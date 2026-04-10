import React, { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import { usePresence } from '../../hooks/usePresence';

export const LiveGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeUsers = usePresence('war-room-global');
  const [threats, setThreats] = useState<{location: [number, number], size: number}[]>([]);
  
  // Static locations for the 10 apps (Global Beacons)
  const appNodes = [
    { location: [37.7749, -122.4194], size: 0.08, color: [0, 1, 0.5] }, // SF
    { location: [40.7128, -74.0060], size: 0.08, color: [0, 1, 0.5] },  // NY
    { location: [51.5074, -0.1278], size: 0.08, color: [0, 1, 0.5] },   // London
    { location: [35.6762, 139.6503], size: 0.08, color: [0, 1, 0.5] },  // Tokyo
    { location: [-33.8688, 151.2093], size: 0.08, color: [0, 1, 0.5] }, // Sydney
    { location: [22.3193, 114.1694], size: 0.08, color: [0, 1, 0.5] },  // HK
    { location: [1.3521, 103.8198], size: 0.08, color: [0, 1, 0.5] },   // Singapore
    { location: [48.8566, 2.3522], size: 0.08, color: [0, 1, 0.5] },    // Paris
    { location: [-23.5505, -46.6333], size: 0.08, color: [0, 1, 0.5] }, // Sao Paulo
    { location: [55.7558, 37.6173], size: 0.08, color: [0, 1, 0.5] },   // Moscow
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newThreat = {
        location: [(Math.random() * 160) - 80, (Math.random() * 360) - 180] as [number, number],
        size: 0.1
      };
      setThreats(prev => [...prev.slice(-5), newThreat]);
      
      // Clear threat after a while
      setTimeout(() => {
        setThreats(prev => prev.filter(t => t !== newThreat));
      }, 2000);
    }, 3000);
    return () => clearInterval(interval);
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
      markerColor: [0, 0.94, 1], // Default Cyan
      glowColor: [0.1, 0.2, 0.4],
      markers: [
        ...appNodes.map(n => ({ location: n.location, size: n.size })),
        ...threats.map(t => ({ location: t.location, size: t.size })),
        ...activeUsers.map((u) => ({ location: [u.location.lat, u.location.lng], size: 0.05 }))
      ],
      onRender: (state: any) => {
        state.phi = phi;
        phi += 0.003;
      },
    } as any);

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [activeUsers, threats]);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-black rounded-3xl border border-neon-cyan/20">
      <div className="absolute top-6 left-6 z-10 font-mono text-xs p-3 rounded-lg bg-black/60 border border-neon-cyan/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 tracking-widest uppercase">Nodes Active: 10/10</span>
        </div>
        <div className="mt-2 text-slate-500 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
          <span>Threat Matrix: Monitoring...</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', maxWidth: '100%', aspectRatio: '1' }}
      />
      <div className="absolute bottom-6 right-6 z-10 text-right">
        <p className="text-[10px] text-neon-magenta uppercase tracking-[0.2em] font-bold">War Room Visualizer v4.0</p>
        <p className="text-[8px] text-slate-600 mt-1">Supabase Realtime Presence</p>
      </div>
    </div>
  );
};
