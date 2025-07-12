import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { generateId } from '../utils/generateId';

// Types matching the original Next.js app
export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  visibility: 'private' | 'public';
}

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  experimental_attachments?: Attachment[];
}

export interface Attachment {
  url: string;
  name: string;
  contentType: string;
}

interface ChatContextType {
  // Chat management
  chats: Chat[];
  currentChat: Chat | null;
  messages: UIMessage[];
  
  // Chat actions
  createChat: (title?: string) => Chat;
  deleteChat: (chatId: string) => void;
  selectChat: (chatId: string) => void;
  
  // Message actions
  addMessage: (message: Omit<UIMessage, 'id' | 'createdAt'>) => void;
  updateMessage: (messageId: string, content: string) => void;
  clearMessages: () => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // AI model
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  
  // Utilities
  generateChatTitle: (firstMessage: string) => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

  const generateChatTitle = useCallback((firstMessage: string): string => {
    // Simple title generation - take first 50 characters
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;
    return title || 'New Chat';
  }, []);

  const createChat = useCallback((title?: string): Chat => {
    const newChat: Chat = {
      id: generateId(),
      title: title || 'New Chat',
      createdAt: new Date().toISOString(),
      visibility: 'private',
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChat(newChat);
    setMessages([]);
    
    return newChat;
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
  }, [currentChat]);

  const selectChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      // In a real app, we'd load messages from storage
      // For now, we'll start with empty messages
      setMessages([]);
    }
  }, [chats]);

  const addMessage = useCallback((message: Omit<UIMessage, 'id' | 'createdAt'>) => {
    const newMessage: UIMessage = {
      ...message,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-generate title from first user message
    if (message.role === 'user' && currentChat && currentChat.title === 'New Chat') {
      const title = generateChatTitle(message.content);
      const updatedChat = { ...currentChat, title };
      setCurrentChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));
    }
  }, [currentChat, generateChatTitle]);

  const updateMessage = useCallback((messageId: string, content: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, content } : msg
    ));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const contextValue: ChatContextType = {
    chats,
    currentChat,
    messages,
    createChat,
    deleteChat,
    selectChat,
    addMessage,
    updateMessage,
    clearMessages,
    isLoading,
    setIsLoading,
    selectedModel,
    setSelectedModel,
    generateChatTitle,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};