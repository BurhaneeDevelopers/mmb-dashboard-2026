/**
 * Extract product specifications from catalogue images using Google Gemini.
 *
 * A catalogue page is one product. That page may carry several spec tables
 * (e.g. "Mould Clamp with Clamping Stud" and "Mould Clamp with T Bolt"); each
 * table row is one sellable variant identified by its MODEL code.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CATALOGUE_PROMPT = `You are reading one page of an industrial product catalogue.

Extract every specification table on the page. Return JSON only.

STRUCTURE
- The page heading is the product name (e.g. "MOULD CLAMP").
- A page can contain SEVERAL products, each with its own main heading
  (e.g. "MOULD CLAMP" and "U - CLAMP" on the same page). Those are separate products.
- A product can have SEVERAL tables under sub-headings
  (e.g. "MOULD CLAMP - WITH CLAMPING STUD" and "MOULD CLAMP WITH T BOLT").
  Those are the SAME product. Put both tables in that product's "tables" array
  and record each sub-heading in "tableTitle".

TABLES
- The first column is almost always the MODEL / PART NO / CODE column. Record
  its header in "modelColumn" and never treat it as a specification.
- Every other column header is a specification attribute.
- Every table ROW is one variant. Extract EVERY row, in printed order, even when
  values repeat between rows. Do not merge, summarise, deduplicate or skip rows.
- Give each row its model code verbatim as printed, including letter suffixes
  (RMC-12, RMC-12A, RMC-12B). Do not correct, renumber or reformat the code.
- Put every other cell of that row into "specifications", keyed by the EXACT
  column header text as printed.
- A cell that is blank or "-" becomes null. Keep the key.
- Every row of one table must have the same set of specification keys.

IGNORE
Company name, logo, address, phone, email, website, page numbers, footnotes,
ordering examples, technical drawings and diagrams, stock symbols.
Descriptive paragraphs are context, not data.

Return exactly this JSON shape:
{
  "products": [
    {
      "name": "MOULD CLAMP",
      "description": "one sentence from the page describing the product, or null",
      "tables": [
        {
          "tableTitle": "MOULD CLAMP - WITH CLAMPING STUD",
          "modelColumn": "MODEL",
          "columns": [
            { "header": "dO x PITCH x L", "unit": "mm" },
            { "header": "CLAMPING RANGE B", "unit": "mm" },
            { "header": "N.W KGS", "unit": "kg" }
          ],
          "rows": [
            {
              "model": "RMC-12",
              "specifications": {
                "dO x PITCH x L": "STUD M12 X 1.75 X 100",
                "CLAMPING RANGE B": "0-35",
                "N.W KGS": "0.99"
              }
            }
          ]
        }
      ]
    }
  ]
}

UNIT RULES for each column:
- dimension headers (mm, L, W, H, h, d, dO, A, B, C, OD, ID, PITCH) -> "mm"
- weight headers (KGS, KG, N.W) -> "kg"; gram headers -> "g"
- force or load headers -> "N"; pressure -> "bar"; torque -> "N-m"
- anything else -> null

Accuracy of the model codes and of the row-to-value pairing matters more than
anything else. Re-read each row before returning it.`;

/**
 * Used when the caller only wants the product's identity, not its full
 * specification table (e.g. a quick add where nobody wants a master created
 * for every column on the page).
 */
const SKU_ONLY_PROMPT = `You are reading one page of an industrial product catalogue.

Extract only the product identity: the product name and the model / part
number / SKU code of every variant. Ignore every specification, dimension,
weight or other attribute column entirely - do not read or record any values
from those columns, only the model code itself.

STRUCTURE
- The page heading is the product name (e.g. "MOULD CLAMP").
- A page can contain SEVERAL products, each with its own main heading. Those
  are separate products.
- A product can have SEVERAL tables under sub-headings
  (e.g. "MOULD CLAMP - WITH CLAMPING STUD" and "MOULD CLAMP WITH T BOLT").
  Those are the SAME product. Put both tables in that product's "tables"
  array and record each sub-heading in "tableTitle".
- The first column is almost always the MODEL / PART NO / CODE column.
  Record its header in "modelColumn".
- Every table ROW is one variant. Extract EVERY row, in printed order, even
  when codes look similar. Do not merge, summarise, deduplicate or skip rows.
- Give each row its model code verbatim as printed, including letter
  suffixes (RMC-12, RMC-12A, RMC-12B). Do not correct, renumber or reformat
  the code.

IGNORE
Every specification column and its values, company name, logo, address,
phone, email, website, page numbers, footnotes, ordering examples, technical
drawings and diagrams, stock symbols. Descriptive paragraphs are context, not
data.

Return exactly this JSON shape:
{
  "products": [
    {
      "name": "MOULD CLAMP",
      "description": "one sentence from the page describing the product, or null",
      "tables": [
        {
          "tableTitle": "MOULD CLAMP - WITH CLAMPING STUD",
          "modelColumn": "MODEL",
          "rows": [
            { "model": "RMC-12" },
            { "model": "RMC-12A" }
          ]
        }
      ]
    }
  ]
}

Do not include a "columns" array or a "specifications" object - only the
model code for each row. Accuracy of the model codes matters more than
anything else. Re-read each row before returning it.`;

export type CatalogueScanMode = 'full' | 'skuOnly';

export interface ParsedColumn {
  header: string;
  unit: string | null;
}

export interface ParsedRow {
  /** Model code exactly as printed in the catalogue. */
  model: string;
  specifications: Record<string, string | null>;
}

export interface ParsedTable {
  tableTitle: string | null;
  modelColumn: string;
  columns: ParsedColumn[];
  rows: ParsedRow[];
}

export interface ParsedProduct {
  name: string;
  description: string | null;
  tables: ParsedTable[];
}

export interface ParseResult {
  products: ParsedProduct[];
  /** Non-fatal problems worth showing the user in the review screen. */
  warnings: string[];
}

const MODEL_HEADER_PATTERN = /^(model|part\s*(no|name|number)?|code|sku|cat\.?\s*no|item)/i;

/** Gemini occasionally wraps JSON in prose or a code fence. Recover it. */
function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last > first) return trimmed.slice(first, last + 1);

  return trimmed;
}

function cleanCell(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || text === '-' || text === '--' || text.toLowerCase() === 'n/a') return null;
  return text;
}

function inferUnit(header: string): string | null {
  const h = header.toLowerCase();
  if (/\b(kgs?|n\.?w)\b/.test(h)) return 'kg';
  if (/gram/.test(h)) return 'g';
  if (/\bn-?m\b|torque/.test(h)) return 'N-m';
  if (/\bbar\b|pressure/.test(h)) return 'bar';
  if (/\bforce\b|\bload\b/.test(h)) return 'N';
  if (/\bmm\b|pitch|length|breadth|width|height|dia|range|slot|\bod\b|\bid\b/.test(h)) return 'mm';
  return null;
}

/**
 * Force the model's output into the documented shape.
 *
 * The scanner used to trust the response as-is, so a shifted key or a missing
 * array turned into silently wrong products. Everything questionable is either
 * repaired here or reported as a warning for the review screen.
 */
function normalizeParseResult(raw: any, mode: CatalogueScanMode = 'full'): ParseResult {
  const warnings: string[] = [];
  const products: ParsedProduct[] = [];

  const rawProducts = Array.isArray(raw?.products) ? raw.products : [];
  if (rawProducts.length === 0) {
    warnings.push('The scan returned no products for this page.');
  }

  for (const rawProduct of rawProducts) {
    const name = cleanCell(rawProduct?.name);
    if (!name) {
      warnings.push('Skipped a product because it had no name.');
      continue;
    }

    const rawTables = Array.isArray(rawProduct?.tables) ? rawProduct.tables : [];
    const tables: ParsedTable[] = [];

    for (const rawTable of rawTables) {
      const rawRows = Array.isArray(rawTable?.rows) ? rawTable.rows : [];
      if (rawRows.length === 0) {
        warnings.push(`"${name}": a table was returned with no rows.`);
        continue;
      }

      const modelColumn = cleanCell(rawTable?.modelColumn) ?? 'MODEL';

      // Column list, rebuilt from the rows so a header the model listed but
      // never used cannot create an empty master. Skipped entirely in
      // sku-only mode, where no specification columns are wanted.
      const headerSet = new Set<string>();
      if (mode === 'full') {
        for (const rawRow of rawRows) {
          const specs = rawRow?.specifications;
          if (specs && typeof specs === 'object') {
            Object.keys(specs).forEach((key) => {
              const header = key.trim();
              // A model column echoed into the specs is not a specification.
              if (header && header !== modelColumn && !MODEL_HEADER_PATTERN.test(header)) {
                headerSet.add(header);
              }
            });
          }
        }
      }

      const declaredUnits = new Map<string, string | null>();
      if (mode === 'full' && Array.isArray(rawTable?.columns)) {
        for (const col of rawTable.columns) {
          const header = cleanCell(col?.header);
          if (header) declaredUnits.set(header, cleanCell(col?.unit));
        }
      }

      const columns: ParsedColumn[] = [...headerSet].map((header) => ({
        header,
        unit: declaredUnits.get(header) ?? inferUnit(header),
      }));

      if (mode === 'full' && columns.length === 0) {
        warnings.push(`"${name}": a table had model codes but no specification columns.`);
        continue;
      }

      const rows: ParsedRow[] = [];
      const seenModels = new Set<string>();

      for (const rawRow of rawRows) {
        const model =
          cleanCell(rawRow?.model) ??
          cleanCell(rawRow?.specifications?.[modelColumn]);

        if (!model) {
          warnings.push(`"${name}": skipped a row with no model code.`);
          continue;
        }

        if (seenModels.has(model.toUpperCase())) {
          warnings.push(`"${name}": model "${model}" appeared twice in one table, kept the first row.`);
          continue;
        }
        seenModels.add(model.toUpperCase());

        const specifications: Record<string, string | null> = {};
        for (const col of columns) {
          specifications[col.header] = cleanCell(rawRow?.specifications?.[col.header]);
        }

        if (mode === 'full') {
          const filled = Object.values(specifications).filter((v) => v !== null).length;
          if (filled === 0) {
            warnings.push(`"${name}": model "${model}" had no readable specification values.`);
            continue;
          }
        }

        rows.push({ model, specifications });
      }

      if (rows.length === 0) {
        warnings.push(`"${name}": a table produced no usable rows.`);
        continue;
      }

      tables.push({
        tableTitle: cleanCell(rawTable?.tableTitle),
        modelColumn,
        columns,
        rows,
      });
    }

    if (tables.length === 0) {
      warnings.push(`"${name}": no usable specification table was found.`);
      continue;
    }

    products.push({
      name,
      description: cleanCell(rawProduct?.description),
      tables,
    });
  }

  return { products, warnings };
}

export async function parseCatalogueImage(
  file: File,
  mode: CatalogueScanMode = 'full'
): Promise<ParseResult> {
  const startTime = Date.now();

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mimeType = file.type || 'image/png';

  console.log(
    `[catalogue-parser] Parsing ${file.name} (${(file.size / 1024).toFixed(2)} KB) in ${mode} mode`
  );

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0,
      maxOutputTokens: 32768,
    },
  });

  let text: string;
  try {
    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      mode === 'skuOnly' ? SKU_ONLY_PROMPT : CATALOGUE_PROMPT,
    ]);
    text = result.response.text();
  } catch (error) {
    console.error(`[catalogue-parser] Gemini call failed for ${file.name}:`, error);
    throw new Error(
      `Could not read ${file.name}: ${error instanceof Error ? error.message : 'the AI service did not respond'}`
    );
  }

  // A truncated response is the usual cause of a scan that "mostly worked":
  // JSON.parse throws and the whole page is lost. Say so plainly instead.
  let raw: unknown;
  try {
    raw = JSON.parse(extractJson(text));
  } catch {
    console.error(`[catalogue-parser] Unparseable response for ${file.name}:`, text.slice(0, 500));
    throw new Error(
      `The scan of ${file.name} came back incomplete, usually because the page holds a very large table. Try cropping the page into two images.`
    );
  }

  const parsed = normalizeParseResult(raw, mode);
  const rowCount = parsed.products.reduce(
    (sum, p) => sum + p.tables.reduce((s, t) => s + t.rows.length, 0),
    0
  );

  console.log(
    `[catalogue-parser] ${file.name}: ${parsed.products.length} product(s), ${rowCount} variant row(s), ` +
      `${parsed.warnings.length} warning(s) in ${Date.now() - startTime}ms`
  );

  return parsed;
}
