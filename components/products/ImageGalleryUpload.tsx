"use client";

import { useRef, useState, type DragEvent as ReactDragEvent } from "react";
import Image from "next/image";
import { Plus, X, Star, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  /** Stable key for reordering and removal. */
  id: string;
  /** Object URL or remote URL used for the preview. */
  url: string;
  /** Present only for images picked in this session. */
  file?: File;
}

interface ImageGalleryUploadProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  max?: number;
  disabled?: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageGalleryUpload({
  images,
  onChange,
  max = 5,
  disabled,
}: ImageGalleryUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = max - images.length;

  const addFiles = (incoming: File[]) => {
    if (disabled) return;

    const valid: File[] = [];
    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;

    if (valid.length > remaining) {
      toast.error(
        remaining === 0
          ? `You already have ${max} images`
          : `Only ${remaining} more image${remaining === 1 ? "" : "s"} can be added`
      );
    }

    const accepted = valid.slice(0, Math.max(remaining, 0));
    if (accepted.length === 0) return;

    onChange([
      ...images,
      ...accepted.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url: URL.createObjectURL(file),
        file,
      })),
    ]);
  };

  const handleDrop = (event: ReactDragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const remove = (id: string) => {
    const target = images.find((image) => image.id === id);
    if (target?.file) URL.revokeObjectURL(target.url);
    onChange(images.filter((image) => image.id !== id));
  };

  const makePrimary = (id: string) => {
    const target = images.find((image) => image.id === id);
    if (!target) return;
    onChange([target, ...images.filter((image) => image.id !== id)]);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          addFiles(Array.from(event.target.files || []));
          if (inputRef.current) inputRef.current.value = "";
        }}
      />

      {images.length === 0 ? (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
            isDragging
              ? "border-pink-400 bg-pink-50"
              : "border-slate-200 bg-slate-50 hover:border-pink-300",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <div className="rounded-full bg-white p-3 shadow-sm">
            <ImageIcon className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            Click to upload or drag photos here
          </p>
          <p className="text-xs text-slate-500">
            Up to {max} images, 5MB each. The first one is the main photo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <div className="relative h-28 w-full">
                <Image
                  src={image.url}
                  alt={index === 0 ? "Main product photo" : `Product photo ${index + 1}`}
                  fill
                  className="object-contain"
                  unoptimized={image.url.startsWith("blob:") || image.url.startsWith("data:")}
                />
              </div>

              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-md bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Main
                </span>
              )}

              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(image.id)}
                      title="Make this the main photo"
                      className="rounded-lg bg-white/90 p-2 text-slate-700 transition-colors hover:bg-white"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(image.id)}
                    title="Remove this photo"
                    className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {remaining > 0 && !disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex h-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 transition-colors hover:border-pink-300 hover:text-pink-600"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">
                Add {remaining} more
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
