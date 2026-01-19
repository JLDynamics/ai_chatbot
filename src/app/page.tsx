'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useMemory } from '@/contexts/MemoryContext';
import { useToast } from '@/contexts/ToastContext';
import Sidebar from '@/components/Sidebar';
import Chat from '@/components/Chat';
import MemoryViewer from '@/components/MemoryViewer';
import NewChatModal from '@/components/Modals/NewChatModal';

export default function Home() {
  const { currentChat, loadChats, messages } = useChat();
  const { loadMemories } = useMemory();
  const { showToast } = useToast();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMemoryViewer, setShowMemoryViewer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousMessageCount = useRef(0);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadChats(), loadMemories()]);
      } catch {
        showToast('Failed to load data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [loadChats, loadMemories, showToast]);

  // Refresh memories after new messages are added (memories are auto-saved during chat)
  useEffect(() => {
    if (previousMessageCount.current > 0 && messages.length > previousMessageCount.current) {
      // New messages were added, refresh memories in the background
      loadMemories().catch(() => {
        // Silently fail - don't show toast for background refresh
      });
    }
    previousMessageCount.current = messages.length;
  }, [messages.length, loadMemories]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-green-400 font-mono">
        <div className="text-center">
          <div className="text-2xl mb-4">Initializing...</div>
          <div className="animate-pulse">Loading components</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-green-400 font-mono">
      <Sidebar
        currentChat={currentChat}
        onSelectChat={(name) => {
          // Context handles the switch
        }}
        onNewChat={() => setShowNewChatModal(true)}
        onShowMemories={() => setShowMemoryViewer(true)}
      />

      <main className="flex-1 flex flex-col">
        <Chat />
      </main>

      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}

      {showMemoryViewer && (
        <MemoryViewer onClose={() => setShowMemoryViewer(false)} />
      )}
    </div>
  );
}
