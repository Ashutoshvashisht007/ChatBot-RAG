// services/transcript.service.ts
import pool, { query } from './db';

export async function persistTranscript(sessionId: string, history: any[]) {
  for (const item of history) {
    await pool.query(
      `INSERT INTO transcripts(session_id, role, transcript, ts) VALUES($1, $2, $3, $4)`,
      [sessionId, item.role, item.text, item.ts]
    );
  }
}

export async function getTranscriptsForSession(sessionId: string) {
  const res = await query('SELECT * FROM transcripts WHERE session_id = $1 ORDER BY created_at DESC', [sessionId]);
  return res.rows;
}
