import React, { useState } from 'react';
import { Shield, Lock, Unlock, AlertTriangle, Key, Fingerprint } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Zone {
  id: string;
  name: string;
  status: 'LOCKED' | 'UNLOCKED' | 'RESTRICTED' | 'BREACH';
  level: number;
  personnel: number;
}

export function AccessControlWidget() {
  const [zones, setZones] = useState<Zone[]>([
    { id: 'SEC-01', name: 'Mainframe Core', status: 'LOCKED', level: 5, personnel: 0 },
    { id: 'SEC-02', name: 'Research Lab A', status: 'RESTRICTED', level: 4, personnel: 3 },
    { id: 'SEC-03', name: 'Hangar Bay', status: 'UNLOCKED', level: 2, personnel: 12 },
    { id: 'SEC-04', name: 'Armory', status: 'LOCKED', level: 5, personnel: 1 },
    { id: 'SEC-05', name: 'Medical Bay', status: 'UNLOCKED', level: 1, personnel: 5 },
    { id: 'SEC-06', name: 'Perimeter Gate', status: 'LOCKED', level: 3, personnel: 2 },
  ]);

  const toggleLock = (id: string) => {
    setZones(prev => prev.map(z => {
      if (z.id === id) {
        const newStatus = z.status === 'LOCKED' ? 'UNLOCKED' : 'LOCKED';
        return { ...z, status: newStatus };
      }
      return z;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LOCKED': return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
      case 'UNLOCKED': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'RESTRICTED': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'BREACH': return 'text-white bg-rose-600 animate-pulse';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex flex-col rounded-3xl border border-white/5 bg-surface p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-cyan/10 rounded-lg">
            <Shield className="h-4 w-4 text-neon-cyan" />
          </div>
          <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">
            Zone Access Control
          </span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Neural_Lock_Active</span>
           <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(zone => (
          <div key={zone.id} className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-neon-cyan/5 transition-all" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="text-xs font-bold text-white group-hover:text-neon-cyan transition-colors">{zone.name}</div>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">{zone.id}</div>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1.5 transition-all duration-500",
                getStatusColor(zone.status)
              )}>
                {zone.status === 'LOCKED' && <Lock size={8} />}
                {zone.status === 'UNLOCKED' && <Unlock size={8} />}
                {zone.status === 'RESTRICTED' && <AlertTriangle size={8} />}
                <span className="tracking-widest">{zone.status}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 relative z-10">
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5" title="Clearance Level">
                  <Key size={10} className="text-slate-600" />
                  <span className="font-mono">LVL {zone.level}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Personnel Count">
                  <Fingerprint size={10} className="text-slate-600" />
                  <span className="font-mono">{zone.personnel}</span>
                </div>
              </div>
              
              <button 
                onClick={() => toggleLock(zone.id)}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300 shadow-lg",
                  zone.status === 'LOCKED' 
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-void shadow-emerald-500/10' 
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white shadow-rose-500/10'
                )}
                title={zone.status === 'LOCKED' ? 'Unlock Zone' : 'Lock Zone'}
              >
                {zone.status === 'LOCKED' ? <Unlock size={14} /> : <Lock size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
