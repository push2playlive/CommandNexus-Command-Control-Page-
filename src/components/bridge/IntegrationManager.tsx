import React, { useState } from 'react';
import { 
  Github, 
  Database, 
  Flame, 
  ExternalLink, 
  Plus, 
  Settings2, 
  Shield, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Integration {
  id: string;
  name: string;
  type: 'github' | 'supabase' | 'firebase' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  details?: string;
}

export function IntegrationManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: '1', name: 'Nexus Core Repo', type: 'github', status: 'connected', lastSync: '2m ago', details: 'main branch' },
    { id: '2', name: 'Production DB', type: 'supabase', status: 'connected', lastSync: '5m ago', details: 'nexus-prod-01' },
    { id: '3', name: 'Auth Firebase', type: 'firebase', status: 'disconnected', details: 'Invalid API Key' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github className="w-5 h-5" />;
      case 'supabase': return <Database className="w-5 h-5" />;
      case 'firebase': return <Flame className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'disconnected': return 'text-slate-500 bg-white/5 border-white/10';
      case 'error': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">External Integrations</h4>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Bridge to GitHub, Firebase, & Databases</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg text-neon-cyan hover:bg-neon-cyan hover:text-void transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {integrations.map((integration) => (
          <motion.div 
            key={integration.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-black/40 border border-white/5 rounded-2xl group hover:border-neon-cyan/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  integration.status === 'connected' ? "bg-neon-cyan/10 text-neon-cyan" : "bg-white/5 text-slate-500"
                )}>
                  {getIcon(integration.type)}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">{integration.name}</h5>
                  <p className="text-[10px] text-slate-500 font-mono">{integration.details}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                  getStatusColor(integration.status)
                )}>
                  {integration.status}
                </div>
                <button className="p-2 text-slate-600 hover:text-white transition-colors">
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {integration.lastSync && (
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[8px] font-mono text-slate-700 uppercase">Last Sync: {integration.lastSync}</span>
                <button className="text-[9px] font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-1 hover:text-white">
                  Sync Now <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-void/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-surface border border-white/10 p-8 rounded-3xl shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">New Bridge Entry</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-neon-cyan/50 transition-all">
                    <Github className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
                  </button>
                  <button className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-neon-cyan/50 transition-all">
                    <Database className="w-6 h-6 text-neon-cyan" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Supabase</span>
                  </button>
                  <button className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-neon-cyan/50 transition-all">
                    <Flame className="w-6 h-6 text-rose-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Firebase</span>
                  </button>
                  <button className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-neon-cyan/50 transition-all">
                    <Shield className="w-6 h-6 text-neon-magenta" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Custom API</span>
                  </button>
                </div>
                
                <div className="pt-6 flex gap-4">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 py-3 bg-neon-cyan text-void rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
