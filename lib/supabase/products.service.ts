import { supabase } from './client';
import type { Product, ProductVariant, CreateProductInput, UpdateProductInput, MasterValue } from './types';

export const MAX_PRODUCT_IMAGES = 5;

// Nested select used everywhere a full product is read
const PRODUCT_SELECT = `
        *,
        product_master_values(
          master_values(
            id,
            value,
            master_field_id
          )
        ),
        product_variants(
          id,
          product_id,
          sku,
          source_sku,
          variant_label,
          sort_order,
          status,
          product_variant_values(
            master_values(
              id,
              value,
              master_field_id
            )
          )
        )
      `;

const transformVariant = (row: any): ProductVariant => {
  const values: Record<string, string> = {};
  const masterValueIds: string[] = [];

  if (Array.isArray(row.product_variant_values)) {
    row.product_variant_values.forEach((pvv: any) => {
      const masterValue = pvv.master_values;
      if (masterValue?.master_field_id && masterValue.value && masterValue.id) {
        values[masterValue.master_field_id] = masterValue.value;
        masterValueIds.push(masterValue.id);
      }
    });
  }

  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku,
    sourceSku: row.source_sku || undefined,
    variantLabel: row.variant_label || undefined,
    sortOrder: row.sort_order ?? 0,
    status: row.status,
    values,
    masterValueIds,
  };
};

// Transform database row to application type
const transformProduct = (row: any): Product => {
  // Build masterValues object grouped by field_id
  const masterValues: Record<string, string[]> = {};
  const masterValueIds: string[] = [];
  
  if (row.product_master_values && Array.isArray(row.product_master_values)) {
    row.product_master_values.forEach((pmv: any) => {
      // Handle both nested object and direct master_values reference
      const masterValue = pmv.master_values;
      
      if (masterValue) {
        const fieldId = masterValue.master_field_id;
        const value = masterValue.value;
        const valueId = masterValue.id;
        
        if (fieldId && value && valueId) {
          masterValueIds.push(valueId);
          
          if (!masterValues[fieldId]) {
            masterValues[fieldId] = [];
          }
          masterValues[fieldId].push(value);
        }
      }
    });
  }
  
  // images[] is the source of truth; image_url is the legacy single image and
  // is folded in so products saved before the gallery existed still show one.
  const images: string[] = Array.isArray(row.images) ? row.images.filter(Boolean) : [];
  if (images.length === 0 && row.image_url) {
    images.push(row.image_url);
  }

  const variants: ProductVariant[] = Array.isArray(row.product_variants)
    ? row.product_variants.map(transformVariant).sort((a: ProductVariant, b: ProductVariant) => a.sortOrder - b.sortOrder)
    : [];

  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    description: row.description || '',
    categoryId: row.category_id,
    status: row.status,
    masterValues,
    masterValueIds,
    images,
    catalogueImageUrl: row.catalogue_image_url || undefined,
    imageUrl: images[0] || undefined,
    variants,
    createdAt: row.created_at,
  };
};

export const productsService = {
  // Get all products
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProduct);
  },

  // Get product by ID
  async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformProduct(data);
  },

  // Get products by category
  async getByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProduct);
  },

  // Get products by status
  async getByStatus(status: 'active' | 'inactive' | 'draft'): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProduct);
  },

  // Search products
  async search(query: string, filters?: {
    categoryId?: string;
    status?: 'active' | 'inactive' | 'draft';
  }): Promise<Product[]> {
    let queryBuilder = supabase
      .from('products')
      .select(PRODUCT_SELECT);

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,sku.ilike.%${query}%`);
    }

    if (filters?.categoryId) {
      queryBuilder = queryBuilder.eq('category_id', filters.categoryId);
    }

    if (filters?.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return data.map(transformProduct);
  },

  // Convert masterValues (field_id -> values[]) to masterValueIds
  async convertMasterValuesToIds(masterValues: Record<string, string[]>): Promise<string[]> {
    const valueIds: string[] = [];
    
    for (const [fieldId, values] of Object.entries(masterValues)) {
      if (!values || values.length === 0) continue;
      
      // Get master_value IDs for these field values
      const { data, error } = await supabase
        .from('master_values')
        .select('id')
        .eq('master_field_id', fieldId)
        .in('value', values);
      
      if (error) throw error;
      if (data) {
        valueIds.push(...data.map(v => v.id));
      }
    }
    
    return valueIds;
  },

  // Create product
  async create(input: CreateProductInput): Promise<Product> {
    const images = (input.images ?? (input.imageUrl ? [input.imageUrl] : []))
      .filter(Boolean)
      .slice(0, MAX_PRODUCT_IMAGES);

    // Insert product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert({
        name: input.name,
        sku: input.sku,
        description: input.description || null,
        category_id: input.categoryId,
        status: input.status,
        images,
        catalogue_image_url: input.catalogueImageUrl || null,
        // Kept in step with images[0] for screens still reading a single image.
        image_url: images[0] ?? null,
      })
      .select()
      .single();

    if (productError) {
      if (productError.code === '23505') {
        throw new Error('A product with this SKU already exists');
      }
      throw productError;
    }

    // Link master values
    if (input.masterValueIds && input.masterValueIds.length > 0) {
      const productMasterValues = input.masterValueIds.map(masterValueId => ({
        product_id: productData.id,
        master_value_id: masterValueId,
      }));

      const { error: linkError } = await supabase
        .from('product_master_values')
        .insert(productMasterValues);

      if (linkError) throw linkError;
    }

    return this.getById(productData.id);
  },

  // Update product
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.catalogueImageUrl !== undefined) {
      updateData.catalogue_image_url = input.catalogueImageUrl || null;
    }
    if (input.images !== undefined) {
      const images = input.images.filter(Boolean).slice(0, MAX_PRODUCT_IMAGES);
      updateData.images = images;
      updateData.image_url = images[0] ?? null;
    } else if (input.imageUrl !== undefined) {
      updateData.image_url = input.imageUrl || null;
    }

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        throw new Error('A product with this SKU already exists');
      }
      throw error;
    }

    // Update master values if provided
    if (input.masterValueIds !== undefined) {
      // Delete existing links
      const { error: deleteError } = await supabase
        .from('product_master_values')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      // Insert new links
      if (input.masterValueIds.length > 0) {
        const productMasterValues = input.masterValueIds.map(masterValueId => ({
          product_id: id,
          master_value_id: masterValueId,
        }));

        const { error: linkError } = await supabase
          .from('product_master_values')
          .insert(productMasterValues);

        if (linkError) throw linkError;
      }
    }

    return this.getById(id);
  },

  // Delete product
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Bulk update status
  async bulkUpdateStatus(ids: string[], status: 'active' | 'inactive' | 'draft'): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ status })
      .in('id', ids);

    if (error) throw error;
  },

  // Check if SKU exists
  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .limit(1);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0;
  },

  // Get recently added products
  async getRecent(days: number = 3): Promise<Product[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProduct);
  },

  /**
   * Replace a product's variants with the given rows.
   *
   * Variants are rewritten wholesale rather than diffed: a catalogue table is
   * edited as a table, and the value links hang off the variant rows anyway.
   */
  async replaceVariants(
    productId: string,
    variants: Array<{
      sku: string;
      sourceSku?: string | null;
      variantLabel?: string | null;
      status?: 'active' | 'inactive' | 'draft';
      /** master_value ids making up this variant's spec combination */
      masterValueIds: string[];
    }>
  ): Promise<void> {
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    if (deleteError) throw deleteError;

    if (variants.length === 0) return;

    const { data: inserted, error: insertError } = await supabase
      .from('product_variants')
      .insert(
        variants.map((variant, index) => ({
          product_id: productId,
          sku: variant.sku.trim().toUpperCase(),
          source_sku: variant.sourceSku ?? null,
          variant_label: variant.variantLabel ?? null,
          sort_order: index,
          status: variant.status ?? 'active',
        }))
      )
      .select('id, sku');

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error('One of these variant SKUs already exists');
      }
      throw insertError;
    }

    const idBySku = new Map((inserted ?? []).map((row) => [row.sku, row.id]));
    const valueRows: Array<{ variant_id: string; master_value_id: string }> = [];

    for (const variant of variants) {
      const variantId = idBySku.get(variant.sku.trim().toUpperCase());
      if (!variantId) continue;

      for (const masterValueId of [...new Set(variant.masterValueIds)]) {
        valueRows.push({ variant_id: variantId, master_value_id: masterValueId });
      }
    }

    if (valueRows.length > 0) {
      const { error: valueError } = await supabase
        .from('product_variant_values')
        .insert(valueRows);

      if (valueError) throw valueError;
    }
  },

  /** Variant SKUs are unique across the whole catalogue. */
  async variantSkuExists(sku: string, excludeProductId?: string): Promise<boolean> {
    let query = supabase
      .from('product_variants')
      .select('id')
      .eq('sku', sku.trim().toUpperCase())
      .limit(1);

    if (excludeProductId) {
      query = query.neq('product_id', excludeProductId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.length > 0;
  },

  // Upload product image
  async uploadImage(file: File, productId: string): Promise<string> {
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    // The random segment keeps two files uploaded in the same millisecond from
    // colliding, which previously failed the whole save.
    const unique = Math.random().toString(36).slice(2, 8);
    const filePath = `${productId}-${Date.now()}-${unique}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /** Upload several images at once, preserving their order. */
  async uploadImages(files: File[], productId: string): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, productId)));
  },

  // Delete product image
  async deleteImage(imageUrl: string): Promise<void> {
    const urlParts = imageUrl.split('/product-images/');
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw error;
  },
};

// Master Values Service
export const masterValuesService = {
  // Get all values for a master field
  async getByField(masterFieldId: string): Promise<MasterValue[]> {
    const { data, error } = await supabase
      .from('master_values')
      .select('*')
      .eq('master_field_id', masterFieldId)
      .order('value');

    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      masterFieldId: row.master_field_id,
      value: row.value,
      createdAt: row.created_at,
    }));
  },

  // Create a new master value
  async create(masterFieldId: string, value: string): Promise<MasterValue> {
    const { data, error } = await supabase
      .from('master_values')
      .insert({
        master_field_id: masterFieldId,
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

    return {
      id: data.id,
      masterFieldId: data.master_field_id,
      value: data.value,
      createdAt: data.created_at,
    };
  },

  // Update a master value
  async update(id: string, value: string): Promise<MasterValue> {
    const { data, error } = await supabase
      .from('master_values')
      .update({ value })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This value already exists for this field');
      }
      throw error;
    }

    return {
      id: data.id,
      masterFieldId: data.master_field_id,
      value: data.value,
      createdAt: data.created_at,
    };
  },

  // Delete a master value
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('master_values')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get or create a master value
  async getOrCreate(masterFieldId: string, value: string): Promise<MasterValue> {
    const { data: existing, error: findError } = await supabase
      .from('master_values')
      .select('*')
      .eq('master_field_id', masterFieldId)
      .eq('value', value)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return {
        id: existing.id,
        masterFieldId: existing.master_field_id,
        value: existing.value,
        createdAt: existing.created_at,
      };
    }

    return this.create(masterFieldId, value);
  },

  // Bulk create master values for a field
  async bulkCreate(masterFieldId: string, values: string[]): Promise<MasterValue[]> {
    const uniqueValues = [...new Set(values)];
    const results: MasterValue[] = [];

    for (const value of uniqueValues) {
      try {
        const masterValue = await this.getOrCreate(masterFieldId, value);
        results.push(masterValue);
      } catch (error) {
        console.error(`Failed to create value "${value}":`, error);
      }
    }

    return results;
  },
};
