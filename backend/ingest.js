// ingest.js
require("dotenv").config();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { ensureCollection, insertPoints } = require("./qdrant");
const xml2js = require("xml2js");

const COLLECTION = process.env.QDRANT_COLLECTION || "news_articles";

// Get embeddings via Jina AI
async function embedText(text) {
  const res = await axios.post(
    "https://api.jina.ai/v1/embeddings",
    { input: text, model: "jina-embeddings-v2-base-en" },
    { headers: { "Authorization": `Bearer ${process.env.JINA_API_KEY}` } }
  );
  return res.data.data[0].embedding;
}

// Fetch RSS headlines
async function fetchArticles() {
  const rss = "http://feeds.bbci.co.uk/news/world/rss.xml";
  const res = await axios.get(rss);
  const parsed = await xml2js.parseStringPromise(res.data);

  return parsed.rss.channel[0].item.slice(0, 50).map(item => ({
    title: item.title[0],
    link: item.link[0],
    text: item.title[0] + " " + (item.description ? item.description[0] : "")
  }));
}

async function main() {
  await ensureCollection(COLLECTION, 768);
  const articles = await fetchArticles();
  console.log("Fetched", articles.length, "articles");

  for (let art of articles) {
    const vec = await embedText(art.text);
    await insertPoints(COLLECTION, [{
      id: uuidv4(),
      vector: vec,
      payload: art
    }]);
    console.log("Inserted:", art.title);
  }
}

main();
