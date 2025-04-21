import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Set optimal fixed sensitivity - this value has been tested to work well for most microphones
  const OPTIMAL_SENSITIVITY = 0.15;
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const animationFrameRef = useRef<number | null>(null);
  const isStartingRef = useRef(false);

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    silenceTimeoutRef.current = setTimeout(() => {
      if (isListening && mountedRef.current) {
        stopListening();
      }
    }, 3000);
  };

  const startAudioMonitoring = async () => {
    try {
      // Check browser compatibility first
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Media devices API not supported in this browser');
      }

      // Check if we already have an active stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Microphone access granted');
      streamRef.current = stream;
      
      // Close existing audio context if it exists
      if (audioContextRef.current?.state !== 'closed') {
        await audioContextRef.current?.close();
      }
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Resume the audio context if it's suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      sourceRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkAudioLevel = () => {
        if (!mountedRef.current || !analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const normalizedLevel = average / 255;
        
        if (normalizedLevel > OPTIMAL_SENSITIVITY && !isListening && !isStartingRef.current) {
          console.log('Audio level triggered recognition start');
          startRecognition();
          resetSilenceTimeout();
        } else if (normalizedLevel > OPTIMAL_SENSITIVITY && isListening) {
          resetSilenceTimeout();
        }
        
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
      setHasPermission(true);
      setErrorMessage(null);
      console.log('Audio monitoring initialized successfully');
    } catch (error) {
      console.error('Audio monitoring error:', error);
      setHasPermission(false);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setErrorMessage('Microphone access was denied. Please allow microphone access in your browser settings and refresh the page.');
        } else if (error.name === 'NotFoundError') {
          setErrorMessage('No microphone found. Please connect a microphone and refresh the page.');
        } else if (error.name === 'NotReadableError') {
          setErrorMessage('Your microphone is busy or not responding. Please check your microphone settings and refresh the page.');
        } else {
          setErrorMessage(`Could not initialize audio monitoring: ${error.message}`);
        }
      } else {
        setErrorMessage('An unexpected error occurred while initializing audio monitoring.');
      }
    }
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return null;
    }

    try {
      console.log('Initializing speech recognition...');
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (!mountedRef.current) return;
        console.log('Speech recognition started successfully');
        setErrorMessage(null);
        setTranscript('');
        setIsListening(true);
        isStartingRef.current = false;
        resetSilenceTimeout();
      };

      recognition.onend = async () => {
        if (!mountedRef.current) return;
        console.log('Speech recognition ended');
        setIsListening(false);
        isStartingRef.current = false;
        
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        if (transcript.trim()) {
          try {
            // First send the transcription to the chat interface
            onTranscription(transcript.trim());
            
            // Then try to save to Supabase (this is optional and shouldn't block the chat)
            try {
              const { data: { user }, error: userError } = await supabase.auth.getUser();
              if (!userError && user) {
                await supabase
                  .from('transcriptions')
                  .insert([{
                    user_id: user.id,
                    text: transcript.trim()
                  }]);
              }
            } catch (error) {
              console.error('Error saving transcription to Supabase:', error);
              // Don't set error message here as it's not critical
            }
          } catch (error) {
            console.error('Error handling transcription:', error);
            setErrorMessage('Failed to process transcription. Please try again.');
          }
        }
        
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        if (!mountedRef.current) return;
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text;
            // Immediately send final transcriptions to the chat
            if (finalTranscript.trim()) {
              console.log('Final transcript received:', finalTranscript);
              onTranscription(finalTranscript.trim());
              setTranscript('');
              return;
            }
          } else {
            interimTranscript += text;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript) {
          console.log('Received transcript:', currentTranscript);
          setTranscript(currentTranscript);
          resetSilenceTimeout();
        }
      };

      recognition.onerror = (event: any) => {
        if (!mountedRef.current) return;
        
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        console.error('Speech recognition error:', event.error);

        switch (event.error) {
          case 'not-allowed':
            setHasPermission(false);
            setErrorMessage('Microphone access denied. Please click the lock icon in your browser\'s address bar and allow microphone access.');
            break;
          case 'no-speech':
            setErrorMessage('No speech detected. Please check your microphone and try speaking again.');
            break;
          case 'audio-capture':
            setErrorMessage('No microphone found. Please connect a microphone and ensure it\'s set as your default input device.');
            break;
          case 'network':
            setErrorMessage('Network error occurred. Please check your internet connection and refresh the page.');
            break;
          case 'aborted':
            // Ignore aborted errors as they're expected when stopping recognition
            break;
          default:
            setErrorMessage(`Speech recognition error: ${event.error}. Please refresh the page and try again.`);
        }
        
        if (event.error !== 'aborted') {
          stopListening();
          // Try to reinitialize after a brief delay
          setTimeout(() => {
            if (mountedRef.current) {
              recognitionRef.current = null;
              startRecognition();
            }
          }, 1000);
        }
      };

      return recognition;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setErrorMessage('Failed to initialize speech recognition. Please refresh the page and try again.');
      return null;
    }
  };

  const startRecognition = () => {
    if (isListening || isStartingRef.current) {
      console.log('Recognition already in progress, skipping start');
      return;
    }

    console.log('Starting speech recognition...');
    isStartingRef.current = true;

    if (!recognitionRef.current) {
      recognitionRef.current = initializeSpeechRecognition();
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        if (error instanceof Error && error.message.includes('already started')) {
          // Handle the case where recognition is already started
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } else {
          setErrorMessage('Failed to start speech recognition. Please refresh and try again.');
          isStartingRef.current = false;
          stopListening();
        }
      }
    } else {
      console.error('Speech recognition not initialized');
      setErrorMessage('Speech recognition failed to initialize. Please use Chrome or Edge browser.');
      isStartingRef.current = false;
    }
  };

  const stopListening = () => {
    isStartingRef.current = false;
    setIsListening(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    startAudioMonitoring();

    return () => {
      mountedRef.current = false;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
      
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {isListening && (
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
              {isListening ? (
                transcript ? `"${transcript}"` : 'Listening...'
              ) : (
                'Voice detection active'
              )}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default VoiceRecorder;