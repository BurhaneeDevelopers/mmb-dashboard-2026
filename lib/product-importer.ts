/**
 * Product importer with Supabase upsert logic
 */

import { createClient } from '@/lib/supabase/client';
import { ParsedProduct } from './catalogue-parser';
import { randomColor, inferIcon, generateSKU } from './catalogue-helpers';

export interface ImportResult {
  success: boolean;
  productId?: string;
  productName: string;
  error?: string;
}

export async function importProduct(
  product: ParsedProduct,
  categoryId: string
): Promise<ImportResult> {
  const supabase = createClient();

  try {
    // Step 1: For each master in the product
    const allValueIds: string[] = [];

    for (const master of product.masters) {
      if (!master.name || !master.values || master.values.length === 0) {
        continue;
      }

      try {
        // Check if master exists in this category (case-insensitive)
        const { data: existingMaster } = await supabase
          .from('masters')
          .select('id')
          .ilike('name', master.name)
          .eq('category_id', categoryId)
          .maybeSingle();

        let masterId: string;
        let fieldId: string;

        if (!existingMaster) {
          // Create master + field
          const { data: newMaster, error: masterError } = await supabase
            .from('masters')
            .insert({
              name: master.name.slice(0, 100),
              description: (master.label || master.name).slice(0, 100),
              color: randomColor(),
              icon: inferIcon(master.name),
              category_id: categoryId,
            })
            .select('id')
            .single();

          if (masterError || !newMaster) {
            console.error('Failed to create master:', masterError);
            continue;
          }

          masterId = newMaster.id;

          const { data: newField, error: fieldError } = await supabase
            .from('master_fields')
            .insert({
              master_id: masterId,
              label: (master.label || master.name).slice(0, 100),
              type: master.type || 'select',
              unit: master.unit || null,
              sort_order: 0,
            })
            .select('id')
            .single();

          if (fieldError || !newField) {
            console.error('Failed to create field:', fieldError);
            continue;
          }

          fieldId = newField.id;
        } else {
          masterId = existingMaster.id;

          // Get field
          const { data: field } = await supabase
            .from('master_fields')
            .select('id')
            .eq('master_id', masterId)
            .maybeSingle();

          if (!field) {
            console.error('No field found for master:', masterId);
            continue;
          }

          fieldId = field.id;
        }

        // NULL GUARD — never proceed without fieldId
        if (!fieldId) {
          console.error('No fieldId available for master:', master.name);
          continue;
        }

        // Step 2: For each value, upsert master_value
        for (const value of master.values) {
          const trimmedValue = String(value ?? '').trim();
          if (!trimmedValue) {
            continue;
          }

          const { data: existing } = await supabase
            .from('master_values')
            .select('id')
            .eq('master_field_id', fieldId)
            .eq('value', trimmedValue)
            .maybeSingle();

          if (existing) {
            allValueIds.push(existing.id);
          } else {
            const { data: newVal, error: valueError } = await supabase
              .from('master_values')
              .insert({
                master_field_id: fieldId,
                value: trimmedValue,
              })
              .select('id')
              .single();

            if (valueError || !newVal) {
              console.error('Failed to create value:', trimmedValue, valueError);
              continue;
            }

            allValueIds.push(newVal.id);
          }
        }
      } catch (masterErr) {
        console.error('Master processing error:', master.name, masterErr);
        continue; // never let one master crash the whole product
      }
    }

    // Step 3: Create product
    const sku = generateSKU(product.name, categoryId);

    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: product.name.slice(0, 200),
        sku,
        description: product.name.slice(0, 200),
        category_id: categoryId,
        status: 'active',
      })
      .select('id')
      .single();

    if (productError || !newProduct) {
      return {
        success: false,
        productName: product.name,
        error: productError?.message || 'Failed to create product',
      };
    }

    // Step 4: Link ALL master values to product
    // FIX: Deduplicate valueIds before linking — prevents unique constraint violation
    const uniqueValueIds = [...new Set(allValueIds)];
    
    if (uniqueValueIds.length > 0) {
      const pmvInserts = uniqueValueIds.map(vid => ({
        product_id: newProduct.id,
        master_value_id: vid,
      }));

      const { error: linkError } = await supabase
        .from('product_master_values')
        .insert(pmvInserts);

      if (linkError) {
        console.error('Failed to link master values:', linkError);
        // Don't fail the whole import, product is created
      }
    }

    return {
      success: true,
      productId: newProduct.id,
      productName: product.name,
    };
  } catch (error) {
    return {
      success: false,
      productName: product.name,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
