import { NextRequest, NextResponse } from 'next/server';
import { getMem0Client } from '@/lib/mem0';

// GET: Fetch all memories
export async function GET() {
  try {
    const mem0 = getMem0Client();
    // getAll() returns { results: [...] }
    const result = await mem0.getAll({ userId: 'default-user' });

    // getAll() returns { results: [...] } not a direct array
    const allMemories = (result as any)?.results || [];

    // Map mem0 results to existing format: { id, memory, created_at }
    const memories = (Array.isArray(allMemories) ? allMemories : []).map((m: any) => ({
      id: m.id || '',
      memory: m.memory || '',
      created_at: m.created_at || m.createdAt || m.metadata?.created_at || new Date().toISOString(),
    }));

    return NextResponse.json({ memories });
  } catch (error) {
    // mem0 might not have available
    console.warn('Get memories error:', error);
    return NextResponse.json({ memories: [] });
  }
}

// POST: Add new memory
export async function POST(request: NextRequest) {
  try {
    const { memory } = await request.json();

    if (!memory) {
      return NextResponse.json({ error: 'Memory text is required' }, { status: 400 });
    }

    const mem0 = getMem0Client();
    // mem0.add() expects array of messages with role/content
    const result = await mem0.add(
      [{ role: 'user', content: memory }],
      {
        userId: 'default-user',
        metadata: { created_at: new Date().toISOString() },
      }
    );

    // Result format: { results: [{ id, memory, ... }] }
    const firstResult = result?.results?.[0];
    return NextResponse.json({ success: true, message: 'Memory added', id: firstResult?.id });
  } catch (error) {
    console.error('Add memory error:', error);
    return NextResponse.json(
      { error: 'Failed to add memory', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete memory by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    const mem0 = getMem0Client();
    await mem0.delete(id);

    return NextResponse.json({ success: true, message: 'Memory deleted' });
  } catch (error) {
    console.error('Delete memory error:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory', details: String(error) },
      { status: 500 }
    );
  }
}
