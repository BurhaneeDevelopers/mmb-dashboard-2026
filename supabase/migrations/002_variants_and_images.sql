-- =====================================================
-- 002: Category nesting, product images, catalogue image,
--      and SKU-level product variants
-- =====================================================

-- -----------------------------------------------------
-- CATEGORIES: nesting (already live in app code, was
-- missing from the tracked schema)
-- -----------------------------------------------------
ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS is_main BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_main ON categories(is_main);

-- A subcategory must have a parent; a main category must not.
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_main_check;
ALTER TABLE categories ADD CONSTRAINT categories_parent_main_check
    CHECK ((is_main AND parent_id IS NULL) OR (NOT is_main AND parent_id IS NOT NULL));

-- -----------------------------------------------------
-- PRODUCTS: catalogue page image + up to 5 gallery images
-- -----------------------------------------------------
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS catalogue_image_url TEXT,
    ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_images_max_check;
ALTER TABLE products ADD CONSTRAINT products_images_max_check
    CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 5);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_catalogue_image_url_length;
ALTER TABLE products ADD CONSTRAINT products_catalogue_image_url_length
    CHECK (catalogue_image_url IS NULL OR char_length(catalogue_image_url) <= 500);

COMMENT ON COLUMN products.catalogue_image_url IS 'Scan of the catalogue page this product came from';
COMMENT ON COLUMN products.images IS 'Product photos, max 5. images[1] is the primary image.';

-- Backfill: fold the legacy single image_url into images[]
UPDATE products
   SET images = ARRAY[image_url]
 WHERE image_url IS NOT NULL
   AND (images IS NULL OR array_length(images, 1) IS NULL);

-- -----------------------------------------------------
-- PRODUCT VARIANTS
-- One catalogue table row = one variant = one sellable SKU.
-- The product ("Mould Clamp") is the page; the variant
-- ("MMC-12A", T Bolt) is what goes in the cart.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    source_sku TEXT,
    variant_label TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT product_variants_sku_length CHECK (char_length(sku) >= 2 AND char_length(sku) <= 100),
    CONSTRAINT product_variants_status_check CHECK (status IN ('active', 'inactive', 'draft'))
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_sort ON product_variants(product_id, sort_order);

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON COLUMN product_variants.source_sku IS 'Model code exactly as printed in the catalogue, before any prefix rule';
COMMENT ON COLUMN product_variants.variant_label IS 'Sub-table this row came from, e.g. "With Clamping Stud" / "With T Bolt"';

-- -----------------------------------------------------
-- PRODUCT VARIANT VALUES
-- The locked spec combination for one variant.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variant_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    master_value_id UUID NOT NULL REFERENCES master_values(id) ON DELETE CASCADE,

    CONSTRAINT product_variant_values_unique UNIQUE (variant_id, master_value_id)
);

CREATE INDEX IF NOT EXISTS idx_pvv_variant_id ON product_variant_values(variant_id);
CREATE INDEX IF NOT EXISTS idx_pvv_master_value_id ON product_variant_values(master_value_id);

-- -----------------------------------------------------
-- RLS
-- -----------------------------------------------------
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product variants are viewable by everyone" ON product_variants;
CREATE POLICY "Product variants are viewable by everyone" ON product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert product variants" ON product_variants;
CREATE POLICY "Authenticated users can insert product variants" ON product_variants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can update product variants" ON product_variants;
CREATE POLICY "Authenticated users can update product variants" ON product_variants FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can delete product variants" ON product_variants;
CREATE POLICY "Authenticated users can delete product variants" ON product_variants FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Product variant values are viewable by everyone" ON product_variant_values;
CREATE POLICY "Product variant values are viewable by everyone" ON product_variant_values FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert product variant values" ON product_variant_values;
CREATE POLICY "Authenticated users can insert product variant values" ON product_variant_values FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can update product variant values" ON product_variant_values;
CREATE POLICY "Authenticated users can update product variant values" ON product_variant_values FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated users can delete product variant values" ON product_variant_values;
CREATE POLICY "Authenticated users can delete product variant values" ON product_variant_values FOR DELETE USING (auth.role() = 'authenticated');

COMMENT ON TABLE product_variants IS 'Sellable SKUs. One catalogue table row = one variant.';
COMMENT ON TABLE product_variant_values IS 'The exact spec combination that defines one variant';
