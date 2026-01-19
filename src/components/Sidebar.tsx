'use client';

import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/contexts/ToastContext';

interface SidebarProps {
  currentChat: string | null;
  onSelectChat: (name: string) => void;
  onNewChat: () => void;
  onShowMemories: () => void;
}

export default function Sidebar({ currentChat, onSelectChat, onNewChat, onShowMemories }: SidebarProps) {
  const { chats, deleteChat, switchChat } = useChat();
  const { showToast } = useToast();

  const handleDelete = async (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete chat "${name}"?`)) return;

    try {
      await deleteChat(name);
      showToast('Chat deleted', 'success');
    } catch {
      showToast('Failed to delete chat', 'error');
    }
  };

  const handleSelect = async (name: string) => {
    try {
      await switchChat(name);
      onSelectChat(name);
    } catch {
      showToast('Failed to switch chat', 'error');
    }
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-mono py-2 px-4 rounded transition-colors"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            No chats yet
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map(chat => (
              <div
                key={chat.name}
                onClick={() => handleSelect(chat.name)}
                className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  currentChat === chat.name
                    ? 'bg-gray-700 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm truncate">{chat.name}</div>
                  {chat.last_message && (
                    <div className="text-xs text-gray-500 truncate">
                      {chat.last_message.substring(0, 30)}...
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(e, chat.name)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 px-2 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onShowMemories}
          className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-mono py-2 px-4 rounded transition-colors text-sm"
        >
          🧠 Memories
        </button>
      </div>
    </aside>
  );
}
