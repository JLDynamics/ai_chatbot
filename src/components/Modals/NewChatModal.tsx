'use client';

import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/contexts/ToastContext';

interface NewChatModalProps {
  onClose: () => void;
}

export default function NewChatModal({ onClose }: NewChatModalProps) {
  const { createChat } = useChat();
  const { showToast } = useToast();
  const [chatName, setChatName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    const trimmedName = chatName.trim();
    if (!trimmedName) {
      showToast('Please enter a chat name', 'error');
      return;
    }

    // Sanitize name
    const sanitizedName = trimmedName.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!sanitizedName) {
      showToast('Invalid chat name', 'error');
      return;
    }

    setIsCreating(true);
    try {
      await createChat(sanitizedName);
      showToast('Chat created', 'success');
      onClose();
    } catch {
      showToast('Failed to create chat', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-mono text-green-400">New Chat</h2>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chat name..."
            className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-green-100 placeholder-gray-500 font-mono text-sm outline-none focus:border-green-500"
            autoFocus
          />
          <div className="text-xs text-gray-500 mt-2 font-mono">
            Use letters, numbers, underscores, and hyphens only
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded font-mono text-sm bg-gray-700 text-gray-200 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !chatName.trim()}
            className={`px-4 py-2 rounded font-mono text-sm ${
              isCreating || !chatName.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
