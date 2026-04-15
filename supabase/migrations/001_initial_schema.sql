-- =====================================================
-- FastenersPro Complete Database Schema
-- =====================================================
-- Clean schema with proper relational structure
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT categories_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT categories_description_length CHECK (char_length(description) >= 5 AND char_length(description) <= 500)
);

CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MASTERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS masters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT masters_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT masters_description_length CHECK (char_length(description) >= 5 AND char_length(description) <= 500)
);

CREATE INDEX IF NOT EXISTS idx_masters_category_id ON masters(category_id);
CREATE INDEX IF NOT EXISTS idx_masters_created_at ON masters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_masters_name ON masters(name);

CREATE TRIGGER update_masters_updated_at
    BEFORE UPDATE ON masters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MASTER FIELDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS master_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_id UUID NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'select',
    unit TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT master_fields_type_check CHECK (type IN ('select', 'text', 'number', 'color')),
    CONSTRAINT master_fields_label_length CHECK (char_length(label) >= 1 AND char_length(label) <= 100)
);

CREATE INDEX IF NOT EXISTS idx_master_fields_master_id ON master_fields(master_id);
CREATE INDEX IF NOT EXISTS idx_master_fields_sort_order ON master_fields(master_id, sort_order);

-- =====================================================
-- MASTER VALUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS master_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_field_id UUID NOT NULL REFERENCES master_fields(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT master_values_master_field_id_value_key UNIQUE (master_field_id, value)
);

CREATE INDEX IF NOT EXISTS idx_master_values_master_field_id ON master_values(master_field_id);
CREATE INDEX IF NOT EXISTS idx_master_values_value ON master_values(value);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT products_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
    CONSTRAINT products_sku_length CHECK (char_length(sku) >= 3 AND char_length(sku) <= 100),
    CONSTRAINT products_status_check CHECK (status IN ('active', 'inactive', 'draft')),
    CONSTRAINT products_image_url_length CHECK (image_url IS NULL OR char_length(image_url) <= 500)
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PRODUCT MASTER VALUES TABLE (Junction Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_master_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    master_value_id UUID NOT NULL REFERENCES master_values(id) ON DELETE CASCADE,
    
    CONSTRAINT product_master_values_product_master_unique UNIQUE (product_id, master_value_id)
);

CREATE INDEX IF NOT EXISTS idx_product_master_values_product_id ON product_master_values(product_id);
CREATE INDEX IF NOT EXISTS idx_product_master_values_master_value_id ON product_master_values(master_value_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_master_values ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Masters Policies
CREATE POLICY "Masters are viewable by everyone" ON masters FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert masters" ON masters FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update masters" ON masters FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete masters" ON masters FOR DELETE USING (auth.role() = 'authenticated');

-- Master Fields Policies
CREATE POLICY "Master fields are viewable by everyone" ON master_fields FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert master fields" ON master_fields FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update master fields" ON master_fields FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete master fields" ON master_fields FOR DELETE USING (auth.role() = 'authenticated');

-- Master Values Policies
CREATE POLICY "Master values are viewable by everyone" ON master_values FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert master values" ON master_values FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update master values" ON master_values FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete master values" ON master_values FOR DELETE USING (auth.role() = 'authenticated');

-- Products Policies
CREATE POLICY "Active products are viewable by everyone" ON products FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Product Master Values Policies
CREATE POLICY "Product master values are viewable by everyone" ON product_master_values FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert product master values" ON product_master_values FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update product master values" ON product_master_values FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete product master values" ON product_master_values FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE categories IS 'Product categories';
COMMENT ON TABLE masters IS 'Attribute types linked to categories';
COMMENT ON TABLE master_fields IS 'Fields for each master';
COMMENT ON TABLE master_values IS 'Individual values for master fields';
COMMENT ON TABLE products IS 'Products in the catalog';
COMMENT ON TABLE product_master_values IS 'Junction table linking products to master values';
