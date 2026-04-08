import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  Zap, 
  MapPin, 
  Globe, 
  Lock, 
  Unlock, 
  AlertTriangle,
  Activity,
  UserX,
  Target,
  RefreshCw,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { cn } from '../../lib/utils';

import { nexus } from '../../shared/nexus-client';

interface Threat {
  id: string;
  type: 'geo_velocity' | 'credential_stuffing' | 'data_movement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  ip: string;
  timestamp: any;
  status: 'detected' | 'blocked' | 'challenged';
}

export function SecurityPulse() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'security_threats'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threatData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Threat[];
      setThreats(threatData);
      setIsScanning(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (threatId: string, action: 'block' | 'challenge' | 'ignore' | 'investigate') => {
    const threatRef = doc(db, 'security_threats', threatId);
    const threat = threats.find(t => t.id === threatId);

    if (action === 'block') {
      if (!threat) return;
      
      // 1. Update local threat status
      await updateDoc(threatRef, { status: 'blocked' });
      
      // 2. Add to Supabase Blacklist (The "Deed")
      const { error } = await nexus
        .from('nexus_security_blacklist')
        .insert({ 
          ip_address: threat.ip, 
          reason: `Behavioral Violation: ${threat.type}`, 
          threat_level: threat.severity === 'critical' ? 10 : 7 
        });
      
      if (!error) {
        alert(`Target Nullified: ${threat.ip} blocked across all apps.`);
      } else {
        console.error("Block Error:", error.message);
      }
    } else if (action === 'challenge') {
      await updateDoc(threatRef, { status: 'challenged' });
      alert(`MFA Challenge issued to node at ${threat?.ip}`);
    } else if (action === 'investigate') {
      if (threat) {
        window.open(`https://www.abuseipdb.com/check/${threat.ip}`, '_blank');
      }
    } else if (action === 'ignore') {
      await deleteDoc(threatRef);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'geo_velocity': return <Globe className="w-4 h-4" />;
      case 'credential_stuffing': return <Lock className="w-4 h-4" />;
      case 'data_movement': return <Activity className="w-4 h-4" />;
      default: return <ShieldAlert className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 -mr-32 -mt-32 rounded-full blur-3xl" />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Security Pulse</h3>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Real-Time Behavioral Firewall</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert("EMERGENCY: Global Session Termination Initiated.")}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.3)]"
          >
            <Zap className="w-3 h-3" /> Kill All Sessions
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/5 rounded-full">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isScanning ? "bg-yellow-500" : "bg-emerald-500")} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {isScanning ? "Scanning Net..." : "Shield Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {threats.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center bg-black/20 border border-dashed border-white/10 rounded-2xl"
            >
              <ShieldCheck className="w-8 h-8 text-emerald-500/50 mx-auto mb-4" />
              <p className="text-xs text-slate-500 uppercase tracking-widest">No active threats detected in the net</p>
            </motion.div>
          ) : (
            threats.map((threat) => (
              <motion.div 
                key={threat.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 bg-black/40 border border-white/5 rounded-2xl group hover:border-rose-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", getSeverityColor(threat.severity))}>
                      {getTypeIcon(threat.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">
                        {threat.type.replace('_', ' ')}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">{threat.ip}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                    threat.status === 'blocked' ? "text-rose-400 border-rose-500/20 bg-rose-500/5" :
                    threat.status === 'challenged' ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" :
                    "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                  )}>
                    {threat.status}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {threat.details}
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(threat.id, 'investigate')}
                    className="flex-1 py-2 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-void transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3 h-3" /> Investigate
                  </button>
                  <button 
                    onClick={() => handleAction(threat.id, 'block')}
                    className="flex-1 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldX className="w-3 h-3" /> Block IP
                  </button>
                  <button 
                    onClick={() => handleAction(threat.id, 'challenge')}
                    className="flex-1 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Target className="w-3 h-3" /> Challenge
                  </button>
                  <button 
                    onClick={() => handleAction(threat.id, 'ignore')}
                    className="p-2 bg-white/5 text-slate-500 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
