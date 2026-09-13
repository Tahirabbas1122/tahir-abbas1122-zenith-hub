import { NextRequest, NextResponse } from 'next/server';
import { verifySignedDownloadToken } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const exp = parseInt(url.searchParams.get('exp') || '0', 10);
    const fn = url.searchParams.get('fn') || 'download.bin';
    const sig = url.searchParams.get('sig') || '';

    // Verify token signature and timestamp
    const isValid = verifySignedDownloadToken({
      fileId: id,
      fileName: fn,
      expiryTimestamp: exp,
      signature: sig,
    });

    if (!isValid) {
      return new NextResponse('Invalid or expired download link.', { status: 403 });
    }

    const file = await prisma.downloadFile.findUnique({
      where: { id },
      include: { software: true },
    });

    if (!file) {
      return new NextResponse('Requested binary not found.', { status: 404 });
    }

    // Generate simulated realistic binary payload
    const demoPayload = `--- ZENITH SOFTWARE HUB VERIFIED BINARY ---
Software: ${file.software.title}
Version: ${file.version}
Platform: ${file.platform} (${file.architecture})
Checksum (SHA-256): ${file.fileHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
Size: ${file.formattedSize}
Storage Key: ${file.storageKey}
Timestamp: ${new Date().toISOString()}

Thank you for downloading from Zenith Software Hub.
This package was signed and delivered via secure expiring token gateway.
`;

    const buffer = Buffer.from(demoPayload, 'utf-8');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fn)}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error serving download:', error);
    return new NextResponse('Internal server error streaming binary file', { status: 500 });
  }
}
