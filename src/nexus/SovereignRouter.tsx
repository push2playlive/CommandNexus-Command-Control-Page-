import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { V24Initial } from '../components/startup/V24Initial';
import { NexusOSLanding } from '../components/nexus/NexusOSLanding';
import { CommandNexus } from '../pages/CommandNexus';

export const SovereignRouter = () => {
  const [phase, setPhase] = useState<'STARTUP' | 'LANDING' | 'TACTICAL'>('STARTUP');

  // Check if already authorized in session (optional, for now we always start fresh for the "feel")
  // useEffect(() => { ... }, []);

  return (
    <div className="min-h-screen bg-void">
      <AnimatePresence mode="wait">
        {phase === 'STARTUP' && (
          <motion.div
            key="startup"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <V24Initial onComplete={() => setPhase('LANDING')} />
          </motion.div>
        )}

        {phase === 'LANDING' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
          >
            <NexusOSLanding onEnter={() => setPhase('TACTICAL')} />
          </motion.div>
        )}

        {phase === 'TACTICAL' && (
          <motion.div
            key="tactical"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <CommandNexus />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
