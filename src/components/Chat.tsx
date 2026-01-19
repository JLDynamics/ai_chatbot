'use client';

import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/contexts/ToastContext';
import InputArea from './InputArea';
import { useRef, useEffect } from 'react';

export default function Chat() {
  const { currentChat, messages, loading } = useChat();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Also scroll on mount
  useEffect(() => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentChat]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-green-400">
        <div className="text-center">
          <div className="text-2xl mb-4">🦝 AI Chatbot</div>
          <div className="text-gray-500">Select or create a chat to start</div>
          <div className="text-gray-600 text-sm mt-2">Press Cmd+K for new chat</div>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-xl mb-2">No messages yet</div>
              <div className="text-sm">Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-green-900 text-green-100'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <div className="text-xs opacity-60 mb-1 font-mono">
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {msg.content}
                </div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    className="mt-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-lg">
              <div className="text-xs opacity-60 mb-1 font-mono">AI</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        {/* Invisible element for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4 bg-gray-900">
        <InputArea />
      </div>
    </div>
  );
}
