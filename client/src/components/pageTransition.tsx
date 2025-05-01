import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  return (
    <div className="page-transition">
      <AnimatePresence mode="wait">
        <motion.div
          key={displayLocation}
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onAnimationComplete={() => {
            if (transitionStage === 'fadeOut') {
              setTransitionStage('fadeIn');
              setDisplayLocation(location);
            }
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}