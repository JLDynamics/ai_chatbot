'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface Chat {
  name: string;
  message_count: number;
  last_message: string | null;
  updated_at: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContextType {
  currentChat: string | null;
  chats: Chat[];
  messages: Message[];
  loading: boolean;
  sendMessage: (message: string) => Promise<void>;
  createChat: (name: string) => Promise<void>;
  deleteChat: (name: string) => Promise<void>;
  switchChat: (name: string) => Promise<void>;
  loadChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch('/api/chats');
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        setChats(data.chats || []);
      } else {
        const text = await response.text();
        console.error('API returned HTML:', text.substring(0, 200));
        setChats([]);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      setChats([]);
    }
  }, []);

  const switchChat = useCallback(async (name: string) => {
    setCurrentChat(name);
    try {
      const response = await fetch(`/api/chats/${name}/messages`);
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        const text = await response.text();
        console.error('API returned HTML:', text.substring(0, 200));
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!currentChat) {
      throw new Error('No chat selected');
    }

    setLoading(true);

    try {
      // Add user message immediately
      const userMessage: Message = { role: 'user', content: message };
      setMessages(prev => [...prev, userMessage]);

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chat_name: currentChat }),
      });

      // Check content type
      const contentType = response.headers.get('content-type') || '';

      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, it's likely an HTML error page
        const text = await response.text();
        throw new Error(`API returned HTML error page: ${text.substring(0, 200)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant response
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);

      // Refresh chat list
      await loadChats();

    } catch (error) {
      console.error('Send message error:', error);
      // Add error message
      const errorMessage: Message = { role: 'assistant', content: `Error: ${String(error)}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [currentChat, loadChats]);

  const createChat = useCallback(async (name: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const contentType = response.headers.get('content-type') || '';

      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`API returned HTML error page: ${text.substring(0, 200)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create chat');
      }

      await loadChats();
      await switchChat(data.chat_name);

    } catch (error) {
      console.error('Create chat error:', error);
      throw error;
    }
  }, [loadChats, switchChat]);

  const deleteChat = useCallback(async (name: string) => {
    try {
      const response = await fetch(`/api/chats?name=${name}`, {
        method: 'DELETE',
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let errorMsg = 'Failed to delete chat';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } else {
          const text = await response.text();
          errorMsg = `API returned HTML error: ${text.substring(0, 100)}...`;
        }
        throw new Error(errorMsg);
      }

      await loadChats();

      // If we deleted the current chat, switch to another or clear
      if (currentChat === name) {
        if (chats.length > 1) {
          const otherChat = chats.find(c => c.name !== name);
          if (otherChat) {
            await switchChat(otherChat.name);
          } else {
            setCurrentChat(null);
            setMessages([]);
          }
        } else {
          setCurrentChat(null);
          setMessages([]);
        }
      }

    } catch (error) {
      console.error('Delete chat error:', error);
      throw error;
    }
  }, [currentChat, chats, loadChats, switchChat]);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        chats,
        messages,
        loading,
        sendMessage,
        createChat,
        deleteChat,
        switchChat,
        loadChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
