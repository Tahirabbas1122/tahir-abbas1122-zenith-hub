import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePresignedUploadUrl } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { fileName, contentType, slug } = body;

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: 'Valid fileName is required' }, { status: 400 });
    }

    const cleanSlug = (slug && typeof slug === 'string')
      ? slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')
      : 'misc';

    const presignedData = await generatePresignedUploadUrl({
      fileName,
      contentType: contentType || 'application/octet-stream',
      slug: cleanSlug,
      expiresInSeconds: 3600,
    });

    return NextResponse.json({
      success: true,
      ...presignedData,
    });
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
