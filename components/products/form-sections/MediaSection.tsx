"use client";

import Image from "next/image";
import { useRef } from "react";
import { FileText, Info, X } from "lucide-react";
import { toast } from "sonner";
import { ImageGalleryUpload, type GalleryImage } from "../ImageGalleryUpload";

interface MediaSectionProps {
  stepNumber: number;
  catalogueImage?: GalleryImage;
  onCatalogueImageChange: (image: GalleryImage | undefined) => void;
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
  maxImages: number;
  disabled?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Two distinct uploads that people confuse if you put them in one box:
 * the catalogue page (the source document) and the product photos (what the
 * shopper sees). They are kept visually separate and each says what it is for.
 */
export function MediaSection({
  stepNumber,
  catalogueImage,
  onCatalogueImageChange,
  images,
  onImagesChange,
  maxImages,
  disabled,
}: MediaSectionProps) {
  const catalogueInputRef = useRef<HTMLInputElement>(null);

  const handleCatalogueFile = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("The catalogue page must be an image file");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("The catalogue page must be smaller than 10MB");
      return;
    }

    if (catalogueImage?.file) URL.revokeObjectURL(catalogueImage.url);

    onCatalogueImageChange({
      id: `catalogue-${Date.now()}`,
      url: URL.createObjectURL(file),
      file,
    });
  };

  const removeCatalogue = () => {
    if (catalogueImage?.file) URL.revokeObjectURL(catalogueImage.url);
    onCatalogueImageChange(undefined);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
          {stepNumber}
        </div>
        <h2 className="text-sm font-semibold text-slate-700">Images</h2>
      </div>

      <div className="space-y-6">
        {/* Catalogue page */}
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label className="text-sm font-medium text-slate-700">
              Catalogue page
            </label>
            <span className="text-xs text-slate-400">Optional</span>
          </div>
          <p className="mb-3 flex items-start gap-1.5 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            The scan of the printed page this product came from. Kept for
            reference and not shown to customers.
          </p>

          <input
            ref={catalogueInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              handleCatalogueFile(event.target.files?.[0]);
              if (catalogueInputRef.current) catalogueInputRef.current.value = "";
            }}
          />

          {catalogueImage ? (
            <div className="group relative flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                <Image
                  src={catalogueImage.url}
                  alt="Catalogue page"
                  fill
                  className="object-contain"
                  unoptimized={
                    catalogueImage.url.startsWith("blob:") ||
                    catalogueImage.url.startsWith("data:")
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700">
                  Catalogue page attached
                </p>
                <button
                  type="button"
                  onClick={() => catalogueInputRef.current?.click()}
                  disabled={disabled}
                  className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Replace
                </button>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={removeCatalogue}
                  title="Remove the catalogue page"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => catalogueInputRef.current?.click()}
              disabled={disabled}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="rounded-lg bg-white p-2.5 shadow-sm">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Upload the catalogue page
                </p>
                <p className="text-xs text-slate-500">PNG or JPG, up to 10MB</p>
              </div>
            </button>
          )}
        </div>

        <div className="border-t border-slate-100" />

        {/* Product photos */}
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label className="text-sm font-medium text-slate-700">
              Product photos
            </label>
            <span className="text-xs text-slate-400">
              {images.length} of {maxImages}
            </span>
          </div>
          <p className="mb-3 flex items-start gap-1.5 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Photos shown on the storefront. The first one is the main image;
            hover any photo to make it main or remove it.
          </p>

          <ImageGalleryUpload
            images={images}
            onChange={onImagesChange}
            max={maxImages}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
