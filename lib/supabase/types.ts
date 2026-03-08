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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          color: string
          icon: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          icon?: string
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
          status: 'active' | 'inactive'
          master_values: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sku: string
          description?: string | null
          category_id: string
          status?: 'active' | 'inactive'
          master_values?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string
          description?: string | null
          category_id?: string
          status?: 'active' | 'inactive'
          master_values?: Json
          created_at?: string
          updated_at?: string
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

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  status: 'active' | 'inactive';
  masterValues: Record<string, string[]>;
  createdAt: string;
}

// API request/response types
export interface CreateCategoryInput {
  name: string;
  description: string;
  color: string;
  icon: string;
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
  status: 'active' | 'inactive';
  masterValues: Record<string, string[]>;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}
