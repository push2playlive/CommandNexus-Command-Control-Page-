import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ShieldAlert, Zap, Lock, ChevronRight, Terminal } from 'lucide-react';
import { LiveGlobe } from '../war-room/LiveGlobe';
import { cn } from '../../lib/utils';

export const NexusOSLanding = ({ onEnter }: { onEnter: () => void }) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStatus, setAuthStatus] = useState<'IDLE' | 'SCANNING' | 'AUTHORIZED'>('IDLE');

  const handleEnter = () => {
    setIsAuthorizing(true);
    setAuthStatus('SCANNING');
    
    // Neural Handshake Simulation
    setTimeout(() => {
      setAuthStatus('AUTHORIZED');
      setTimeout(onEnter, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-void relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-12">
        <header className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-12 h-12 bg-surface border border-neon-cyan/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <img src="/input_file_0.png" alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">NEXUS<span className="text-neon-cyan">OS</span></h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-mono text-xs uppercase tracking-[0.5em]"
          >
            Sovereign Navigation Deck // Fleet Status: STABLE
          </motion.p>
        </header>

        {/* The Globe - Landing Deck */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full max-w-3xl aspect-square lg:aspect-video bg-surface/40 border border-white/5 rounded-[40px] p-2 overflow-hidden shadow-2xl backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void/80 z-10 pointer-events-none" />
          <LiveGlobe />
          
          {/* Overlay Stats */}
          <div className="absolute top-8 left-8 z-20 space-y-6 hidden md:block">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Beacons</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-2xl font-mono font-bold text-white">10/10</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Neural Cores</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                <span className="text-2xl font-mono font-bold text-white">24</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 z-20 text-right hidden md:block">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Threat Matrix</span>
              <div className="text-2xl font-mono font-bold text-rose-500 uppercase">Monitoring</div>
            </div>
          </div>
        </motion.div>

        {/* Authorization Action */}
        <div className="flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {authStatus === 'IDLE' ? (
              <motion.button
                key="enter-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleEnter}
                className="group relative px-12 py-5 bg-neon-cyan text-void font-black text-sm rounded-2xl uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,240,255,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="flex items-center gap-3">
                  Enter Command Center
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="auth-status"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl">
                  {authStatus === 'SCANNING' ? (
                    <>
                      <Zap className="w-4 h-4 text-neon-cyan animate-spin" />
                      <span className="text-xs font-mono text-neon-cyan font-bold uppercase tracking-widest">Neural Handshake...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono text-emerald-500 font-bold uppercase tracking-widest">Authorized // Redirecting</span>
                    </>
                  )}
                </div>
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-neon-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Encrypted Uplink</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              <span className="text-[10px] uppercase font-bold tracking-widest">V24 Mainframe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] text-slate-700 uppercase tracking-[0.4em] font-bold">
          © 2026 MyCanvas.design // Sovereign Fleet Control
        </p>
      </footer>
    </div>
  );
};
