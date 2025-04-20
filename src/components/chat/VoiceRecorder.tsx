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
  const pauseTimerRef = useRef<number | null>(null);

  const PAUSE_DURATION = 1500; // Time in ms to wait for natural pause

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      onRecordingChange(false);
      return null;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setErrorMessage(null);
      setTranscript('');
      console.log('Speech recognition started');
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (transcript.trim()) {
        onTranscription(transcript.trim());
      }
      setTranscript('');
      onRecordingChange(false);
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
        console.log('Transcript updated:', currentTranscript);

        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
        }

        pauseTimerRef.current = window.setTimeout(() => {
          if (recognition && finalTranscript.trim()) {
            recognition.stop();
          }
        }, PAUSE_DURATION);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      switch (event.error) {
        case 'not-allowed':
          setErrorMessage('Please allow microphone access to use voice input.');
          break;
        case 'no-speech':
          setErrorMessage('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          setErrorMessage('No microphone detected. Please check your microphone connection.');
          break;
        case 'network':
          setErrorMessage('Network error occurred. Please check your internet connection.');
          break;
        default:
          setErrorMessage('Error with speech recognition. Please try again.');
      }
      onRecordingChange(false);
    };

    recognition.onaudiostart = () => {
      console.log('Audio capture started');
    };

    recognition.onaudioend = () => {
      console.log('Audio capture ended');
    };

    recognition.onsoundstart = () => {
      console.log('Sound detected');
    };

    recognition.onsoundend = () => {
      console.log('Sound ended');
    };

    return recognition;
  };

  useEffect(() => {
    if (isRecording) {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeSpeechRecognition();
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log('Starting speech recognition');
        } catch (error) {
          console.error('Failed to start recording:', error);
          setErrorMessage('Failed to start recording. Please try again.');
          onRecordingChange(false);
        }
      }
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopping speech recognition');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }

    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition on cleanup:', error);
        }
      }
    };
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