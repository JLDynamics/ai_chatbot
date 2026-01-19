# AI Chatbot

A local-first AI chatbot with an engineering-first, high-agency vibe. Built with Next.js 16, React 19, TypeScript, and mem0 (AI memory system).

## Features

- 🤖 Chat with AI (OpenAI GPT models)
- 🧠 Memory system with semantic search (mem0)
- 💾 Persistent chat history
- 🎨 Terminal-style UI (black background, green/cyan text)
- ⚡ Fast & responsive
- 🔍 Internet search (Tavily, optional)

## Prerequisites

1. **Node.js 18+** installed
2. **OpenAI API key** for chat and embeddings

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create `.env.local` with your API key:
   ```env
   OPENAI_API_KEY=your_openai_key_here
   LLM_MODEL=gpt-4.1-nano
   TAVILY_API_KEY=your_tavily_key_here  # optional
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   ```
   http://localhost:3000
   ```

## Usage

### Creating a Chat
- Click "New Chat" in sidebar
- Enter a chat name
- Start chatting!

### Adding Memories
- Click "🧠 Memories" in sidebar
- Type your memory and click "Add"
- Memories are automatically retrieved during conversations
- The AI also auto-extracts key facts from your chats

### Search
- Ask questions that need real-time data:
  - "What's the weather in Tokyo?"
  - "Tesla stock price"
  - "Latest news about AI"

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (Next.js App Router)
│   │   ├── chat/     # Core chat logic with mem0
│   │   ├── chats/    # Chat CRUD operations
│   │   ├── memories/ # Memory CRUD operations (mem0)
│   │   ├── search/   # Internet search (Tavily)
│   │   └── health/   # Health check
│   ├── page.tsx      # Main page (orchestrates components)
│   ├── layout.tsx    # Root layout
│   └── globals.css   # Terminal theme styles
├── components/       # React components (Chat, Sidebar, InputArea, etc.)
├── contexts/         # React Context providers (Chat, Memory, Toast)
├── types/            # TypeScript interfaces
└── lib/
    └── mem0.ts       # mem0 client singleton
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get AI response |
| GET | `/api/chats` | List all chats |
| POST | `/api/chats` | Create new chat |
| DELETE | `/api/chats` | Delete chat |
| GET | `/api/memories` | List memories |
| POST | `/api/memories` | Add memory |
| DELETE | `/api/memories` | Delete memory |
| POST | `/api/search` | Internet search |
| GET | `/api/health` | Health check |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI**: OpenAI SDK, mem0ai (memory/embeddings)
- **Search**: Tavily API (optional)

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Environment Variables

```env
# Required
OPENAI_API_KEY=your_openai_key_here

# Optional
LLM_MODEL=gpt-4.1-nano        # defaults to gpt-4.1-nano
TAVILY_API_KEY=your_tavily_key_here
```

## Notes

- Chat history stored in `data/` directory (gitignored)
- Mem0 handles embeddings and semantic search automatically
- No Docker required - mem0 uses OpenAI for embeddings
- System prompt uses "tech founder bro" persona with first-principles thinking

## License

MIT
