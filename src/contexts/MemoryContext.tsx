'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface Memory {
  id: string;
  memory: string;
  created_at: string;
}

interface MemoryContextType {
  memories: Memory[];
  loading: boolean;
  loadMemories: () => Promise<void>;
  addMemory: (text: string) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  clearAllMemories: () => Promise<void>;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>([]);

  const loadMemories = useCallback(async () => {
    try {
      const response = await fetch('/api/memories');
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        setMemories(data.memories || []);
      } else {
        const text = await response.text();
        console.error('API returned HTML:', text.substring(0, 200));
        setMemories([]);
      }
    } catch (error) {
      console.error('Failed to load memories:', error);
      setMemories([]);
    }
  }, []);

  const addMemory = useCallback(async (text: string) => {
    if (!text.trim()) {
      throw new Error('Memory text is required');
    }

    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory: text }),
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
        throw new Error(data.error || 'Failed to add memory');
      }

      await loadMemories();

    } catch (error) {
      console.error('Add memory error:', error);
      throw error;
    }
  }, [loadMemories]);

  const deleteMemory = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/memories?id=${id}`, {
        method: 'DELETE',
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let errorMsg = 'Failed to delete memory';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } else {
          const text = await response.text();
          errorMsg = `API returned HTML error: ${text.substring(0, 100)}...`;
        }
        throw new Error(errorMsg);
      }

      await loadMemories();

    } catch (error) {
      console.error('Delete memory error:', error);
      throw error;
    }
  }, [loadMemories]);

  const clearAllMemories = useCallback(async () => {
    try {
      // Get all memories first
      const response = await fetch('/api/memories');
      const contentType = response.headers.get('content-type') || '';

      let allMemories: Memory[] = [];
      if (contentType.includes('application/json')) {
        const data = await response.json();
        allMemories = data.memories || [];
      } else {
        const text = await response.text();
        throw new Error(`API returned HTML error page: ${text.substring(0, 200)}...`);
      }

      // Delete each one
      for (const memory of allMemories) {
        await fetch(`/api/memories?id=${memory.id}`, { method: 'DELETE' });
      }

      await loadMemories();

    } catch (error) {
      console.error('Clear all memories error:', error);
      throw error;
    }
  }, [loadMemories]);

  return (
    <MemoryContext.Provider
      value={{
        memories,
        loading: false,
        loadMemories,
        addMemory,
        deleteMemory,
        clearAllMemories,
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
}
