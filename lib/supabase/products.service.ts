import { supabase } from './client';
import type { Product, CreateProductInput, UpdateProductInput } from './types';

// Transform database row to application type
const transformProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  description: row.description || '',
  categoryId: row.category_id,
  status: row.status,
  masterValues: typeof row.master_values === 'object' ? row.master_values : {},
  createdAt: row.created_at,
});

export const productsService = {
  // Get all products
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProduct);
  },

  // Get product by ID
  async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformProduct(data);
  },

  // Get products by category
  async getByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProduct);
  },

  // Get products by status
  async getByStatus(status: 'active' | 'inactive'): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProduct);
  },

  // Search products
  async search(query: string, filters?: {
    categoryId?: string;
    status?: 'active' | 'inactive';
  }): Promise<Product[]> {
    let queryBuilder = supabase
      .from('products')
      .select('*');

    // Apply search
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,sku.ilike.%${query}%`);
    }

    // Apply filters
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

  // Create product
  async create(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: input.name,
        sku: input.sku,
        description: input.description || null,
        category_id: input.categoryId,
        status: input.status,
        master_values: input.masterValues,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation for SKU
      if (error.code === '23505') {
        throw new Error('A product with this SKU already exists');
      }
      throw error;
    }

    return transformProduct(data);
  },

  // Update product
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.masterValues !== undefined) updateData.master_values = input.masterValues;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation for SKU
      if (error.code === '23505') {
        throw new Error('A product with this SKU already exists');
      }
      throw error;
    }

    return transformProduct(data);
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
  async bulkUpdateStatus(ids: string[], status: 'active' | 'inactive'): Promise<void> {
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

  // Get recently added products (last N days)
  async getRecent(days: number = 3): Promise<Product[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProduct);
  },
};
