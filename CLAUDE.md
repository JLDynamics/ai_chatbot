# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Chatbot - A local-first AI chatbot with terminal-style UI, built with Next.js 16, React 19, TypeScript, mem0 (AI memory system), and OpenAI. Features chat management, memory system with semantic search.

## Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Environment Variables

**Required:**
- `OPENAI_API_KEY` - OpenAI API key for chat and mem0 embeddings

**Optional:**
- `LLM_MODEL` - OpenAI model (default: gpt-4.1-nano)

## High-Level Architecture

### Frontend (Client Components)
- **src/app/page.tsx** - Main page orchestrates Sidebar, Chat, MemoryViewer, NewChatModal
- **src/components/** - React components for UI (Chat, Sidebar, InputArea, MemoryViewer, Modals)
- **src/contexts/** - React Context providers for state management:
  - **ChatContext.tsx** - Manages chat list, current chat, messages, CRUD operations
  - **MemoryContext.tsx** - Manages memories, CRUD operations
  - **ToastContext.tsx** - Simple toast notification system
- **src/types/index.ts** - Shared TypeScript interfaces (Chat, Message, Memory)

### Backend (Next.js API Routes)
All routes in **src/app/api/**:

- **POST /api/chat** - Send message, get AI response
  - Searches mem0 for relevant memories (semantic search)
  - Loads chat history from `data/{chat_name}.json`
  - Calls OpenAI with system prompt + memories + history + user message
  - Saves response to chat history
  - Async adds conversation to mem0 memory (if < 50 memories)

- **GET/POST/DELETE /api/chats** - Chat management
  - GET: Lists all chats from `data/` directory with metadata
  - POST: Creates new chat file
  - DELETE: Removes chat file

- **GET/POST/DELETE /api/memories** - Memory management (mem0)
  - GET: Fetches all memories from mem0
  - POST: Adds memory to mem0 with OpenAI embedding
  - DELETE: Removes memory by ID

- **POST /api/search** - Internet search via Tavily
  - Intent detection to determine if search is needed
  - Returns formatted results if TAVILY_API_KEY configured

- **GET /api/health** - Health check endpoint

### Data Flow
```
User Input → ChatContext → API Route → mem0 (memories) → OpenAI → Response → UI
```

### Storage
- **Chat History**: JSON files in `data/{chat_name}.json` (gitignored)
- **Memories**: mem0 cloud-managed storage (uses OpenAI API)
- **Embeddings**: OpenAI text-embedding-3-small (handled by mem0)

## Key Implementation Details

### System Prompt
Located in `src/app/api/chat/route.ts` - Engineering-first, high-agency, future-obsessed tech founder "bro" vibe. Direct, concise, mission-driven tone with first-principles thinking.

### Memory System (mem0)
- **Client Singleton**: `src/lib/mem0.ts` - Exports `getMem0Client()` function
- **API quirks**: `getAll()` returns `{ results: [...] }`, `add()` takes message array format `[{ role: 'user', content: '...' }]`
- `search()` returns `{ results: [{ id, memory, score, ... }] }`
- Memories stored with metadata: `{ memory, created_at, userId }`
- User isolation via `userId: 'default-user'`

### Search Intent Detection
`shouldSearch()` function in search route checks for:
- Question words (what, when, where, who, how, why, etc.)
- Real-time contexts (weather, stock, news, time, sports, etc.)

## Important Files

- **src/app/page.tsx** - Main application entry point
- **src/app/api/chat/route.ts** - Core AI chat logic with mem0 integration
- **src/app/api/memories/route.ts** - Memory CRUD operations
- **src/lib/mem0.ts** - mem0 client singleton
- **src/contexts/ChatContext.tsx** - Client-side chat state management
- **src/contexts/MemoryContext.tsx** - Client-side memory state management
- **next.config.ts** - Next.js configuration (CORS headers)
- **package.json** - Dependencies and scripts

## Troubleshooting

### mem0 not responding
- Check that OPENAI_API_KEY is set in `.env.local`
- Verify API key has valid credits
- Check server logs for detailed error messages

### Build errors
```bash
rm -rf node_modules .next
npm install
npm run build
```

### API returning HTML errors
Check that all environment variables are set in `.env.local`.

### Memory search not working
mem0 automatically initializes on first use - no manual setup required.
