import type { GalleryImage } from "../ImageGalleryUpload";

/** Shape of the product form, shared by the form and each of its sections. */
export type ProductFormData = {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  status: "active" | "inactive" | "draft";
  masterValues: Record<string, string[]>;
  /** Product photos, max 5. The first is the main image. */
  images: GalleryImage[];
  /** Scan of the catalogue page this product came from. */
  catalogueImage?: GalleryImage;
};
