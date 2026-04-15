-- =====================================================
-- Seed Data for Testing
-- =====================================================

-- Insert Categories
INSERT INTO categories (name, description, color, icon) VALUES
('Die Springs', 'High-quality compression springs for die sets and molds', '#6366f1', '🔗'),
('Ejector Pins', 'Precision ejector pins for mold ejection systems', '#ec4899', '📌'),
('Guide Posts', 'Precision guide posts for die alignment', '#10b981', '🎯');

-- Insert Masters for Die Springs
DO $$
DECLARE
  v_category_id UUID;
  v_master_id UUID;
  v_field_id UUID;
BEGIN
  -- Get Die Springs category
  SELECT id INTO v_category_id FROM categories WHERE name = 'Die Springs';
  
  -- Create Size Master
  INSERT INTO masters (name, description, color, icon, category_id)
  VALUES ('Size', 'Spring size specification', '#6366f1', '📐', v_category_id)
  RETURNING id INTO v_master_id;
  
  INSERT INTO master_fields (master_id, label, type, unit, sort_order)
  VALUES (v_master_id, 'Size', 'select', NULL, 0)
  RETURNING id INTO v_field_id;
  
  INSERT INTO master_values (master_field_id, value) VALUES
  (v_field_id, 'M6'),
  (v_field_id, 'M8'),
  (v_field_id, 'M10'),
  (v_field_id, 'M12'),
  (v_field_id, 'M16');
  
  -- Create Load Master
  INSERT INTO masters (name, description, color, icon, category_id)
  VALUES ('Load', 'Load capacity classification', '#f59e0b', '⚡', v_category_id)
  RETURNING id INTO v_master_id;
  
  INSERT INTO master_fields (master_id, label, type, unit, sort_order)
  VALUES (v_master_id, 'Load Type', 'select', NULL, 0)
  RETURNING id INTO v_field_id;
  
  INSERT INTO master_values (master_field_id, value) VALUES
  (v_field_id, 'Light'),
  (v_field_id, 'Medium'),
  (v_field_id, 'Heavy'),
  (v_field_id, 'Extra Heavy');
  
  -- Create Free Length Master
  INSERT INTO masters (name, description, color, icon, category_id)
  VALUES ('Free Length', 'Free length measurement', '#8b5cf6', '📏', v_category_id)
  RETURNING id INTO v_master_id;
  
  INSERT INTO master_fields (master_id, label, type, unit, sort_order)
  VALUES (v_master_id, 'Free Length', 'select', 'mm', 0)
  RETURNING id INTO v_field_id;
  
  INSERT INTO master_values (master_field_id, value) VALUES
  (v_field_id, '25'),
  (v_field_id, '38'),
  (v_field_id, '51'),
  (v_field_id, '64'),
  (v_field_id, '76');
END $$;

-- Insert Masters for Ejector Pins
DO $$
DECLARE
  v_category_id UUID;
  v_master_id UUID;
  v_field_id UUID;
BEGIN
  -- Get Ejector Pins category
  SELECT id INTO v_category_id FROM categories WHERE name = 'Ejector Pins';
  
  -- Create Diameter Master
  INSERT INTO masters (name, description, color, icon, category_id)
  VALUES ('Diameter', 'Pin diameter specification', '#ec4899', '⭕', v_category_id)
  RETURNING id INTO v_master_id;
  
  INSERT INTO master_fields (master_id, label, type, unit, sort_order)
  VALUES (v_master_id, 'Diameter', 'select', 'mm', 0)
  RETURNING id INTO v_field_id;
  
  INSERT INTO master_values (master_field_id, value) VALUES
  (v_field_id, '2.0'),
  (v_field_id, '3.0'),
  (v_field_id, '4.0'),
  (v_field_id, '5.0'),
  (v_field_id, '6.0');
  
  -- Create Length Master
  INSERT INTO masters (name, description, color, icon, category_id)
  VALUES ('Length', 'Pin length measurement', '#f59e0b', '📏', v_category_id)
  RETURNING id INTO v_master_id;
  
  INSERT INTO master_fields (master_id, label, type, unit, sort_order)
  VALUES (v_master_id, 'Length', 'select', 'mm', 0)
  RETURNING id INTO v_field_id;
  
  INSERT INTO master_values (master_field_id, value) VALUES
  (v_field_id, '50'),
  (v_field_id, '75'),
  (v_field_id, '100'),
  (v_field_id, '150'),
  (v_field_id, '200');
  
  -- Create Material Master
  INSERT INTO masters (name, description, color, icon, category_id)
  VALUES ('Material', 'Material composition', '#10b981', '🔧', v_category_id)
  RETURNING id INTO v_master_id;
  
  INSERT INTO master_fields (master_id, label, type, unit, sort_order)
  VALUES (v_master_id, 'Material', 'select', NULL, 0)
  RETURNING id INTO v_field_id;
  
  INSERT INTO master_values (master_field_id, value) VALUES
  (v_field_id, 'SKD61'),
  (v_field_id, 'SKH51'),
  (v_field_id, 'Nitrided Steel'),
  (v_field_id, 'Stainless Steel');
END $$;

-- Insert Masters for Guide Posts
DO $$
DECLARE
  v_category_id UUID;
  v_master_id UUID;
  v_field_id UUID;
BEGIN
  -- Get Guide Posts category
  SELECT id INTO v_category_id FROM categories WHERE name = 'Guide Posts';
  
  -- Create Diameter Master
  INSERT INTO masters (name, description, color, icon, category_id)
  VALUES ('Diameter', 'Guide post diameter', '#10b981', '⭕', v_category_id)
  RETURNING id INTO v_master_id;
  
  INSERT INTO master_fields (master_id, label, type, unit, sort_order)
  VALUES (v_master_id, 'Diameter', 'select', 'mm', 0)
  RETURNING id INTO v_field_id;
  
  INSERT INTO master_values (master_field_id, value) VALUES
  (v_field_id, '12'),
  (v_field_id, '16'),
  (v_field_id, '20'),
  (v_field_id, '25');
  
  -- Create Length Master
  INSERT INTO masters (name, description, color, icon, category_id)
  VALUES ('Length', 'Guide post length', '#3b82f6', '📏', v_category_id)
  RETURNING id INTO v_master_id;
  
  INSERT INTO master_fields (master_id, label, type, unit, sort_order)
  VALUES (v_master_id, 'Length', 'select', 'mm', 0)
  RETURNING id INTO v_field_id;
  
  INSERT INTO master_values (master_field_id, value) VALUES
  (v_field_id, '100'),
  (v_field_id, '150'),
  (v_field_id, '200'),
  (v_field_id, '250');
END $$;

-- Insert Products
DO $$
DECLARE
  v_category_id UUID;
  v_product_id UUID;
  v_value_id UUID;
BEGIN
  -- Die Spring Products
  SELECT id INTO v_category_id FROM categories WHERE name = 'Die Springs';
  
  -- Product 1: Die Spring M6 Light 25mm
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES ('Die Spring M6 Light 25mm', 'DS-M6-L-25', 
    'Light duty die spring, M6 size with 25mm free length', 
    v_category_id, 'active')
  RETURNING id INTO v_product_id;
  
  -- Link values
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Size' AND m.category_id = v_category_id AND mv.value = 'M6';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Load' AND m.category_id = v_category_id AND mv.value = 'Light';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Free Length' AND m.category_id = v_category_id AND mv.value = '25';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  -- Product 2: Die Spring M10 Heavy 51mm
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES ('Die Spring M10 Heavy 51mm', 'DS-M10-H-51', 
    'Heavy duty die spring, M10 size with 51mm free length', 
    v_category_id, 'active')
  RETURNING id INTO v_product_id;
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Size' AND m.category_id = v_category_id AND mv.value = 'M10';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Load' AND m.category_id = v_category_id AND mv.value = 'Heavy';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Free Length' AND m.category_id = v_category_id AND mv.value = '51';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  -- Ejector Pin Products
  SELECT id INTO v_category_id FROM categories WHERE name = 'Ejector Pins';
  
  -- Product 3: Ejector Pin 3mm x 75mm SKD61
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES ('Ejector Pin 3mm x 75mm SKD61', 'EP-3-75-SKD61', 
    'Precision ejector pin, 3mm diameter x 75mm length in SKD61', 
    v_category_id, 'active')
  RETURNING id INTO v_product_id;
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Diameter' AND m.category_id = v_category_id AND mv.value = '3.0';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Length' AND m.category_id = v_category_id AND mv.value = '75';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Material' AND m.category_id = v_category_id AND mv.value = 'SKD61';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  -- Product 4: Ejector Pin 5mm x 150mm Stainless
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES ('Ejector Pin 5mm x 150mm Stainless', 'EP-5-150-SS', 
    'Stainless steel ejector pin, 5mm diameter x 150mm length', 
    v_category_id, 'active')
  RETURNING id INTO v_product_id;
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Diameter' AND m.category_id = v_category_id AND mv.value = '5.0';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Length' AND m.category_id = v_category_id AND mv.value = '150';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Material' AND m.category_id = v_category_id AND mv.value = 'Stainless Steel';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  -- Guide Post Products
  SELECT id INTO v_category_id FROM categories WHERE name = 'Guide Posts';
  
  -- Product 5: Guide Post 16mm x 150mm
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES ('Guide Post 16mm x 150mm', 'GP-16-150', 
    'Precision guide post, 16mm diameter x 150mm length', 
    v_category_id, 'active')
  RETURNING id INTO v_product_id;
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Diameter' AND m.category_id = v_category_id AND mv.value = '16';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Length' AND m.category_id = v_category_id AND mv.value = '150';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  -- Product 6: Guide Post 20mm x 200mm
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES ('Guide Post 20mm x 200mm', 'GP-20-200', 
    'Heavy duty guide post, 20mm diameter x 200mm length', 
    v_category_id, 'draft')
  RETURNING id INTO v_product_id;
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Diameter' AND m.category_id = v_category_id AND mv.value = '20';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
  
  SELECT mv.id INTO v_value_id FROM master_values mv
  JOIN master_fields mf ON mv.master_field_id = mf.id
  JOIN masters m ON mf.master_id = m.id
  WHERE m.name = 'Length' AND m.category_id = v_category_id AND mv.value = '200';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_value_id);
END $$;
