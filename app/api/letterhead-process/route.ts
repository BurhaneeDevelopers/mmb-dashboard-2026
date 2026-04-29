/**
 * Letterhead processing API route using Google Gemini Vision API
 * Replaces Python OCR service with direct Gemini integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseCatalogueImage } from '@/lib/catalogue-parser';
import { importProduct } from '@/lib/product-importer';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    const categoryId = formData.get('categoryId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }
    if (files.length > 4) {
      return NextResponse.json({ error: 'Maximum 4 images allowed' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const results: Array<{ 
      filename: string; 
      success: boolean; 
      productId?: string; 
      productName?: string;
      error?: string;
    }> = [];

    let totalImagesProcessed = 0;
    let totalImagesFailed = 0;
    let totalProductsCreated = 0;

    // Process each image independently
    for (const file of files) {
      let imageSuccess = false;
      let productsFromThisImage = 0;

      try {
        // Step 1: Parse image with Gemini Vision API
        const parseResult = await parseCatalogueImage(file);

        if (!parseResult.products || parseResult.products.length === 0) {
          results.push({ 
            filename: file.name, 
            success: false, 
            error: 'No products detected in image' 
          });
          totalImagesFailed++;
          continue;
        }

        // Step 2: Import each product detected in the image
        for (const product of parseResult.products) {
          const importResult = await importProduct(product, categoryId);

          results.push({
            filename: file.name,
            success: importResult.success,
            productId: importResult.productId,
            productName: importResult.productName,
            error: importResult.error,
          });

          if (importResult.success) {
            imageSuccess = true;
            productsFromThisImage++;
            totalProductsCreated++;
          }
        }

        if (imageSuccess) {
          totalImagesProcessed++;
        } else {
          totalImagesFailed++;
        }

      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
        results.push({ 
          filename: file.name, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
        totalImagesFailed++;
      }
    }

    return NextResponse.json({
      results,
      summary: {
        totalImages: files.length,
        imagesProcessed: totalImagesProcessed,
        imagesFailed: totalImagesFailed,
        productsCreated: totalProductsCreated,
      },
    });

  } catch (err) {
    console.error('Letterhead process error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
