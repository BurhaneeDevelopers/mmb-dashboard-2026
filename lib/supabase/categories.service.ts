import { supabase } from './client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from './types';

// Transform database row to application type
const transformCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  description: row.description,
  color: row.color,
  icon: row.icon,
  createdAt: row.created_at,
});

export const categoriesService = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformCategory);
  },

  // Get category by ID
  async getById(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformCategory(data);
  },

  // Get category with masters count
  async getWithMasterCount() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        masters:masters(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((row) => ({
      ...transformCategory(row),
      masterCount: row.masters?.[0]?.count || 0,
    }));
  },

  // Create category
  async create(input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: input.name,
        description: input.description,
        color: input.color,
        icon: input.icon,
      })
      .select()
      .single();

    if (error) throw error;
    return transformCategory(data);
  },

  // Update category
  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: input.name,
        description: input.description,
        color: input.color,
        icon: input.icon,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformCategory(data);
  },

  // Delete category
  async delete(id: string): Promise<void> {
    // Check if category has linked masters
    const { data: masters, error: checkError } = await supabase
      .from('masters')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (masters && masters.length > 0) {
      throw new Error('Cannot delete category with linked masters');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
