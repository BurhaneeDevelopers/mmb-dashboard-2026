/**
 * The editable draft that sits between the AI scan and the database.
 *
 * The scanner used to write straight to Supabase, so a misread column or a
 * wrong model code became a product nobody had looked at. The scan now produces
 * a draft, the user checks it, and only then does it get imported.
 */

import type { ParsedProduct, ParseResult } from './catalogue-parser';
import { applySkuRule, inferVariantSuffix, DEFAULT_SKU_RULE_ID } from './sku-rules';

export interface DraftVariant {
  /** Row identity inside the draft, not a database id. */
  key: string;
  /** Model code as printed in the catalogue. */
  sourceSku: string;
  /** Model code after the catalogue's SKU rule, editable by the user. */
  sku: string;
  /** Sub-table this row came from, e.g. "With T Bolt". */
  variantLabel: string | null;
  specifications: Record<string, string | null>;
  /** Unchecked rows are not imported. */
  include: boolean;
}

export interface DraftMaster {
  /** Column header, used as the master name. */
  header: string;
  unit: string | null;
  include: boolean;
}

export interface DraftProduct {
  key: string;
  name: string;
  description: string;
  masters: DraftMaster[];
  variants: DraftVariant[];
  /** Which image this product was read from. */
  sourceFilename: string;
  include: boolean;
}

export interface CatalogueDraft {
  products: DraftProduct[];
  warnings: string[];
  skuRuleId: string;
}

let counter = 0;
function nextKey(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * Flatten one scanned product into a draft.
 *
 * All of a product's tables share one master set: "Mould Clamp with Clamping
 * Stud" and "Mould Clamp with T Bolt" describe the same product, so a column
 * that appears in both becomes a single master. A row keeps its own table's
 * heading as its variant label, and that heading becomes the SKU suffix so the
 * two sub-tables cannot collide.
 */
export function buildDraftProduct(
  parsed: ParsedProduct,
  sourceFilename: string,
  skuRuleId: string
): DraftProduct {
  const masters = new Map<string, DraftMaster>();
  const variants: DraftVariant[] = [];

  for (const table of parsed.tables) {
    for (const column of table.columns) {
      if (!masters.has(column.header)) {
        masters.set(column.header, {
          header: column.header,
          unit: column.unit,
          include: true,
        });
      }
    }

    const suffix = parsed.tables.length > 1 ? inferVariantSuffix(table.tableTitle) : '';

    for (const row of table.rows) {
      variants.push({
        key: nextKey('variant'),
        sourceSku: row.model,
        sku: applySkuRule(row.model, skuRuleId, suffix),
        variantLabel: table.tableTitle,
        specifications: { ...row.specifications },
        include: true,
      });
    }
  }

  return {
    key: nextKey('product'),
    name: parsed.name,
    description: parsed.description ?? '',
    masters: [...masters.values()],
    variants,
    sourceFilename,
    include: true,
  };
}

export function buildDraft(
  scans: Array<{ filename: string; result: ParseResult }>,
  skuRuleId: string = DEFAULT_SKU_RULE_ID
): CatalogueDraft {
  const products: DraftProduct[] = [];
  const warnings: string[] = [];

  for (const scan of scans) {
    for (const parsed of scan.result.products) {
      products.push(buildDraftProduct(parsed, scan.filename, skuRuleId));
    }
    warnings.push(...scan.result.warnings.map((w) => `${scan.filename}: ${w}`));
  }

  return { products, warnings, skuRuleId };
}

/** Re-run the SKU rule over a draft after the user picks a different one. */
export function reapplySkuRule(draft: CatalogueDraft, skuRuleId: string): CatalogueDraft {
  return {
    ...draft,
    skuRuleId,
    products: draft.products.map((product) => {
      const multiTable = new Set(product.variants.map((v) => v.variantLabel)).size > 1;
      return {
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          sku: applySkuRule(
            variant.sourceSku,
            skuRuleId,
            multiTable ? inferVariantSuffix(variant.variantLabel) : ''
          ),
        })),
      };
    }),
  };
}

export interface DraftIssue {
  level: 'error' | 'warning';
  message: string;
}

/**
 * Checks that run in the review screen, before anything is written.
 * Errors block the import; warnings are shown but do not.
 */
export function validateDraft(draft: CatalogueDraft): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const included = draft.products.filter((p) => p.include);

  if (included.length === 0) {
    issues.push({ level: 'error', message: 'No products are selected for import.' });
    return issues;
  }

  const skuOwners = new Map<string, string>();

  for (const product of included) {
    if (!product.name.trim()) {
      issues.push({ level: 'error', message: 'A product has an empty name.' });
    }

    const activeVariants = product.variants.filter((v) => v.include);
    if (activeVariants.length === 0) {
      issues.push({
        level: 'error',
        message: `"${product.name}" has no variants selected, so there would be nothing to add to a cart.`,
      });
    }

    for (const variant of activeVariants) {
      const sku = variant.sku.trim().toUpperCase();

      if (!sku) {
        issues.push({
          level: 'error',
          message: `"${product.name}": the row read as "${variant.sourceSku}" has an empty SKU.`,
        });
        continue;
      }

      const owner = skuOwners.get(sku);
      if (owner) {
        issues.push({
          level: 'error',
          message: `SKU "${sku}" is used twice, in "${owner}" and "${product.name}".`,
        });
      } else {
        skuOwners.set(sku, product.name);
      }

      const emptySpecs = product.masters
        .filter((m) => m.include)
        .filter((m) => !variant.specifications[m.header]);

      if (emptySpecs.length > 0 && emptySpecs.length === product.masters.filter((m) => m.include).length) {
        issues.push({
          level: 'warning',
          message: `"${product.name}": ${sku} has no specification values filled in.`,
        });
      }
    }

    if (product.masters.filter((m) => m.include).length === 0) {
      issues.push({
        level: 'warning',
        message: `"${product.name}" has no specification columns selected.`,
      });
    }
  }

  return issues;
}
