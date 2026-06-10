'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { FolderPlus, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreateCategory, useCategories } from '@/lib/hooks';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/store';
import { cn } from '@/lib/utils';

interface QuickCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: (categoryId: string) => void;
}

type FormData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId: string;
  isMain: boolean;
};

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'At least 2 characters')
    .max(40, 'Max 40 characters'),
  description: Yup.string()
    .min(5, 'At least 5 characters')
    .max(200, 'Max 200 characters'),
  color: Yup.string().required('Pick a color'),
  icon: Yup.string().required('Pick an icon'),
  parentId: Yup.string().when('isMain', {
    is: false,
    then: schema => schema.required('Please select a parent category'),
    otherwise: schema => schema,
  }),
});

export function QuickCategoryDialog({
  open,
  onOpenChange,
  onCategoryCreated,
}: QuickCategoryDialogProps) {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateCategory();

  const mainCategories = categories.filter(cat => cat.isMain);

  const formik = useFormik<FormData>({
    initialValues: {
      name: '',
      description: '',
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
      parentId: '',
      isMain: true,
    },
    validationSchema,
    onSubmit: async (values: FormData) => {
      try {
        const result = await createMutation.mutateAsync(values);
        toast.success(`Category "${values.name}" created!`);
        
        // Call the callback with the new category ID
        if (onCategoryCreated && result?.id) {
          onCategoryCreated(result.id);
        }
        
        // Reset form and close
        formik.resetForm();
        onOpenChange(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error('Failed to create category', {
          description: errorMessage,
        });
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-orange-500" />
            Quick Create Category
          </DialogTitle>
          <DialogDescription>
            Create a new category to organize your products
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Live preview */}
            {formik.values.name && (
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                <span className="text-xs text-slate-500">Preview:</span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white shadow-sm"
                  style={{ background: formik.values.color }}
                >
                  {formik.values.icon} {formik.values.name}
                </span>
              </div>
            )}

            {/* Name */}
            <div>
              <Label htmlFor="name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., Springs, Pins & Punches, Bolts..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-slate-400 mt-1.5"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>
              )}
            </div>

            {/* Category Type */}
            <div>
              <Label>Category Type</Label>
              <div className="flex gap-3 mt-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isMain"
                    checked={formik.values.isMain}
                    onChange={() => {
                      formik.setFieldValue('isMain', true);
                      formik.setFieldValue('parentId', '');
                    }}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span className="text-sm text-slate-700">Main Category</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isMain"
                    checked={!formik.values.isMain}
                    onChange={() => formik.setFieldValue('isMain', false)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span className="text-sm text-slate-700">Subcategory</span>
                </label>
              </div>
            </div>

            {/* Parent Category */}
            {!formik.values.isMain && (
              <div>
                <Label>
                  Parent Category <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-500 mb-2 mt-1">
                  Select a category to nest this under
                </p>
                <div className="space-y-2">
                  {mainCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => formik.setFieldValue('parentId', cat.id)}
                      className={cn(
                        'w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2',
                        formik.values.parentId === cat.id
                          ? 'border-transparent shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      )}
                      style={
                        formik.values.parentId === cat.id
                          ? { background: `${cat.color}12`, borderColor: cat.color }
                          : {}
                      }
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {formik.touched.parentId && formik.errors.parentId && (
                  <p className="mt-1 text-xs text-red-500">{formik.errors.parentId}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Briefly describe what types of products fall under this category..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-slate-400 resize-none mt-1.5"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-xs text-red-500">{formik.errors.description}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <Label>Badge Color</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => formik.setFieldValue('color', c)}
                    title={c}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all duration-150 shadow-sm',
                      formik.values.color === c
                        ? 'ring-2 ring-offset-2 ring-slate-500 scale-110'
                        : 'hover:scale-105'
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <Label>Icon</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {CATEGORY_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => formik.setFieldValue('icon', ic)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-lg flex items-center justify-center border-2 transition-all duration-150',
                      formik.values.icon === ic
                        ? 'border-orange-400 bg-orange-50 scale-110'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            style={{ background: `linear-gradient(135deg, ${formik.values.color}dd, ${formik.values.color})` }}
            className="text-white"
          >
            <Sparkles className="w-4 h-4" />
            Create Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
