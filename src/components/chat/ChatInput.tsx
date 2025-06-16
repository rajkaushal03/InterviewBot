"use client";

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import type React from 'react';

type ChatInputProps = {
  userInput: string;
  setUserInput: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
};

export default function ChatInput({ userInput, setUserInput, onSendMessage, isLoading }: ChatInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && userInput.trim()) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <Textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message to Swayam..."
        className="flex-1 resize-none min-h-[44px] max-h-[150px] rounded-xl shadow-sm focus-visible:ring-primary py-2.5"
        rows={1}
        disabled={isLoading}
        aria-label="Chat input field"
      />
      <Button
        onClick={onSendMessage}
        disabled={isLoading || !userInput.trim()}
        className="h-[44px] rounded-xl shadow-sm"
        aria-label="Send message"
        type="submit"
      >
        <SendHorizonal size={20} />
      </Button>
    </div>
  );
}
