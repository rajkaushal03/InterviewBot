
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
import { Bot, Settings, MessageSquareDashed, Volume2, Voicemail } from 'lucide-react';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

type VoiceOption = {
  value: string; // voiceURI
  label: string;
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
  const [voiceTone, setVoiceTone] = useState(voiceToneOptions[1].value); // Default to professional for interview
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('default');
  const [voiceOptions, setVoiceOptions] = useState<VoiceOption[]>([{ value: 'default', label: 'Default (Browser)' }]);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const updateVoices = useCallback(() => {
    if (!speechSynthesisRef.current) return;

    const voices = speechSynthesisRef.current.getVoices();
    if (!voices.length) return; // Voices might not be loaded yet

    const uniqueVoicesMap = new Map<string, SpeechSynthesisVoice>();
    voices.forEach(voice => {
      if (!uniqueVoicesMap.has(voice.voiceURI)) {
        uniqueVoicesMap.set(voice.voiceURI, voice);
      }
    });
    
    const allUniqueVoices = Array.from(uniqueVoicesMap.values());
    setAvailableVoices(allUniqueVoices);

    const languageCounters: Record<string, number> = {
      en: 0,
      hi: 0,
      es: 0,
      zh: 0,
    };

    const formattedOptions: VoiceOption[] = allUniqueVoices.map(voice => {
      const langPrefix = voice.lang.substring(0, 2).toLowerCase();
      let label = `${voice.name} (${voice.lang})`;

      if (langPrefix === 'en') {
        languageCounters.en++;
        label = `English Voice ${languageCounters.en}`;
      } else if (langPrefix === 'hi') {
        languageCounters.hi++;
        label = `Hindi Voice ${languageCounters.hi}`;
      } else if (langPrefix === 'es') {
        languageCounters.es++;
        label = `Spanish Voice ${languageCounters.es}`;
      } else if (langPrefix === 'zh') {
        languageCounters.zh++;
        label = `Chinese Voice ${languageCounters.zh}`;
      }
      return { value: voice.voiceURI, label: label };
    });
    
    setVoiceOptions([{ value: 'default', label: 'Default (Browser)' }, ...formattedOptions]);

  }, []);

  useEffect(() => {
    if (speechSynthesisRef.current) {
      updateVoices(); // Initial load
      speechSynthesisRef.current.onvoiceschanged = updateVoices; // Update if voices change
    }

    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.onvoiceschanged = null;
        speechSynthesisRef.current.cancel();
      }
    };
  }, [updateVoices]);


  const speakText = useCallback((text: string) => {
    if (!isTTSEnabled || !speechSynthesisRef.current) return;

    speechSynthesisRef.current.cancel(); // Cancel any previous speech
    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoiceURI && selectedVoiceURI !== 'default') {
      const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; // Ensure lang is set from the selected voice
      } else {
         // Fallback: try to set a default lang if specific voice not found
        const defaultLangVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        if (defaultLangVoice) {
          utterance.lang = defaultLangVoice.lang;
        }
      }
    } else {
        // Fallback for default: try to set a default lang
        const defaultLangVoice = availableVoices.find(v => v.lang.startsWith('en')) || (availableVoices.length > 0 ? availableVoices[0] : null);
        if (defaultLangVoice) {
          utterance.lang = defaultLangVoice.lang;
        }
    }
    
    speechSynthesisRef.current.speak(utterance);
  }, [isTTSEnabled, selectedVoiceURI, availableVoices]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: "Hello! I'm Swayam Kaushal. It's a pleasure to be here for this interview. I'm ready for your questions whenever you are.",
        timestamp: new Date(),
      },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async () => {
    if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel(); // Stop any ongoing speech from previous AI message
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
        description: 'Failed to get a response. Please try again.',
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
          <h1 className="text-3xl font-headline font-bold text-primary">InterviewBot</h1>
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
              <p className="text-xs text-muted-foreground mt-1.5">Adjust how Swayam responds.</p>
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
                  onCheckedChange={(checked) => {
                    setIsTTSEnabled(checked);
                    if (!checked && speechSynthesisRef.current) {
                        speechSynthesisRef.current.cancel();
                    }
                  }}
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
            {isTTSEnabled && (
              <div>
                <Label htmlFor="select-voice" className="text-sm font-medium text-foreground/90 flex items-center">
                  <Voicemail size={16} className="mr-2 text-muted-foreground" />
                  Select Voice
                </Label>
                <Select
                  value={selectedVoiceURI}
                  onValueChange={setSelectedVoiceURI}
                  disabled={isLoading || !isTTSEnabled}
                >
                  <SelectTrigger id="select-voice" className="w-full mt-1.5 rounded-lg shadow-sm">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg max-h-[200px] overflow-y-auto">
                    {voiceOptions.length > 0 ? (
                      voiceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-voices" disabled>
                        No voices available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Choose a specific voice for replies. Availability depends on your browser.
                </p>
              </div>
            )}
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
