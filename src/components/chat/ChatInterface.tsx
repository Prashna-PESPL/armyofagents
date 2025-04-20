import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, VolumeX, Smile, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import ChatMessage from './ChatMessage';
import VoiceRecorder from './VoiceRecorder';
import { Message } from '../../types';
import { supabase } from '../../lib/supabase';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now(),
      text: "Hey there! I'm your AI pal, ready to chat and get to know you. What's your name?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageSound = useRef<HTMLAudioElement | null>(null);

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

        console.log('Environment variables loaded successfully');

        // Initialize audio (optional)
        try {
          messageSound.current = new Audio('/message.mp3');
          messageSound.current.load();
          console.log('Audio initialized successfully');
        } catch (audioError) {
          console.warn('Could not initialize audio:', audioError);
          setIsSoundEnabled(false);
        }
        
        // Initialize speech synthesis
        if ('speechSynthesis' in window) {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
              console.log('Speech synthesis voices loaded');
              // Test speech synthesis after voices are loaded
              if (mounted) {
                speakMessage('Welcome to Army of Agents!');
              }
            };
          } else {
            // Test speech synthesis immediately if voices are already loaded
            if (mounted) {
              speakMessage('Welcome to Army of Agents!');
            }
          }
          console.log('Speech synthesis initialized with', voices.length, 'voices');
        } else {
          console.warn('Speech synthesis not supported in this browser');
          setIsSoundEnabled(false);
        }

        if (mounted) {
          setIsInitialized(true);
          scrollToBottom();
          console.log('ChatInterface initialized successfully');
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
      console.log('ChatInterface cleanup');
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      scrollToBottom();
    }
  }, [messages, isInitialized]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices and select a natural-sounding one
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = voices.filter(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      );
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
      
      // Configure utterance
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Speak the message
      window.speechSynthesis.speak(utterance);
      
      console.log('Speaking message with voice:', utterance.voice?.name);
    }
  };

  const getBotResponse = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userMessage }
      });

      if (error) {
        console.error('Error getting bot response:', error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        }]);
        return;
      }

      if (data) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        }]);
        if (isSoundEnabled) {
          speakMessage(data.response);
        }
      }
    } catch (error) {
      console.error('Error in getBotResponse:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    await getBotResponse(inputText);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (!isSoundEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setInputText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleBackToWelcome = () => {
    window.location.reload();
  };

  const handleVoiceInput = async (text: string) => {
    if (text.trim()) {
      setInputText(text);
      await handleSendMessage();
      setInputText('');
    }
  };

  const toggleVoiceMode = () => {
    if (isVoiceModeActive) {
      setIsVoiceModeActive(false);
    } else {
      setIsVoiceModeActive(true);
    }
  };

  const handleRecordingChange = (recording: boolean) => {
    setIsRecording(recording);
    if (!recording) {
      setIsVoiceModeActive(false);
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
            <motion.button
              onClick={toggleVoiceMode}
              className={`p-2 rounded-full transition-colors ${isVoiceModeActive ? 'bg-electric-blue' : 'hover:bg-space-gray'}`}
              animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className={`w-5 h-5 ${isVoiceModeActive ? 'text-space-black' : 'text-gray-400'}`} />
            </motion.button>
            
            <div className="flex-1 bg-space-gray rounded-xl">
              {isVoiceModeActive ? (
                <VoiceRecorder 
                  onTranscription={handleVoiceInput}
                  isRecording={isRecording}
                  onRecordingChange={handleRecordingChange}
                />
              ) : (
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-none p-3 focus:outline-none resize-none"
                  rows={1}
                />
              )}
            </div>
            
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-space-gray rounded-full transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
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