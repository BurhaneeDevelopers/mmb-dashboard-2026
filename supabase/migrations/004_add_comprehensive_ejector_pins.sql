-- =====================================================
-- Comprehensive Blade & Air Ejector Pins with ALL specs
-- Based on MMB catalog pages 8, 13, 14, 15
-- =====================================================

DO $$
DECLARE
  v_cat        UUID;
  m_diameter   UUID;
  m_length     UUID;
  m_material   UUID;
  m_pin_type   UUID;
  m_standard   UUID;
  m_d2         UUID;
  m_k          UUID;
  m_r          UUID;
  m_hardness   UUID;
  
  f_diameter   UUID;
  f_length     UUID;
  f_material   UUID;
  f_pin_type   UUID;
  f_standard   UUID;
  f_d2         UUID;
  f_k          UUID;
  f_r          UUID;
  f_hardness   UUID;
  
  v_product_id UUID;
  v_val_id     UUID;
  v_val        TEXT;
BEGIN
  -- Get Ejector Pins category
  SELECT id INTO v_cat FROM categories WHERE name = 'Ejector Pins';
  IF v_cat IS NULL THEN 
    RAISE EXCEPTION 'Category "Ejector Pins" not found'; 
  END IF;

  -- =====================================================
  -- Resolve or create all masters
  -- =====================================================
  
  SELECT id INTO m_diameter FROM masters WHERE name = 'Diameter' AND category_id = v_cat;
  SELECT id INTO m_length FROM masters WHERE name = 'Length' AND category_id = v_cat;
  SELECT id INTO m_material FROM masters WHERE name = 'Material' AND category_id = v_cat;
  SELECT id INTO m_pin_type FROM masters WHERE name = 'Pin Type' AND category_id = v_cat;
  
  -- Create additional masters if they don't exist
  IF NOT EXISTS (SELECT 1 FROM masters WHERE name = 'Standard' AND category_id = v_cat) THEN
    INSERT INTO masters (name, description, color, icon, category_id)
    VALUES ('Standard', 'Dimensional standard', '#3b82f6', '📋', v_cat)
    RETURNING id INTO m_standard;
    
    INSERT INTO master_fields (master_id, label, type, unit, sort_order)
    VALUES (m_standard, 'Standard', 'select', NULL, 0)
    RETURNING id INTO f_standard;
  ELSE
    SELECT id INTO m_standard FROM masters WHERE name = 'Standard' AND category_id = v_cat;
    SELECT id INTO f_standard FROM master_fields WHERE master_id = m_standard;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM masters WHERE name = 'D2' AND category_id = v_cat) THEN
    INSERT INTO masters (name, description, color, icon, category_id)
    VALUES ('D2', 'Head diameter (-0.2)', '#8b5cf6', '⭕', v_cat)
    RETURNING id INTO m_d2;
    
    INSERT INTO master_fields (master_id, label, type, unit, sort_order)
    VALUES (m_d2, 'D2', 'select', 'mm', 0)
    RETURNING id INTO f_d2;
  ELSE
    SELECT id INTO m_d2 FROM masters WHERE name = 'D2' AND category_id = v_cat;
    SELECT id INTO f_d2 FROM master_fields WHERE master_id = m_d2;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM masters WHERE name = 'K' AND category_id = v_cat) THEN
    INSERT INTO masters (name, description, color, icon, category_id)
    VALUES ('K', 'Head height (-0.05)', '#f59e0b', '📏', v_cat)
    RETURNING id INTO m_k;
    
    INSERT INTO master_fields (master_id, label, type, unit, sort_order)
    VALUES (m_k, 'K', 'select', 'mm', 0)
    RETURNING id INTO f_k;
  ELSE
    SELECT id INTO m_k FROM masters WHERE name = 'K' AND category_id = v_cat;
    SELECT id INTO f_k FROM master_fields WHERE master_id = m_k;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM masters WHERE name = 'R' AND category_id = v_cat) THEN
    INSERT INTO masters (name, description, color, icon, category_id)
    VALUES ('R', 'Fillet radius', '#10b981', '🔄', v_cat)
    RETURNING id INTO m_r;
    
    INSERT INTO master_fields (master_id, label, type, unit, sort_order)
    VALUES (m_r, 'R', 'select', 'mm', 0)
    RETURNING id INTO f_r;
  ELSE
    SELECT id INTO m_r FROM masters WHERE name = 'R' AND category_id = v_cat;
    SELECT id INTO f_r FROM master_fields WHERE master_id = m_r;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM masters WHERE name = 'Hardness' AND category_id = v_cat) THEN
    INSERT INTO masters (name, description, color, icon, category_id)
    VALUES ('Hardness', 'Hardness specification', '#ef4444', '💎', v_cat)
    RETURNING id INTO m_hardness;
    
    INSERT INTO master_fields (master_id, label, type, unit, sort_order)
    VALUES (m_hardness, 'Hardness', 'select', NULL, 0)
    RETURNING id INTO f_hardness;
  ELSE
    SELECT id INTO m_hardness FROM masters WHERE name = 'Hardness' AND category_id = v_cat;
    SELECT id INTO f_hardness FROM master_fields WHERE master_id = m_hardness;
  END IF;
  
  -- Get field IDs
  SELECT id INTO f_diameter FROM master_fields WHERE master_id = m_diameter;
  SELECT id INTO f_length FROM master_fields WHERE master_id = m_length;
  SELECT id INTO f_material FROM master_fields WHERE master_id = m_material;
  SELECT id INTO f_pin_type FROM master_fields WHERE master_id = m_pin_type;

  -- =====================================================
  -- Add ALL master values from catalog specifications
  -- =====================================================
  
  -- Blade DIN-1530 Diameters (from table: a column)
  INSERT INTO master_values (master_field_id, value)
  SELECT f_diameter, v FROM unnest(ARRAY[
    '1.0','1.2','1.5','2.0','2.5','3.5','4.2','4.5','5.5','6.5','7.5','9.5','11.5','15.5'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_diameter AND value = t.v);
  
  -- Blade DIN-1530 Lengths (from table: L1 and L2 rows)
  INSERT INTO master_values (master_field_id, value)
  SELECT f_length, v FROM unnest(ARRAY[
    '30','40','50','60','63','80','100','125','160','200','250','315','400'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_length AND value = t.v);
  
  -- Blade DIN-1530 D2 values (from table: d2 column)
  INSERT INTO master_values (master_field_id, value)
  SELECT f_d2, v FROM unnest(ARRAY[
    '4','8','10','14','16','20','22'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_d2 AND value = t.v);
  
  -- Blade DIN-1530 K values (from table: k column)
  INSERT INTO master_values (master_field_id, value)
  SELECT f_k, v FROM unnest(ARRAY[
    '3','5','7'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_k AND value = t.v);
  
  -- Blade DIN-1530 R values (from table: r1, r2 columns)
  INSERT INTO master_values (master_field_id, value)
  SELECT f_r, v FROM unnest(ARRAY[
    '0.3','0.5','0.8'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_r AND value = t.v);
  
  -- Air Ejector Pin Type A dimensions
  INSERT INTO master_values (master_field_id, value)
  SELECT f_diameter, v FROM unnest(ARRAY[
    '8','10','12','16','18','20','25'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_diameter AND value = t.v);
  
  INSERT INTO master_values (master_field_id, value)
  SELECT f_length, v FROM unnest(ARRAY[
    '11','18','20','22','24','26','34','38','46','50'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_length AND value = t.v);
  
  -- Air Ejector Pin Type B dimensions
  INSERT INTO master_values (master_field_id, value)
  SELECT f_diameter, v FROM unnest(ARRAY[
    '6','8','10','12','16','18','20','25','30'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_diameter AND value = t.v);
  
  INSERT INTO master_values (master_field_id, value)
  SELECT f_length, v FROM unnest(ARRAY[
    '12','15','20','25','30','35','45'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_length AND value = t.v);
  
  -- Air Ejector Pin Type C dimensions
  INSERT INTO master_values (master_field_id, value)
  SELECT f_diameter, v FROM unnest(ARRAY[
    '5','6','8','10','12','16','20'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_diameter AND value = t.v);
  
  INSERT INTO master_values (master_field_id, value)
  SELECT f_length, v FROM unnest(ARRAY[
    '12','20'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_length AND value = t.v);
  
  -- Standards
  INSERT INTO master_values (master_field_id, value)
  SELECT f_standard, v FROM unnest(ARRAY[
    'DIN-1530','MMB Type A','MMB Type B','MMB Type C'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_standard AND value = t.v);
  
  -- Hardness values
  INSERT INTO master_values (master_field_id, value)
  SELECT f_hardness, v FROM unnest(ARRAY[
    'Through Hardened 52+2 HRC','47-52 HRC'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id = f_hardness AND value = t.v);

  -- =====================================================
  -- PRODUCT 1: Blade Ejector Pin DIN-1530
  -- =====================================================
  
  DELETE FROM products WHERE sku = 'BEP-DIN-1530';
  
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES (
    'Blade Ejector Pin DIN-1530',
    'BEP-DIN-1530',
    'Through Hardened & Ground Steel blade ejector pins per DIN-1530 standard. Hardness: Through Hardened up to 52+2 HRC. Available in multiple sizes.',
    v_cat,
    'active'
  ) RETURNING id INTO v_product_id;
  
  -- Link Standard
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_standard AND value = 'DIN-1530';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Material
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_material AND value = 'Through Hardened & Ground Steel';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Hardness
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_hardness AND value = 'Through Hardened 52+2 HRC';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Pin Type
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_pin_type AND value = 'Blade DIN-1530';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link ALL Blade DIN-1530 Diameters
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_diameter
    AND value IN ('1.0','1.2','1.5','2.0','2.5','3.5','4.2','4.5','5.5','6.5','7.5','9.5','11.5','15.5')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_diameter AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;
  
  -- Link ALL Blade DIN-1530 Lengths
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_length
    AND value IN ('30','40','50','60','63','80','100','125','160','200','250','315','400')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_length AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;
  
  -- Link ALL D2 values
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_d2
    AND value IN ('4','8','10','14','16','20','22')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_d2 AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;
  
  -- Link ALL K values
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_k
    AND value IN ('3','5','7')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_k AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;
  
  -- Link ALL R values
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_r
    AND value IN ('0.3','0.5','0.8')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_r AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;

  -- =====================================================
  -- PRODUCT 2: Air Ejector Pin Type A
  -- =====================================================
  
  DELETE FROM products WHERE sku = 'AEP-TYPE-A';
  
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES (
    'Air Ejector Pin Type A',
    'AEP-TYPE-A',
    'SUS-420 air ejector pin Type A. Hardness: 47-52 HRC. Spring-loaded valve system for uniform air pressure release.',
    v_cat,
    'active'
  ) RETURNING id INTO v_product_id;
  
  -- Link Standard
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_standard AND value = 'MMB Type A';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Material
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_material AND value = 'SUS-420';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Hardness
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_hardness AND value = '47-52 HRC';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Pin Type
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_pin_type AND value = 'Air Type A';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link ALL Type A Diameters
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_diameter
    AND value IN ('8','10','12','16','18','20','25')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_diameter AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;
  
  -- Link ALL Type A Lengths
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_length
    AND value IN ('11','18','20','22','24','26','34','38','46','50')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_length AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;

  -- =====================================================
  -- PRODUCT 3: Air Ejector Pin Type B
  -- =====================================================
  
  DELETE FROM products WHERE sku = 'AEP-TYPE-B';
  
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES (
    'Air Ejector Pin Type B',
    'AEP-TYPE-B',
    'SUS-420 air ejector pin Type B. Hardness: 47-52 HRC. Used to eject plastic products without any hole in its wall.',
    v_cat,
    'active'
  ) RETURNING id INTO v_product_id;
  
  -- Link Standard
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_standard AND value = 'MMB Type B';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Material
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_material AND value = 'SUS-420';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Hardness
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_hardness AND value = '47-52 HRC';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Pin Type
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_pin_type AND value = 'Air Type B';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link ALL Type B Diameters
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_diameter
    AND value IN ('6','8','10','12','16','18','20','25','30')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_diameter AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;
  
  -- Link ALL Type B Lengths
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_length
    AND value IN ('12','15','20','25','30','35','45')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_length AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;

  -- =====================================================
  -- PRODUCT 4: Air Ejector Pin Type C
  -- =====================================================
  
  DELETE FROM products WHERE sku = 'AEP-TYPE-C';
  
  INSERT INTO products (name, sku, description, category_id, status)
  VALUES (
    'Air Ejector Pin Type C',
    'AEP-TYPE-C',
    'SUS-420 air ejector pin Type C. Hardness: 47-52 HRC. Made from stainless steel specially for moulding thin and small plastic parts. Air pressure range: 1.5 to 6 bars.',
    v_cat,
    'active'
  ) RETURNING id INTO v_product_id;
  
  -- Link Standard
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_standard AND value = 'MMB Type C';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Material
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_material AND value = 'SUS-420';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Hardness
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_hardness AND value = '47-52 HRC';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link Pin Type
  SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_pin_type AND value = 'Air Type C';
  INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  
  -- Link ALL Type C Diameters
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_diameter
    AND value IN ('5','6','8','10','12','16','20')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_diameter AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;
  
  -- Link ALL Type C Lengths
  FOR v_val IN SELECT value FROM master_values WHERE master_field_id = f_length
    AND value IN ('12','20')
  LOOP
    SELECT id INTO v_val_id FROM master_values WHERE master_field_id = f_length AND value = v_val;
    INSERT INTO product_master_values (product_id, master_value_id) VALUES (v_product_id, v_val_id);
  END LOOP;

END $$;
