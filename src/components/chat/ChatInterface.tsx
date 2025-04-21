import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, VolumeX, Smile, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import ChatMessage from './ChatMessage';
import VoiceRecorder from './VoiceRecorder';
import { Message } from '../../types';
import { supabase } from '../../lib/supabase';
import { conversationExamples } from '../../data/conversations';
import { conversationGuidelines } from '../../data/conversationGuidelines';

interface ChatInterfaceProps {
  agentType: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agentType }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [isAskingForName, setIsAskingForName] = useState(true);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageSound = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log('Initializing ChatInterface...');
        
        // Check for required environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
          throw new Error('Supabase URL is not configured. Please update your .env file with a valid Supabase URL.');
        }

        if (!supabaseKey || supabaseKey === 'your_supabase_anon_key') {
          throw new Error('Supabase anonymous key is not configured. Please update your .env file with a valid Supabase anonymous key.');
        }

        // Initialize audio (optional)
        try {
          messageSound.current = new Audio('/message.mp3');
          messageSound.current.load();
        } catch (audioError) {
          console.warn('Could not initialize audio:', audioError);
          setIsSoundEnabled(false);
        }
        
        if (mounted) {
          setIsInitialized(true);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Error initializing ChatInterface:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat interface');
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      scrollToBottom();
    }
  }, [messages, isInitialized]);

  useEffect(() => {
    // Initialize with conversation example for the selected agent type
    setMessages(conversationExamples[agentType] || []);
  }, [agentType]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && isSoundEnabled) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = voices.filter(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      );
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const getBotResponse = async (userMessage: string) => {
    try {
      if (isAskingForName) {
        if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('sure') || userMessage.toLowerCase().includes('okay')) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "Great! What would you like to call me?",
            sender: 'bot',
            timestamp: new Date()
          }]);
          return;
        } else if (userMessage.toLowerCase().includes('no') || userMessage.toLowerCase().includes('not')) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "No problem! I'll keep my default name. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
          }]);
          setIsAskingForName(false);
          return;
        } else if (!agentName) {
          // Extract the actual name from common name introduction patterns
          let extractedName = userMessage;
          const namePatterns = [
            /my name is\s+(\w+)/i,
            /i am\s+(\w+)/i,
            /i'm\s+(\w+)/i,
            /call me\s+(\w+)/i,
            /name's\s+(\w+)/i,
            /(\w+)\s+is my name/i
          ];

          for (const pattern of namePatterns) {
            const match = userMessage.match(pattern);
            if (match && match[1]) {
              extractedName = match[1];
              break;
            }
          }

          // If no pattern matches, take the first word that's not a common introduction word
          if (extractedName === userMessage) {
            const words = userMessage.split(/\s+/);
            const commonWords = ['my', 'name', 'is', 'i', 'am', "i'm", 'call', 'me'];
            extractedName = words.find(word => !commonWords.includes(word.toLowerCase())) || words[0];
          }

          // Capitalize the first letter of the name
          extractedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1).toLowerCase();
          
          setAgentName(extractedName);
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: `Nice to meet you, ${extractedName}! Would you like to give me a name too?`,
            sender: 'bot',
            timestamp: new Date()
          }]);
          return;
        }
      }

      // Format messages to include conversation history
      const messageHistory = messages.slice(-5); // Get last 5 messages for context
      messageHistory.push({
        id: Date.now(),
        text: userMessage,
        sender: 'user' as const,
        timestamp: new Date()
      });

      console.log('Sending message to bot:', { userMessage, messageHistory });
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: messageHistory }
      });

      if (error) {
        console.error('Error getting bot response:', error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot' as const,
          timestamp: new Date()
        }]);
        return;
      }

      if (data?.response) {
        console.log('Received bot response:', data.response);
        const botMessage = {
          id: Date.now(),
          text: data.response,
          sender: 'bot' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        if (isSoundEnabled) {
          speakMessage(data.response);
        }
      } else {
        console.error('No response data from bot');
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: 'Sorry, I did not receive a proper response. Please try again.',
          sender: 'bot' as const,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error in getBotResponse:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot' as const,
        timestamp: new Date()
      }]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    const botMessage: Message = {
      id: messages.length + 2,
      text: conversationGuidelines.initiation.initialMessage,
      sender: 'bot',
      timestamp: new Date()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (!isSoundEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleBackToWelcome = () => {
    window.location.reload();
  };

  const handleVoiceInput = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Get bot's response
    setIsTyping(true);
    try {
      await getBotResponse(text.trim());
    } catch (error) {
      console.error('Error getting bot response for voice input:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Sorry, I encountered an error processing your voice input. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <div className="animate-pulse text-electric-blue text-xl">Initializing chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-space-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="bg-electric-blue text-space-black font-bold py-3 px-8 rounded-full 
                   transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.7)]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-space-black">
      {/* Chat Header */}
      <div className="bg-space-dark border-b border-space-light p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToWelcome}
              className="p-2 hover:bg-space-gray rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-electric-blue" />
            </button>
            <div className="w-10 h-10 rounded-full bg-electric-blue/10 flex items-center justify-center">
              <span className="text-electric-blue text-xl">AI</span>
            </div>
            <div>
              <h2 className="font-space-grotesk font-bold">BFF Agent</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                <span className="text-sm text-gray-400">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className="p-2 hover:bg-space-gray rounded-full transition-colors"
          >
            {isSoundEnabled ? (
              <Volume2 className="w-5 h-5 text-electric-blue" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isSoundEnabled={isSoundEnabled}
            />
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 items-end"
            >
              <div className="w-8 h-8 rounded-full bg-electric-blue/10 flex items-center justify-center">
                <span className="text-electric-blue text-sm">AI</span>
              </div>
              <div className="bg-space-gray rounded-xl p-3 inline-block">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-space-dark border-t border-space-light p-4">
        <div className="relative">
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-space-gray rounded-xl">
              <VoiceRecorder onTranscription={handleVoiceInput} />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-transparent border-none p-3 focus:outline-none resize-none"
                rows={1}
              />
            </div>
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-space-gray rounded-full transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
            
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-electric-blue text-space-black rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;