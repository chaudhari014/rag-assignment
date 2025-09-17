require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const Redis = require("ioredis");
const axios = require("axios");
const { searchPoints } = require("./qdrant");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const redis = new Redis(process.env.REDIS_URL);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const COLLECTION = process.env.QDRANT_COLLECTION || "news_articles";
const SESSION_TTL = 60 * 60 * 24;

// --- Session Helpers ---
async function pushMessage(sessionId, msg) {
  await redis.rpush(`session:${sessionId}`, JSON.stringify(msg));
  await redis.expire(`session:${sessionId}`, SESSION_TTL);
}
async function getHistory(sessionId) {
  const items = await redis.lrange(`session:${sessionId}`, 0, -1);
  return items.map(i => JSON.parse(i));
}

// --- Gemini LLM Call ---
async function callGemini(prompt) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const res = await axios.post(
    `${url}?key=${GEMINI_API_KEY}`,
    { contents: [{ role: "user", parts: [{ text: prompt }] }] }
  );
  return res.data.candidates[0].content.parts[0].text;
}

// --- API Routes ---
app.post("/api/session", async (req, res) => {
  const id = uuidv4();
  res.json({ sessionId: id });
});

app.get("/api/session/:id/history", async (req, res) => {
  const history = await getHistory(req.params.id);
  res.json({ messages: history });
});

app.post("/api/session/:id/reset", async (req, res) => {
  await redis.del(`session:${req.params.id}`);
  res.json({ reset: true });
});

app.post("/api/chat", async (req, res) => {
  const { sessionId, message } = req.body;
  if (!sessionId || !message) return res.status(400).json({ error: "Missing fields" });

  await pushMessage(sessionId, { role: "user", text: message, ts: Date.now() });

  // 1) Embed query
  const embRes = await axios.post(
    "https://api.jina.ai/v1/embeddings",
    { input: message, model: "jina-embeddings-v2-base-en" },
    { headers: { "Authorization": `Bearer ${process.env.JINA_API_KEY}` } }
  );
  const vector = embRes.data.data[0].embedding;

  // 2) Search Qdrant
  const hits = await searchPoints(COLLECTION, vector, 5);
  const context = hits.map(h => h.payload.text).join("\n");

  // 3) Call Gemini
  const prompt = `Context:\n${context}\n\nUser: ${message}\nAnswer based on context above.`;
  const answer = await callGemini(prompt);

  await pushMessage(sessionId, { role: "assistant", text: answer, ts: Date.now() });
  res.json({ answer });
});

// --- Start ---
app.listen(process.env.PORT || 4000, () =>
  console.log("Backend running on port", process.env.PORT || 4000)
);
