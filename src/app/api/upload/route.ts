import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

// Ensure the upload directory exists
const uploadDir = join(process.cwd(), 'public', 'uploads');
if (!existsSync(uploadDir)) {
  try {
    mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  } catch (error) {
    console.error(`Failed to create upload directory: ${uploadDir}`, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const prefix = data.get('prefix') as string || 'product';
    const productId = data.get('productId') as string || 'temp';
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    // Basic validation
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: 'File size exceeds 5MB limit.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create product-specific directory
    const productDir = join(uploadDir, productId);
    if (!existsSync(productDir)) {
      mkdirSync(productDir, { recursive: true });
    }

    // Create a unique filename with prefix
    const filename = `${prefix}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const path = join(productDir, filename);

    await writeFile(path, buffer);
    console.log(`File uploaded successfully: ${path}`);

    // Return the relative URL path for accessing the file
    const fileUrl = `/uploads/${productId}/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    console.error('Error saving file:', error);
    let errorMessage = 'Failed to save file.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}