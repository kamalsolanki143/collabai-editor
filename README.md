# CollabAI Editor

**Real-Time Collaborative Document Editor with FAISS-Powered AI Search**

CollabAI Editor is a modern collaborative document editing platform built using Next.js, FastAPI, Socket.IO, TipTap, and FAISS. The platform enables rich text editing, document indexing, real-time collaboration infrastructure, and AI-powered semantic document retrieval.

---

## Features

### Rich Text Editor

* Bold, Italic, Underline
* Headings (H1, H2, H3)
* Bullet Lists
* Numbered Lists
* Code Blocks
* Block Quotes
* Horizontal Rules
* Undo / Redo Support

### AI Search (Beta)

* Natural language document search
* FAISS vector similarity search
* Google Gemini embeddings integration
* Search result relevance scoring
* Search history support
* Query suggestions

### Collaboration

* User presence indicators
* Active user tracking
* Join / Leave notifications
* Typing indicators
* Socket.IO based real-time communication

### User Experience

* Responsive UI
* Modern SaaS design
* Dark Mode
* Loading skeletons
* Status indicators
* Toast notifications
* Mobile-friendly layout

---

## Architecture

```text
┌──────────────────────┐
│      Frontend        │
│      Next.js         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     FastAPI API      │
│   Socket.IO Server   │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌──────────┐ ┌──────────┐
│ Gemini   │ │  FAISS   │
│Embeddings│ │ Vector DB│
└──────────┘ └──────────┘
```

---

## Tech Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* TipTap Editor
* Socket.IO Client
* Lucide React

### Backend

* FastAPI
* Python
* Socket.IO
* FAISS
* LangChain
* Google Gemini Embeddings
* Uvicorn

---

## Project Structure

```text
kb/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── main.py
│   ├── embeddings.py
│   ├── vector_store.py
│   ├── worker.py
│   ├── websocket_manager.py
│   ├── config.py
│   └── requirements.txt
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/kamalsolanki143/collabai-editor.git
cd collabai-editor
```

---

## Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Create `.env.local`

```env
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
PORT=8000
FAISS_DB_PATH=./faiss_data
```

Run Backend

```bash
python -m uvicorn main:sio_app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_YJS_WS_URL=ws://localhost:8000/yjs
```

Run Frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

## API Endpoints

### Health Check

```http
GET /health
```

### Search

```http
POST /search
```

Example:

```json
{
  "query": "machine learning",
  "document_id": "default",
  "n_results": 5
}
```

### Index Document

```http
POST /index
```

Example:

```json
{
  "document_id": "default",
  "content": "Document content"
}
```

---

## Environment Variables

### Backend

| Variable       | Description         |
| -------------- | ------------------- |
| GOOGLE_API_KEY | Gemini API Key      |
| PORT           | Backend Port        |
| FAISS_DB_PATH  | Vector storage path |

### Frontend

| Variable                | Description   |
| ----------------------- | ------------- |
| NEXT_PUBLIC_BACKEND_URL | Backend URL   |
| NEXT_PUBLIC_SOCKET_URL  | Socket URL    |
| NEXT_PUBLIC_YJS_WS_URL  | WebSocket URL |

---

## Current Status

| Feature               | Status      |
| --------------------- | ----------- |
| Rich Text Editor      | ✅           |
| Document Indexing     | ✅           |
| FastAPI Backend       | ✅           |
| Socket.IO Events      | ✅           |
| FAISS Integration     | ✅           |
| Search UI             | ✅           |
| AI Search             | Beta        |
| Production Deployment | In Progress |

---

## Future Improvements

* Authentication System
* Multi-document Support
* Comments & Mentions
* Document Version History
* AI Summaries
* PDF Export
* Team Workspaces
* Advanced Search Filters
* Cloud Vector Database
* Analytics Dashboard

---

## Deployment

### Frontend

Deploy on:

* Vercel

### Backend

Deploy on:

* Render

---

## License

MIT License

---

## Author

**Kamal Solanki**

IIT Madras BS in Data Science & Applications

GitHub: https://github.com/kamalsolanki143
