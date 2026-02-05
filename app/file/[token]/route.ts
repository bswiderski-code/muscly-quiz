import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { PAYMENT_CREDENTIALS } from '@/config/credentials';

export const dynamic = 'force-dynamic';

// Mapping from OrderItem enum to S3 object keys (filenames)
// TODO: User to fill in actual filenames
const ORDER_ITEM_FILES: Record<string, string> = {
    workout_solo: 'workout_solo.pdf',
    workout_bundle: 'workout_bundle.pdf',
    raport: 'raport.pdf',
    calisthenics_solo: 'calisthenics_solo.pdf',
    calisthenics_bundle: 'calisthenics_bundle.pdf',
};

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    const { token } = await context.params;

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const order = await prisma.orders.findUnique({
        where: { pdfToken: token },
    });

    if (!order) {
        return NextResponse.json({ error: 'File not found or invalid token' }, { status: 404 });
    }

    // Determine file key
    const fileKey = ORDER_ITEM_FILES[order.item];
    if (!fileKey) {
        console.error(`No file mapping for item: ${order.item}`);
        return NextResponse.json({ error: 'File configuration missing' }, { status: 500 });
    }

    // Initialize S3
    const s3Config = PAYMENT_CREDENTIALS.s3;
    if (!s3Config.credentials.accessKeyId || !s3Config.credentials.secretAccessKey) {
        console.error('S3 credentials missing');
        // Return 404 to hide internal error details from user
        return NextResponse.json({ error: 'File not available' }, { status: 500 });
    }

    const s3 = new S3Client({
        region: s3Config.region,
        endpoint: s3Config.endpoint,
        credentials: s3Config.credentials,
        forcePathStyle: true, // Often needed for non-AWS S3
    });

    try {
        const command = new GetObjectCommand({
            Bucket: s3Config.bucket,
            Key: fileKey,
        });

        const response = await s3.send(command);

        if (!response.Body) {
            return NextResponse.json({ error: 'Empty file' }, { status: 500 });
        }

        // Stream the response
        // Web Streams API (standard in Next.js App Router)
        const stream = response.Body.transformToWebStream();

        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `inline; filename="${fileKey}"`);
        if (response.ContentLength) {
            headers.set('Content-Length', response.ContentLength.toString());
        }

        return new NextResponse(stream, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error('S3 Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch file' }, { status: 404 });
    }
}
