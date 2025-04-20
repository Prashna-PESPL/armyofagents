import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Settings, HelpCircle, Info } from 'lucide-react';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    
    // Simulate haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const menuItems = [
    { icon: <MessageSquare size={18} />, label: 'Chat', color: 'bg-electric-blue' },
    { icon: <HelpCircle size={18} />, label: 'Help', color: 'bg-electric-purple' },
    { icon: <Info size={18} />, label: 'About', color: 'bg-electric-pink' },
    { icon: <Settings size={18} />, label: 'Settings', color: 'bg-status-success' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Items */}
            <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3 z-50">
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 20, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: 20, x: 20 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.05 * (menuItems.length - index),
                  }}
                >
                  <motion.div
                    className="bg-space-dark text-white px-3 py-2 rounded-lg text-sm shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.div>
                  <button
                    className={`${item.color} text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Simulate haptic feedback
                      if ('vibrate' in navigator) {
                        navigator.vibrate(5);
                      }
                    }}
                  >
                    {item.icon}
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        className="bg-electric-blue text-space-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22v-6m0-6V3.5M12 16c5 0 8-2 8-5s-3-5-8-5-8 2-8 5 3 5 8 5z"></path>
            </svg>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;