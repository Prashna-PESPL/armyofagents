import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-space-dark py-12 border-t border-space-light">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-electric-blue">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22v-6m0-6V3.5M12 16c5 0 8-2 8-5s-3-5-8-5-8 2-8 5 3 5 8 5z"></path>
                </svg>
              </div>
              <span className="font-space-grotesk font-bold text-xl">ArmyOfAgents<span className="text-electric-blue">.AI</span></span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Deploy your personal AI army for unprecedented productivity and automation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors duration-300">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors duration-300">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors duration-300">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-space-grotesk font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Use Cases', 'Roadmap'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors duration-300 text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-space-grotesk font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              {['Documentation', 'API Reference', 'Blog', 'Community'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors duration-300 text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-space-grotesk font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Contact', 'Terms of Service', 'Privacy Policy'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors duration-300 text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-space-light flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ArmyOfAgents.AI. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-electric-blue transition-colors duration-300 text-sm">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-electric-blue transition-colors duration-300 text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-electric-blue transition-colors duration-300 text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;