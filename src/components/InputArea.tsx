'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/contexts/ToastContext';

export default function InputArea() {
  const { sendMessage, loading } = useChat();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_CHARS = 2000;

  useEffect(() => {
    // Auto-focus on mount
    textareaRef.current?.focus();
  }, []);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > MAX_CHARS) {
      showToast(`Message too long (${value.length}/${MAX_CHARS})`, 'error');
      return;
    }
    setText(value);
    adjustHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    if (trimmedText.length > MAX_CHARS) {
      showToast('Message exceeds character limit', 'error');
      return;
    }

    try {
      setText('');
      adjustHeight();
      await sendMessage(trimmedText);
      // Refocus textarea after sending for continuous typing
      setTimeout(() => textareaRef.current?.focus(), 0);
    } catch {
      showToast('Failed to send message', 'error');
    }
  };

  const isDisabled = loading || !text.trim();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex gap-2 items-end">
        <div className="flex-1 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden focus-within:border-green-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full bg-transparent text-green-100 placeholder-gray-500 resize-none outline-none p-3 font-mono text-sm"
            rows={1}
            disabled={loading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`px-6 py-3 rounded-lg font-mono text-sm font-medium transition-all ${
            isDisabled
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
          }`}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
      <div className="text-right text-xs text-gray-500 mt-1 font-mono">
        {text.length}/{MAX_CHARS}
      </div>
    </div>
  );
}
