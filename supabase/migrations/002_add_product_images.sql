-- =====================================================
-- Add Image Support to Products
-- =====================================================

-- Add image_url column to products table
ALTER TABLE products
ADD COLUMN image_url TEXT;

-- Add constraint for image URL length
ALTER TABLE products
ADD CONSTRAINT products_image_url_length 
CHECK (image_url IS NULL OR char_length(image_url) <= 500);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Add comment
COMMENT ON COLUMN products.image_url IS 'URL to product image stored in Supabase Storage';
