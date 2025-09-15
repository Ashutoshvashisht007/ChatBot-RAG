import Parser from 'rss-parser';
import fetch, { Response } from 'node-fetch';
import * as cheerio from 'cheerio';
import { Article, Passage } from './utils/types';
import { v4 as uuidv4 } from 'uuid';

const parser = new Parser();

/** Fetch RSS entries and return Article[] */
export async function ingestFromRss(rssUrls: string[], maxPerFeed = 30): Promise<Article[]> {
    const out: Article[] = [];
    for (const feed of rssUrls) {
        const parsed = await parser.parseURL(feed);
        const items = parsed.items.slice(0, maxPerFeed);
        for (const it of items) {
            try {
                const url = it.link || it.guid || '';
                if (!url) continue;
                const text = await fetchArticleText(url) || (it.contentSnippet || it.content || it.summary || '');
                if (!text || text.length < 100) continue;
                out.push({
                    title: (it.title || '').slice(0, 300),
                    url,
                    published: it.pubDate || it.isoDate || '',
                    text
                });
            } catch (err) {
                console.warn('RSS item failed', err);
            }
        }
    }
    console.log(`Ingested ${out.length} articles from RSS`);
    return out;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, { signal: controller.signal });
        return res;
    } finally {
        clearTimeout(timeout);
    }
}

/** Very simple HTML fetch + text extraction using cheerio */
export async function fetchArticleText(url: string): Promise<string | null> {
    try {
        const res = await fetchWithTimeout(url, 10000);
        if (!res.ok) return null;
        const html = await res.text();
        const $ = cheerio.load(html);
        $('script,style,nav,aside,footer,header').remove();
        const article = $('article').text() || $('main').text() || $('body').text();
        const cleaned = article.replace(/\s+/g, ' ').trim();
        if (cleaned.length < 50) {
            // fallback to meta description
            const desc = $('meta[name="description"]').attr('content') || '';
            return desc.replace(/\s+/g, ' ').trim();
        }
        return cleaned;
    } catch (err) {
        console.warn('fetchArticleText error for', url, err);
        return null;
    }
}

/** chunk text into overlapping passages (char-based) */
export function chunkText(text: string, chunkSize = 800, overlap = 200): string[] {
    if (text.length <= chunkSize) return [text];
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        if (end === text.length) break;
        start = Math.max(0, end - overlap);
    }
    return chunks;
}

/** produce Passage[] from Article[] */
export function articleToPassages(articles: Article[], chunkSize = 800, overlap = 200): Passage[] {
  const pass: Passage[] = [];
  for (const a of articles) {
    const chunks = chunkText(a.text, chunkSize, overlap);
    chunks.forEach((ch, idx) => {
      const id = uuidv4();  
      pass.push({
        id,
        text: ch,
        payload: {
          title: a.title,
          url: a.url,
          published: a.published,
          chunkIndex: idx,
          preview: ch.slice(0, 300)
        }
      });
    });
  }
  return pass;
}
