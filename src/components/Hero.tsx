import React from 'react';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen pt-24 flex items-center relative overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center">
          {/* 3D Logo Animation */}
          <motion.div
            className="w-24 h-24 sm:w-32 sm:h-32 mb-8 relative"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
          >
            <motion.div 
              className="absolute inset-0 bg-electric-blue/20 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-electric-blue"
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22v-6m0-6V3.5M12 16c5 0 8-2 8-5s-3-5-8-5-8 2-8 5 3 5 8 5z"></path>
              </svg>
            </motion.div>
          </motion.div>

          {/* Main Hero Title */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-space-grotesk mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="gradient-text">Experience the Future</span>
            <br />of AI Collaboration
          </motion.h1>

          {/* Auto-typing Tagline */}
          <motion.div
            className="text-xl sm:text-2xl md:text-3xl mb-8 text-gray-300 h-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Typewriter
              options={{
                strings: [
                  'Your Personal AI Army Awaits',
                  'Unlock Superhuman Productivity',
                  'Scale Your Intelligence Infinitely'
                ],
                autoStart: true,
                loop: true,
                delay: 40,
                deleteSpeed: 20,
              }}
            />
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <motion.button 
              className="btn-primary flex items-center gap-2"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(0, 240, 255, 0.7)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Deploy Your Army <ArrowRight size={18} />
            </motion.button>
            <button className="py-3 px-8 rounded-full border border-electric-blue/30 hover:border-electric-blue transition-all duration-300">
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16 max-w-3xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "150ms", label: "Response Time" },
              { value: "500+", label: "Available Agents" }
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-electric-blue text-3xl sm:text-4xl font-bold font-space-grotesk">{stat.value}</span>
                <span className="text-gray-400 text-sm sm:text-base">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <motion.div
              className="w-6 h-10 rounded-full border-2 border-electric-blue/50 flex justify-center p-1"
              animate={{ y: [0, 10, 0] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-electric-blue"
                animate={{ 
                  y: [0, 14, 0],
                  opacity: [1, 0.2, 1]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;