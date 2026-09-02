/**
 * Write a reviewed catalogue draft into Supabase.
 *
 * One draft product becomes:
 *   - one row in products (the catalogue page)
 *   - one master + master_field per specification column
 *   - one master_value per distinct cell value
 *   - one product_variant per catalogue row, holding that row's exact
 *     combination of values in product_variant_values
 *
 * The product also keeps a flat link to every value it uses, so existing
 * category and attribute filtering keeps working.
 */

import { createClient } from '@/lib/supabase/client';
import type { DraftProduct } from './catalogue-draft';
import { randomColor, inferIcon } from './catalogue-helpers';

export interface ImportedVariant {
  sku: string;
  variantLabel: string | null;
}

export interface ImportResult {
  success: boolean;
  productId?: string;
  productName: string;
  variantsCreated: number;
  mastersCreated: number;
  valuesCreated: number;
  variants: ImportedVariant[];
  error?: string;
}

interface FieldRef {
  masterId: string;
  fieldId: string;
  created: boolean;
}

/**
 * Find or create the master and its field for one specification column.
 *
 * Masters are matched on (category, name). The old code looked up a master's
 * field with maybeSingle(), which throws as soon as a master has more than one
 * field; ordering by sort_order and taking the first row is both stable and
 * safe.
 */
async function resolveField(
  supabase: ReturnType<typeof createClient>,
  categoryId: string,
  header: string,
  unit: string | null
): Promise<FieldRef | null> {
  const name = header.trim().slice(0, 100);
  if (!name) return null;

  const { data: existingMaster, error: lookupError } = await supabase
    .from('masters')
    .select('id')
    .eq('category_id', categoryId)
    .ilike('name', name)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error('[product-importer] Master lookup failed:', name, lookupError);
    return null;
  }

  if (existingMaster) {
    const { data: field } = await supabase
      .from('master_fields')
      .select('id')
      .eq('master_id', existingMaster.id)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (field) {
      return { masterId: existingMaster.id, fieldId: field.id, created: false };
    }

    // Master exists without a field. Repair it rather than dropping the column.
    const { data: repaired, error: repairError } = await supabase
      .from('master_fields')
      .insert({
        master_id: existingMaster.id,
        label: name,
        type: 'select',
        unit: unit || null,
        sort_order: 0,
      })
      .select('id')
      .single();

    if (repairError || !repaired) {
      console.error('[product-importer] Could not add field to master:', name, repairError);
      return null;
    }

    return { masterId: existingMaster.id, fieldId: repaired.id, created: false };
  }

  // The masters table requires a description of at least 5 characters.
  const description = name.length >= 5 ? name.slice(0, 500) : `${name} specification`;

  const { data: newMaster, error: masterError } = await supabase
    .from('masters')
    .insert({
      name,
      description,
      color: randomColor(),
      icon: inferIcon(name),
      category_id: categoryId,
    })
    .select('id')
    .single();

  if (masterError || !newMaster) {
    console.error('[product-importer] Could not create master:', name, masterError);
    return null;
  }

  const { data: newField, error: fieldError } = await supabase
    .from('master_fields')
    .insert({
      master_id: newMaster.id,
      label: name,
      type: 'select',
      unit: unit || null,
      sort_order: 0,
    })
    .select('id')
    .single();

  if (fieldError || !newField) {
    console.error('[product-importer] Could not create field:', name, fieldError);
    return null;
  }

  return { masterId: newMaster.id, fieldId: newField.id, created: true };
}

/**
 * Resolve every distinct value of one field in two round trips instead of one
 * per value, and return a value -> id map.
 */
async function resolveValues(
  supabase: ReturnType<typeof createClient>,
  fieldId: string,
  values: string[]
): Promise<{ map: Map<string, string>; created: number }> {
  const map = new Map<string, string>();
  const wanted = [...new Set(values.map((v) => v.trim()).filter(Boolean))];
  if (wanted.length === 0) return { map, created: 0 };

  const { data: existing, error: readError } = await supabase
    .from('master_values')
    .select('id, value')
    .eq('master_field_id', fieldId)
    .in('value', wanted);

  if (readError) {
    console.error('[product-importer] Value lookup failed:', readError);
  }

  for (const row of existing ?? []) {
    map.set(row.value, row.id);
  }

  const missing = wanted.filter((v) => !map.has(v));
  if (missing.length === 0) return { map, created: 0 };

  const { data: inserted, error: insertError } = await supabase
    .from('master_values')
    .insert(missing.map((value) => ({ master_field_id: fieldId, value })))
    .select('id, value');

  if (insertError) {
    // A concurrent import can win the race on the unique constraint. Re-read
    // rather than losing the values.
    console.warn('[product-importer] Value insert conflict, re-reading:', insertError.message);
    const { data: reread } = await supabase
      .from('master_values')
      .select('id, value')
      .eq('master_field_id', fieldId)
      .in('value', missing);

    for (const row of reread ?? []) {
      map.set(row.value, row.id);
    }
    return { map, created: 0 };
  }

  for (const row of inserted ?? []) {
    map.set(row.value, row.id);
  }

  return { map, created: inserted?.length ?? 0 };
}

export async function importDraftProduct(
  product: DraftProduct,
  categoryId: string,
  options: { catalogueImageUrl?: string | null; images?: string[] } = {}
): Promise<ImportResult> {
  const supabase = createClient();
  const base: Omit<ImportResult, 'success'> = {
    productName: product.name,
    variantsCreated: 0,
    mastersCreated: 0,
    valuesCreated: 0,
    variants: [],
  };

  const activeMasters = product.masters.filter((m) => m.include);
  const activeVariants = product.variants.filter((v) => v.include && v.sku.trim());

  if (activeVariants.length === 0) {
    return { ...base, success: false, error: 'No variants selected for this product' };
  }

  let productId: string | undefined;

  try {
    // Step 1: masters, fields and values for every selected column.
    const fieldByHeader = new Map<string, FieldRef>();
    const valueIdByHeader = new Map<string, Map<string, string>>();
    let mastersCreated = 0;
    let valuesCreated = 0;

    for (const master of activeMasters) {
      const field = await resolveField(supabase, categoryId, master.header, master.unit);
      if (!field) {
        console.warn(`[product-importer] Skipping column "${master.header}"`);
        continue;
      }
      if (field.created) mastersCreated += 1;
      fieldByHeader.set(master.header, field);

      const columnValues = activeVariants
        .map((v) => v.specifications[master.header])
        .filter((v): v is string => Boolean(v && v.trim()));

      const { map, created } = await resolveValues(supabase, field.fieldId, columnValues);
      valueIdByHeader.set(master.header, map);
      valuesCreated += created;
    }

    // Step 2: the product itself.
    const images = (options.images ?? []).slice(0, 5);
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: product.name.trim().slice(0, 200),
        // The page's own model codes live on the variants, so the product
        // carries a readable parent code derived from the first variant.
        sku: activeVariants[0].sku.trim().toUpperCase(),
        description: product.description.trim().slice(0, 500) || null,
        category_id: categoryId,
        status: 'active',
        catalogue_image_url: options.catalogueImageUrl || null,
        images,
        image_url: images[0] ?? null,
      })
      .select('id')
      .single();

    if (productError || !newProduct) {
      const message =
        productError?.code === '23505'
          ? `A product with SKU "${activeVariants[0].sku}" already exists`
          : productError?.message ?? 'Could not create the product';
      return { ...base, success: false, error: message };
    }

    productId = newProduct.id;

    // Step 3: variants, one per catalogue row.
    const variantRows = activeVariants.map((variant, index) => ({
      product_id: productId!,
      sku: variant.sku.trim().toUpperCase(),
      source_sku: variant.sourceSku,
      variant_label: variant.variantLabel,
      sort_order: index,
      status: 'active' as const,
    }));

    const { data: insertedVariants, error: variantError } = await supabase
      .from('product_variants')
      .insert(variantRows)
      .select('id, sku');

    if (variantError || !insertedVariants) {
      // Without variants the product is not sellable, so do not leave a
      // half-written product behind.
      await supabase.from('products').delete().eq('id', productId);
      const message =
        variantError?.code === '23505'
          ? 'One of these SKUs already exists in the catalogue'
          : variantError?.message ?? 'Could not create the variants';
      return { ...base, success: false, error: message };
    }

    const variantIdBySku = new Map(insertedVariants.map((v) => [v.sku, v.id]));

    // Step 4: the exact value combination behind each variant.
    const variantValueRows: Array<{ variant_id: string; master_value_id: string }> = [];
    const productValueIds = new Set<string>();

    for (const variant of activeVariants) {
      const variantId = variantIdBySku.get(variant.sku.trim().toUpperCase());
      if (!variantId) continue;

      for (const master of activeMasters) {
        if (!fieldByHeader.has(master.header)) continue;

        const cell = variant.specifications[master.header];
        if (!cell || !cell.trim()) continue;

        const valueId = valueIdByHeader.get(master.header)?.get(cell.trim());
        if (!valueId) continue;

        variantValueRows.push({ variant_id: variantId, master_value_id: valueId });
        productValueIds.add(valueId);
      }
    }

    if (variantValueRows.length > 0) {
      const { error: pvvError } = await supabase
        .from('product_variant_values')
        .insert(variantValueRows);

      if (pvvError) {
        await supabase.from('products').delete().eq('id', productId);
        return {
          ...base,
          success: false,
          error: `Could not save the variant specifications: ${pvvError.message}`,
        };
      }
    }

    // Step 5: the product-level value links that existing filters read.
    if (productValueIds.size > 0) {
      const { error: linkError } = await supabase.from('product_master_values').insert(
        [...productValueIds].map((valueId) => ({
          product_id: productId!,
          master_value_id: valueId,
        }))
      );

      if (linkError) {
        // Filtering degrades, the product and its variants are still correct.
        console.error('[product-importer] Could not link product master values:', linkError);
      }
    }

    return {
      success: true,
      productId,
      productName: product.name,
      variantsCreated: insertedVariants.length,
      mastersCreated,
      valuesCreated,
      variants: activeVariants.map((v) => ({
        sku: v.sku.trim().toUpperCase(),
        variantLabel: v.variantLabel,
      })),
    };
  } catch (error) {
    if (productId) {
      await supabase.from('products').delete().eq('id', productId);
    }
    return {
      ...base,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
