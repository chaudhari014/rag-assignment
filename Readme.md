# RAG Chatbot Assignment  

This project implements a **Retrieval-Augmented Generation (RAG) based chatbot** using Node.js, React, and Gemini API.  
It integrates **Qdrant** for vector search, **Redis** for caching & session history, and **Jina embeddings API** for text embeddings.  

---

## 🚀 Tech Stack  

### Backend  
- Node.js + Express.js  
- Jina API → Text embeddings  
- Qdrant (Cloud / Docker) → Vector Database  
- Redis (RedisLabs / Docker) → Session caching & chat history  
- Gemini API → LLM responses  

### Frontend  
- React.js (Vite)  
- SCSS for styling  

### Deployment  
- Backend → Render  
- Frontend → Vercel  

### Local Setup  
- Docker Compose (Redis + Qdrant)  

---

## 📂 Project Structure  

```
rag-assignment-main/
│── backend/        # Node.js backend
│   ├── server.js   # Express server entry
│   ├── ingest.js   # Script to ingest documents into Qdrant
│   ├── qdrant.js   # Qdrant client utilities
│   └── package.json
│
│── frontend/       # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── styles.scss
│   │   └── ...
│   └── package.json
│
│── docker-compose.yaml   # Redis + Qdrant setup
│── Readme.md             # This file
```

---

## ⚙️ Setup Instructions  

### 1. Clone the repository  
```bash
git clone https://github.com/chaudhari014/rag-assignment.git
```

### 2. Start Redis & Qdrant (Docker)  
```bash
docker-compose up -d
```

This will spin up Redis and Qdrant locally within a minute.  

### 3. Backend Setup  
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:  
```
PORT=4000
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
JINA_API_KEY=your_jina_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Run backend:  
```bash
npm run dev
```
### 4. Ingest Articles into Qdrant Database  
To add articles/documents into the Qdrant vector database, run:  

```bash
npm run ingest
```

### 5. Frontend Setup  
```bash
cd frontend
npm install
npm run dev
```

---

## 🎥 Demo  

- [Demo Video Link](https://drive.google.com/file/d/1jTgDPtzQY6u3Fp2POhJ4eXVLSO7aTnpR/view?usp=sharing)  
- Shows:  
  - Starting the frontend  
  - Sending queries → Gemini responses  
  - Viewing & resetting chat history  

---

## 📖 Code Walkthrough  

- **Embeddings**: Generated via **Jina API** → stored in **Qdrant**  
- **Retrieval**: Qdrant provides semantic search results  
- **Caching & History**: Redis stores session context and past chat logs  
- **LLM Responses**: Gemini API generates final answers  
- **Frontend-Backend Flow**:  
  - Frontend sends queries → Backend retrieves context + calls Gemini → Response returned & displayed  
- **Design Decisions**:  
  - Qdrant chosen for efficient vector search  
  - Redis used for fast session storage  
  - Dockerized services for easy setup  
- **Future Improvements**:  
  - Add user authentication  
  - Support multi-turn RAG  
  - Enhance UI/UX  

---

## 🌐 Live Deployment  

- **Frontend (Vercel):** [Link]( https://rag-assignment.vercel.app/)  
- **Backend (Render):** [Link](https://rag-assignment-0yko.onrender.com)  

---
