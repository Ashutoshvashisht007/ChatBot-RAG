// App.tsx
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header/Header';
import { MessageList } from './components/MessageList/MessageList';
import { ChatInput } from './components/ChatInput/ChatInput';
import { useChat } from './hooks/useChat';
import { v4 as uuidv4 } from 'uuid';
import './App.scss';

const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>("");
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Load or create sessionId on mount
  useEffect(() => {
    const initializeSession = () => {
      try {
        let sid = localStorage.getItem("sessionId");
        if (!sid) {
          sid = uuidv4();
          localStorage.setItem("sessionId", sid);
        }
        setSessionId(sid);
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        // Fallback to generating session ID without localStorage
        setSessionId(uuidv4());
      } finally {
        setIsSessionLoading(false);
      }
    };

    initializeSession();
  }, []);

  const {
    messages,
    inputText,
    setInputText,
    isLoading,
    streamingText,
    isStreaming,
    sendMessage,
    resetSession,
    persistSession
  } = useChat(sessionId);

  const isDisabled = isLoading || isStreaming || isSessionLoading;

  const handleReset = async () => {
    try {
      // Clear current session from backend
      await resetSession();
      
      // Clear localStorage and create new session
      localStorage.removeItem("sessionId");
      const newId = uuidv4();
      localStorage.setItem("sessionId", newId);
      setSessionId(newId);
    } catch (error) {
      console.error('Error resetting session:', error);
      // Even if localStorage fails, create new session
      const newId = uuidv4();
      setSessionId(newId);
    }
  };

  // Show loading screen while session is being initialized
  if (isSessionLoading) {
    return (
      <div className="chat-app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <Header
        sessionId={sessionId}
        onResetSession={handleReset}
        onPersistSession={persistSession}
      />

      <div className="chat-container">
        <MessageList
          messages={messages}
          streamingText={streamingText}
          isStreaming={isStreaming}
          isLoading={isLoading}
        />

        <ChatInput
          value={inputText}
          onChange={setInputText}
          onSend={sendMessage}
          disabled={isDisabled}
          placeholder={isSessionLoading ? "Loading..." : "Ask me about the news articles..."}
        />
      </div>
    </div>
  );
};

export default App;