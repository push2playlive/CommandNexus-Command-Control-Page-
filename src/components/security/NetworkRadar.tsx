import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nexus } from '../../shared/nexus-client';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '../../lib/utils';

interface Ping {
  id: string;
  type: 'healthy' | 'threat' | 'blocked';
  x: number;
  y: number;
  label?: string;
}

export function NetworkRadar() {
  const [pings, setPings] = useState<Ping[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Subscribe to Live Blacklist (Red Dots)
    const blacklistChannel = nexus
      .channel('radar-blacklist')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nexus_security_blacklist' }, (payload) => {
        const newPing: Ping = {
          id: `blacklist-${payload.new.ip_address}`,
          type: 'blocked',
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          label: payload.new.ip_address
        };
        setPings(prev => [...prev.slice(-19), newPing]);
      })
      .subscribe();

    // 2. Subscribe to Live Threats (Yellow Dots)
    const threatsQuery = query(collection(db, 'security_threats'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribeThreats = onSnapshot(threatsQuery, (snapshot) => {
      const newThreats: Ping[] = snapshot.docs.map(doc => ({
        id: `threat-${doc.id}`,
        type: 'threat',
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        label: doc.data().ip
      }));
      setPings(prev => {
        const filtered = prev.filter(p => p.type !== 'threat');
        return [...filtered, ...newThreats].slice(-30);
      });
    });

    // 3. Initial Fleet Pings (Green Dots)
    nexus.from('nexus_identities').select('domain_url, shell_name').then(({ data }) => {
      if (data) {
        const fleetPings: Ping[] = data.map(shell => ({
          id: `fleet-${shell.domain_url}`,
          type: 'healthy',
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          label: shell.shell_name
        }));
        setPings(prev => [...prev, ...fleetPings].slice(-40));
      }
    });

    return () => {
      nexus.removeChannel(blacklistChannel);
      unsubscribeThreats();
    };
  }, []);

  return (
    <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden h-[400px] flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 -mr-32 -mt-32 rounded-full blur-3xl" />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Network Radar</h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Live Fleet Pulse & Threat Mapping</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Fleet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Threat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Blocked</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
        {/* Radar Grids */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[80%] h-[80%] border border-white/5 rounded-full" />
          <div className="w-[60%] h-[60%] border border-white/5 rounded-full" />
          <div className="w-[40%] h-[40%] border border-white/5 rounded-full" />
          <div className="w-[20%] h-[20%] border border-white/5 rounded-full" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/5" />
        </div>

        {/* Radar Sweep */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 origin-center pointer-events-none"
          style={{ 
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 240, 255, 0.1) 60deg, transparent 60deg)'
          }}
        />

        {/* Pings */}
        <AnimatePresence>
          {pings.map((ping) => (
            <motion.div
              key={ping.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-crosshair"
              style={{ left: `${ping.x}%`, top: `${ping.y}%` }}
            >
              <div className={cn(
                "w-2 h-2 rounded-full relative",
                ping.type === 'healthy' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" :
                ping.type === 'threat' ? "bg-yellow-500 shadow-[0_0_10px_#eab308]" :
                "bg-rose-500 shadow-[0_0_10px_#f43f5e]"
              )}>
                <div className={cn(
                  "absolute inset-0 rounded-full animate-ping opacity-40",
                  ping.type === 'healthy' ? "bg-emerald-500" :
                  ping.type === 'threat' ? "bg-yellow-500" :
                  "bg-rose-500"
                )} />
              </div>
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                <div className="bg-void/90 border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-white uppercase tracking-widest">
                  {ping.label || 'UNKNOWN_NODE'}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase tracking-widest">
        <span>Sweep Frequency: 0.25Hz</span>
        <span>Active Nodes: {pings.length}</span>
      </div>
    </div>
  );
}
