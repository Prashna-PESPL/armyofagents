import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
  isSoundEnabled?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSoundEnabled = true }) => {
  const isBot = message.sender === 'bot';
  const hasSpokenRef = useRef(false);

  useEffect(() => {
    const speakMessage = async () => {
      if (isBot && isSoundEnabled && !hasSpokenRef.current) {
        try {
          // Wait for voices to be loaded
          if (window.speechSynthesis.getVoices().length === 0) {
            await new Promise(resolve => {
              window.speechSynthesis.addEventListener('voiceschanged', resolve, { once: true });
            });
          }

          const utterance = new SpeechSynthesisUtterance(message.text);
          const voices = window.speechSynthesis.getVoices();
          
          // Try to find a female English voice
          const voice = voices.find(v => 
            v.lang.startsWith('en-') && v.name.toLowerCase().includes('female')
          ) || voices.find(v => v.lang.startsWith('en-')) || voices[0];

          if (voice) {
            utterance.voice = voice;
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            // Speak the new message
            window.speechSynthesis.speak(utterance);
            hasSpokenRef.current = true;
          }
        } catch (error) {
          console.error('Speech synthesis error:', error);
        }
      }
    };

    speakMessage();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isBot, message.text, isSoundEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex gap-3 items-end ${isBot ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
        ${isBot ? 'bg-electric-blue/10' : 'bg-space-gray'}`}
      >
        <span className="text-sm">{isBot ? 'AI' : 'You'}</span>
      </div>
      
      <div className={`max-w-[80%] ${isBot ? 'bg-space-gray' : 'bg-electric-blue/10'} 
        rounded-xl p-3 relative group`}
      >
        <p className="text-white">{message.text}</p>
        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0 translate-y-full pt-1">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatMessage;