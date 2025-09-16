import { Request, Response } from 'express';
import { articleToPassages, ingestFromRss } from '../ingest';
import { embedTexts } from '../services/embeddings';
import { ensureCollection, upsertPassages } from '../services/vectorstore';


export async function ingestHandler(req: Request, res: Response) {
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
}
