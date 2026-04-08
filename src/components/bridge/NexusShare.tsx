import React from 'react';
import { Share2, Network, Shield, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function NexusShare() {
  const shareNet = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({
        title: 'Join the CommandNexus Network',
        text: 'Connect your shell to the global brain.',
        url: url,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      alert("Nexus Link Copied: Share the DNA.");
    }
  };

  return (
    <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-magenta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-neon-magenta/10 border border-neon-magenta/20 rounded-xl">
            <Share2 className="w-5 h-5 text-neon-magenta" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Nexus Share</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Invite others to join the net</p>
          </div>
        </div>

        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl mb-6 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:border-neon-magenta/50 transition-all duration-500">
            <img src="/input_file_0.png" alt="Nexus Shield" className="w-10 h-10 object-contain opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Place the Nexus Shield on any site to give others the ability to "Join the Net" and sync with the global brain.
          </p>
          
          <button 
            onClick={shareNet}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
          >
            Generate Invite Link <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Network className="w-3 h-3 text-slate-600" />
            <span className="text-[8px] font-mono text-slate-600 uppercase">Network Propagation: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-mono text-emerald-500 uppercase">Verified DNA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
