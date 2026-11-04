
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, Send, Star, ArrowLeft, Home, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/use-app-store';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage } from '@/lib/types';
import { respondToLocalSupport } from '@/lib/local-support';
import { isLocalImageSource } from '@/lib/local-image';

type Message = {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  agentName?: string;
  timestamp: string;
};

type ChatState = 'idle' | 'chatting' | 'ended';

const StarRating = ({ onRate }: { onRate: (rating: number) => void }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        key={index}
                        onClick={() => {
                            setRating(ratingValue);
                            onRate(ratingValue);
                        }}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <Star
                            className={cn(
                                "h-6 w-6 transition-colors",
                                ratingValue <= (hover || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
};


function AgentLiveChatContent() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [agentName] = useState('PNB ONE Support');
  const [showRating, setShowRating] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'model' | 'system', text: string) => {
    const newMessage: Message = { id: `${role}-${Date.now()}`, role, text, timestamp: new Date().toISOString() };
    if (role === 'model' && agentName) {
        newMessage.agentName = agentName;
    }
    setMessages(prev => [...prev, newMessage]);
  };
  
  // Effect to load history from global state and update local state
  useEffect(() => {
    if (state.chatHistory && state.chatHistory.length > 0) {
        const loadedMessages = state.chatHistory.map(msg => ({
            id: msg.id,
            role: (msg.sender === 'agent' ? 'model' : msg.sender) as 'user' | 'model' | 'system',
            text: msg.content,
            timestamp: msg.timestamp,
        }));
        setMessages(loadedMessages);
        setChatState('chatting'); // Assume if there's history, we're in a chat
    } else {
        setMessages([]);
        setChatState('idle');
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chatHistory]);


  // Effect to save messages to global state
  useEffect(() => {
    // Prevent saving on initial load if messages are just being populated from history
    if (messages.length === 0 && state.chatHistory.length > 0) return;

    const newHistory: ChatMessage[] = messages.map(msg => ({
        id: msg.id,
        sender: msg.role === 'model' ? 'agent' : msg.role === 'system' ? 'system' : 'user',
        content: msg.text,
        timestamp: msg.timestamp,
    }));
    
    // Only update if there's a difference to avoid infinite loops
    if (JSON.stringify(newHistory) !== JSON.stringify(state.chatHistory)) {
        dispatch({
            type: 'UPDATE_CHAT_HISTORY',
            payload: newHistory
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  
  const simulateTyping = (callback: () => void) => {
      setIsLoading(true);
      const delay = 1000 + Math.random() * 1500;
      setTimeout(() => {
          setIsLoading(false);
          callback();
      }, delay);
  };
  
  const handleRating = (rating: number) => {
      toast({title: `Thank you for your feedback!`, description: `You rated this chat ${rating} out of 5.`});
      setShowRating(false);
  }
  
  const startChatSession = () => {
    setMessages([]); // Clear local messages first
    dispatch({ type: 'UPDATE_CHAT_HISTORY', payload: [] }); // Clear global history
    setShowRating(false);
    addMessage('system', 'Starting a local support conversation...');
    simulateTyping(() => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
        addMessage('system', 'The PNB ONE local support assistant is ready.');
        addMessage('model', `${greeting}! I am the PNB ONE local support assistant. How may I help you today?`);
        setChatState('chatting');
    });
  }

  const handleSend = async () => {
    const userMessageText = input.trim();
    if (!userMessageText) return;

    // Special handling for starting a new chat
    if (/^(?:hi|hii|hello|hey)$/i.test(userMessageText) && (chatState === 'idle' || chatState === 'ended')) {
        startChatSession();
        setInput('');
        return;
    }
    
    addMessage('user', userMessageText);
    setInput('');
    setIsLoading(true);
    
    const activeAccount = state.accounts.find(account => account.id === state.activeAccountId) || state.accounts[0];
    const result = respondToLocalSupport(userMessageText, {
        customerName: state.user.name,
        account: activeAccount,
        transactions: state.transactions.filter(transaction => !activeAccount || transaction.accountId === activeAccount.id),
        payees: state.payees,
        englishStyle: state.settings.agentEnglishStyle,
    });

    // Responses are generated locally from the current browser state. No account
    // details or chat messages are sent to an external AI or banking service.
    simulateTyping(() => {
        addMessage('model', result.response);
        if (result.endChat) {
            setChatState('ended');
            simulateTyping(() => {
                addMessage('system', 'Chat is closed.');
                setShowRating(true);
            });
        }
    });
  };

  return (
    <div className="pnb-page flex flex-col min-h-screen bg-gray-50">
      <header className="pnb-page-header bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md sticky top-0 z-20">
          <button onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6 text-accent" />
          </button>
          <h1 className="text-xl font-semibold">Support Chat</h1>
          <Link href="/dashboard">
                <Home className="h-6 w-6 text-accent" />
          </Link>
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && chatState === 'idle' && (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full p-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                  <h2 className="text-lg font-semibold">Start a Conversation</h2>
                  <p className="text-sm">Type &apos;Hi&apos; to start local support. No live agent or bank system is connected.</p>
              </div>
          )}
          {messages.map(message => (
            <div key={message.id} className={cn('flex w-full items-end gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'model' && (
                <Avatar className="h-8 w-8">
                   {isLocalImageSource(state.settings.agentAvatar) && <AvatarImage src={state.settings.agentAvatar} />}
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              {message.role !== 'system' ? (
                <div className={cn('max-w-xs md:max-w-md rounded-lg px-3 py-2', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={cn("text-xs mt-1", message.role === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70')}>
                        {new Date(message.timestamp).toLocaleString('en-IN', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', '')}
                    </p>
                </div>
              ) : (
                <div className="text-center w-full my-2">
                    <p className="text-xs text-muted-foreground italic">{message.text}</p>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <Avatar className="h-8 w-8">
                {isLocalImageSource(state.settings.agentAvatar) && <AvatarImage src={state.settings.agentAvatar} />}
                <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center space-x-1">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          {showRating && (
             <div className="p-4 bg-muted rounded-lg text-center space-y-2">
                <p className="text-sm font-medium">Please rate your experience</p>
                <StarRating onRate={handleRating} />
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={
                chatState === 'ended' ? "Chat ended. Type 'Hi' to restart." :
                chatState === 'idle' ? "Type 'Hi' to start local support..." :
                "Type a message..."
            }
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


export default function AgentLiveChatPage() {
    return (
        <Suspense fallback={<div>Loading chat...</div>}>
            <AgentLiveChatContent />
        </Suspense>
    )
}
