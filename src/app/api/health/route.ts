import { NextResponse } from 'next/server';
import { QdrantClient } from '@qdrant/js-client-rest';

export async function GET() {
  try {
    const qdrant = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333' });

    // Check Qdrant connection
    const collectionInfo = await qdrant.getCollections();
    const qdrantStatus = collectionInfo.collections.length >= 0 ? 'connected' : 'unknown';

    return NextResponse.json({
      status: 'ok',
      qdrant: qdrantStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      qdrant: 'disconnected',
      error: String(error),
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
