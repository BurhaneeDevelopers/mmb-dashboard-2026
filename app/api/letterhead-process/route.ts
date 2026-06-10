import { NextRequest, NextResponse } from 'next/server';
import { parseCatalogueImage } from '@/lib/catalogue-parser';
import { importProduct } from '@/lib/product-importer';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes timeout for image processing

interface ProcessResult {
  filename: string;
  success: boolean;
  productId?: string;
  productName?: string;
  error?: string;
  isUpdate?: boolean;
  matchedProductName?: string;
  similarity?: number;
}

interface ApiSummary {
  totalImages: number;
  imagesProcessed: number;
  imagesFailed: number;
  productsCreated: number;
  productsUpdated: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId') as string;
    const images = formData.getAll('images') as File[];

    console.log(`[letterhead-process] Starting processing: ${images.length} images, category: ${categoryId}`);

    // Validation
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    if (images.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 images allowed' },
        { status: 400 }
      );
    }

    // Validate file types
    for (const image of images) {
      if (!image.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `Invalid file type: ${image.name}. Only images are allowed.` },
          { status: 400 }
        );
      }
    }

    const results: ProcessResult[] = [];
    let imagesProcessed = 0;
    let imagesFailed = 0;
    let productsCreated = 0;
    let productsUpdated = 0;

    // Process each image
    for (const image of images) {
      const imageStartTime = Date.now();
      try {
        console.log(`[letterhead-process] Processing image: ${image.name} (${(image.size / 1024).toFixed(2)} KB)`);
        
        // Parse image with Gemini
        const parseResult = await parseCatalogueImage(image);
        const parseTime = Date.now() - imageStartTime;
        console.log(`[letterhead-process] Parsed ${image.name} in ${parseTime}ms, found ${parseResult.products?.length || 0} products`);
        
        if (!parseResult.products || parseResult.products.length === 0) {
          results.push({
            filename: image.name,
            success: false,
            error: 'No products detected in image',
          });
          imagesFailed++;
          continue;
        }

        // Import each product detected in the image
        for (const product of parseResult.products) {
          const importStartTime = Date.now();
          const importResult = await importProduct(product, categoryId, {
            updateExisting: true,
            similarityThreshold: 0.8,
          });
          const importTime = Date.now() - importStartTime;
          console.log(`[letterhead-process] Imported "${product.name}" in ${importTime}ms, success: ${importResult.success}`);
          
          results.push({
            filename: image.name,
            success: importResult.success,
            productId: importResult.productId,
            productName: importResult.productName,
            error: importResult.error,
            isUpdate: importResult.isUpdate,
            matchedProductName: importResult.matchedProductName,
            similarity: importResult.similarity,
          });

          if (importResult.success) {
            if (importResult.isUpdate) {
              productsUpdated++;
            } else {
              productsCreated++;
            }
          }
        }

        imagesProcessed++;
        const imageTime = Date.now() - imageStartTime;
        console.log(`[letterhead-process] Completed ${image.name} in ${imageTime}ms`);
      } catch (error) {
        console.error(`[letterhead-process] Error processing image ${image.name}:`, error);
        results.push({
          filename: image.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        imagesFailed++;
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`[letterhead-process] Completed all processing in ${totalTime}ms`);

    const summary: ApiSummary = {
      totalImages: images.length,
      imagesProcessed,
      imagesFailed,
      productsCreated,
      productsUpdated,
    };

    return NextResponse.json({
      results,
      summary,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[letterhead-process] Error after ${totalTime}ms:`, error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
