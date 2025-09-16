import { useState, useEffect } from 'react';
import type { Message, ChatResponse, HistoryResponse } from '../types/types';
import { API_BASE } from '../constants/api';

export const useChat = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [sessionId]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history/${sessionId}`);
      if (response.ok) {
        const data: HistoryResponse = await response.json();
        if (data.success && data.history) {
          setMessages(data.history.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const simulateTyping = (text: string, callback: () => void) => {
    setIsStreaming(true);
    setStreamingText('');

    let index = 0;
    const typingSpeed = 30;

    const typeChar = () => {
      if (index < text.length) {
        setStreamingText(prev => prev + text[index]);
        index++;
        setTimeout(typeChar, typingSpeed);
      } else {
        setIsStreaming(false);
        setStreamingText('');
        callback();
      }
    };

    typeChar();
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.text,
          sessionId: sessionId
        })
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();

        if (data.answer) {  // 'answer' field check karo
          simulateTyping(data.answer, () => {
            const botMessage: Message = {
              id: `bot_${Date.now()}`,
              text: data.answer,
              sender: 'bot',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
          });
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/history/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessages([]);
        setStreamingText('');
        setIsStreaming(false);
      }
    } catch (error) {
      console.error('Failed to reset session:', error);
    }
  };

  const persistSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/persist/${sessionId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const successMessage: Message = {
          id: `system_${Date.now()}`,
          text: 'Session has been saved to database successfully!',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isLoading,
    streamingText,
    isStreaming,
    sendMessage,
    resetSession,
    persistSession
  };
};