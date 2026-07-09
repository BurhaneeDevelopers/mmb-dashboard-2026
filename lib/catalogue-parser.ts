/**
 * Extract product specifications from images using Google Gemini Vision API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Prompt for Gemini Vision API
const CATALOGUE_PROMPT = `You are analyzing an industrial product catalogue page image.
Your task: Extract ALL product specification data from this image.

CRITICAL RULES:
1. Find the product name/title from the page heading
2. Find ALL specification tables. One page may have MULTIPLE tables with different products
3. For each table:
   - Each ROW = one product variant
   - Each COLUMN HEADER = one master (specification attribute)
   - Extract EVERY row as a separate product variant with ALL its column values
   - DO NOT skip rows with duplicate or similar values
   - Include empty values as null or "-" to maintain data integrity
4. IGNORE: company name, logo, address, phone, email, website, page numbers,
   footnotes, ordering examples, technical diagrams/drawings, stock symbols (✓ ●)
5. If ONE table → multiple product variants. If TWO separate titled tables → two product groups

Return this exact JSON structure:
{
  "productName": "primary product name from page heading",
  "products": [
    {
      "name": "specific product name for this table section",
      "variants": [
        {
          "variantName": "descriptive name based on key distinguishing values",
          "specifications": {
            "Column Header 1": "value1",
            "Column Header 2": "value2",
            "Column Header 3": "value3"
          }
        }
      ],
      "masters": [
        {
          "name": "exact column header",
          "label": "exact column header",
          "type": "select",
          "unit": "mm | g | N | bar | null",
          "values": ["val1", "val2", "val3"]
        }
      ]
    }
  ]
}

Unit detection rules:
- Header contains "mm" or dimension letters (L, d1, d2, H, S, k, OD, ID) → "mm"
- Header contains "g" or "weight" or "gram" → "g"
- Header contains "N" or "force" or "load" → "N"
- Header contains "bar" or "Bar" or "pressure" → "bar"
- Header contains "N-m" or "Nm" or "torque" → "N-m"
- Otherwise → null

IMPORTANT: Extract EVERY row from the table, even if some values repeat. Each row represents a distinct product variant.`;

// Return types
export interface ParsedMaster {
  name: string;
  label: string;
  type: string;
  unit: string | null;
  values: string[];
}

export interface ProductVariant {
  variantName: string;
  specifications: Record<string, string>;
}

export interface ParsedProduct {
  name: string;
  variants?: ProductVariant[];
  masters: ParsedMaster[];
}

export interface ParseResult {
  products: ParsedProduct[];
}

/**
 * Parse a catalogue image using Gemini Vision API
 */
export async function parseCatalogueImage(file: File): Promise<ParseResult> {
  const startTime = Date.now();
  try {
    // Convert File to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type as 'image/jpeg' | 'image/png';

    console.log(`[catalogue-parser] Starting parse for ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // Configure Gemini model - using flash-lite for faster processing
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });

    // Send to Gemini
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
    const parseTime = Date.now() - startTime;
    console.log(`[catalogue-parser] Gemini response received in ${parseTime}ms, parsing JSON...`);
    
    const parsed = JSON.parse(text) as ParseResult;
    const totalTime = Date.now() - startTime;
    console.log(`[catalogue-parser] Successfully parsed ${file.name} in ${totalTime}ms`);

    return parsed;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[catalogue-parser] Error after ${totalTime}ms:`, error);
    throw new Error(`Failed to parse image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
