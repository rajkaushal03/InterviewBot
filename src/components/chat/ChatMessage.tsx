"use client";

import { format } from 'date-fns';
import type React from 'react';

type ChatMessageProps = {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

export default function ChatMessage({ sender, text, timestamp }: ChatMessageProps) {
  const isUser = sender === 'user';

  // Sanitize timestamp if it's invalid
  const displayTimestamp = timestamp && !isNaN(timestamp.valueOf()) ? format(timestamp, 'p') : '...';


  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-xl xl:max-w-2xl px-4 py-3 rounded-2xl shadow-md transition-all duration-300 ease-in-out ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-lg'
            : 'bg-card text-card-foreground rounded-bl-lg border'
        }`}
        role="log"
        aria-live={isUser ? "off" : "polite"}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-primary-foreground/80 text-right' : 'text-muted-foreground text-left'}`}>
          {displayTimestamp}
        </p>
      </div>
    </div>
  );
}
