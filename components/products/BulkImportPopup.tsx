"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/lib/hooks";

interface ProcessResult {
  filename: string;
  success: boolean;
  productId?: string;
  productName?: string;
  error?: string;
}

interface ApiSummary {
  totalImages: number;
  imagesProcessed: number;
  imagesFailed: number;
  productsCreated: number;
}

interface BulkImportPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type Step = "upload" | "done";

export function BulkImportPopup({ open, onOpenChange, onComplete }: BulkImportPopupProps) {
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [categoryId, setCategoryId] = useState("");
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [summary, setSummary] = useState<ApiSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useCategories();

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addFiles = (newFiles: File[]) => {
    const allowed = newFiles
      .filter(f => f.type === "image/png" || f.type === "image/jpeg")
      .slice(0, 4 - files.length);

    setFiles(prev => {
      const updated = [...prev, ...allowed].slice(0, 4);
      const newPreviews: Record<string, string> = {};
      allowed.forEach(f => {
        newPreviews[f.name] = URL.createObjectURL(f);
      });
      setPreviewUrls(prev2 => ({ ...prev2, ...newPreviews }));
      return updated;
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (files.length < 4) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (files.length >= 4) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleProcess = async () => {
    if (!categoryId || files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append("images", file));
      formData.append("categoryId", categoryId);

      const res = await fetch("/api/letterhead-process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setIsProcessing(false);
        return;
      }

      // Map results to parsed images format
      
      if (data.results && Array.isArray(data.results)) {
        setResults(data.results);
      }

      if (data.summary) {
        setSummary(data.summary);
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviewUrls({});
    setResults([]);
    setSummary(null);
    setCategoryId("");
    setStep("upload");
    setError(null);
    onOpenChange(false);
    if (step === "done") {
      onComplete?.();
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  // Group results by filename to show per-image status
  const imageResults = files.map(file => {
    const fileResults = results.filter(r => r.filename === file.name);
    const successfulProducts = fileResults.filter(r => r.success);
    const failedProducts = fileResults.filter(r => !r.success);
    
    return {
      filename: file.name,
      totalProducts: fileResults.length,
      successfulProducts: successfulProducts.length,
      failedProducts: failedProducts.length,
      products: fileResults,
    };
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Bulk Import from Letterhead</DialogTitle>
          <DialogDescription>
            Upload 1–4 product images to auto-extract masters and values
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={step === "upload" ? "text-foreground font-medium" : ""}>1. Upload</span>
          <ChevronRight className="w-3 h-3" />
          <span className={step === "done" ? "text-foreground font-medium" : ""}>2. Done</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* STEP 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            {/* Category selector */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Dropzone */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (files.length < 4) fileInputRef.current?.click();
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                files.length < 4 ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              } ${
                isDragging
                  ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                  : "border-muted-foreground/25 hover:border-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-950/10"
              }`}
            >
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragging
                  ? "Drop images here..."
                  : "Click to select or drag & drop PNG/JPEG images"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Maximum 4 images</p>
            </div>

            {/* File previews */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Images ({files.length}/4)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {files.map(file => (
                    <div key={file.name} className="relative group rounded-lg overflow-hidden border">
                      <img
                        src={previewUrls[file.name]}
                        alt={file.name}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                        <p className="text-white text-xs truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Process button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} type="button">Cancel</Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleProcess();
                }}
                disabled={files.length === 0 || !categoryId || isProcessing}
                type="button"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing & Importing...
                  </>
                ) : (
                  "Process & Import"
                )}
              </Button>
            </div>
          </div>
        )}



        {/* STEP 2: Done */}
        {step === "done" && (
          <div className="space-y-4 py-4">
            {/* Summary */}
            {summary && (
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-sm font-medium mb-2">Import Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Images processed:</span>
                    <span className="ml-2 font-medium">{summary.imagesProcessed} / {summary.totalImages}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Products created:</span>
                    <span className="ml-2 font-medium text-green-600">{summary.productsCreated}</span>
                  </div>
                </div>
              </div>
            )}

            {successCount > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">
                    {successCount} product{successCount !== 1 ? "s" : ""} imported successfully
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-500">
                    Masters and values were created or reused automatically.
                  </p>
                </div>
              </div>
            )}

            {failCount > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">
                    {failCount} product{failCount !== 1 ? "s" : ""} failed to import
                  </p>
                  <div className="mt-2 space-y-1">
                    {results.filter(r => !r.success).map((r, idx) => (
                      <p key={idx} className="text-sm text-red-700 dark:text-red-400">
                        {r.productName || r.filename}: {r.error}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Per-image breakdown */}
            {imageResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Details by Image</p>
                {imageResults.map((img, idx) => (
                  <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate flex-1">{img.filename}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        img.successfulProducts > 0 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {img.successfulProducts} / {img.totalProducts} products
                      </span>
                    </div>
                    {img.products.length > 0 && (
                      <div className="space-y-1">
                        {img.products.map((product, pidx) => (
                          <div key={pidx} className="flex items-center gap-2 text-xs">
                            {product.success ? (
                              <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                            )}
                            <span className={product.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                              {product.productName || "Unknown"}
                              {!product.success && product.error && ` - ${product.error}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleClose} 
                type="button"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
