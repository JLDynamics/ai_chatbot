'use client';

import { useState, useEffect } from 'react';
import { useMemory } from '@/contexts/MemoryContext';
import { useToast } from '@/contexts/ToastContext';

interface MemoryViewerProps {
  onClose: () => void;
}

export default function MemoryViewer({ onClose }: MemoryViewerProps) {
  const { memories, addMemory, deleteMemory, clearAllMemories, loadMemories } = useMemory();
  const { showToast } = useToast();
  const [newMemory, setNewMemory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Load memories when the viewer opens
  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleAdd = async () => {
    if (!newMemory.trim()) {
      showToast('Please enter memory text', 'error');
      return;
    }

    setIsAdding(true);
    try {
      await addMemory(newMemory);
      setNewMemory('');
      showToast('Memory added', 'success');
      // Give mem0 time to index the memory before reloading
      setTimeout(() => {
        loadMemories();
      }, 500);
    } catch {
      showToast('Failed to add memory', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory?')) return;

    try {
      await deleteMemory(id);
      showToast('Memory deleted', 'success');
      // Give mem0 time to process the deletion before reloading
      setTimeout(() => {
        loadMemories();
      }, 300);
    } catch {
      showToast('Failed to delete memory', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL memories? This cannot be undone!')) return;
    if (!confirm('Are you absolutely sure?')) return;

    setIsClearing(true);
    try {
      await clearAllMemories();
      showToast('All memories cleared', 'success');
    } catch {
      showToast('Failed to clear memories', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-mono text-green-400">🧠 Memory Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-2">
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="Add a new memory..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded p-2 text-green-100 placeholder-gray-500 font-mono text-sm resize-none"
              rows={2}
            />
            <button
              onClick={handleAdd}
              disabled={isAdding || !newMemory.trim()}
              className={`px-4 py-2 rounded font-mono text-sm ${
                isAdding || !newMemory.trim()
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {memories.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No memories yet</div>
          ) : (
            <div className="space-y-3">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-gray-800 border border-gray-700 rounded p-3 group"
                >
                  <div className="text-sm text-green-100 font-mono mb-2">
                    {memory.memory}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500 font-mono">
                      {new Date(memory.created_at).toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleDelete(memory.id)}
                      className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={handleClearAll}
            disabled={isClearing || memories.length === 0}
            className={`px-4 py-2 rounded font-mono text-sm ${
              isClearing || memories.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-red-700 text-white hover:bg-red-800'
            }`}
          >
            {isClearing ? 'Clearing...' : 'Clear All'}
          </button>
        </div>
      </div>
    </div>
  );
}
