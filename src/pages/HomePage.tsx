import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AgentShowcase from '../components/AgentShowcase';
import Features from '../components/Features';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import FloatingActionButton from '../components/FloatingActionButton';
import { motion, useScroll } from 'framer-motion';

function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  
  useEffect(() => {
    setIsMounted(true);
    
    const prefetchImages = [
      'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg',
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
    ];
    
    prefetchImages.forEach(imageSrc => {
      const img = new Image();
      img.src = imageSrc;
    });
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative overflow-x-hidden">
      <motion.div className="progress-bar" style={{ scaleX: scrollYProgress }} />
      
      <ParticleBackground />
      
      <Header />
      
      <main>
        <Hero />
        <AgentShowcase />
        <Features />
        <CTA />
      </main>
      
      <Footer />
      
      <FloatingActionButton />
    </div>
  );
}

export default HomePage;