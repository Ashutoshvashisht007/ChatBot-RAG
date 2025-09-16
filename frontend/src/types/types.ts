interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatResponse {
  sessionId: string;
  answer: string;
}

interface HistoryResponse {
  history: Message[];
  success: boolean;
}

export type {Message, ChatResponse, HistoryResponse}