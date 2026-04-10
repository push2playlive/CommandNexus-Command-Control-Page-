import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, Zap, Activity, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

export const GalacticProfile = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-shield">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 -mr-32 -mt-32 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-2 border-neon-cyan p-1 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/commander/200/200" 
                  alt="Commander" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-surface rounded-full shadow-lg" title="Online" />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tighter mb-2">COMMANDER [USERNAME]</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full text-[10px] font-bold text-neon-cyan uppercase tracking-widest">
                Rank: Lead Architect
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Net: CommandNexus Alpha
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-white/5 p-6 rounded-2xl text-center shadow-shield group hover:border-neon-cyan/30 transition-all">
          <Award className="w-6 h-6 text-neon-cyan mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Missions</h3>
          <p className="text-3xl font-mono font-bold text-white">42</p>
        </div>
        <div className="bg-surface border border-white/5 p-6 rounded-2xl text-center shadow-shield group hover:border-neon-magenta/30 transition-all">
          <Zap className="w-6 h-6 text-neon-magenta mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Neural Credits</h3>
          <p className="text-3xl font-mono font-bold text-white">850</p>
        </div>
        <div className="bg-surface border border-white/5 p-6 rounded-2xl text-center shadow-shield group hover:border-emerald-500/30 transition-all">
          <Activity className="w-6 h-6 text-emerald-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Uptime</h3>
          <p className="text-3xl font-mono font-bold text-white">99.9%</p>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-surface border border-white/5 p-8 rounded-3xl shadow-shield">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-neon-cyan" />
          Pilot's Log
        </h3>
        <p className="text-slate-400 leading-relaxed italic font-serif text-lg">
          "Bolding my way through the code. Searching for the next creative galaxy."
        </p>
      </div>
    </div>
  );
};
