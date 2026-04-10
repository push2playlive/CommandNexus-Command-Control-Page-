import React from 'react';
import { Wallet, CheckCircle, Lock, ArrowUpRight, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';

export const VaultAccount = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-surface border border-white/5 p-8 rounded-3xl shadow-shield relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Wallet className="w-32 h-32 text-neon-cyan" />
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neon-cyan/10 rounded-2xl border border-neon-cyan/20">
              <Wallet className="w-6 h-6 text-neon-cyan" />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">The Vault</h2>
          </div>
          <div className="px-4 py-2 bg-neon-cyan text-void font-black text-[10px] rounded-full uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            LIFETIME OWNER
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {/* Subscription Status */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CreditCard className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Active Plan</h3>
              </div>
              <div>
                <p className="text-xl font-bold text-white">Architect Tier</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Next billing cycle: May 10, 2026</p>
              </div>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                Upgrade Credits
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Authorized Connections */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Lock className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Authorized Connections</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { domain: 'mycanvaslab.com', active: true },
                  { domain: 'utubechat.com', active: true },
                  { domain: 'hygieneteam.nz', active: false },
                ].map((conn) => (
                  <li key={conn.domain} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      {conn.active ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={cn("text-xs font-mono", conn.active ? "text-slate-200" : "text-slate-600")}>
                        {conn.domain}
                      </span>
                    </div>
                    {!conn.active && (
                      <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Inactive</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
