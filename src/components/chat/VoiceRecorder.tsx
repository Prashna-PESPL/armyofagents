import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  onRecordingChange: (isRecording: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription, isRecording, onRecordingChange }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const PAUSE_DURATION = 1500; // Time in ms to wait for natural pause

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Speech recognition is not supported in your browser. Please use Chrome.');
      return null;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setErrorMessage(null);
      setTranscript('');
      onRecordingChange(true);
    };

    recognition.onend = () => {
      onRecordingChange(false);
      if (transcript.trim()) {
        onTranscription(transcript.trim());
      }
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      if (currentTranscript) {
        setTranscript(currentTranscript);

        // Reset pause timer
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
        }

        // Set new pause timer
        pauseTimerRef.current = setTimeout(() => {
          if (isRecording && currentTranscript.trim()) {
            recognition.stop();
          }
        }, PAUSE_DURATION);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') return;
      
      setErrorMessage(
        event.error === 'not-allowed' 
          ? 'Please allow microphone access to use voice input.'
          : 'Error with speech recognition. Please try again.'
      );
      onRecordingChange(false);
    };

    return recognition;
  };

  useEffect(() => {
    recognitionRef.current = initializeSpeechRecognition();
    
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recording:', error);
        setErrorMessage('Failed to start recording. Please try again.');
        onRecordingChange(false);
      }
    } else if (!isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }, [isRecording]);

  return (
    <div className="p-3 flex items-center gap-3">
      {isRecording && (
        <div className="flex gap-1 items-center">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-4 bg-electric-blue rounded-full"
              animate={{ 
                scaleY: [1, 1.5 + Math.random(), 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.5 + Math.random() * 0.3,
                delay: i * 0.1 
              }}
            />
          ))}
        </div>
      )}
      
      <span className="text-sm">
        {errorMessage ? (
          <span className="text-status-error">{errorMessage}</span>
        ) : (
          <span className="text-gray-400">
            {isRecording ? (
              transcript ? `"${transcript}"` : 'Listening...'
            ) : (
              'Click microphone to start recording'
            )}
          </span>
        )}
      </span>
    </div>
  );
};

export default VoiceRecorder;