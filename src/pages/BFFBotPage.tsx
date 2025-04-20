import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ChatInterface from '../components/chat/ChatInterface';

const BFFBotPage = () => {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return <ChatInterface />;
  }

  return (
    <div className="min-h-screen bg-space-black text-white flex flex-col items-center justify-center p-4">
      <Link to="/home-page" className="absolute top-4 left-4 flex items-center gap-2 text-2xl font-bold font-space-grotesk">
        <Heart className="w-8 h-8 text-electric-blue" />
        BFF<span className="text-electric-blue">Agent</span>
      </Link>
      
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-space-grotesk">
          Ready to Chat with Your <span className="text-electric-blue">AI BFF</span>?
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          I'm here to listen, support, and chat with you about anything on your mind.
        </p>
        <button
          onClick={() => setShowChat(true)}
          className="btn-primary"
        >
          Start Chatting
        </button>
      </div>
    </div>
  );
};

export default BFFBotPage;