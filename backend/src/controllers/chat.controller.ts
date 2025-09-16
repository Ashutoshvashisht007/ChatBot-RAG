// controllers/chat.controller.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pushMessage, getHistory, clearHistory } from '../utils/redisClient';
import { ragQuery } from '../services/rag'; // your existing RAG function
import { persistTranscript } from '../services/transcript.service';

/** POST /api/chat { sessionId?, query } */
export async function chatHandler(req: Request, res: Response) {
  try {
    const sessionId = req.body.sessionId || uuidv4();
    const queryText = req.body.query;
    if (!queryText) return res.status(400).json({ error: 'query required' });

    await pushMessage(sessionId, 'user', queryText);
    const { answer, retrieved } = await ragQuery(queryText, 5);
    await pushMessage(sessionId, 'assistant', answer);

    res.json({ sessionId, answer, retrieved });
  } catch (err: any) {
    console.error('chat error', err);
    res.status(500).json({ error: err.message || 'internal' });
  }
}

/** GET /api/history/:sessionId */
export async function historyHandler(req: Request, res: Response) {
  const sessionId = req.params.sessionId;
  const h = await getHistory(sessionId);
  res.json({ sessionId, history: h });
}

/** DELETE /api/history/:sessionId */
export async function clearHandler(req: Request, res: Response) {
  const sessionId = req.params.sessionId;
  await clearHistory(sessionId);
  res.json({ ok: true });
}

/** POST /api/persist/:sessionId  -> persist to Postgres */
export async function persistHandler(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId;
    const history = await getHistory(sessionId);
    if (!history || history.length === 0) {
      return res.status(400).json({ ok: false, error: 'no history to persist' });
    }
    const row = await persistTranscript(sessionId, history);
    res.json({ ok: true, persisted: row });
  } catch (err: any) {
    console.error('persist error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
