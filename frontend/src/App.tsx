import React, { useState } from 'react';
import { Header } from './components/Header/Header';
import { MessageList } from './components/MessageList/MessageList';
import { ChatInput } from './components/ChatInput/ChatInput';
import { useChat } from './hooks/useChat';
import { v4 as uuidv4 } from 'uuid';
import './App.scss';

const App: React.FC = () => {
  const [sessionId] = useState(uuidv4());

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

  const isDisabled = isLoading || isStreaming;

  return (
    <div className="chat-app">
      <Header
        sessionId={sessionId}
        onResetSession={resetSession}
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
        />
      </div>
    </div>
  );
};

export default App;