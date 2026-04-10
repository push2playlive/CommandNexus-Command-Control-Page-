import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, ShieldCheck } from 'lucide-react';

export const V24Initial = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING_V24_CORE');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return 100;
        }
        
        // Dynamic status updates
        if (prev > 20 && prev < 40) setStatus('SYNCHRONIZING_NEURAL_PATHWAYS');
        if (prev > 40 && prev < 70) setStatus('STABILIZING_SKY_TOWERS');
        if (prev > 70 && prev < 90) setStatus('SOVEREIGN_OS_READY');
        if (prev > 90) setStatus('DREADNOUGHT_ONLINE');
        
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-void z-[100] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-neon-cyan/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 bg-surface border border-neon-cyan/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <Cpu className="w-10 h-10 text-neon-cyan animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tighter uppercase">Mainframe V24</h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] mt-1">DREADNOUGHT CLASS // SOVEREIGN OS</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-ping" />
                <span className="text-[10px] text-neon-cyan font-mono font-bold uppercase tracking-widest">{status}</span>
              </div>
              <div className="text-[8px] text-slate-600 font-mono uppercase">CORES ACTIVE: 24/24</div>
            </div>
            <span className="text-sm font-mono font-bold text-white">{Math.min(100, Math.round(progress))}%</span>
          </div>

          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Firewall Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-neon-magenta" />
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Neural Link Sync</span>
              </div>
            </div>
            <span className="text-[8px] text-slate-700 font-mono uppercase tracking-widest italic">"Sky Towers Stabilized"</span>
          </div>
        </div>
      </div>
    </div>
  );
};
