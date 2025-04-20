import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import AgentCard from './AgentCard';
import { agents } from '../data/agents';

const AgentShowcase: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section id="agents" className="py-20 relative">
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-space-grotesk mb-4">
            Meet Your <span className="text-electric-blue">AI Agents</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Specialized AI agents ready to tackle any task. Each agent comes with unique capabilities and can be deployed instantly.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {agents.map((agent, index) => (
            <AgentCard key={index} agent={agent} index={index} />
          ))}
        </motion.div>
      </div>

      {/* Decorative Element */}
      <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-electric-blue/5 rounded-full blur-3xl" />
    </section>
  );
};

export default AgentShowcase;