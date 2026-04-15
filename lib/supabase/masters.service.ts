import { supabase } from './client';
import type { Master, MasterField, CreateMasterInput, UpdateMasterInput } from './types';

// Transform database row to application type
const transformMasterField = (row: any): MasterField => {
  // Get options from master_values if available, otherwise fall back to options JSONB
  const options = row.master_values && Array.isArray(row.master_values)
    ? row.master_values.map((mv: any) => mv.value)
    : (Array.isArray(row.options) ? row.options : []);
  
  return {
    id: row.id,
    label: row.label,
    type: row.type as 'select' | 'text' | 'number' | 'color',
    options,
    unit: row.unit || undefined,
  };
};

const transformMaster = (row: any): Master => ({
  id: row.id,
  name: row.name,
  description: row.description,
  color: row.color,
  icon: row.icon,
  categoryId: row.category_id || undefined,
  fields: row.master_fields ? row.master_fields.map(transformMasterField) : [],
  createdAt: row.created_at,
});

export const mastersService = {
  // Get all masters with fields
  async getAll(): Promise<Master[]> {
    const { data, error } = await supabase
      .from('masters')
      .select(`
        *,
        master_fields(
          *,
          master_values(value)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformMaster);
  },

  // Get master by ID with fields
  async getById(id: string): Promise<Master> {
    const { data, error } = await supabase
      .from('masters')
      .select(`
        *,
        master_fields(
          *,
          master_values(value)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformMaster(data);
  },

  // Get masters by category
  async getByCategory(categoryId: string): Promise<Master[]> {
    const { data, error } = await supabase
      .from('masters')
      .select(`
        *,
        master_fields(
          *,
          master_values(value)
        )
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformMaster);
  },

  // Create master with fields
  async create(input: CreateMasterInput): Promise<Master> {
    // Insert master
    const { data: masterData, error: masterError } = await supabase
      .from('masters')
      .insert({
        name: input.name,
        description: input.description,
        color: input.color,
        icon: input.icon,
        category_id: input.categoryId || null,
      })
      .select()
      .single();

    if (masterError) throw masterError;

    // Insert fields and their values
    if (input.fields && input.fields.length > 0) {
      for (let index = 0; index < input.fields.length; index++) {
        const field = input.fields[index];
        
        // Insert field
        const { data: fieldData, error: fieldError } = await supabase
          .from('master_fields')
          .insert({
            master_id: masterData.id,
            label: field.label,
            type: field.type,
            unit: field.unit || null,
            sort_order: index,
          })
          .select()
          .single();

        if (fieldError) throw fieldError;

        // Insert values for this field
        if (field.options && field.options.length > 0) {
          const valuesToInsert = field.options.map(value => ({
            master_field_id: fieldData.id,
            value,
          }));

          const { error: valuesError } = await supabase
            .from('master_values')
            .insert(valuesToInsert);

          if (valuesError) throw valuesError;
        }
      }
    }

    return this.getById(masterData.id);
  },

  // Update master
  async update(id: string, input: UpdateMasterInput): Promise<Master> {
    // Update master
    const { error: masterError } = await supabase
      .from('masters')
      .update({
        name: input.name,
        description: input.description,
        color: input.color,
        icon: input.icon,
        category_id: input.categoryId !== undefined ? input.categoryId || null : undefined,
      })
      .eq('id', id);

    if (masterError) throw masterError;

    // Update fields if provided
    if (input.fields) {
      // Delete existing fields (cascade will delete values)
      const { error: deleteError } = await supabase
        .from('master_fields')
        .delete()
        .eq('master_id', id);

      if (deleteError) throw deleteError;

      // Insert new fields and values
      if (input.fields.length > 0) {
        for (let index = 0; index < input.fields.length; index++) {
          const field = input.fields[index];
          
          // Insert field
          const { data: fieldData, error: fieldError } = await supabase
            .from('master_fields')
            .insert({
              master_id: id,
              label: field.label,
              type: field.type,
              unit: field.unit || null,
              sort_order: index,
            })
            .select()
            .single();

          if (fieldError) throw fieldError;

          // Insert values for this field
          if (field.options && field.options.length > 0) {
            const valuesToInsert = field.options.map(value => ({
              master_field_id: fieldData.id,
              value,
            }));

            const { error: valuesError } = await supabase
              .from('master_values')
              .insert(valuesToInsert);

            if (valuesError) throw valuesError;
          }
        }
      }
    }

    return this.getById(id);
  },

  // Delete master
  async delete(id: string): Promise<void> {
    // Check if master is used in any products
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (products && products.length > 0) {
      throw new Error('Cannot delete master used in products');
    }

    // Delete master (fields will be cascade deleted)
    const { error } = await supabase
      .from('masters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Add option to master field
  async addFieldOption(fieldId: string, option: string): Promise<void> {
    // Get current field
    const { data: field, error: getError } = await supabase
      .from('master_fields')
      .select('options')
      .eq('id', fieldId)
      .single();

    if (getError) throw getError;

    const currentOptions = Array.isArray(field.options) ? field.options : [];
    
    // Add new option if not exists
    if (!currentOptions.includes(option)) {
      const { error: updateError } = await supabase
        .from('master_fields')
        .update({
          options: [...currentOptions, option],
        })
        .eq('id', fieldId);

      if (updateError) throw updateError;
    }
  },

  // Get all master values for a field
  async getFieldValues(fieldId: string) {
    const { data, error } = await supabase
      .from('master_values')
      .select('*')
      .eq('master_field_id', fieldId)
      .order('value');

    if (error) throw error;
    return data;
  },

  // Create master value
  async createFieldValue(fieldId: string, value: string) {
    const { data, error } = await supabase
      .from('master_values')
      .insert({
        master_field_id: fieldId,
        value,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This value already exists for this field');
      }
      throw error;
    }

    return data;
  },
};
