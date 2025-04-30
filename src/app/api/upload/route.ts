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
    // Depending on the desired behavior, you might want to throw an error here
    // or handle it in a way that prevents the server from starting without the directory.
  }
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  // Basic validation (optional: add more checks like file size, specific image types)
  if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Only images are allowed.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename (e.g., timestamp + original name)
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const path = join(uploadDir, filename);

  try {
    await writeFile(path, buffer);
    console.log(`File uploaded successfully: ${path}`);

    // Return the relative URL path for accessing the file
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, message: 'Failed to save file.' }, { status: 500 });
  }
}