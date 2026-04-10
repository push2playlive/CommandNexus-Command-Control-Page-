import React from 'react';
import { Settings, Eye, RefreshCw, Shield, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BridgeSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-surface border border-white/5 p-8 rounded-3xl shadow-shield">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-6 h-6 text-neon-cyan" />
          <h2 className="text-xl font-bold text-white uppercase tracking-widest">Bridge Settings</h2>
        </div>
        
        <div className="space-y-10">
          {/* Visual Interface */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Eye className="w-4 h-4" />
              <label className="text-xs uppercase font-bold tracking-widest">Visual Interface</label>
            </div>
            <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors nexus-input">
              <option>Dark Matter (Default)</option>
              <option>Nebula Pulse</option>
              <option>Solar Flare</option>
            </select>
          </div>

          {/* Nexus Sync */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <RefreshCw className="w-4 h-4" />
              <label className="text-xs uppercase font-bold tracking-widest">Nexus Sync</label>
            </div>
            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl">
              <span className="text-sm text-slate-300">Auto-sync missions across all apps</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
              </label>
            </div>
          </div>

          {/* Security Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4" />
              <label className="text-xs uppercase font-bold tracking-widest">Security Level</label>
            </div>
            <div className="space-y-4">
              <input 
                type="range" 
                min="1" 
                max="10" 
                defaultValue="8" 
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-cyan nexus-slider" 
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg">
                <Zap className="w-3 h-3 text-neon-cyan animate-pulse" />
                <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">Current Shielding: High (Behavioral Firewall Active)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
