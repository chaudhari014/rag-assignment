// qdrant.js
const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

async function ensureCollection(name, dim = 768) {
  try {
    await client.getCollection(name);
    console.log(`Collection "${name}" already exists`);
  } catch (err) {
    console.log(`Creating collection "${name}"...`);
    await client.createCollection(name, {
      vectors: { size: dim, distance: "Cosine" },
    });
  }
}

async function insertPoints(name, points) {
  return client.upsert(name, { points });
}

async function searchPoints(name, vector, limit = 5) {
  return client.search(name, {
    vector,
    limit,
    with_payload: true,
  });
}

module.exports = { client, ensureCollection, insertPoints, searchPoints };
