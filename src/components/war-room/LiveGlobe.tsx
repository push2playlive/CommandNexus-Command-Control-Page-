import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { usePresence } from '../../hooks/usePresence';

export const LiveGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeUsers = usePresence('war-room-global');
  
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
      markerColor: [0, 0.94, 1], // Neon Cyan
      glowColor: [0.1, 0.2, 0.4],
      markers: activeUsers.map((u) => ({ location: [u.location.lat, u.location.lng], size: 0.05 })),
      onRender: (state: any) => {
        state.phi = phi;
        phi += 0.003;
      },
    } as any);

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [activeUsers]);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-black rounded-3xl border border-neon-cyan/20">
      <div className="absolute top-6 left-6 z-10 font-mono text-xs p-3 rounded-lg bg-black/60 border border-neon-cyan/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
          </span>
          <span className="text-neon-cyan tracking-widest uppercase">Active Agents: {activeUsers.length || 1}</span>
        </div>
        <div className="mt-2 text-slate-500">Uplink: {activeUsers.length > 0 ? 'Secure' : 'Simulated'}</div>
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
