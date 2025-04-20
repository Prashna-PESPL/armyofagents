import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, VolumeX, Smile, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import ChatMessage from './ChatMessage';
import VoiceRecorder from './VoiceRecorder';
import { Message } from '../../types';

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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageSound = useRef(new Audio('/message.mp3'));

  useEffect(() => {
    scrollToBottom();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const getBotResponse = async (messageHistory: Message[]) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messageHistory }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting bot response:', error);
      return "I'm having trouble thinking right now. Could you try again?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    if (isSoundEnabled) {
      messageSound.current.play().catch(() => {});
    }

    const botResponse = await getBotResponse([...messages, newMessage]);
    
    const botMessage: Message = {
      id: Date.now(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    if (isSoundEnabled) {
      messageSound.current.play().catch(() => {});
    }
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

  const handleVoiceInput = (text: string) => {
    setInputText(text);
    handleSendMessage();
  };

  const toggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode;
    setIsVoiceMode(newVoiceMode);
    setIsRecording(newVoiceMode); // Start recording immediately when voice mode is enabled
  };

  const handleRecordingChange = (recording: boolean) => {
    setIsRecording(recording);
    if (!recording) {
      setIsVoiceMode(false); // Disable voice mode when recording stops
    }
  };

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
              className={`p-2 rounded-full transition-colors ${isVoiceMode ? 'bg-electric-blue' : 'hover:bg-space-gray'}`}
              animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className={`w-5 h-5 ${isVoiceMode ? 'text-space-black' : 'text-gray-400'}`} />
            </motion.button>
            
            <div className="flex-1 bg-space-gray rounded-xl">
              {isVoiceMode ? (
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