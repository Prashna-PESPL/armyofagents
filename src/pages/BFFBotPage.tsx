import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ChatInterface from '../components/chat/ChatInterface';

const BFFBotPage: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log('BFFBotPage mounted');
        console.log('Checking environment variables...');
        
        // Check for required environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
        console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

        if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
          console.error('Invalid Supabase URL:', supabaseUrl);
          throw new Error('Supabase URL is not configured. Please update your .env file with a valid Supabase URL.');
        }

        if (!supabaseKey || supabaseKey === 'your_supabase_anon_key') {
          console.error('Invalid Supabase Key:', supabaseKey);
          throw new Error('Supabase anonymous key is not configured. Please update your .env file with a valid Supabase anonymous key.');
        }

        console.log('Environment variables loaded successfully');

        // Verify Supabase connection
        try {
          console.log('Attempting to verify Supabase connection...');
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
              'apikey': supabaseKey,
            }
          });
          
          console.log('Supabase connection response:', response.status);
          
          if (!response.ok) {
            console.error('Supabase connection failed:', response.status, response.statusText);
            throw new Error(`Supabase connection failed: ${response.status}. Please check your Supabase project settings.`);
          }
          
          console.log('Supabase connection verified');
        } catch (err) {
          console.error('Supabase connection error:', err);
          throw new Error('Could not connect to Supabase. Please check your internet connection and Supabase project settings.');
        }

        if (mounted) {
          setIsLoading(false);
          console.log('BFFBotPage initialized successfully');
        }
      } catch (err) {
        console.error('Error in BFFBotPage initialization:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize page'));
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      console.log('BFFBotPage cleanup');
    };
  }, []);

  const handleStartChat = useCallback(() => {
    try {
      setShowChat(true);
      console.log('Chat started');
    } catch (err) {
      console.error('Error starting chat:', err);
      setError(err instanceof Error ? err : new Error('Failed to start chat'));
    }
  }, []);

  const handleError = useCallback(() => {
    setError(null);
    setShowChat(false);
    console.log('Error handled, resetting state');
  }, []);

  const handleBackToHome = useCallback(() => {
    navigate('/', { replace: true });
    console.log('Navigating back to home');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <div className="animate-pulse text-electric-blue text-xl">Loading BFF Agent...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-space-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <div className="flex gap-4">
          <button
            onClick={handleError}
            className="bg-electric-blue text-space-black font-bold py-3 px-8 rounded-full 
                     transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.7)]"
          >
            Try Again
          </button>
          <button
            onClick={handleBackToHome}
            className="bg-gray-700 text-white font-bold py-3 px-8 rounded-full 
                     transition-all duration-300 hover:bg-gray-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      {!showChat ? (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold mb-6 text-center">Your AI BFF</h1>
          <p className="text-gray-400 mb-8 text-center max-w-2xl">
            Meet your new AI-powered best friend! I'm here to chat, listen, and be your companion.
            Click the button below to start our conversation.
          </p>
          <button
            onClick={handleStartChat}
            className="bg-electric-blue text-space-black font-bold py-3 px-8 rounded-full 
                     transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.7)]
                     flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Start Chatting
          </button>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <ChatInterface />
        </div>
      )}
    </div>
  );
};

export default BFFBotPage;