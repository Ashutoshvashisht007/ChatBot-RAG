import axios from 'axios';
import https from 'https';

const JINA_API_URL = process.env.JINA_API_URL || '';
const JINA_API_KEY = process.env.JINA_API_KEY || '';

if (!JINA_API_URL) {
  console.warn('JINA_API_URL not set - embeddings will fail until you set env variable');
}

/** embed a list of texts using Jina Embeddings API */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!JINA_API_URL) throw new Error('JINA_API_URL not configured');
  const payload = {
    model: 'jina-embeddings-v3',
    input: texts
  };
  const headers: any = { 'Content-Type': 'application/json' };
  if (JINA_API_KEY) headers['Authorization'] = `Bearer ${JINA_API_KEY}`;

  const agent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true
  });

  const resp = await axios.post(JINA_API_URL, payload, {
    headers,
    timeout: 120000,
    httpsAgent: agent,
  });
  if (resp.data && resp.data.embeddings) {
    return resp.data.embeddings as number[][];
  }
  if (resp.data && resp.data.data && Array.isArray(resp.data.data)) {
    return resp.data.data.map((d: any) => d.embedding || d);
  }
  throw new Error('Unexpected Jina response shape - please inspect resp.data');
}
