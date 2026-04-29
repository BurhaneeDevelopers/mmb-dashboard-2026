-- =====================================================
-- All masters, fields, values + 5 products
-- Spring Plungers: 7b72a427  Parting Locks: 36dc7800  Cooling Plugs: 972ae52a
-- =====================================================
DO $$
DECLARE
  c_sp  UUID := '7b72a427-372f-4df8-9730-d1e8f29ac704'; -- Spring Plungers
  c_pl  UUID := '36dc7800-78cf-452b-af1e-b358a82c86b5'; -- Parting Locks
  c_cp  UUID := '972ae52a-64bc-4596-90ff-20d289fc53d0'; -- Cooling Plugs
  m_id  UUID; f_id  UUID;
  p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID;

  -- Spring Plunger Screw field IDs
  fsp_d1 UUID; fsp_l UUID; fsp_s UUID; fsp_d2 UUID;
  fsp_wt UUID; fsp_f1 UUID; fsp_ff UUID; fsp_type UUID;

  -- Spring Plunger Allen Key field IDs
  fsp_d2a UUID; fsp_la UUID; fsp_sa UUID; fsp_wsa UUID;
  fsp_fl1 UUID; fsp_fl2 UUID; fsp_wta UUID;

  -- Parting Lock field IDs
  fpl_od UUID; fpl_od_small UUID; fpl_h UUID; fpl_l UUID;
  fpl_m UUID; fpl_b UUID; fpl_stock UUID;

  -- Cooling Plug O-ring field IDs
  fcp_d UUID; fcp_l UUID; fcp_mat UUID; fcp_ptype UUID;

  -- Cooling Plug Threaded field IDs
  fct_od UUID; fct_l UUID; fct_h UUID; fct_ptype UUID; fct_mat UUID;

BEGIN

  -- ==========================================================
  -- SPRING PLUNGERS MASTERS
  -- ==========================================================

  -- Plunger Type (screw vs allen key)
  SELECT id INTO m_id FROM masters WHERE name='Plunger Type' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('Plunger Type','Type of spring plunger','#6366f1','🔩',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='Plunger Type';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'Plunger Type','select',NULL,0) RETURNING id INTO f_id; END IF;
  fsp_type := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['Screw Type','Allen Key Type']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- d1 (thread size)
  SELECT id INTO m_id FROM masters WHERE name='d1 (Thread)' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('d1 (Thread)','Thread size d1','#ec4899','🔩',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='d1 (Thread)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'d1 (Thread)','select',NULL,0) RETURNING id INTO f_id; END IF;
  fsp_d1 := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['M3','M4','M5','M6','M8','M10','M12','M16','M20','M24']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- L
  SELECT id INTO m_id FROM masters WHERE name='L (SP)' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('L (SP)','Overall length','#10b981','📏',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='L (SP)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'L (SP)','select','mm',0) RETURNING id INTO f_id; END IF;
  fsp_l := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['8','9','12','14','15','16','18','19','22','23','24','26','33','43','48']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- S (stroke)
  SELECT id INTO m_id FROM masters WHERE name='S (Stroke)' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('S (Stroke)','Ball stroke S','#f59e0b','↕',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='S (Stroke)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'S (Stroke)','select','mm',0) RETURNING id INTO f_id; END IF;
  fsp_s := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['0.4','0.8','0.9','1.0','1.5','2.0','2.5','3.5','4.5','5.5']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- d2 (ball/body dia)
  SELECT id INTO m_id FROM masters WHERE name='d2 (SP)' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('d2 (SP)','Ball/body diameter d2','#8b5cf6','⭕',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='d2 (SP)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'d2 (SP)','select','mm',0) RETURNING id INTO f_id; END IF;
  fsp_d2 := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['1.5','2.5','3.0','3.5','4.5','5.0','6.0','8.0','10.0','12.0','15.0']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- Weight (g)
  SELECT id INTO m_id FROM masters WHERE name='Weight' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('Weight','Weight in grams','#6366f1','⚖',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='Weight';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'Weight','select','g',0) RETURNING id INTO f_id; END IF;
  fsp_wt := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['0.30','0.5','0.70','0.8','1.20','1.7','1.80','3.5','3.90','6.0','8.10','10.0','13.0','25.5','32.0','66.0','106.0']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- Initial Force / Spring Load F1
  SELECT id INTO m_id FROM masters WHERE name='Spring Load F1' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('Spring Load F1','Initial/Spring Load F1 (N)','#ec4899','💪',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='Spring Load F1';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'Spring Load F1','select','N',0) RETURNING id INTO f_id; END IF;
  fsp_f1 := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['3.0','6','7','8.5','9','11.0','18.0','20','24.0','25','26.0','35','41.0','56.0','65','81.0']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- Final Force / Spring Load F2
  SELECT id INTO m_id FROM masters WHERE name='Spring Load F2' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('Spring Load F2','Final/Spring Load F2 (N)','#10b981','💪',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='Spring Load F2';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'Spring Load F2','select','N',0) RETURNING id INTO f_id; END IF;
  fsp_ff := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['4.5','12','13','14.0','15','18.0','31.0','35','45.0','45','49.0','60','86.0','110','111.0','151.0']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- WS (allen key width)
  SELECT id INTO m_id FROM masters WHERE name='WS (Allen Key)' AND category_id=c_sp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('WS (Allen Key)','Allen key wrench size WS','#f59e0b','🔧',c_sp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='WS (Allen Key)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'WS (Allen Key)','select','mm',0) RETURNING id INTO f_id; END IF;
  fsp_wsa := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['1.5','2.0','2.5','3.0','4.0','5.0','6.0','8.0','10.0','12.0']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- ==========================================================
  -- PARTING LOCKS MASTERS
  -- ==========================================================

  -- ØD (outer dia)
  SELECT id INTO m_id FROM masters WHERE name='ØD' AND category_id=c_pl;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('ØD','Outer diameter ØD','#6366f1','⭕',c_pl) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='ØD';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'ØD','select','mm',0) RETURNING id INTO f_id; END IF;
  fpl_od := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['10','12','13','16','20','25']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- Ød (inner dia)
  SELECT id INTO m_id FROM masters WHERE name='Ød' AND category_id=c_pl;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('Ød','Inner diameter Ød','#ec4899','⭕',c_pl) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='Ød';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'Ød','select','mm',0) RETURNING id INTO f_id; END IF;
  fpl_od_small := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['8.5','11','14','16']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- H
  SELECT id INTO m_id FROM masters WHERE name='H (PL)' AND category_id=c_pl;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('H (PL)','Head height H','#10b981','📐',c_pl) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='H (PL)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'H (PL)','select','mm',0) RETURNING id INTO f_id; END IF;
  fpl_h := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['3','3.5','4','5.5']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- L (PL)
  SELECT id INTO m_id FROM masters WHERE name='L (PL)' AND category_id=c_pl;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('L (PL)','Body length L','#f59e0b','📏',c_pl) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='L (PL)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'L (PL)','select','mm',0) RETURNING id INTO f_id; END IF;
  fpl_l := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['18','20','25','30']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- M (thread)
  SELECT id INTO m_id FROM masters WHERE name='M (Thread)' AND category_id=c_pl;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('M (Thread)','Bolt thread size M','#8b5cf6','🔩',c_pl) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='M (Thread)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'M (Thread)','select',NULL,0) RETURNING id INTO f_id; END IF;
  fpl_m := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['M5','M6','M8','M10']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- B (flange width)
  SELECT id INTO m_id FROM masters WHERE name='B (PL)' AND category_id=c_pl;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('B (PL)','Flange width B','#3b82f6','📐',c_pl) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='B (PL)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'B (PL)','select','mm',0) RETURNING id INTO f_id; END IF;
  fpl_b := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['4','5','6','8']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- ==========================================================
  -- COOLING PLUGS MASTERS
  -- ==========================================================

  -- Plug Type (O-ring vs Threaded BSP vs Threaded BSPT)
  SELECT id INTO m_id FROM masters WHERE name='Plug Type' AND category_id=c_cp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('Plug Type','Type of cooling plug','#6366f1','🔌',c_cp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='Plug Type';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'Plug Type','select',NULL,0) RETURNING id INTO f_id; END IF;
  fcp_ptype := f_id; fct_ptype := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['O-ring','Threaded BSP','Threaded BSPT']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- Material
  SELECT id INTO m_id FROM masters WHERE name='Material (CP)' AND category_id=c_cp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('Material (CP)','Raw material','#ec4899','🔧',c_cp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='Material (CP)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'Material (CP)','select',NULL,0) RETURNING id INTO f_id; END IF;
  fcp_mat := f_id; fct_mat := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,'Brass'
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value='Brass');

  -- D (CP) - O-ring plug diameter
  SELECT id INTO m_id FROM masters WHERE name='D (CP)' AND category_id=c_cp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('D (CP)','Plug diameter D','#10b981','⭕',c_cp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='D (CP)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'D (CP)','select','mm',0) RETURNING id INTO f_id; END IF;
  fcp_d := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['Ø4','Ø6','Ø8','Ø10','Ø12','Ø14','Ø16','Ø18','Ø20','Ø25','Ø30']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- L (CP)
  SELECT id INTO m_id FROM masters WHERE name='L (CP)' AND category_id=c_cp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('L (CP)','Plug length L','#f59e0b','📏',c_cp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='L (CP)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'L (CP)','select','mm',0) RETURNING id INTO f_id; END IF;
  fcp_l := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['8','10','12','13','14','16','19']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- ØD (Threaded) — thread size
  SELECT id INTO m_id FROM masters WHERE name='ØD (Thread)' AND category_id=c_cp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('ØD (Thread)','Thread size ØD','#8b5cf6','🔩',c_cp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='ØD (Thread)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'ØD (Thread)','select',NULL,0) RETURNING id INTO f_id; END IF;
  fct_od := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY[
    'M8 X0.75','M10 X 1','M12 X 1.5','M14 X 1.5',
    '1/8\" BSP','1/4\" BSP','3/8\" BSP','½\" BSP','3/4\" BSP','1\" BSP',
    '1/8\" BSPT','1/4\" BSPT','3/8\" BSPT','½\" BSPT','3/4\" BSPT','1\" BSPT'
  ]) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- L (Threaded)
  SELECT id INTO m_id FROM masters WHERE name='L (Threaded CP)' AND category_id=c_cp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('L (Threaded CP)','Threaded plug length L','#3b82f6','📏',c_cp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='L (Threaded CP)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'L (Threaded CP)','select','mm',0) RETURNING id INTO f_id; END IF;
  fct_l := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['7.0','8.0','8.9','10.0','12.0','14.0','16.5']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- H (Threaded)
  SELECT id INTO m_id FROM masters WHERE name='H (Threaded CP)' AND category_id=c_cp;
  IF m_id IS NULL THEN
    INSERT INTO masters (name,description,color,icon,category_id) VALUES ('H (Threaded CP)','Threaded plug hex height H','#6366f1','📐',c_cp) RETURNING id INTO m_id;
  END IF;
  SELECT id INTO f_id FROM master_fields WHERE master_id=m_id AND label='H (Threaded CP)';
  IF f_id IS NULL THEN INSERT INTO master_fields (master_id,label,type,unit,sort_order) VALUES (m_id,'H (Threaded CP)','select','mm',0) RETURNING id INTO f_id; END IF;
  fct_h := f_id;
  INSERT INTO master_values (master_field_id,value) SELECT f_id,v FROM unnest(ARRAY['4.0','5.0','6.0','7.0','8.0','10.0','14.0','17.0']) t(v)
  WHERE NOT EXISTS (SELECT 1 FROM master_values WHERE master_field_id=f_id AND value=t.v);

  -- ==========================================================
  -- PRODUCT 1: Spring Plunger Screw Type
  -- ==========================================================
  INSERT INTO products (name,sku,description,category_id,status)
  VALUES ('Spring Plunger Screw Type','SP-SCREW-MSP',
    'Spring Plungers Screw Type with Hardened Polished Stainless Steel Ball. 7 sizes M4–M16.',
    c_sp,'active') RETURNING id INTO p1;

  INSERT INTO product_master_values (product_id,master_value_id)
  SELECT p1,id FROM master_values WHERE master_field_id=fsp_type AND value='Screw Type'
  UNION ALL SELECT p1,id FROM master_values WHERE master_field_id=fsp_d1 AND value IN ('M4','M5','M6','M8','M10','M12','M16')
  UNION ALL SELECT p1,id FROM master_values WHERE master_field_id=fsp_l  AND value IN ('9','12','14','16','19','22','24')
  UNION ALL SELECT p1,id FROM master_values WHERE master_field_id=fsp_s  AND value IN ('0.8','0.9','1.0','1.5','2.0','2.5','3.5')
  UNION ALL SELECT p1,id FROM master_values WHERE master_field_id=fsp_d2 AND value IN ('2.5','3.0','3.5','5.0','6.0','8.0','10.0')
  UNION ALL SELECT p1,id FROM master_values WHERE master_field_id=fsp_wt AND value IN ('0.5','0.8','1.7','3.5','6.0','10.0','25.5')
  UNION ALL SELECT p1,id FROM master_values WHERE master_field_id=fsp_f1 AND value IN ('6','7','9','20','25','35','65')
  UNION ALL SELECT p1,id FROM master_values WHERE master_field_id=fsp_ff AND value IN ('12','13','15','35','45','60','110');

  -- ==========================================================
  -- PRODUCT 2: Spring Plunger Allen Key Type
  -- ==========================================================
  INSERT INTO products (name,sku,description,category_id,status)
  VALUES ('Spring Plunger Allen Key Type','SP-ALLEN-MSPA',
    'Spring Plungers Allen Key Type with Hardened Polished Stainless Steel Ball. 10 sizes M3–M24.',
    c_sp,'active') RETURNING id INTO p2;

  INSERT INTO product_master_values (product_id,master_value_id)
  SELECT p2,id FROM master_values WHERE master_field_id=fsp_type AND value='Allen Key Type'
  UNION ALL SELECT p2,id FROM master_values WHERE master_field_id=fsp_d1  AND value IN ('M3','M4','M5','M6','M8','M10','M12','M16','M20','M24')
  UNION ALL SELECT p2,id FROM master_values WHERE master_field_id=fsp_d2  AND value IN ('1.5','2.5','3.0','3.5','4.5','6.0','8.0','10.0','12.0','15.0')
  UNION ALL SELECT p2,id FROM master_values WHERE master_field_id=fsp_l   AND value IN ('8','12','14','15','18','23','26','33','43','48')
  UNION ALL SELECT p2,id FROM master_values WHERE master_field_id=fsp_s   AND value IN ('0.4','0.8','0.9','1.0','1.5','2.0','2.5','3.5','4.5','5.5')
  UNION ALL SELECT p2,id FROM master_values WHERE master_field_id=fsp_wsa AND value IN ('1.5','2.0','2.5','3.0','4.0','5.0','6.0','8.0','10.0','12.0')
  UNION ALL SELECT p2,id FROM master_values WHERE master_field_id=fsp_f1  AND value IN ('3.0','8.5','8.5','11.0','18.0','24.0','26.0','41.0','56.0','81.0')
  UNION ALL SELECT p2,id FROM master_values WHERE master_field_id=fsp_ff  AND value IN ('4.5','14.0','14.0','18.0','31.0','45.0','49.0','86.0','111.0','151.0')
  UNION ALL SELECT p2,id FROM master_values WHERE master_field_id=fsp_wt  AND value IN ('0.30','0.70','1.20','1.80','3.90','8.10','13.0','32.0','66.0','106.0');

  -- ==========================================================
  -- PRODUCT 3: Parting Lock
  -- ==========================================================
  INSERT INTO products (name,sku,description,category_id,status)
  VALUES ('Parting Lock','PL-MPL',
    'Parting Lock for mould plate pulling. 6 sizes MPL-10 to MPL-25. Ex-stock and against order.',
    c_pl,'active') RETURNING id INTO p3;

  INSERT INTO product_master_values (product_id,master_value_id)
  SELECT p3,id FROM master_values WHERE master_field_id=fpl_od       AND value IN ('10','12','13','16','20','25')
  UNION ALL SELECT p3,id FROM master_values WHERE master_field_id=fpl_od_small AND value IN ('8.5','11','14','16')
  UNION ALL SELECT p3,id FROM master_values WHERE master_field_id=fpl_h        AND value IN ('3','3.5','4','5.5')
  UNION ALL SELECT p3,id FROM master_values WHERE master_field_id=fpl_l        AND value IN ('18','20','25','30')
  UNION ALL SELECT p3,id FROM master_values WHERE master_field_id=fpl_m        AND value IN ('M5','M6','M8','M10')
  UNION ALL SELECT p3,id FROM master_values WHERE master_field_id=fpl_b        AND value IN ('4','5','6','8');

  -- ==========================================================
  -- PRODUCT 4: Cooling Plug O-ring
  -- ==========================================================
  INSERT INTO products (name,sku,description,category_id,status)
  VALUES ('Cooling Plug O-ring','CP-ORING-MCP',
    'Cooling Plugs with Viton O-Ring. Raw material: Brass. 11 sizes MCP 04–MCP 30. Up to 220°C.',
    c_cp,'active') RETURNING id INTO p4;

  INSERT INTO product_master_values (product_id,master_value_id)
  SELECT p4,id FROM master_values WHERE master_field_id=fcp_ptype AND value='O-ring'
  UNION ALL SELECT p4,id FROM master_values WHERE master_field_id=fcp_mat   AND value='Brass'
  UNION ALL SELECT p4,id FROM master_values WHERE master_field_id=fcp_d     -- all D values
  UNION ALL SELECT p4,id FROM master_values WHERE master_field_id=fcp_l     AND value IN ('8','10','12','13','14','16','19');

  -- ==========================================================
  -- PRODUCT 5: Cooling Plug Threaded (BSP + BSPT combined)
  -- ==========================================================
  INSERT INTO products (name,sku,description,category_id,status)
  VALUES ('Cooling Plug Threaded','CP-THREADED-MTP',
    'Cooling Plugs Threaded type (BSP and BSPT). Raw material: Brass. Ex-stock. 10 sizes each.',
    c_cp,'active') RETURNING id INTO p5;

  INSERT INTO product_master_values (product_id,master_value_id)
  SELECT p5,id FROM master_values WHERE master_field_id=fct_ptype AND value IN ('Threaded BSP','Threaded BSPT')
  UNION ALL SELECT p5,id FROM master_values WHERE master_field_id=fct_mat   AND value='Brass'
  UNION ALL SELECT p5,id FROM master_values WHERE master_field_id=fct_od    -- all thread sizes
  UNION ALL SELECT p5,id FROM master_values WHERE master_field_id=fct_l     -- all L values
  UNION ALL SELECT p5,id FROM master_values WHERE master_field_id=fct_h;    -- all H values

END $$;