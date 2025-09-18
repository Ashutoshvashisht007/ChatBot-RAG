interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatResponse {
  sessionId: string;
  answer: string;
  retrieved?: any;
}

interface HistoryResponse {
  sessionId: string;
  history: {
    role: 'user' | 'assistant' | 'system';
    text: string;
    ts: number;
  }[];
}

export type {Message, ChatResponse, HistoryResponse}

  // try {
  //   const sessionId = req.params.sessionId;
  //   const history = await getHistory(sessionId);
  //   if (!history || history.length === 0) {
  //     return res.status(400).json({ ok: false, error: 'no history to persist' });
  //   }
  //   const row = await persistTranscript(sessionId, history);
  //   res.json({ ok: true, persisted: row });
  // } catch (err: any) {
  //   console.error('persist error', err);
  //   res.status(500).json({ ok: false, error: err.message });
  // }