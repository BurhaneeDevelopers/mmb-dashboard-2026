import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mastersService } from '../supabase';
import type { Master, CreateMasterInput, UpdateMasterInput } from '../supabase/types';

// Query keys
export const masterKeys = {
  all: ['masters'] as const,
  lists: () => [...masterKeys.all, 'list'] as const,
  list: (filters?: string) => [...masterKeys.lists(), { filters }] as const,
  details: () => [...masterKeys.all, 'detail'] as const,
  detail: (id: string) => [...masterKeys.details(), id] as const,
  byCategory: (categoryId: string) => [...masterKeys.all, 'by-category', categoryId] as const,
};

// Get all masters
export function useMasters() {
  return useQuery({
    queryKey: masterKeys.lists(),
    queryFn: () => mastersService.getAll(),
  });
}

// Get master by ID
export function useMaster(id: string) {
  return useQuery({
    queryKey: masterKeys.detail(id),
    queryFn: () => mastersService.getById(id),
    enabled: !!id,
  });
}

// Get masters by category
export function useMastersByCategory(categoryId: string) {
  return useQuery({
    queryKey: masterKeys.byCategory(categoryId),
    queryFn: () => mastersService.getByCategory(categoryId),
    enabled: !!categoryId,
  });
}

// Create master
export function useCreateMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMasterInput) => mastersService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.all });
    },
  });
}

// Update master
export function useUpdateMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMasterInput }) =>
      mastersService.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: masterKeys.all });
      queryClient.setQueryData(masterKeys.detail(data.id), data);
    },
  });
}

// Delete master
export function useDeleteMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mastersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.all });
    },
  });
}

// Add option to master field
export function useAddFieldOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, option }: { fieldId: string; option: string }) =>
      mastersService.addFieldOption(fieldId, option),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.all });
    },
  });
}
