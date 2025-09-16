import React from 'react';
import { Loader2 } from 'lucide-react';
import type { Message as MessageType } from '../../types/types';
import './Message.scss';

interface MessageProps {
  message: MessageType;
}

interface StreamingMessageProps {
  text: string;
}

interface LoadingMessageProps {}

export const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
};

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ text }) => {
  return (
    <div className="message bot streaming">
      <div className="message-content">
        <div className="message-text">
          {text}
          <span className="cursor">|</span>
        </div>
      </div>
    </div>
  );
};

export const LoadingMessage: React.FC<LoadingMessageProps> = () => {
  return (
    <div className="message bot">
      <div className="message-content">
        <div className="message-text typing-indicator">
          <Loader2 className="spinner" size={16} />
          Thinking...
        </div>
      </div>
    </div>
  );
};