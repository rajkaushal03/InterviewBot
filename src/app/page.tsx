
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import LoadingIndicator from '@/components/chat/LoadingIndicator';
import { generateSwayamResponse, type GenerateSwayamResponseInput } from '@/ai/flows/generate-response';
import { Bot, Settings, MessageSquareDashed, Volume2 } from 'lucide-react';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

const voiceToneOptions = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'sincere', label: 'Sincere' },
  { value: 'thoughtful', label: 'Thoughtful' },
  { value: 'reflective', label: 'Reflective' },
];

export default function SwayamChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [voiceTone, setVoiceTone] = useState(voiceToneOptions[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakText = useCallback((text: string) => {
    if (!isTTSEnabled) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      // You could add further configuration for utterance here (e.g., voice, rate, pitch)
      // utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "TTS Not Supported",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      });
    }
  }, [isTTSEnabled, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: "Welcome to my interview! I'm Swayam, or at least a digital version of me. Feel free to ask your questions. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
    
    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel speech on component unmount
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech from previous AI message
    }
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: userInput.trim(),
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const aiInput: GenerateSwayamResponseInput = {
        prompt: userMessage.text,
        voiceTone: voiceTone,
      };
      const aiResponse = await generateSwayamResponse(aiInput);
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: aiResponse.response,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      speakText(aiResponse.response);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from Swayam. Please try again.',
        variant: 'destructive',
      });
       const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: "I seem to be having a bit of trouble connecting right now. Please try sending your message again shortly.",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      speakText(errorMessage.text);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="flex h-screen max-h-screen bg-background text-foreground overflow-hidden antialiased">
      {/* Settings Panel */}
      <aside className="w-[320px] border-r border-border p-6 flex flex-col space-y-6 bg-card shadow-lg">
        <div className="flex items-center space-x-3">
          <Bot size={32} className="text-primary" />
          <h1 className="text-3xl font-headline font-bold text-primary">SwayamChat</h1>
        </div>
        <Separator />
        <div className="flex-grow space-y-6">
          <h2 className="text-xl font-headline text-foreground flex items-center">
            <Settings size={20} className="mr-2 text-muted-foreground" />
            Chat Settings
          </h2>
          <div className="space-y-5">
            <div>
              <Label htmlFor="voice-tone" className="text-sm font-medium text-foreground/90">
                Voice Tone
              </Label>
              <Select value={voiceTone} onValueChange={setVoiceTone} disabled={isLoading}>
                <SelectTrigger id="voice-tone" className="w-full mt-1.5 rounded-lg shadow-sm">
                  <SelectValue placeholder="Select voice tone" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {voiceToneOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">Adjust how Swayam responds to you.</p>
            </div>

            <div>
              <Label htmlFor="tts-toggle" className="text-sm font-medium text-foreground/90 flex items-center">
                <Volume2 size={16} className="mr-2 text-muted-foreground" />
                Voice Reply
              </Label>
              <div className="flex items-center space-x-2 mt-1.5">
                <Switch
                  id="tts-toggle"
                  checked={isTTSEnabled}
                  onCheckedChange={setIsTTSEnabled}
                  disabled={isLoading}
                  aria-label="Toggle voice reply"
                />
                <span className="text-xs text-muted-foreground">
                  {isTTSEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Have Swayam's responses read aloud.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Crafted with Gemini & Firebase.
            <br />
            An AI reflection of Swayam Kaushal.
          </p>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-6" id="chat-scroll-area">
          <div className="space-y-5 pr-2">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageSquareDashed size={48} className="mb-4" />
                <p className="text-lg font-medium">No messages yet.</p>
                <p className="text-sm">Start the conversation by typing below!</p>
              </div>
            )}
            {messages.map(msg => (
              <ChatMessage key={msg.id} sender={msg.sender} text={msg.text} timestamp={msg.timestamp} />
            ))}
            {isLoading && <LoadingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleFormSubmit} className="border-t border-border p-4 bg-card/80 backdrop-blur-sm">
          <ChatInput
            userInput={userInput}
            setUserInput={setUserInput}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </form>
      </main>
    </div>
  );
}
