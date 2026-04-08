import React, { useState } from 'react';
import { 
  Plus, 
  Globe, 
  Shield, 
  Cpu, 
  Network,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function AppRegistry() {
  const [step, setStep] = useState(1);
  const [appData, setAppData] = useState({
    name: '',
    domain: '',
    environment: 'production',
    tier: 'enterprise'
  });

  const nextStep = () => setStep(prev => prev + 1);

  return (
    <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-magenta/5 -mr-32 -mt-32 rounded-full blur-3xl" />
      
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">App Registry</h4>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Deploy New Shell to the Network</p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn(
              "w-8 h-1 rounded-full transition-all",
              step >= s ? "bg-neon-magenta" : "bg-white/10"
            )} />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Application Name</label>
                <input 
                  type="text"
                  placeholder="e.g. WhisperTech"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-magenta/50 text-sm"
                  value={appData.name}
                  onChange={e => setAppData({...appData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Primary Domain</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  <input 
                    type="text"
                    placeholder="whispertech.net"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-neon-magenta/50 text-sm font-mono"
                    value={appData.domain}
                    onChange={e => setAppData({...appData, domain: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-neon-magenta text-void rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white transition-all"
            >
              Next Phase <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {['Production', 'Staging', 'Development', 'Sandbox'].map((env) => (
                <button 
                  key={env}
                  onClick={() => setAppData({...appData, environment: env.toLowerCase()})}
                  className={cn(
                    "p-4 border rounded-2xl text-center transition-all",
                    appData.environment === env.toLowerCase() 
                      ? "bg-neon-magenta/10 border-neon-magenta text-neon-magenta" 
                      : "bg-black/40 border-white/5 text-slate-500 hover:border-white/20"
                  )}
                >
                  <Cpu className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{env}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-neon-magenta text-void rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white transition-all"
            >
              Finalize Config <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h5 className="text-white font-bold uppercase tracking-widest mb-2">Configuration Ready</h5>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-8">Deploying {appData.name} to the Nexus network...</p>
            
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left space-y-2 mb-8">
              <div className="flex justify-between">
                <span className="text-[9px] text-slate-700 font-bold uppercase">Node ID</span>
                <span className="text-[9px] text-neon-magenta font-mono">NX-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] text-slate-700 font-bold uppercase">Domain</span>
                <span className="text-[9px] text-white font-mono">{appData.domain}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(1)}
              className="w-full py-4 bg-white text-void rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-neon-cyan transition-all shadow-lg"
            >
              Deploy to Network
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
