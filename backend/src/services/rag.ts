import { embedTexts } from './embeddings';
import { search } from './vectorstore';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error('GENAI_API_KEY not set in .env');

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/** Retrieve top-k passages for a query */
export async function retrieveTopK(query: string, k = 5) {
  const emb = (await embedTexts([query]))[0];
  const results = await search(emb, k);
  return results.map(r => ({
    id: String(r.id),
    score: r.score,
    payload: (r.payload as any)
  }));
}

/** Assemble prompt using retrieved passages */
function buildPrompt(query: string, retrieved: any[]) {
  const context = retrieved.map((r, i) => `Source ${i+1} (${r.payload.url || r.payload.title}):\n${r.payload.preview || ''}`).join('\n\n');
  const prompt = `You are an assistant. Use ONLY the provided context to answer. If the answer is not in the context, say "I don't know".\n\nCONTEXT:\n${context}\n\nQUESTION:\n${query}\n\nProvide a concise answer and cite source URLs.`;
  return prompt;
}

/** Call Gemini - placeholder. You should replace with official Gemini Node client or HTTP call. */
export async function callGemini(prompt: string): Promise<string> {
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: prompt
    });

    return response.text || '';
  } catch (err) {
    console.error('Gemini API call failed:', err);
    return 'Error: LLM response failed';
  }
}

/** Full RAG flow */
export async function ragQuery(query: string, topK = 5) {
  const retrieved = await retrieveTopK(query, topK);
  const prompt = buildPrompt(query, retrieved);
  const answer = await callGemini(prompt);
  return { answer, retrieved };
}
