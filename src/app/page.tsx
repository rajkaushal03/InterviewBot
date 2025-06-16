
'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
import { Bot, Settings, MessageSquareDashed, Volume2, Voicemail, Mic as MicIcon, Info, PanelLeft } from 'lucide-react';

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

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function SwayamChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [voiceTone, setVoiceTone] = useState(voiceToneOptions[1].value); // Default to professional for interview
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('default');
  const [voiceOptions, setVoiceOptions] = useState<VoiceOption[]>([{ value: 'default', label: 'Default (Browser)' }]);

  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);


  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setIsSpeechRecognitionSupported(true);
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = false; // Important: process one utterance at a time
        recognitionRef.current.interimResults = true; // Get interim results
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let concatenatedTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            concatenatedTranscript += event.results[i][0].transcript;
          }
          setUserInput(concatenatedTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          let errorMessage = 'Speech recognition error.';
          if (event.error === 'no-speech') {
            errorMessage = 'No speech was detected. Please try again.';
          } else if (event.error === 'audio-capture') {
            errorMessage = 'Microphone problem. Please ensure it is enabled and working.';
          } else if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access denied. Please enable it in your browser settings.';
          } else if (event.error === 'network') {
            errorMessage = 'Network error during speech recognition. Please check your internet connection.';
          }
          toast({
            title: 'Mic Error',
            description: errorMessage,
            variant: 'destructive',
          });
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

      } else {
        setIsSpeechRecognitionSupported(false);
      }
    }
  }, [toast]);


  const updateVoices = useCallback(() => {
    if (!speechSynthesisRef.current) return;

    const voices = speechSynthesisRef.current.getVoices();
    if (!voices.length) return; 

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
      } else {
        label = `${voice.name} (${voice.lang})`;
      }
      return { value: voice.voiceURI, label: label };
    });
    
    setVoiceOptions([{ value: 'default', label: 'Default (Browser)' }, ...formattedOptions]);

  }, []);

  useEffect(() => {
    if (speechSynthesisRef.current) {
      updateVoices(); 
      speechSynthesisRef.current.onvoiceschanged = updateVoices; 
    }

    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.onvoiceschanged = null;
        speechSynthesisRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [updateVoices]);


  const speakText = useCallback((text: string) => {
    if (!isTTSEnabled || !speechSynthesisRef.current) return;

    speechSynthesisRef.current.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoiceURI && selectedVoiceURI !== 'default') {
      const voice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; 
      } else {
        const defaultLangVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        if (defaultLangVoice) {
          utterance.lang = defaultLangVoice.lang;
        }
      }
    } else {
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
        speechSynthesisRef.current.cancel(); 
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
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

  const handleToggleListening = () => {
    if (!isSpeechRecognitionSupported || !recognitionRef.current) {
        toast({
            title: 'Unsupported',
            description: 'Speech recognition is not supported in your browser.',
            variant: 'destructive',
        });
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setUserInput(''); // Clear input before starting new recognition
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <SidebarProvider defaultOpen={true} className=''>
      <div className="flex max-w-screen w-screen  h-screen max-h-screen bg-background text-foreground overflow-hidden antialiased">
        <Sidebar collapsible="offcanvas" side="left" className="border-r border-border shadow-lg">
          <SidebarHeader className="py-3">
            <div className="flex items-center space-x-2">
              <Bot size={32} className="text-primary" />
              <h1 className="md:text-2xl text-xl font-headline font-bold text-primary">InterviewBot</h1>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent className="p-6 pr-4"> {/* Added pr-4 for scrollbar spacing */}
            <div className="space-y-6">
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
                <div>
                    <Label className="text-sm font-medium text-foreground/90 flex items-center">
                        <MicIcon size={16} className="mr-2 text-muted-foreground" />
                        Microphone Input
                    </Label>
                    <div className="flex items-center space-x-2 mt-1.5">
                        <span className={`text-xs px-2 py-1 rounded-md ${
                            isListening 
                                ? 'bg-red-500/20 text-red-700 dark:bg-red-700/30 dark:text-red-300' 
                                : isSpeechRecognitionSupported 
                                    ? 'bg-green-500/20 text-green-700 dark:bg-green-700/30 dark:text-green-300'
                                    : 'bg-gray-500/20 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300'
                        }`}>
                            {isListening 
                                ? 'Listening...' 
                                : isSpeechRecognitionSupported 
                                    ? 'Ready' 
                                    : 'Not Supported'}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
                       <Info size={12} className="mr-1 shrink-0" />
                       {isSpeechRecognitionSupported 
                           ? 'Click the mic in input field.'
                           : 'Your browser does not support speech input.'}
                    </p>
                </div>
              </div>
            </div>
          </SidebarContent>
          <SidebarFooter className="p-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Crafted with Gemini & Firebase.
              <br />
              An AI reflection of Swayam Kaushal.
            </p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="flex-1 w-full flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border bg-card/80 backdrop-blur-sm">
                <SidebarTrigger className="h-8 w-8">
                    <PanelLeft size={18}/>
                </SidebarTrigger>
            </div>
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
                isListening={isListening}
                onToggleListening={handleToggleListening}
                isSpeechRecognitionSupported={isSpeechRecognitionSupported}
              />
            </form>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
