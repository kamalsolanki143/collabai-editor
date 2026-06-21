# CollabAI Editor

**Real-Time Collaborative Document Editor with AI-Powered Semantic Search**

A production-ready web application that enables multiple users to edit the same document simultaneously while automatically indexing content in the background for semantic retrieval using Google Gemini embeddings and ChromaDB.

---

## Features

### Core
- **Rich Text Editing** — TipTap editor with bold, italic, underline, headings (H1-H3), bullet lists, numbered lists, code blocks, block quotes, and horizontal rules
- **Real-Time Collaboration** — Multiple users edit simultaneously via Yjs CRDT — no conflicts, instant sync
- **AI Semantic Search** — Natural language search powered by Google Gemini embeddings and ChromaDB vector database
- **Background Indexing** — Document content is automatically chunked, embedded, and indexed asynchronously with debouncing

### Collaboration
- Live user count and active user avatars
- Colored cursor labels showing each user's position
- User join/leave notifications
- Typing indicators with animated dots
- Automatic reconnection on disconnection

### Search Experience
- Debounced search with natural language queries
- Relevance score display (percentage match)
- Search result highlighting
- Search history with localStorage persistence
- Sample query suggestions
- Loading, empty, and error states

### UI/UX
- Modern SaaS-style dark mode interface
- Fully responsive (mobile, tablet, desktop)
- Glassmorphism and backdrop blur effects
- Smooth animations and micro-interactions
- Professional loading skeletons
- Toast notification system
- Connection and indexing status indicators

---

## Architecture

```
┌─────────────────┐
│  User Browser    │
│  (Next.js 15)   │
└───────┬─────────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌──────┐  ┌──────────┐
│ Yjs  │  │ Socket.IO│
│ WS   │  │ Client   │
└──┬───┘  └────┬─────┘
   │           │
   ▼           ▼
┌─────────────────────┐
│   FastAPI Backend    │
│                      │
│  ┌───────────────┐   │
│  │ Yjs WS Server │   │
│  │ (CRDT Sync)   │   │
│  └───────────────┘   │
│  ┌───────────────┐   │
│  │ Socket.IO     │   │
│  │ (Presence)    │   │
│  └───────────────┘   │
│  ┌───────────────┐   │
│  │ REST API      │   │
│  │ /search /index│   │
│  └──────┬────────┘   │
└─────────┼────────────┘
          │
          ▼
┌───────────────────┐
│ Background Worker  │
│ (Async Indexing)   │
└──────┬────────────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
┌──────┐  ┌─────────┐
│Gemini│  │ ChromaDB│
│Embed │  │ Vector  │
│ API  │  │ Store   │
└──────┘  └─────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 15 (App Router) | SSR, routing, TypeScript |
| UI Styling | TailwindCSS v3 | Utility-first CSS |
| Editor | TipTap v2 | Rich text editing |
| Collaboration | Yjs + y-prosemirror + y-websocket | CRDT-based real-time sync |
| Real-time Events | Socket.IO | Presence, notifications, typing |
| Backend Framework | FastAPI | REST API, WebSocket handling |
| Embeddings | LangChain + Google Gemini | Text embedding generation |
| Vector Database | ChromaDB | Semantic similarity search |
| Server | Uvicorn | ASGI server |
| Icons | Lucide React | Consistent icon system |

---

## Folder Structure

```
kb/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── next.config.ts
│   ├── vercel.json
│   ├── .env.example
│   └── src/
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── components/
│       │   ├── Editor.tsx
│       │   ├── Toolbar.tsx
│       │   ├── UserPresence.tsx
│       │   ├── SearchPanel.tsx
│       │   ├── ConnectionStatus.tsx
│       │   ├── IndexingStatus.tsx
│       │   ├── Notification.tsx
│       │   └── LoadingSkeleton.tsx
│       ├── hooks/
│       │   ├── useCollaboration.ts
│       │   ├── useSearch.ts
│       │   └── useSocket.ts
│       ├── lib/
│       │   ├── api.ts
│       │   ├── constants.ts
│       │   └── socket.ts
│       └── types/
│           └── index.ts
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── websocket_manager.py
│   ├── embeddings.py
│   ├── vector_store.py
│   ├── worker.py
│   ├── yjs_server.py
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Google Gemini API Key (from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Start the server
python main.py
```

The backend runs at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend runs at `http://localhost:3000`.

---

## Environment Variables

### Backend (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | Yes | — | Google Gemini API key for embeddings |
| `CHROMA_DB_PATH` | No | `./chroma_data` | ChromaDB persistence directory |
| `PORT` | No | `8000` | Server port |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed origins |
| `INDEX_DEBOUNCE_SECONDS` | No | `2.0` | Indexing debounce delay |
| `CHUNK_SIZE` | No | `500` | Text chunk size for splitting |
| `CHUNK_OVERLAP` | No | `50` | Overlap between chunks |
| `MAX_SEARCH_RESULTS` | No | `10` | Max results per search |
| `SEARCH_RATE_LIMIT` | No | `30` | Max searches per minute per client |
| `LOG_LEVEL` | No | `INFO` | Logging level |

### Frontend (`.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | No | `http://localhost:8000` | Backend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | No | `http://localhost:8000` | Socket.IO server URL |
| `NEXT_PUBLIC_YJS_WS_URL` | No | `ws://localhost:8000/yjs` | Yjs WebSocket URL |

---

## API Documentation

### REST Endpoints

#### `GET /`
Welcome endpoint. Returns API info and available endpoints.

#### `GET /health`
Health check. Returns service status, embedding availability, vector store stats, and connected user count.

#### `POST /search`
Semantic search on indexed document content.

**Request Body:**
```json
{
  "query": "What does the document say about machine learning?",
  "document_id": "default",
  "n_results": 5
}
```

**Response:**
```json
{
  "query": "What does the document say about machine learning?",
  "results": [
    {
      "text": "Machine Learning (ML) is a subset of AI...",
      "score": 0.8742,
      "chunk_index": 1,
      "document_id": "default",
      "metadata": {}
    }
  ],
  "total_results": 3,
  "status": "success"
}
```

#### `POST /index`
Manually trigger document indexing.

**Request Body:**
```json
{
  "document_id": "default",
  "content": "Full document text content..."
}
```

### WebSocket Events

#### Socket.IO (Presence & Notifications)

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join_document` | Client → Server | `{ document_id, username }` | Join a document room |
| `leave_document` | Client → Server | `{ document_id }` | Leave a document room |
| `cursor_update` | Client → Server | `{ position: { anchor, head } }` | Update cursor position |
| `typing` | Client → Server | `{ is_typing: boolean }` | Typing indicator |
| `document_content` | Client → Server | `{ document_id, content }` | Send content for indexing |
| `room_state` | Server → Client | `{ users, count, document_id }` | Initial room state |
| `user_joined` | Server → Client | `{ user, users, count }` | User joined notification |
| `user_left` | Server → Client | `{ user, users, count }` | User left notification |
| `cursor_updated` | Server → Client | `{ sid, user }` | Cursor position broadcast |
| `user_typing` | Server → Client | `{ sid, user, is_typing }` | Typing status broadcast |
| `indexing_status` | Server → Client | `{ document_id, status }` | Indexing progress update |

#### Yjs WebSocket (`/yjs/{document_id}`)
Binary CRDT protocol — handles document state synchronization automatically.

---

## Semantic Search Workflow

```
1. User edits document in TipTap editor
          │
2. Yjs syncs changes to all connected clients
          │
3. Content is sent via Socket.IO to the backend (debounced, 3s)
          │
4. Backend worker receives content change
          │
5. Debounce timer starts (2s) — resets on subsequent changes
          │
6. After debounce: text is chunked (RecursiveCharacterTextSplitter)
          │
7. Chunks are sent to Google Gemini for embedding generation
          │
8. Old document chunks are deleted from ChromaDB
          │
9. New chunks + embeddings are upserted into ChromaDB
          │
10. Indexing status broadcast to all clients via Socket.IO
          │
11. User performs natural language search
          │
12. Query is embedded via Gemini
          │
13. ChromaDB performs cosine similarity search
          │
14. Results returned with relevance scores
```

---

## Deployment Guide

### Frontend → Vercel

1. Push the `frontend/` directory to a GitHub repository
2. Connect the repository to [Vercel](https://vercel.com)
3. Set the Root Directory to `frontend`
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_BACKEND_URL` = your Render backend URL
   - `NEXT_PUBLIC_SOCKET_URL` = your Render backend URL
   - `NEXT_PUBLIC_YJS_WS_URL` = `wss://your-backend.onrender.com/yjs`
5. Deploy

### Backend → Render

1. Push the `backend/` directory to a GitHub repository
2. Create a new Web Service on [Render](https://render.com)
3. Connect to the repository, set Root Directory to `backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:sio_app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `GOOGLE_API_KEY` = your Gemini API key
   - `CORS_ORIGINS` = your Vercel frontend URL
7. Deploy

---

## Screenshots

> Screenshots will be added after deployment. The UI features:
> - Dark mode SaaS-style dashboard
> - Rich text editor with formatting toolbar
> - Real-time user cursors with colored labels
> - Side panel with AI semantic search
> - Toast notifications for user events
> - Connection and indexing status indicators

---

## Demo

In development mode, the editor auto-populates with sample content about:
- Artificial Intelligence fundamentals
- Machine Learning algorithms
- Neural Networks and Deep Learning
- Vector Databases and Embeddings
- Real-Time Collaboration technology
- Transformer Architecture

This allows immediate testing of the semantic search feature.

---

## Testing Checklists

### Editor Functionality
- [ ] Bold, italic, underline formatting works
- [ ] Headings (H1, H2, H3) render correctly
- [ ] Bullet and numbered lists work
- [ ] Code blocks render with monospace font
- [ ] Block quotes have left border styling
- [ ] Horizontal rule inserts correctly
- [ ] Undo/redo functions work
- [ ] Placeholder text shows when editor is empty

### Collaboration
- [ ] Open two browser tabs — both connect
- [ ] Type in one tab — text appears in the other
- [ ] User avatars show for all connected users
- [ ] Join notification appears for new users
- [ ] Leave notification appears when user disconnects
- [ ] Typing indicator shows when another user types
- [ ] Colored cursors show with user labels

### Semantic Search
- [ ] Search input accepts text
- [ ] Search returns relevant results
- [ ] Relevance scores display correctly
- [ ] Search result highlighting works
- [ ] Sample queries populate and execute
- [ ] Search history saves and restores
- [ ] Empty state shows when no results
- [ ] Error state shows on API failure
- [ ] Loading skeleton shows during search

### Error Handling
- [ ] Disconnect the backend — error notification appears
- [ ] Reconnect — success notification appears
- [ ] Search without API key — proper error message
- [ ] Rate limit exceeded — 429 response handled

### Deployment
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend starts without errors (`python main.py`)
- [ ] Vercel deployment succeeds
- [ ] Render deployment succeeds
- [ ] WebSocket connections work over HTTPS/WSS

---

## Future Improvements

- [ ] **Authentication** — User accounts with OAuth (Google, GitHub)
- [ ] **Multiple Documents** — Document list, create, delete, rename
- [ ] **Version History** — Document versioning and rollback
- [ ] **Comments** — Inline commenting system
- [ ] **File Upload** — Image and file embedding in documents
- [ ] **AI Summarization** — Auto-generate document summaries
- [ ] **Export** — PDF, Markdown, DOCX export
- [ ] **Permissions** — Role-based access control (viewer, editor, admin)
- [ ] **Mobile App** — React Native companion app
- [ ] **Custom Themes** — Light/dark/custom theme switcher
- [ ] **Analytics** — Document edit analytics and user activity tracking
- [ ] **ChromaDB Cloud** — Scale to cloud-hosted vector database

---

## Troubleshooting

### Backend won't start
- Ensure Python 3.11+ is installed
- Run `pip install -r requirements.txt` in a virtual environment
- Check that `GOOGLE_API_KEY` is set in `.env`

### Frontend build fails
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check for TypeScript errors with `npx tsc --noEmit`

### WebSocket connection fails
- Ensure the backend is running on port 8000
- Check CORS_ORIGINS includes your frontend URL
- For production, use `wss://` instead of `ws://`

### Search returns no results
- Ensure `GOOGLE_API_KEY` is valid
- Check `/health` endpoint — `embedding_service` should be `true`
- Manually trigger indexing via `POST /index`
- Check ChromaDB has chunks: `vector_store.total_chunks > 0`

### ChromaDB errors
- Delete the `chroma_data/` directory and restart the backend
- Ensure the `CHROMA_DB_PATH` directory is writable

---

## License

MIT License — See [LICENSE](LICENSE) for details.
