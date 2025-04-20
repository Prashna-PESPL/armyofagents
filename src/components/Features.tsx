import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Bot, Brain, Zap, Shield, Lightbulb, Sliders } from 'lucide-react';

const Features: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <Bot size={36} />,
      title: 'Advanced AI Agents',
      description: 'Specialized AI agents for every task, from data analysis to creative work.'
    },
    {
      icon: <Brain size={36} />,
      title: 'Contextual Understanding',
      description: 'Our agents understand context and maintain conversation history.'
    },
    {
      icon: <Zap size={36} />,
      title: 'Lightning Fast',
      description: 'Response times under 150ms for real-time collaboration.'
    },
    {
      icon: <Shield size={36} />,
      title: 'Enterprise Security',
      description: 'SOC2 compliant with end-to-end encryption for all communications.'
    },
    {
      icon: <Lightbulb size={36} />,
      title: 'Continuous Learning',
      description: 'Agents improve over time by learning from your interactions.'
    },
    {
      icon: <Sliders size={36} />,
      title: 'Fully Customizable',
      description: 'Train custom agents on your specific data and workflows.'
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="features" className="py-20 bg-space-dark">
      <div className="container-custom">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-space-grotesk mb-4">
            Unlock <span className="text-electric-blue">Superhuman</span> Capabilities
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our army of AI agents provides unprecedented capabilities to augment your team and scale your intelligence.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card flex flex-col"
              whileHover={{ 
                y: -5,
                boxShadow: '0 10px 25px -5px rgba(0, 240, 255, 0.1)',
                borderColor: 'rgba(0, 240, 255, 0.5)'
              }}
            >
              <div className="mb-4 text-electric-blue">
                {feature.icon}
              </div>
              <h3 className="text-xl font-space-grotesk mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;