import { NextRequest, NextResponse } from 'next/server';
import { parseCatalogueImage, type ParseResult } from '@/lib/catalogue-parser';

export const runtime = 'nodejs';
export const maxDuration = 300;

const MAX_IMAGES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

interface ScanResponseItem {
  filename: string;
  success: boolean;
  result?: ParseResult;
  error?: string;
}

/**
 * Read catalogue pages and return a draft for review.
 *
 * This endpoint no longer writes to the database. It used to create products
 * straight from the model's output, so any misread went in unseen; the client
 * now shows the draft, the user corrects it, and the import runs from there.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const images = formData.getAll('images').filter((f): f is File => f instanceof File);

    if (images.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images per scan` },
        { status: 400 }
      );
    }

    for (const image of images) {
      if (!image.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `${image.name} is not an image file` },
          { status: 400 }
        );
      }
      if (image.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `${image.name} is larger than 10MB` },
          { status: 400 }
        );
      }
    }

    // Pages are independent, so read them together rather than one after
    // another. A single failed page no longer costs the whole batch.
    const scans: ScanResponseItem[] = await Promise.all(
      images.map(async (image) => {
        try {
          const result = await parseCatalogueImage(image);
          return { filename: image.name, success: true, result };
        } catch (error) {
          console.error(`[letterhead-process] ${image.name} failed:`, error);
          return {
            filename: image.name,
            success: false,
            error: error instanceof Error ? error.message : 'Could not read this image',
          };
        }
      })
    );

    const productCount = scans.reduce((sum, s) => sum + (s.result?.products.length ?? 0), 0);
    const variantCount = scans.reduce(
      (sum, s) =>
        sum +
        (s.result?.products.reduce(
          (inner, p) => inner + p.tables.reduce((t, table) => t + table.rows.length, 0),
          0
        ) ?? 0),
      0
    );

    console.log(
      `[letterhead-process] Scanned ${images.length} image(s) in ${Date.now() - startTime}ms: ` +
        `${productCount} product(s), ${variantCount} variant(s)`
    );

    return NextResponse.json({
      scans,
      summary: {
        totalImages: images.length,
        imagesScanned: scans.filter((s) => s.success).length,
        imagesFailed: scans.filter((s) => !s.success).length,
        productsFound: productCount,
        variantsFound: variantCount,
      },
    });
  } catch (error) {
    console.error(`[letterhead-process] Failed after ${Date.now() - startTime}ms:`, error);
    return NextResponse.json(
      {
        error: 'Could not process the images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
