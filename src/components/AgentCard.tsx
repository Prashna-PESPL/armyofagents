import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  index: number;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, index }) => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 50 
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const handleClick = () => {
    if (agent.name === "BFF Bot") {
      navigate('/bff-agent');
    }
  };

  // Calculate delay based on index for staggered animation
  const delay = index * 0.1;

  return (
    <motion.div
      className="card overflow-hidden cursor-pointer"
      variants={cardVariants}
      transition={{ delay }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px -5px rgba(0, 240, 255, 0.1)',
        borderColor: 'rgba(0, 240, 255, 0.5)'
      }}
      onClick={handleClick}
    >
      <div className="relative mb-4 overflow-hidden rounded-xl aspect-square">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 to-electric-purple/20 z-10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.img
          src={agent.avatarUrl}
          alt={agent.name}
          className="w-full h-full object-cover object-center"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Status Indicator */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-space-black/70 py-1 px-3 rounded-full">
          <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-status-success animate-pulse' : agent.status === 'learning' ? 'bg-status-warning' : 'bg-status-error'}`} />
          <span className="text-xs capitalize">{agent.status}</span>
        </div>
      </div>

      <div className="p-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-space-grotesk">{agent.name}</h3>
          <span className="text-xs bg-space-gray px-2 py-1 rounded font-mono">v{agent.version}</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{agent.description}</p>
        
        <div className="mb-4">
          <h4 className="text-xs uppercase text-gray-500 mb-2">Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability, i) => (
              <span key={i} className="text-xs bg-space-gray px-2 py-1 rounded-md">
                {capability}
              </span>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Accuracy</p>
            <div className="w-full bg-space-gray h-1.5 rounded-full mt-1">
              <div 
                className="bg-electric-blue h-full rounded-full" 
                style={{ width: `${agent.metrics.accuracy}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Speed</p>
            <div className="w-full bg-space-gray h-1.5 rounded-full mt-1">
              <div 
                className="bg-electric-purple h-full rounded-full" 
                style={{ width: `${agent.metrics.speed}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentCard;