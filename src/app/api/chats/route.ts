import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CHATS_DIR = path.join(process.cwd(), 'data');

// GET: List all chats
export async function GET() {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(CHATS_DIR)) {
      fs.mkdirSync(CHATS_DIR, { recursive: true });
      return NextResponse.json({ chats: [] });
    }

    const files = fs.readdirSync(CHATS_DIR);
    const chats = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const chatPath = path.join(CHATS_DIR, f);
        const stats = fs.statSync(chatPath);
        const history = JSON.parse(fs.readFileSync(chatPath, 'utf-8'));

        return {
          name: f.replace('.json', ''),
          message_count: history.length,
          last_message: history.length > 0 ? history[history.length - 1].content : null,
          updated_at: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('List chats error:', error);
    return NextResponse.json(
      { error: 'Failed to list chats', details: String(error) },
      { status: 500 }
    );
  }
}

// POST: Create new chat
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Chat name is required' }, { status: 400 });
    }

    // Sanitize name
    const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!sanitizedName) {
      return NextResponse.json({ error: 'Invalid chat name' }, { status: 400 });
    }

    const chatPath = path.join(CHATS_DIR, `${sanitizedName}.json`);

    if (fs.existsSync(chatPath)) {
      return NextResponse.json({ error: 'Chat already exists' }, { status: 400 });
    }

    // Ensure data directory exists
    if (!fs.existsSync(CHATS_DIR)) {
      fs.mkdirSync(CHATS_DIR, { recursive: true });
    }

    // Create empty chat file
    fs.writeFileSync(chatPath, JSON.stringify([], null, 2));

    return NextResponse.json({
      success: true,
      chat_name: sanitizedName,
      message: 'Chat created successfully',
    });
  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { error: 'Failed to create chat', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete chat
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Chat name is required' }, { status: 400 });
    }

    const chatPath = path.join(CHATS_DIR, `${name}.json`);

    if (!fs.existsSync(chatPath)) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    fs.unlinkSync(chatPath);

    return NextResponse.json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat', details: String(error) },
      { status: 500 }
    );
  }
}
