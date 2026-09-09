// Database types generated from Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string
          color: string
          icon: string
          parent_id: string | null
          is_main: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          color: string
          icon: string
          parent_id?: string | null
          is_main?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          icon?: string
          parent_id?: string | null
          is_main?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      masters: {
        Row: {
          id: string
          name: string
          description: string
          color: string
          icon: string
          category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          color: string
          icon: string
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          icon?: string
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      master_fields: {
        Row: {
          id: string
          master_id: string
          label: string
          type: string
          options: Json
          unit: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          master_id: string
          label: string
          type?: string
          options?: Json
          unit?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          master_id?: string
          label?: string
          type?: string
          options?: Json
          unit?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string
          description: string | null
          category_id: string
          status: 'active' | 'inactive' | 'draft'
          image_url: string | null
          catalogue_image_url: string | null
          images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sku: string
          description?: string | null
          category_id: string
          status?: 'active' | 'inactive' | 'draft'
          image_url?: string | null
          catalogue_image_url?: string | null
          images?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string
          description?: string | null
          category_id?: string
          status?: 'active' | 'inactive' | 'draft'
          image_url?: string | null
          catalogue_image_url?: string | null
          images?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      master_values: {
        Row: {
          id: string
          master_field_id: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          master_field_id: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          master_field_id?: string
          value?: string
          created_at?: string
        }
      }
      product_master_values: {
        Row: {
          id: string
          product_id: string
          master_value_id: string
        }
        Insert: {
          id?: string
          product_id: string
          master_value_id: string
        }
        Update: {
          id?: string
          product_id?: string
          master_value_id?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          source_sku: string | null
          variant_label: string | null
          sort_order: number
          status: 'active' | 'inactive' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          source_sku?: string | null
          variant_label?: string | null
          sort_order?: number
          status?: 'active' | 'inactive' | 'draft'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string
          source_sku?: string | null
          variant_label?: string | null
          sort_order?: number
          status?: 'active' | 'inactive' | 'draft'
          created_at?: string
          updated_at?: string
        }
      }
      product_variant_values: {
        Row: {
          id: string
          variant_id: string
          master_value_id: string
        }
        Insert: {
          id?: string
          variant_id: string
          master_value_id: string
        }
        Update: {
          id?: string
          variant_id?: string
          master_value_id?: string
        }
      }
    }
  }
}

// Application types
export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  parentId?: string | null;
  isMain: boolean;
}

export interface MasterField {
  id: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'color';
  options: string[];
  unit?: string;
}

export interface Master {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  categoryId?: string;
  fields: MasterField[];
  createdAt: string;
}

export interface MasterValue {
  id: string;
  masterFieldId: string;
  value: string;
  createdAt: string;
}

export interface ProductMasterValue {
  id: string;
  productId: string;
  masterValueId: string;
  masterValue?: MasterValue;
}

/** One sellable SKU: a single row of a catalogue specification table. */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  /** Model code as printed in the catalogue, before the SKU rule ran. */
  sourceSku?: string;
  /** Sub-table the row came from, e.g. "Mould Clamp with T Bolt". */
  variantLabel?: string;
  sortOrder: number;
  status: 'active' | 'inactive' | 'draft';
  /** The locked spec combination for this SKU, keyed by master field id. */
  values: Record<string, string>;
  masterValueIds: string[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  status: 'active' | 'inactive' | 'draft';
  masterValues: Record<string, string[]>; // For backward compatibility
  masterValueIds?: string[]; // New: array of master_value IDs
  /** Product photos, max 5. images[0] is the primary image. */
  images: string[];
  /** Scan of the catalogue page this product came from. */
  catalogueImageUrl?: string;
  /** Kept in sync with images[0] for screens that still read a single image. */
  imageUrl?: string;
  variants: ProductVariant[];
  createdAt: string;
}

// API request/response types
export interface CreateCategoryInput {
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string | null;
  isMain: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface CreateMasterInput {
  name: string;
  description: string;
  color: string;
  icon: string;
  categoryId?: string;
  fields: Array<{
    label: string;
    type: 'select';
    options: string[];
    unit?: string;
  }>;
}

export interface UpdateMasterInput extends Partial<Omit<CreateMasterInput, 'fields'>> {
  fields?: Array<{
    id?: string;
    label: string;
    type: 'select';
    options: string[];
    unit?: string;
  }>;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  categoryId: string;
  status: 'active' | 'inactive' | 'draft';
  masterValueIds: string[]; // Array of master_value IDs to link
  /** Product photos, max 5. */
  images?: string[];
  /** Scan of the catalogue page this product came from. */
  catalogueImageUrl?: string | null;
  imageUrl?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface CreateMasterValueInput {
  masterFieldId: string;
  value: string;
}

export interface UpdateMasterValueInput {
  value?: string;
}
