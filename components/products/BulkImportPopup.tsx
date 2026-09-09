'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Upload, X, CheckCircle2, AlertCircle, AlertTriangle, Loader2,
  ChevronRight, ChevronLeft, Clipboard, Image as ImageIcon, FolderPlus, Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCategories } from '@/lib/hooks';
import { categoriesService } from '@/lib/supabase/categories.service';
import { productsService } from '@/lib/supabase/products.service';
import { QuickCategoryDialog } from '@/components/categories/QuickCategoryDialog';
import { DraftProductCard } from './scan-review/DraftProductCard';
import {
  buildDraft,
  reapplySkuRule,
  validateDraft,
  type CatalogueDraft,
  type DraftProduct,
} from '@/lib/catalogue-draft';
import { SKU_RULES, DEFAULT_SKU_RULE_ID } from '@/lib/sku-rules';
import { importDraftProduct, type ImportResult } from '@/lib/product-importer';
import type { Category } from '@/lib/supabase/types';

interface BulkImportPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type Step = 'upload' | 'review' | 'done';

const MAX_IMAGES = 5;

const STEPS: Array<{ id: Step; label: string }> = [
  { id: 'upload', label: 'Upload pages' },
  { id: 'review', label: 'Check what was read' },
  { id: 'done', label: 'Import' },
];

export function BulkImportPopup({ open, onOpenChange, onComplete }: BulkImportPopupProps) {
  const [step, setStep] = useState<Step>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [categoryId, setCategoryId] = useState('');
  const [mainCategoryId, setMainCategoryId] = useState('');
  const [skuOnly, setSkuOnly] = useState(false);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<CatalogueDraft | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickCategoryDialog, setShowQuickCategoryDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allCategories = [], refetch: refetchCategories } = useCategories();
  const mainCategories = allCategories.filter((cat) => cat.isMain && !cat.parentId);

  useEffect(() => {
    if (!mainCategoryId) {
      setSubCategories([]);
      setCategoryId('');
      return;
    }

    setCategoryId(mainCategoryId);
    categoriesService
      .getSubCategories(mainCategoryId)
      .then(setSubCategories)
      .catch(() => setSubCategories([]));
  }, [mainCategoryId]);

  const cleanupPreviews = useCallback(() => {
    setPreviewUrls((current) => {
      Object.values(current).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });
  }, []);

  // Revoke any previews still held when the dialog unmounts.
  useEffect(() => () => cleanupPreviews(), [cleanupPreviews]);

  const handleFileSelect = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(
      (file) => file.type === 'image/png' || file.type === 'image/jpeg'
    );

    if (imageFiles.length === 0) {
      toast.error('Please select PNG or JPEG images only');
      return;
    }

    // Two pages picked from different folders can share a name, which used to
    // overwrite one preview with the other. Key on name plus size plus index.
    const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
    const fresh = imageFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));

    if (fresh.length < imageFiles.length) {
      toast.info('Some of those pages were already added');
    }
    if (fresh.length === 0) return;

    const room = MAX_IMAGES - files.length;
    if (room <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} pages per scan`);
      return;
    }

    const accepted = fresh.slice(0, room);
    if (accepted.length < fresh.length) {
      toast.error(`Only ${room} more page${room === 1 ? '' : 's'} can be added`);
    }

    const newPreviews: Record<string, string> = {};
    accepted.forEach((file) => {
      newPreviews[`${file.name}-${file.size}`] = URL.createObjectURL(file);
    });

    setFiles((prev) => [...prev, ...accepted]);
    setPreviewUrls((prev) => ({ ...prev, ...newPreviews }));
    setError(null);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(Array.from(event.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(Array.from(event.dataTransfer.files));
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const imageFiles: File[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const extension = type.split('/')[1] || 'png';
            imageFiles.push(
              new File([blob], `pasted-${Date.now()}-${imageFiles.length}.${extension}`, { type })
            );
          }
        }
      }

      if (imageFiles.length === 0) {
        toast.error('No image found in the clipboard');
        return;
      }

      handleFileSelect(imageFiles);
    } catch (err) {
      console.error('Paste error:', err);
      toast.error('Could not read the clipboard');
    }
  };

  const handleRemoveImage = (key: string) => {
    setFiles((prev) => prev.filter((f) => `${f.name}-${f.size}` !== key));
    setPreviewUrls((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Step 1 -> 2: read the pages, do not write anything yet.
  const handleScan = async () => {
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (files.length === 0) {
      toast.error('Please add at least one catalogue page');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      if (skuOnly) formData.append('mode', 'skuOnly');

      const res = await fetch('/api/letterhead-process', { method: 'POST', body: formData });
      const contentType = res.headers.get('content-type');

      if (!contentType?.includes('application/json')) {
        if (res.status === 504) {
          throw new Error('The scan timed out. Try fewer pages, or smaller files.');
        }
        const text = await res.text();
        throw new Error(`Server error: ${text.substring(0, 120)}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Could not scan the pages');

      const scans = (data.scans as Array<{ filename: string; success: boolean; result?: any; error?: string }>)
        .filter((scan) => scan.success && scan.result)
        .map((scan) => ({ filename: scan.filename, result: scan.result }));

      const failed = (data.scans as Array<{ filename: string; success: boolean; error?: string }>)
        .filter((scan) => !scan.success);

      if (scans.length === 0) {
        throw new Error(
          failed[0]?.error ?? 'No products could be read from these pages'
        );
      }

      const nextDraft = buildDraft(scans, DEFAULT_SKU_RULE_ID);
      nextDraft.warnings.push(
        ...failed.map((scan) => `${scan.filename}: ${scan.error ?? 'could not be read'}`)
      );

      if (nextDraft.products.length === 0) {
        throw new Error('No products could be read from these pages');
      }

      setDraft(nextDraft);
      setStep('review');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not scan the pages';
      setError(message);
      toast.error('Scan failed', { description: message });
    } finally {
      setIsScanning(false);
    }
  };

  const issues = useMemo(() => (draft ? validateDraft(draft) : []), [draft]);
  const blockingIssues = issues.filter((issue) => issue.level === 'error');

  // SKUs claimed by more than one included row, highlighted in the table.
  const duplicateSkus = useMemo(() => {
    if (!draft) return new Set<string>();
    const counts = new Map<string, number>();

    for (const product of draft.products) {
      if (!product.include) continue;
      for (const variant of product.variants) {
        if (!variant.include) continue;
        const sku = variant.sku.trim().toUpperCase();
        if (sku) counts.set(sku, (counts.get(sku) ?? 0) + 1);
      }
    }

    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([sku]) => sku));
  }, [draft]);

  const updateProduct = (updated: DraftProduct) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            products: current.products.map((p) => (p.key === updated.key ? updated : p)),
          }
        : current
    );
  };

  // Step 2 -> 3: write the reviewed draft.
  const handleImport = async () => {
    if (!draft || blockingIssues.length > 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const included = draft.products.filter((p) => p.include);
      const imported: ImportResult[] = [];

      // One product at a time: each import creates masters that the next may
      // reuse, and running them together would create the same master twice.
      for (const product of included) {
        const catalogueFile = files.find((f) => f.name === product.sourceFilename);
        let catalogueImageUrl: string | null = null;

        if (catalogueFile) {
          try {
            catalogueImageUrl = await productsService.uploadImage(
              catalogueFile,
              `catalogue-${Date.now()}`
            );
          } catch (uploadError) {
            // The page image is a reference copy; losing it must not block the
            // product itself.
            console.error('[bulk-import] Catalogue image upload failed:', uploadError);
          }
        }

        imported.push(await importDraftProduct(product, categoryId, { catalogueImageUrl }));
      }

      setResults(imported);
      setStep('done');

      const created = imported.filter((r) => r.success).length;
      const variants = imported.reduce((sum, r) => sum + r.variantsCreated, 0);

      if (created > 0) {
        toast.success(
          `Imported ${created} product${created === 1 ? '' : 's'} with ${variants} variant${variants === 1 ? '' : 's'}`
        );
        onComplete?.();
      } else {
        toast.error('Nothing was imported');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The import failed';
      setError(message);
      toast.error('Import failed', { description: message });
    } finally {
      setIsImporting(false);
    }
  };

  const resetScanState = () => {
    cleanupPreviews();
    setFiles([]);
    setDraft(null);
    setResults([]);
    setStep('upload');
    setError(null);
  };

  const handleClose = () => {
    resetScanState();
    setCategoryId('');
    setMainCategoryId('');
    setSubCategories([]);
    setSkuOnly(false);
    onOpenChange(false);
  };

  const handleCategoryCreated = async (newCategoryId: string) => {
    const { data: updated } = await refetchCategories();
    const created = updated?.find((c) => c.id === newCategoryId);
    if (!created) return;

    if (created.isMain && !created.parentId) {
      setMainCategoryId(newCategoryId);
      setCategoryId(newCategoryId);
    } else if (created.parentId) {
      const parent = updated?.find((c) => c.id === created.parentId);
      if (parent?.isMain && !parent.parentId) {
        setMainCategoryId(parent.id);
        setCategoryId(newCategoryId);
      }
    }

    toast.success(`Category "${created.name}" selected`);
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);
  const totalVariants = draft
    ? draft.products
        .filter((p) => p.include)
        .reduce((sum, p) => sum + p.variants.filter((v) => v.include).length, 0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden bg-white">
        <DialogHeader>
          <DialogTitle>Scan catalogue pages</DialogTitle>
          <DialogDescription>
            Read products and their model codes off printed catalogue pages, check
            what was read, then import.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          {STEPS.map((stepDef, index) => (
            <div key={stepDef.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  index < currentStepIndex && 'bg-emerald-100 text-emerald-700',
                  index === currentStepIndex && 'bg-pink-100 text-pink-700',
                  index > currentStepIndex && 'bg-slate-100 text-slate-400'
                )}
              >
                {index < currentStepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  index === currentStepIndex ? 'text-slate-800' : 'text-slate-400'
                )}
              >
                {stepDef.label}
              </span>
              {index < STEPS.length - 1 && (
                <ChevronRight className="ml-1 h-3.5 w-3.5 text-slate-300" />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-1">
          {step === 'upload' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="main-category-select">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickCategoryDialog(true)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    Quick create
                  </Button>
                </div>

                <Select value={mainCategoryId} onValueChange={setMainCategoryId}>
                  <SelectTrigger id="main-category-select">
                    <SelectValue placeholder="Choose a main category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {mainCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No categories yet. Create one before scanning.
                  </p>
                )}

                {subCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="sub-category-select">
                      Subcategory{' '}
                      <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="sub-category-select">
                        <SelectValue placeholder="Use the main category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={mainCategoryId}>
                          {mainCategories.find((c) => c.id === mainCategoryId)?.name}{' '}
                          <span className="text-xs text-muted-foreground">(main category)</span>
                        </SelectItem>
                        {subCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSkuOnly((current) => !current)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                  skuOnly ? 'border-pink-300 bg-pink-50' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    skuOnly ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-400'
                  )}
                >
                  <Tag className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-700">
                      Just read the model / part number
                    </p>
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                        skuOnly ? 'border-pink-500 bg-pink-500' : 'border-slate-300'
                      )}
                    >
                      {skuOnly && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Skips every specification column, so no new specifications
                    are created and only the SKU is imported. Use this for
                    pages where the specifications do not matter.
                  </p>
                </div>
              </button>

              {files.length === 0 ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={handleDrop}
                  className={cn(
                    'rounded-lg border-2 border-dashed p-12 text-center transition-colors',
                    isDragging ? 'border-pink-500 bg-pink-50' : 'border-border hover:border-pink-300'
                  )}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={cn(
                        'flex h-16 w-16 items-center justify-center rounded-full bg-muted',
                        isDragging && 'bg-pink-100'
                      )}
                    >
                      <ImageIcon
                        className={cn('h-8 w-8 text-muted-foreground', isDragging && 'text-pink-500')}
                      />
                    </div>

                    <div>
                      <p className="mb-1 font-medium">Drop catalogue pages here</p>
                      <p className="text-sm text-muted-foreground">
                        One page per image works best
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                        className="text-white"
                      >
                        <Upload className="h-4 w-4" />
                        Choose files
                      </Button>
                      <Button onClick={handlePaste} variant="outline">
                        <Clipboard className="h-4 w-4" />
                        Paste
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      PNG or JPEG, up to {MAX_IMAGES} pages
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {files.map((file) => {
                      const key = `${file.name}-${file.size}`;
                      return (
                        <div
                          key={key}
                          className="group relative overflow-hidden rounded-lg border bg-muted/50"
                        >
                          {/* Local preview of a file the user just picked. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrls[key]}
                            alt={file.name}
                            className="h-40 w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleRemoveImage(key)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 truncate bg-black/70 p-2 text-xs text-white">
                            {file.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {files.length < MAX_IMAGES && (
                    <div className="flex gap-2">
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                        Add more
                      </Button>
                      <Button onClick={handlePaste} variant="outline" size="sm">
                        <Clipboard className="h-4 w-4" />
                        Paste
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
            </>
          )}

          {step === 'review' && draft && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm text-slate-600">
                  Read{' '}
                  <span className="font-semibold text-slate-800">
                    {draft.products.filter((p) => p.include).length} product
                    {draft.products.filter((p) => p.include).length === 1 ? '' : 's'}
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-slate-800">
                    {totalVariants} variant{totalVariants === 1 ? '' : 's'}
                  </span>
                  . Correct anything wrong before importing.
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="sku-rule" className="text-xs text-slate-500">
                    SKU rule
                  </Label>
                  <Select
                    value={draft.skuRuleId}
                    onValueChange={(ruleId) =>
                      setDraft((current) => (current ? reapplySkuRule(current, ruleId) : current))
                    }
                  >
                    <SelectTrigger id="sku-rule" className="h-8 w-72 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKU_RULES.map((rule) => (
                        <SelectItem key={rule.id} value={rule.id}>
                          {rule.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {issues.length > 0 && (
                <div
                  className={cn(
                    'space-y-1 rounded-lg border p-3',
                    blockingIssues.length > 0
                      ? 'border-red-200 bg-red-50'
                      : 'border-amber-200 bg-amber-50'
                  )}
                >
                  {issues.map((issue, index) => (
                    <p
                      key={index}
                      className={cn(
                        'flex items-start gap-2 text-xs',
                        issue.level === 'error' ? 'text-red-700' : 'text-amber-700'
                      )}
                    >
                      {issue.level === 'error' ? (
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      )}
                      {issue.message}
                    </p>
                  ))}
                </div>
              )}

              {draft.warnings.length > 0 && (
                <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-600">Notes from the scan</p>
                  {draft.warnings.map((warning, index) => (
                    <p key={index} className="text-xs text-slate-500">
                      {warning}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {draft.products.map((product) => (
                  <DraftProductCard
                    key={product.key}
                    product={product}
                    onChange={updateProduct}
                    duplicateSkus={duplicateSkus}
                  />
                ))}
              </div>
            </>
          )}

          {step === 'done' && (
            <>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {results.filter((r) => r.success).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Products created</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {results.reduce((sum, r) => sum + r.variantsCreated, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Variants created</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-700">
                        {results.reduce((sum, r) => sum + r.mastersCreated, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">New specifications</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-2 rounded-lg p-3 text-sm',
                      result.success ? 'bg-emerald-50' : 'bg-red-50'
                    )}
                  >
                    {result.success ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'font-medium',
                          result.success ? 'text-emerald-900' : 'text-red-900'
                        )}
                      >
                        {result.productName}
                      </p>
                      {result.success ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {result.variants.map((variant) => (
                            <Badge key={variant.sku} variant="secondary" className="font-mono text-[10px]">
                              {variant.sku}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-red-700">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {error && step !== 'done' && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-900">Something went wrong</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t pt-4">
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleScan}
                disabled={!categoryId || files.length === 0 || isScanning}
                style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                className="text-white"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reading pages...
                  </>
                ) : (
                  <>
                    Scan pages
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'review' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')} disabled={isImporting}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={blockingIssues.length > 0 || isImporting}
                title={
                  blockingIssues.length > 0
                    ? 'Fix the problems listed above before importing'
                    : undefined
                }
                style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                className="text-white"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {totalVariants} variant{totalVariants === 1 ? '' : 's'}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'done' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                onClick={resetScanState}
                style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                className="text-white"
              >
                <Upload className="h-4 w-4" />
                Scan more pages
              </Button>
            </>
          )}
        </div>
      </DialogContent>

      <QuickCategoryDialog
        open={showQuickCategoryDialog}
        onOpenChange={setShowQuickCategoryDialog}
        onCategoryCreated={handleCategoryCreated}
      />
    </Dialog>
  );
}
