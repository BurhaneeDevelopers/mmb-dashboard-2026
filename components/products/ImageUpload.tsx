"use client";

import { useState, useRef, DragEvent } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50">
            <Image
              src={preview}
              alt="Product preview"
              fill
              className="object-contain"
              unoptimized={preview.startsWith('data:')}
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full h-64 rounded-xl border-2 border-dashed
            flex flex-col items-center justify-center gap-3
            transition-all cursor-pointer
            ${
              isDragging
                ? "border-pink-500 bg-pink-50"
                : "border-slate-300 bg-slate-50 hover:border-pink-400 hover:bg-pink-50/50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div
            className={`
            p-4 rounded-full transition-colors
            ${isDragging ? "bg-pink-100" : "bg-slate-100"}
          `}
          >
            {isDragging ? (
              <Upload className="w-8 h-8 text-pink-600" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              {isDragging ? "Drop image here" : "Click to upload or drag & drop"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
