import React, { useState, useEffect } from 'react';
import { 
  ShieldX, 
  Trash2, 
  Search, 
  Plus, 
  Clock, 
  AlertTriangle,
  Database,
  UserX,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { cn } from '../../lib/utils';

interface BlacklistEntry {
  id: string;
  ip_address: string;
  reason: string;
  threat_level: number;
  created_at: any;
  expires_at?: any;
}

export function BaddieBlocker() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [newIp, setNewIp] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'security_blacklist'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlacklistEntry[];
      setEntries(data);
    });

    return () => unsubscribe();
  }, []);

  const addEntry = async () => {
    if (!newIp) return;
    await addDoc(collection(db, 'security_blacklist'), {
      ip_address: newIp,
      reason: newReason || 'Manual Block',
      threat_level: 10,
      created_at: serverTimestamp()
    });
    setNewIp('');
    setNewReason('');
    setIsAdding(false);
  };

  const removeEntry = async (id: string) => {
    await deleteDoc(doc(db, 'security_blacklist', id));
  };

  return (
    <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 -mr-32 -mt-32 rounded-full blur-3xl" />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl">
            <UserX className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Baddie Blocker</h3>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Global IP Blacklist Vault</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Plus className={cn("w-5 h-5 transition-transform", isAdding && "rotate-45")} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8 relative z-10"
          >
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target IP Address</label>
                  <input 
                    type="text"
                    placeholder="0.0.0.0"
                    value={newIp}
                    onChange={e => setNewIp(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 text-sm font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reason for Block</label>
                  <input 
                    type="text"
                    placeholder="e.g. Credential Stuffing"
                    value={newReason}
                    onChange={e => setNewReason(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50 text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={addEntry}
                className="w-full py-3 bg-neon-cyan text-void rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all"
              >
                Inject Block
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {entries.length === 0 ? (
          <div className="p-12 text-center bg-black/20 border border-dashed border-white/10 rounded-2xl">
            <ShieldX className="w-8 h-8 text-slate-700 mx-auto mb-4" />
            <p className="text-xs text-slate-500 uppercase tracking-widest">Blacklist vault is currently empty</p>
          </div>
        ) : (
          entries.map((entry) => (
            <motion.div 
              key={entry.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-neon-cyan/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <ShieldX className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <h5 className="text-xs font-mono text-white">{entry.ip_address}</h5>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">{entry.reason}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Threat Level</p>
                  <p className="text-[10px] text-neon-cyan font-mono">{entry.threat_level}/10</p>
                </div>
                <button 
                  onClick={() => removeEntry(entry.id)}
                  className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
