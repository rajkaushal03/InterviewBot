
"use client";

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Mic, MicOff } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';

type ChatInputProps = {
  userInput: string;
  setUserInput: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  isSpeechRecognitionSupported: boolean;
};

export default function ChatInput({ 
  userInput, 
  setUserInput, 
  onSendMessage, 
  isLoading,
  isListening,
  onToggleListening,
  isSpeechRecognitionSupported 
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  }, [userInput]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && !isListening && userInput.trim()) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <Textarea
        ref={textareaRef}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : "Type your message to Swayam..."}
        className="flex-1 resize-none min-h-[44px] max-h-[150px] rounded-xl shadow-sm focus-visible:ring-primary py-2.5"
        rows={1}
        disabled={isLoading || isListening}
        aria-label="Chat input field"
      />
      {isSpeechRecognitionSupported && (
        <Button
          type="button"
          onClick={onToggleListening}
          disabled={isLoading}
          className={`h-[44px] w-[44px] rounded-xl shadow-sm ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          variant="outline"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </Button>
      )}
      <Button
        onClick={onSendMessage}
        disabled={isLoading || isListening || !userInput.trim()}
        className="h-[44px] rounded-xl shadow-sm"
        aria-label="Send message"
        type="submit"
      >
        <SendHorizonal size={20} />
      </Button>
    </div>
  );
}
