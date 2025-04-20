import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';

const CTA: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-electric-purple/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-electric-blue/10 rounded-full blur-3xl" />
      
      <div className="container-custom relative z-10">
        <motion.div
          className="bg-space-dark border border-space-light rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          ref={ref}
        >
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-space-grotesk mb-6"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Deploy Your Personal <br />
            <span className="text-electric-blue">AI Army</span> Today
          </motion.h2>
          
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto text-lg mb-8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Start with 5 free agents. No credit card required. Upgrade anytime to access our full army.
          </motion.p>
          
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
              {[
                { plan: "Starter", price: "Free", features: ["5 AI Agents", "10,000 tokens/day", "Basic features"] },
                { plan: "Pro", price: "$49", features: ["50 AI Agents", "Unlimited tokens", "All features", "Priority support"] },
                { plan: "Enterprise", price: "Custom", features: ["Unlimited Agents", "Custom training", "Dedicated account manager", "On-premise option"] }
              ].map((tier, index) => (
                <div key={index} className="bg-space-black p-6 rounded-xl flex-1 min-w-0">
                  <h3 className="font-space-grotesk text-xl mb-2">{tier.plan}</h3>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">{tier.price}</span>
                    {tier.price !== "Free" && tier.price !== "Custom" && <span className="text-gray-400 text-sm">/month</span>}
                  </div>
                  <ul className="text-sm text-gray-400 space-y-2 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-electric-blue">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full py-2 px-4 rounded-lg transition-all duration-300 ${
                      index === 1 ? 'bg-electric-blue text-space-black font-medium' : 'border border-space-light hover:border-electric-blue/50'
                    }`}
                  >
                    {index === 2 ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <button 
              className="group inline-flex items-center gap-2 text-electric-blue hover:text-white transition-colors duration-300"
            >
              Schedule a Demo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300"/>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;