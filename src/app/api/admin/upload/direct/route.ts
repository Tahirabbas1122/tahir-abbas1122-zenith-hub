import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { formatBytes } from '@/lib/storage';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const requestedStorageKey = formData.get('storageKey') as string | null;
    const slug = (formData.get('slug') as string) || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name;
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = requestedStorageKey || `uploads/${slug}/${Date.now()}-${sanitizedFileName}`;

    // Target absolute file path on disk
    const targetPath = path.join(process.cwd(), 'storage', storageKey);
    const targetDir = path.dirname(targetPath);

    await fs.promises.mkdir(targetDir, { recursive: true });

    // Read buffer and calculate hash
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    await fs.promises.writeFile(targetPath, buffer);

    const fileSize = buffer.length;
    const formattedSize = formatBytes(fileSize);

    return NextResponse.json({
      success: true,
      storageKey,
      fileName,
      fileSize,
      formattedSize,
      fileHash,
    });
  } catch (error) {
    console.error('Error handling direct file upload:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
