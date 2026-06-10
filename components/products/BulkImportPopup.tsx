'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Clipboard, Image as ImageIcon } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCategories } from '@/lib/hooks';
import { QuickCategoryDialog } from '../categories/QuickCategoryDialog';
import { CategoryDropdown } from '../categories/CategoryDropdown';

interface BulkImportPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type Step = 'upload' | 'done';

interface ProcessResult {
  filename: string;
  success: boolean;
  productId?: string;
  productName?: string;
  error?: string;
  isUpdate?: boolean;
  matchedProductName?: string;
  similarity?: number;
}

interface ApiSummary {
  totalImages: number;
  imagesProcessed: number;
  imagesFailed: number;
  productsCreated: number;
  productsUpdated: number;
}

export function BulkImportPopup({ open, onOpenChange, onComplete }: BulkImportPopupProps) {
  const [step, setStep] = useState<Step>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [categoryId, setCategoryId] = useState('');
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [summary, setSummary] = useState<ApiSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickCategoryDialog, setShowQuickCategoryDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allCategories = [], refetch: refetchCategories } = useCategories();

  // Cleanup preview URLs
  const cleanupPreviews = useCallback(() => {
    Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls({});
  }, [previewUrls]);

  // Handle file selection
  const handleFileSelect = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => 
      file.type === 'image/png' || file.type === 'image/jpeg'
    );

    if (imageFiles.length === 0) {
      toast.error('Please select PNG or JPEG images only');
      return;
    }

    const totalFiles = files.length + imageFiles.length;
    if (totalFiles > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    // Create preview URLs
    const newPreviews: Record<string, string> = {};
    imageFiles.forEach(file => {
      newPreviews[file.name] = URL.createObjectURL(file);
    });

    setFiles(prev => [...prev, ...imageFiles]);
    setPreviewUrls(prev => ({ ...prev, ...newPreviews }));
    setError(null);
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleFileSelect(selectedFiles);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  };

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const imageFiles: File[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-${Date.now()}.png`, { type });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length === 0) {
        toast.error('No images found in clipboard');
        return;
      }

      handleFileSelect(imageFiles);
      toast.success(`${imageFiles.length} image(s) pasted from clipboard`);
    } catch (error) {
      toast.error('Failed to paste from clipboard');
      console.error('Paste error:', error);
    }
  };

  // Remove image
  const handleRemoveImage = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    
    if (previewUrls[fileName]) {
      URL.revokeObjectURL(previewUrls[fileName]);
      setPreviewUrls(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[fileName];
        return newPreviews;
      });
    }
  };

  // Process and import
  const handleProcessAndImport = async () => {
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      formData.append('categoryId', categoryId);

      const res = await fetch('/api/letterhead-process', {
        method: 'POST',
        body: formData,
      });

      // Handle timeout or non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (res.status === 504) {
          throw new Error('Request timeout: Processing is taking too long. Try with fewer images or smaller files.');
        }
        const text = await res.text();
        throw new Error(`Server error: ${text.substring(0, 100)}`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to process images');
      }

      setResults(data.results);
      setSummary(data.summary);
      setStep('done');

      const totalSuccess = data.summary.productsCreated + data.summary.productsUpdated;
      if (totalSuccess > 0) {
        const message = [];
        if (data.summary.productsCreated > 0) {
          message.push(`${data.summary.productsCreated} created`);
        }
        if (data.summary.productsUpdated > 0) {
          message.push(`${data.summary.productsUpdated} updated`);
        }
        toast.success(`Products processed: ${message.join(', ')}`);
        onComplete?.();
      } else {
        toast.error('No products were created or updated');
      }
    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process images';
      setError(errorMessage);
      toast.error('Failed to process images', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle close
  const handleClose = () => {
    cleanupPreviews();
    setFiles([]);
    setCategoryId('');
    setResults([]);
    setSummary(null);
    setStep('upload');
    setError(null);
    onOpenChange(false);
  };

  // Handle add more products - keeps category selections
  const handleAddMoreProducts = () => {
    cleanupPreviews();
    setFiles([]);
    setResults([]);
    setSummary(null);
    setStep('upload');
    setError(null);
    toast.success('Category selections preserved. Add more images to continue.');
  };

  // Handle category created from quick dialog
  const handleCategoryCreated = async (newCategoryId: string) => {
    await refetchCategories();
    setCategoryId(newCategoryId);
  };

  // Group results by filename
  const resultsByFile = results.reduce((acc, result) => {
    if (!acc[result.filename]) {
      acc[result.filename] = [];
    }
    acc[result.filename].push(result);
    return acc;
  }, {} as Record<string, ProcessResult[]>);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>
            Bulk Import Products from Images
          </DialogTitle>
          <DialogDescription>
            Upload 1-4 product catalogue images to automatically extract specifications and create products
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {step === 'upload' && (
            <>
              {/* Category Selection */}
              <div className="space-y-4">
                <div>
                  <Label>
                    Select Category <span className="text-red-500">*</span>
                  </Label>
                  <CategoryDropdown
                    categories={allCategories}
                    value={categoryId}
                    onChange={setCategoryId}
                    showQuickCreate
                  />
                </div>
              </div>

              {/* Upload Area */}
              {files.length === 0 ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
                    isDragging
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-border hover:border-pink-300'
                  )}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center bg-muted',
                      isDragging && 'bg-pink-100'
                    )}>
                      <ImageIcon className={cn(
                        'w-8 h-8 text-muted-foreground',
                        isDragging && 'text-pink-500'
                      )} />
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">
                        Drag and drop your images here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or use the buttons below
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="gradient"
                        style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                      >
                        <Upload className="w-4 h-4" />
                        Choose Files
                      </Button>

                      <Button
                        onClick={handlePaste}
                        variant="outline"
                      >
                        <Clipboard className="w-4 h-4" />
                        Paste from Clipboard
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Supports PNG and JPEG images (max 4 images)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="relative group border rounded-lg overflow-hidden bg-muted/50"
                      >
                        <img
                          src={previewUrls[file.name]}
                          alt={file.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            onClick={() => handleRemoveImage(file.name)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add More Button */}
                  {files.length < 4 && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="w-4 h-4" />
                        Add More Images
                      </Button>

                      <Button
                        onClick={handlePaste}
                        variant="outline"
                        size="sm"
                      >
                        <Clipboard className="w-4 h-4" />
                        Paste
                      </Button>
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
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'done' && summary && (
            <>
              {/* Summary Card */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{summary.totalImages}</div>
                      <div className="text-sm text-muted-foreground">Images Processed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{summary.productsCreated}</div>
                      <div className="text-sm text-muted-foreground">Products Created</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{summary.productsUpdated}</div>
                      <div className="text-sm text-muted-foreground">Products Updated</div>
                    </div>
                  </div>

                  {summary.imagesFailed > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {summary.imagesFailed} image(s) failed to process
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results by Image */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Results by Image</h3>
                
                {Object.entries(resultsByFile).map(([filename, fileResults]) => {
                  const successCount = fileResults.filter(r => r.success).length;
                  const failCount = fileResults.length - successCount;

                  return (
                    <Card key={filename}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <ImageIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium truncate">{filename}</span>
                              <Badge variant={failCount === 0 ? 'default' : 'secondary'}>
                                {fileResults.length} product{fileResults.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {fileResults.map((result, idx) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    'flex items-start gap-2 text-sm p-2 rounded-lg',
                                    result.success ? (result.isUpdate ? 'bg-blue-50' : 'bg-green-50') : 'bg-red-50'
                                  )}
                                >
                                  {result.success ? (
                                    <CheckCircle2 className={cn(
                                      'w-4 h-4 shrink-0 mt-0.5',
                                      result.isUpdate ? 'text-blue-600' : 'text-green-600'
                                    )} />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      'font-medium',
                                      result.success 
                                        ? (result.isUpdate ? 'text-blue-900' : 'text-green-900')
                                        : 'text-red-900'
                                    )}>
                                      {result.productName}
                                      {result.isUpdate && (
                                        <span className="ml-2 text-xs font-normal text-blue-700">
                                          (Updated)
                                        </span>
                                      )}
                                    </p>
                                    {result.isUpdate && result.matchedProductName && (
                                      <p className="text-xs text-blue-700 mt-1">
                                        Matched with: "{result.matchedProductName}" 
                                        {result.similarity && (
                                          <span className="ml-1">
                                            ({Math.round(result.similarity * 100)}% similar)
                                          </span>
                                        )}
                                      </p>
                                    )}
                                    {result.error && (
                                      <p className="text-xs text-red-700 mt-1">{result.error}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleProcessAndImport}
                disabled={!categoryId || files.length === 0 || isProcessing}
                style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                className="text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Process & Import
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
                onClick={handleAddMoreProducts}
                style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                className="text-white"
              >
                <Upload className="w-4 h-4" />
                Add More Products
              </Button>
            </>
          )}
        </div>
      </DialogContent>

      {/* Quick Category Creation Dialog */}
      <QuickCategoryDialog
        open={showQuickCategoryDialog}
        onOpenChange={setShowQuickCategoryDialog}
        onCategoryCreated={handleCategoryCreated}
      />
    </Dialog>
  );
}
