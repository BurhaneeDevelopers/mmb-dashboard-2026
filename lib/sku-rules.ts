/**
 * Per-catalogue SKU rules.
 *
 * Catalogues print a "MODEL" code (RMC-12, RUC-12-160). That code is the
 * sellable SKU, but each catalogue needs its own adjustments before we store
 * it: a different leading letter, a suffix that says which sub-table the row
 * came from, and so on. Rules live here so a new catalogue is a data change
 * rather than a code change.
 */

export interface SkuRule {
  /** Stable key stored alongside the scan so we know which rule ran. */
  id: string;
  /** Shown in the review screen. */
  label: string;
  /** Replace the leading character(s). `from` is matched case-insensitively. */
  replacePrefix?: { from: string; to: string };
  /** Force the final SKU to upper case. */
  uppercase?: boolean;
}

export const SKU_RULES: SkuRule[] = [
  {
    id: 'none',
    label: 'Keep model code as printed',
    uppercase: true,
  },
  {
    id: 'r-to-m',
    label: 'Clamping: leading R becomes M (RMC-12 to MMC-12)',
    replacePrefix: { from: 'R', to: 'M' },
    uppercase: true,
  },
];

export const DEFAULT_SKU_RULE_ID = 'r-to-m';

export function getSkuRule(ruleId: string | undefined): SkuRule {
  return SKU_RULES.find((r) => r.id === ruleId) ?? SKU_RULES[0];
}

/**
 * Turn a printed model code into the stored SKU.
 *
 * @param sourceSku  model exactly as printed, e.g. "RMC-12A"
 * @param ruleId     which SkuRule to apply
 * @param suffix     sub-table suffix, e.g. "t-bolt" -> "MMC-12A-T-BOLT"
 */
export function applySkuRule(
  sourceSku: string,
  ruleId: string = DEFAULT_SKU_RULE_ID,
  suffix?: string | null
): string {
  const rule = getSkuRule(ruleId);
  let sku = String(sourceSku ?? '').trim();

  if (!sku) return '';

  if (rule.replacePrefix) {
    const { from, to } = rule.replacePrefix;
    if (sku.toUpperCase().startsWith(from.toUpperCase())) {
      sku = to + sku.slice(from.length);
    }
  }

  const cleanSuffix = String(suffix ?? '').trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (cleanSuffix) {
    sku = `${sku}-${cleanSuffix}`;
  }

  return rule.uppercase ? sku.toUpperCase() : sku;
}

/**
 * Suffix inferred from a sub-table heading, so "MOULD CLAMP WITH T BOLT"
 * becomes "t-bolt" and both sub-tables can live under one product without
 * their model codes colliding.
 */
export function inferVariantSuffix(tableTitle: string | null | undefined): string {
  const title = String(tableTitle ?? '').toLowerCase();
  if (!title) return '';

  if (title.includes('t bolt') || title.includes('t-bolt')) return 't-bolt';
  if (title.includes('clamping stud') || title.includes('c stud') || title.includes('c-stud')) return 'c-stud';
  if (title.includes('stud')) return 'stud';

  // Fall back to whatever follows "with", e.g. "... with hex nut" -> "hex-nut"
  const withMatch = title.match(/\bwith\s+(.+)$/);
  if (withMatch) {
    return withMatch[1].trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  }

  return '';
}
