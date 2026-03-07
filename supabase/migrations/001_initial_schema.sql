-- =====================================================
-- FastenersPro Database Schema
-- =====================================================
-- This schema supports a fasteners catalog management system
-- with Categories, Masters (attributes), and Products
-- 
-- Hierarchy:
-- 1. Categories (e.g., "Die Springs", "Ejector Pins")
-- 2. Masters (e.g., "Size", "Length", "Material") - linked to Categories
-- 3. Products - belong to one Category, have values from its Masters
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
-- Categories represent product types (e.g., Die Springs, Ejector Pins)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT categories_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT categories_description_length CHECK (char_length(description) >= 5 AND char_length(description) <= 500)
);

-- Index for faster queries
CREATE INDEX idx_categories_created_at ON categories(created_at DESC);
CREATE INDEX idx_categories_name ON categories(name);

-- =====================================================
-- MASTERS TABLE
-- =====================================================
-- Masters represent attribute types (e.g., Size, Length, Material)
-- that can be linked to multiple categories
CREATE TABLE masters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT masters_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT masters_description_length CHECK (char_length(description) >= 5 AND char_length(description) <= 500)
);

-- Indexes
CREATE INDEX idx_masters_category_id ON masters(category_id);
CREATE INDEX idx_masters_created_at ON masters(created_at DESC);
CREATE INDEX idx_masters_name ON masters(name);

-- =====================================================
-- MASTER FIELDS TABLE
-- =====================================================
-- Fields define the specific attributes for each master
-- (e.g., Master "Size" has field "Size" with options ["M6", "M8", "M10"])
CREATE TABLE master_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'select',
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    unit TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT master_fields_type_check CHECK (type IN ('select', 'text', 'number', 'color')),
    CONSTRAINT master_fields_label_length CHECK (char_length(label) >= 1 AND char_length(label) <= 100)
);

-- Indexes
CREATE INDEX idx_master_fields_master_id ON master_fields(master_id);
CREATE INDEX idx_master_fields_sort_order ON master_fields(master_id, sort_order);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
-- Products are the actual items in the catalog
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active',
    master_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT products_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
    CONSTRAINT products_sku_length CHECK (char_length(sku) >= 3 AND char_length(sku) <= 100),
    CONSTRAINT products_status_check CHECK (status IN ('active', 'inactive', 'draft'))
);

-- Indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_name ON products(name);

-- GIN index for JSONB master_values for efficient querying
CREATE INDEX idx_products_master_values ON products USING GIN (master_values);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_masters_updated_at
    BEFORE UPDATE ON masters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CATEGORIES RLS POLICIES
-- =====================================================

-- Public read access (for ecommerce site)
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert categories"
    ON categories FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update
CREATE POLICY "Authenticated users can update categories"
    ON categories FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete categories"
    ON categories FOR DELETE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- MASTERS RLS POLICIES
-- =====================================================

-- Public read access (for ecommerce site)
CREATE POLICY "Masters are viewable by everyone"
    ON masters FOR SELECT
    USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert masters"
    ON masters FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update
CREATE POLICY "Authenticated users can update masters"
    ON masters FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete masters"
    ON masters FOR DELETE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- MASTER FIELDS RLS POLICIES
-- =====================================================

-- Public read access (for ecommerce site)
CREATE POLICY "Master fields are viewable by everyone"
    ON master_fields FOR SELECT
    USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert master fields"
    ON master_fields FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update
CREATE POLICY "Authenticated users can update master fields"
    ON master_fields FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete master fields"
    ON master_fields FOR DELETE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- PRODUCTS RLS POLICIES
-- =====================================================

-- Public can view active products (for ecommerce site)
CREATE POLICY "Active products are viewable by everyone"
    ON products FOR SELECT
    USING (status = 'active' OR auth.role() = 'authenticated');

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert products"
    ON products FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update
CREATE POLICY "Authenticated users can update products"
    ON products FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete products"
    ON products FOR DELETE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert sample categories
INSERT INTO categories (id, name, description, color, icon) VALUES
    ('cat-1', 'Die Springs', 'Compression springs used in die sets and molds', '#6366f1', '🔗'),
    ('cat-2', 'Ejector Pins', 'Pins used to eject parts from molds', '#ec4899', '📌');

-- Insert sample masters
INSERT INTO masters (id, name, description, color, icon, category_id) VALUES
    ('master-1', 'Size', 'Product size specification', '#6366f1', '📐', 'cat-1'),
    ('master-2', 'Load', 'Load capacity specification', '#f59e0b', '⚡', 'cat-1'),
    ('master-3', 'Length', 'Product length measurement', '#ec4899', '📏', 'cat-2'),
    ('master-4', 'Material', 'Material composition', '#10b981', '🔧', 'cat-2');

-- Insert sample master fields
INSERT INTO master_fields (master_id, label, type, options, unit, sort_order) VALUES
    ('master-1', 'Size', 'select', '["M6", "M8", "M10", "M12", "M16"]'::jsonb, NULL, 0),
    ('master-2', 'Load', 'select', '["Light", "Medium", "Heavy", "Extra Heavy"]'::jsonb, NULL, 0),
    ('master-3', 'Length', 'select', '["50mm", "75mm", "100mm", "150mm", "200mm"]'::jsonb, 'mm', 0),
    ('master-4', 'Material', 'select', '["SKD61", "SKH51", "Nitrided Steel", "Stainless Steel"]'::jsonb, NULL, 0);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get all masters for a category
CREATE OR REPLACE FUNCTION get_category_masters(category_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    color TEXT,
    icon TEXT,
    fields JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.description,
        m.color,
        m.icon,
        jsonb_agg(
            jsonb_build_object(
                'id', mf.id,
                'label', mf.label,
                'type', mf.type,
                'options', mf.options,
                'unit', mf.unit
            ) ORDER BY mf.sort_order
        ) as fields
    FROM masters m
    LEFT JOIN master_fields mf ON m.id = mf.master_id
    WHERE m.category_id = category_uuid
    GROUP BY m.id, m.name, m.description, m.color, m.icon;
END;
$$ LANGUAGE plpgsql;

-- Function to search products
CREATE OR REPLACE FUNCTION search_products(search_term TEXT, category_filter UUID DEFAULT NULL, status_filter TEXT DEFAULT 'active')
RETURNS TABLE (
    id UUID,
    name TEXT,
    sku TEXT,
    description TEXT,
    category_id UUID,
    status TEXT,
    master_values JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.sku,
        p.description,
        p.category_id,
        p.status,
        p.master_values,
        p.created_at
    FROM products p
    WHERE 
        (search_term IS NULL OR search_term = '' OR 
         p.name ILIKE '%' || search_term || '%' OR 
         p.sku ILIKE '%' || search_term || '%')
        AND (category_filter IS NULL OR p.category_id = category_filter)
        AND (status_filter IS NULL OR p.status = status_filter)
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE categories IS 'Product categories (e.g., Die Springs, Ejector Pins)';
COMMENT ON TABLE masters IS 'Attribute types (e.g., Size, Length, Material) that can be linked to categories';
COMMENT ON TABLE master_fields IS 'Specific fields for each master with their options';
COMMENT ON TABLE products IS 'Actual products in the catalog';

COMMENT ON COLUMN products.master_values IS 'JSONB object storing selected values for each master field. Format: {"field_id": ["value1", "value2"]}';
COMMENT ON COLUMN products.status IS 'Product status: active (visible to public), inactive (hidden), draft (work in progress)';
