import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../services/api';
import { useAuth } from './AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  chatId: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  userId: string;
  visibility: 'public' | 'private';
}

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  setCurrentChat: (chat: Chat | null) => void;
  createChat: (title: string) => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string, model?: string) => Promise<void>;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Socket connection management
  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io('http://localhost:3001', {
        auth: { token },
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to chat server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from chat server');
      });

      newSocket.on('chat-delta', (data) => {
        if (data.chatId === currentChat?.id) {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + data.delta }
              ];
            }
            return prev;
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  // Join/leave chat rooms when current chat changes
  useEffect(() => {
    if (socket && currentChat) {
      socket.emit('join-chat', currentChat.id);
      return () => {
        socket.emit('leave-chat', currentChat.id);
      };
    }
  }, [socket, currentChat]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createChat = async (title: string): Promise<Chat> => {
    try {
      const response = await apiClient.post('/chats', { title });
      const newChat = response.data;
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await apiClient.delete(`/chats/${chatId}`);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/ai/chat/${chatId}/history`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, model = 'gpt-4o-mini') => {
    if (!currentChat) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      chatId: currentChat.id,
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    try {
      const messagesForAPI = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Create assistant message placeholder
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        chatId: currentChat.id,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Send to AI API
      const response = await apiClient.post('/ai/chat', {
        messages: messagesForAPI,
        model,
        chatId: currentChat.id,
      });

      // The streaming response will be handled by the socket listener
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the assistant message placeholder on error
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const value: ChatContextType = {
    chats,
    currentChat,
    messages,
    isLoading,
    isConnected,
    setCurrentChat,
    createChat,
    deleteChat,
    sendMessage,
    loadChats,
    loadMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};