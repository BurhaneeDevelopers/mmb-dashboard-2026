import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../supabase';
import type { Product, CreateProductInput, UpdateProductInput } from '../supabase/types';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: { categoryId?: string; status?: string; search?: string }) =>
    [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byCategory: (categoryId: string) => [...productKeys.all, 'by-category', categoryId] as const,
  byStatus: (status: string) => [...productKeys.all, 'by-status', status] as const,
};

// Get all products
export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productsService.getAll(),
  });
}

// Get product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  });
}

// Get products by category
export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: productKeys.byCategory(categoryId),
    queryFn: () => productsService.getByCategory(categoryId),
    enabled: !!categoryId,
  });
}

// Get products by status
export function useProductsByStatus(status: 'active' | 'inactive') {
  return useQuery({
    queryKey: productKeys.byStatus(status),
    queryFn: () => productsService.getByStatus(status),
  });
}

// Search products
export function useSearchProducts(
  query: string,
  filters?: { categoryId?: string; status?: 'active' | 'inactive' }
) {
  return useQuery({
    queryKey: productKeys.list({ search: query, ...filters }),
    queryFn: () => productsService.search(query, filters),
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => productsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productsService.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.setQueryData(productKeys.detail(data.id), data);
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// Bulk update status
export function useBulkUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'active' | 'inactive' }) =>
      productsService.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// Check SKU exists
export function useCheckSku(sku: string, excludeId?: string) {
  return useQuery({
    queryKey: ['sku-check', sku, excludeId],
    queryFn: () => productsService.skuExists(sku, excludeId),
    enabled: sku.length >= 3,
  });
}

// Get recently added products
export function useRecentProducts(days: number = 3) {
  return useQuery({
    queryKey: [...productKeys.all, 'recent', days],
    queryFn: () => productsService.getRecent(days),
  });
}
