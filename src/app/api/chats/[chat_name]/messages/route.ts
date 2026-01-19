import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CHATS_DIR = path.join(process.cwd(), 'data');

// GET: Get messages for a specific chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chat_name: string }> }
) {
  try {
    const { chat_name } = await params;

    if (!chat_name) {
      return NextResponse.json({ error: 'Chat name is required' }, { status: 400 });
    }

    const chatPath = path.join(CHATS_DIR, `${chat_name}.json`);

    if (!fs.existsSync(chatPath)) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const messages = JSON.parse(fs.readFileSync(chatPath, 'utf-8'));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages', details: String(error) },
      { status: 500 }
    );
  }
}
