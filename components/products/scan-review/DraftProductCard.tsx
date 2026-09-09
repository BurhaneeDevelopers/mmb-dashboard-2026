"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DraftProduct } from "@/lib/catalogue-draft";

interface DraftProductCardProps {
  product: DraftProduct;
  onChange: (product: DraftProduct) => void;
  /** SKUs that appear more than once across the whole draft. */
  duplicateSkus: Set<string>;
}

/**
 * One scanned product, opened up for checking before it is written.
 *
 * The point of this screen is that a person sees every model code and every
 * value the AI read, in the same grid shape as the printed table, and can fix
 * or drop anything wrong.
 */
export function DraftProductCard({ product, onChange, duplicateSkus }: DraftProductCardProps) {
  const [expanded, setExpanded] = useState(true);

  const activeMasters = product.masters.filter((m) => m.include);
  const includedVariants = product.variants.filter((v) => v.include).length;

  const update = (patch: Partial<DraftProduct>) => onChange({ ...product, ...patch });

  const updateVariant = (key: string, patch: Partial<DraftProduct["variants"][number]>) =>
    update({
      variants: product.variants.map((v) => (v.key === key ? { ...v, ...patch } : v)),
    });

  const toggleMaster = (header: string) =>
    update({
      masters: product.masters.map((m) =>
        m.header === header ? { ...m, include: !m.include } : m
      ),
    });

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-colors",
        product.include ? "border-slate-200" : "border-slate-200 bg-slate-50/80"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={product.include}
          onChange={(event) => update({ include: event.target.checked })}
          className="mt-1.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-pink-600"
          aria-label={`Import ${product.name}`}
        />

        <div className="min-w-0 flex-1">
          <input
            value={product.name}
            onChange={(event) => update({ name: event.target.value })}
            disabled={!product.include}
            className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-semibold text-slate-800 outline-none transition-colors hover:border-slate-200 focus:border-indigo-400 focus:bg-white disabled:text-slate-400"
          />

          <div className="mt-1 flex flex-wrap items-center gap-2 px-2">
            <Badge variant="secondary">
              {includedVariants} variant{includedVariants === 1 ? "" : "s"}
            </Badge>
            <Badge variant="secondary">
              {activeMasters.length} spec{activeMasters.length === 1 ? "" : "s"}
            </Badge>
            <span className="text-xs text-slate-400">from {product.sourceFilename}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {expanded && product.include && (
        <div className="border-t border-slate-100">
          {/* Which columns become masters */}
          {product.masters.length > 0 && (
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Specification columns read from the page
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.masters.map((master) => (
                <button
                  key={master.header}
                  type="button"
                  onClick={() => toggleMaster(master.header)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    master.include
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-400 line-through"
                  )}
                >
                  {master.header}
                  {master.unit ? (
                    <span className="ml-1 font-normal opacity-70">({master.unit})</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* The rows, as a table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                  <th className="w-10 px-3 py-2" />
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SKU
                  </th>
                  {activeMasters.map((master) => (
                    <th
                      key={master.header}
                      className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {master.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => {
                  const isDuplicate = duplicateSkus.has(variant.sku.trim().toUpperCase());

                  return (
                    <tr
                      key={variant.key}
                      className={cn(
                        "border-b border-slate-50 last:border-0",
                        !variant.include && "opacity-40"
                      )}
                    >
                      <td className="px-3 py-1.5">
                        <input
                          type="checkbox"
                          checked={variant.include}
                          onChange={(event) =>
                            updateVariant(variant.key, { include: event.target.checked })
                          }
                          className="h-4 w-4 rounded border-slate-300 accent-pink-600"
                          aria-label={`Import ${variant.sku}`}
                        />
                      </td>

                      <td className="px-3 py-1.5">
                        <input
                          value={variant.sku}
                          onChange={(event) =>
                            updateVariant(variant.key, { sku: event.target.value })
                          }
                          disabled={!variant.include}
                          className={cn(
                            "w-40 rounded-md border px-2 py-1 font-mono text-xs outline-none transition-colors",
                            isDuplicate && variant.include
                              ? "border-red-300 bg-red-50 text-red-700"
                              : "border-slate-200 focus:border-indigo-400"
                          )}
                        />
                        <span className="ml-2 font-mono text-[10px] text-slate-400">
                          was {variant.sourceSku}
                        </span>
                        {isDuplicate && variant.include && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            duplicate
                          </span>
                        )}
                        {variant.variantLabel && (
                          <p className="mt-0.5 truncate text-[10px] text-slate-400">
                            {variant.variantLabel}
                          </p>
                        )}
                      </td>

                      {activeMasters.map((master) => (
                        <td key={master.header} className="px-3 py-1.5">
                          <input
                            value={variant.specifications[master.header] ?? ""}
                            onChange={(event) =>
                              updateVariant(variant.key, {
                                specifications: {
                                  ...variant.specifications,
                                  [master.header]: event.target.value || null,
                                },
                              })
                            }
                            disabled={!variant.include}
                            placeholder="empty"
                            className="w-32 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none transition-colors focus:border-indigo-400 placeholder:text-slate-300"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
