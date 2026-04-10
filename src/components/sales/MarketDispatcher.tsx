import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Globe, ShieldAlert, Zap, Search, AlertTriangle, Sparkles } from 'lucide-react';
import { DispatcherButton } from './DispatcherButton';
import { cn } from '../../lib/utils';

interface MarketDispatcherProps {
  triggeredTopic?: string | null;
}

export const MarketDispatcher = ({ triggeredTopic }: MarketDispatcherProps) => {
  const [targetDomain, setTargetDomain] = useState('canva.com');
  const [parallelMode, setParallelMode] = useState(true);
  const [isBoosting, setIsBoosting] = useState(false);

  useEffect(() => {
    if (triggeredTopic) {
      setIsBoosting(true);
      // Simulate SEO boost for the triggered topic
      const timer = setTimeout(() => setIsBoosting(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [triggeredTopic]);

  return (
    <div className={cn(
      "bg-surface border rounded-3xl p-8 relative overflow-hidden group transition-all duration-500",
      isBoosting ? "border-neon-cyan shadow-[0_0_30px_rgba(0,240,255,0.2)]" : "border-white/5"
    )}>
      <div className={cn(
        "absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 rounded-full blur-3xl transition-colors duration-1000",
        isBoosting ? "bg-neon-cyan/20" : "bg-rose-500/5 group-hover:bg-rose-500/10"
      )} />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 border rounded-xl transition-colors",
            isBoosting ? "bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
          )}>
            {isBoosting ? <Zap className="w-5 h-5 animate-pulse" /> : <Crosshair className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isBoosting ? 'SEO Boost Active' : 'Market Dispatcher'}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {isBoosting ? `Optimizing for: ${triggeredTopic}` : 'Competitive Displacement Protocol'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-[8px] font-mono font-bold uppercase tracking-widest",
            isBoosting ? "text-neon-cyan" : "text-rose-500"
          )}>
            {isBoosting ? 'V24_SEO_OVERDRIVE' : 'V24_DREADNOUGHT_CORE'}
          </span>
          <div className="flex gap-1 mt-1">
            {[...Array(24)].map((_, i) => (
              <div key={i} className={cn(
                "w-0.5 h-2 rounded-full transition-colors",
                isBoosting ? "bg-neon-cyan animate-pulse" : "bg-rose-500/40"
              )} style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isBoosting && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl flex items-center justify-between relative z-10"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-neon-cyan animate-spin" />
              <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">
                Oracle Spike Detected: "{triggeredTopic}" // Auto-injecting SEO backlinks
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 relative z-10">
        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Offensive Parameters</span>
            </div>
            <button 
              onClick={() => setParallelMode(!parallelMode)}
              className={cn(
                "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all",
                parallelMode ? "bg-rose-500 text-void border-rose-400" : "bg-white/5 text-slate-500 border-white/10"
              )}
            >
              {parallelMode ? 'Parallel Mode: ACTIVE' : 'Parallel Mode: STANDBY'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target Competitor Domain</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="text" 
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  placeholder="e.g. competitor.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-rose-500/50 transition-all text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold mb-1">Strategy</p>
                <p className="text-[10px] text-slate-300 font-bold uppercase">{parallelMode ? 'Fleet-wide Scrape' : 'Scrape & Displace'}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold mb-1">Node Status</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase">V24 Dreadnought Online</p>
              </div>
            </div>

            <DispatcherButton targetDomain={targetDomain} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <Search className="w-5 h-5 text-slate-600 mb-3" />
            <p className="text-[9px] font-bold text-white uppercase tracking-widest mb-1">Scrape Leads</p>
            <p className="text-[8px] text-slate-500 uppercase">Identify forum complaints</p>
          </div>
          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <Zap className="w-5 h-5 text-slate-600 mb-3" />
            <p className="text-[9px] font-bold text-white uppercase tracking-widest mb-1">Reverse Links</p>
            <p className="text-[8px] text-slate-500 uppercase">Map competitor backlinks</p>
          </div>
          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center text-center">
            <ShieldAlert className="w-5 h-5 text-slate-600 mb-3" />
            <p className="text-[9px] font-bold text-white uppercase tracking-widest mb-1">Auto-Outreach</p>
            <p className="text-[8px] text-slate-500 uppercase">Dispatch personalized alerts</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          <span>Warning: Offensive market actions may trigger competitor alerts</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
};
