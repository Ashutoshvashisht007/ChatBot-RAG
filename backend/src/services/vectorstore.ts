import { QdrantClient } from '@qdrant/qdrant-js';
import { Passage } from '../utils/types';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const COLLECTION = process.env.QDRANT_COLLECTION || 'news_rag';

const client = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY || undefined
});

/** Ensure collection exists (recreate in dev) */
export async function ensureCollection(vectorSize: number) {
  try {
    await client.recreateCollection(COLLECTION, {
      vectors: { size: vectorSize, distance: 'Cosine' }
    });
    console.log(`Qdrant collection ${COLLECTION} ready (size=${vectorSize})`);
  } catch (err) {
    console.warn('createCollection failed', err);
  }
}

/** Upsert passages: expects embeddings aligned with passages (same order) */
export async function upsertPassages(passages: Passage[], embeddings: number[][]) {
  const points = passages.map((p, i) => ({
    id: p.id,
    payload: p.payload,
    vector: embeddings[i]
  }));
  
  await client.upsert(COLLECTION, {
    wait: true,
    points
  });
  console.log(`Upserted ${points.length} points into Qdrant`);
}

/** Search top-k; returns array of hits with payload & score */
export async function search(queryEmbedding: number[], topK = 5) {
  const result = await client.search(COLLECTION, {
    vector: queryEmbedding,
    limit: topK
  });
  
  return result; 
}