/**
 * Google Gemini Vision API integration for catalogue parsing
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const CATALOGUE_PROMPT = `You are analyzing an industrial product catalogue page image.
Your task: Extract ALL product specification data from this image.

RULES:
1. Find the product name/title from the page heading
2. Find ALL specification tables. One page may have MULTIPLE tables with different products
3. For each table:
   - Each COLUMN HEADER = one master (specification attribute)
   - All values in that column across ALL rows = that master's values
   - Include every unique non-empty value
4. IGNORE: company name, logo, address, phone, email, website, page numbers,
   footnotes, ordering examples, technical diagrams/drawings, stock symbols (✓ ●)
5. If ONE table → one product. If TWO separate titled tables → two products

Return this exact JSON structure:
{
  "productName": "primary product name from page heading",
  "products": [
    {
      "name": "specific product name for this table section",
      "masters": [
        {
          "name": "exact column header",
          "label": "exact column header",
          "type": "select",
          "unit": "mm | g | N | null",
          "values": ["val1", "val2", "val3"]
        }
      ]
    }
  ]
}

Unit detection rules:
- Header contains "mm" or dimension letters (L, d1, d2, H, S, k) → "mm"
- Header contains "g" or "weight" or "gram" → "g"
- Header contains "N" or "force" or "load" → "N"
- Otherwise → null

Example: For Spring Plunger catalogue page with TWO tables (Screw Type + Allen Key Type):
- products array should have 2 items, one per table section
- Each item has its own masters array from its own table columns`;

export interface ParsedMaster {
  name: string;
  label: string;
  type: string;
  unit: string | null;
  values: string[];
}

export interface ParsedProduct {
  name: string;
  masters: ParsedMaster[];
}

export interface ParseResult {
  products: ParsedProduct[];
}

export async function parseCatalogueImage(
  file: File
): Promise<ParseResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  });

  // Convert file to base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mimeType = file.type as 'image/jpeg' | 'image/png';

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      CATALOGUE_PROMPT,
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No text response from Gemini');
    }

    const parsed = JSON.parse(text) as ParseResult;

    // Validate structure
    if (!parsed.products || !Array.isArray(parsed.products)) {
      throw new Error('Invalid response structure: missing products array');
    }

    return parsed;
  } catch (error) {
    throw error;
  }
}
