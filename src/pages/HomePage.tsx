import React, { useEffect, useState, Suspense } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AgentShowcase from '../components/AgentShowcase';
import Features from '../components/Features';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import FloatingActionButton from '../components/FloatingActionButton';
import SupabaseTest from '../components/SupabaseTest';
import { motion, useScroll } from 'framer-motion';

const LoadingFallback = () => (
  <div className="min-h-screen bg-space-black flex items-center justify-center">
    <div className="animate-pulse text-electric-blue text-xl">Loading...</div>
  </div>
);

function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <LoadingFallback />;
  }

  return (
    <div className="relative overflow-x-hidden">
      <motion.div 
        className="progress-bar fixed top-0 left-0 h-1 bg-electric-blue origin-left" 
        style={{ scaleX: scrollYProgress }} 
      />
      
      <ParticleBackground />
      
      <Suspense fallback={<LoadingFallback />}>
        <Header />
      </Suspense>
      
      <main>
        <SupabaseTest />
        <Suspense fallback={<LoadingFallback />}>
          <Hero />
        </Suspense>
        <Suspense fallback={<LoadingFallback />}>
          <AgentShowcase />
        </Suspense>
        <Suspense fallback={<LoadingFallback />}>
          <Features />
        </Suspense>
        <Suspense fallback={<LoadingFallback />}>
          <CTA />
        </Suspense>
      </main>
      
      <Suspense fallback={<LoadingFallback />}>
        <Footer />
      </Suspense>
      
      <FloatingActionButton />
    </div>
  );
}

export default HomePage;