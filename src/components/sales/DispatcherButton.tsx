import React, { useState } from 'react';
import { Rocket, ShieldAlert, Zap, Target, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { nexus } from '../../shared/nexus-client';
import { cn } from '../../lib/utils';

interface DispatcherButtonProps {
  targetDomain: string;
  className?: string;
}

export const DispatcherButton: React.FC<DispatcherButtonProps> = ({ targetDomain, className }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');

  const handleDispatch = async () => {
    if (!targetDomain) return;
    
    setIsDeploying(true);
    setStatus('deploying');
    
    try {
      // Triggers the Edge Function which runs the scraper on the V12
      const { data, error } = await nexus.functions.invoke('nexus-market-dispatch', {
        body: { target: targetDomain }
      });
      
      if (error) throw error;
      
      setStatus('success');
      // Reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error("Dispatch Error:", err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <div className={cn(
        "absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500",
        status === 'deploying' && "animate-pulse opacity-70",
        status === 'success' && "from-emerald-500 to-teal-500 opacity-70"
      )}></div>
      
      <button 
        onClick={handleDispatch}
        disabled={isDeploying || !targetDomain}
        className={cn(
          "relative w-full py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 overflow-hidden",
          status === 'idle' && "bg-black/60 text-white border border-white/10 hover:border-rose-500/50",
          status === 'deploying' && "bg-rose-600 text-white border-rose-500",
          status === 'success' && "bg-emerald-600 text-white border-emerald-500",
          status === 'error' && "bg-rose-900 text-rose-200 border-rose-700",
          (!targetDomain && status === 'idle') && "opacity-50 cursor-not-allowed"
        )}
      >
        {status === 'deploying' ? (
          <>
            <Zap className="w-4 h-4 animate-spin" />
            <span>Scrambling Agents...</span>
          </>
        ) : status === 'success' ? (
          <>
            <ShieldAlert className="w-4 h-4" />
            <span>Dispatch Confirmed</span>
          </>
        ) : status === 'error' ? (
          <>
            <ShieldAlert className="w-4 h-4" />
            <span>Uplink Failed</span>
          </>
        ) : (
          <>
            <Target className="w-4 h-4 group-hover:scale-125 transition-transform" />
            <span>Attack Market: {targetDomain || 'Select Target'}</span>
          </>
        )}

        {/* Scanning effect during deployment */}
        {status === 'deploying' && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </button>
    </div>
  );
};
