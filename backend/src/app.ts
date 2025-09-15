import express from 'express';
import bodyParser from 'body-parser';
import { ingestFromRss, articleToPassages } from './ingest';
import { embedTexts } from './services/embeddings';
import { ensureCollection, upsertPassages } from './services/vectorstore';
import { ragQuery } from './services/rag';
import { pushMessage, getHistory, clearHistory } from './utils/redisClient';
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";

const app = express();
app.use(bodyParser.json());
dotenv.config();

/** Build collection endpoint (run once) */
app.post('/api/ingest', async (req, res) => {
    try {
        const rss: string[] = req.body.rss || [];
        const maxPer = req.body.maxPerFeed || 30;
        const articles = await ingestFromRss(rss, maxPer);
        const passages = articleToPassages(articles);
        const texts = passages.map(p => p.text);
        const embeddings = await embedTexts(texts);
        await ensureCollection(embeddings[0].length);
        await upsertPassages(passages, embeddings);
        res.json({ message: "Ingest completed", count: passages.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: (err as any).message });
    }
});

/** Chat endpoint - sessionId optional */
app.post('/api/chat', async (req, res) => {
    try {
        const sessionId = req.body.sessionId || uuidv4();
        const query = req.body.query;
        if (!query) return res.status(400).json({ error: 'query required' });

        await pushMessage(sessionId, 'user', query);
        const { answer, retrieved } = await ragQuery(query, 5);
        await pushMessage(sessionId, 'assistant', answer);
        res.json({ sessionId, answer, retrieved });
    } catch (err) {
        console.error('chat error', err);
        res.status(500).json({ error: (err as any).message });
    }
});

app.get('/api/history/:sessionId', async (req, res) => {
    const h = await getHistory(req.params.sessionId);
    res.json({ history: h });
});

app.delete('/api/history/:sessionId', async (req, res) => {
    await clearHistory(req.params.sessionId);
    res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('RAG backend listening on', PORT);
});
