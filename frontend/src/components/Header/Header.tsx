// components/Header/Header.tsx
import React from 'react';
import { MessageSquare, RotateCcw, Database } from 'lucide-react';
import './Header.scss';

interface HeaderProps {
  sessionId: string;
  onResetSession: () => void;
  onPersistSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionId,
  onResetSession,
  onPersistSession
}) => {
  const formatSessionId = (id: string) => {
    if (id.length > 20) {
      return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
    }
    return id;
  };

  return (
    <header className="chat-header">
      <div className="header-content">
        <MessageSquare className="header-icon" />
        <h1>RAG Chat Assistant</h1>
        <div className="header-actions">
          <button 
            onClick={onPersistSession}
            className="persist-btn"
            title="Save session to database"
          >
            <Database size={18} />
          </button>
          <button 
            onClick={onResetSession}
            className="reset-btn"
            title="Reset session"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
      <div className="session-info">
        Session: {formatSessionId(sessionId)}
      </div>
    </header>
  );
};