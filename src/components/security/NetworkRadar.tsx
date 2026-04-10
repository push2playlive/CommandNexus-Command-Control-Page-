import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import createGlobe from 'cobe';
import { nexus } from '../../shared/nexus-client';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { Globe as GlobeIcon, Shield, AlertTriangle, XCircle } from 'lucide-react';

interface Ping {
  id: string;
  type: 'healthy' | 'threat' | 'blocked';
  lat: number;
  lng: number;
  label?: string;
}

export function NetworkRadar() {
  const [pings, setPings] = useState<Ping[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. Subscribe to Live Blacklist (Red Dots)
    const blacklistChannel = nexus
      .channel('radar-blacklist')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nexus_security_blacklist' }, (payload) => {
        const newPing: Ping = {
          id: `blacklist-${payload.new.ip_address}`,
          type: 'blocked',
          lat: (Math.random() * 160) - 80,
          lng: (Math.random() * 360) - 180,
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
        lat: (Math.random() * 160) - 80,
        lng: (Math.random() * 360) - 180,
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
          lat: (Math.random() * 160) - 80,
          lng: (Math.random() * 360) - 180,
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

  useEffect(() => {
    let phi = 0;
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.02, 0.02, 0.02],
      markerColor: [0, 0.94, 1],
      glowColor: [0.1, 0.2, 0.4],
      markers: pings.map(p => ({
        location: [p.lat, p.lng],
        size: p.type === 'healthy' ? 0.08 : 0.1
      })),
      onRender: (state: any) => {
        state.phi = phi;
        phi += 0.003;
      },
    } as any);

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [pings]);

  return (
    <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden h-[500px] flex flex-col group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 -mr-32 -mt-32 rounded-full blur-3xl group-hover:bg-neon-cyan/10 transition-colors duration-1000" />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl">
            <GlobeIcon className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Network Radar</h3>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Global Fleet Status & Real-time Threat Mapping</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fleet Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Threat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Node Blocked</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-[400px] aspect-square"
          style={{ cursor: 'grab' }}
        />
        
        {/* IP Overlay List */}
        <div className="absolute top-0 right-0 w-48 space-y-2 hidden lg:block">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Recent Activity</p>
          <AnimatePresence mode="popLayout">
            {pings.slice(-5).reverse().map((ping) => (
              <motion.div
                key={ping.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-2 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm"
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  ping.type === 'healthy' ? "bg-emerald-500" :
                  ping.type === 'threat' ? "bg-yellow-500" :
                  "bg-rose-500"
                )} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-mono text-white truncate">{ping.label || '0.0.0.0'}</span>
                  <span className="text-[7px] text-slate-500 uppercase tracking-tighter">
                    {ping.type === 'healthy' ? 'Fleet Node' : ping.type === 'threat' ? 'Threat Detected' : 'IP Blocked'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* System Stats Overlay */}
        <div className="absolute bottom-0 left-0 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Sweep Rate</span>
              <span className="text-xs font-mono text-neon-cyan">0.25Hz</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Active Nodes</span>
              <span className="text-xs font-mono text-white">{pings.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>Behavioral Firewall: Active</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span>Threats: {pings.filter(p => p.type === 'threat').length}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Blocked: {pings.filter(p => p.type === 'blocked').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
