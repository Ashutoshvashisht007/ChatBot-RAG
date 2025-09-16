import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageComponent, StreamingMessage, LoadingMessage } from '../Message/Message';
import type { Message } from '../../types/types';
import './MessageList.scss';

interface MessageListProps {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  streamingText,
  isStreaming,
  isLoading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  return (
    <div className="messages-container">
      {messages.length === 0 && !isStreaming && (
        <div className="empty-state">
          <MessageSquare size={48} />
          <h3>Welcome to RAG Chat!</h3>
          <p>Ask me anything about the ingested news articles.</p>
        </div>
      )}
      
      {messages.map((message) => (
        <MessageComponent key={message.id} message={message} />
      ))}
      
      {isStreaming && <StreamingMessage text={streamingText} />}
      
      {isLoading && !isStreaming && <LoadingMessage />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};