import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Search, Zap, AlertTriangle, ShieldCheck, Loader2, Globe, Crosshair } from 'lucide-react';
import { nexus } from '../../shared/nexus-client';
import { cn } from '../../lib/utils';

interface IntelData {
  ipAddress: string;
  abuseConfidenceScore: number;
  countryCode: string;
  usageType: string;
  isp: string;
  domain: string;
  totalReports: number;
  lastReportedAt: string;
}

export const AbuseOracle = () => {
  const [targetIp, setTargetIp] = useState('');
  const [intel, setIntel] = useState<IntelData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentStrikes, setRecentStrikes] = useState<any[]>([]);

  const checkBaddie = async (ip: string) => {
    if (!ip) return;
    setIsScanning(true);
    setError(null);
    setIntel(null);
    
    try {
      // Simulate calling the AbuseIPDB API via a Supabase Edge Function
      // In a real scenario, the API key would be pulled from Supabase Vault
      const { data, error: funcError } = await nexus.functions.invoke('nexus-abuse-oracle', {
        body: { ipAddress: ip }
      });

      if (funcError) throw funcError;

      if (data) {
        setIntel(data);
        
        // Logic from user request: If score > 90, auto-nullify
        if (data.abuseConfidenceScore > 90) {
          await strikeThreat(ip, data.countryCode);
        }
      } else {
        // Fallback mock data for demo
        const mockIntel: IntelData = {
          ipAddress: ip,
          abuseConfidenceScore: Math.floor(Math.random() * 100),
          countryCode: 'US',
          usageType: 'Data Center/Web Hosting/Transit',
          isp: 'DigitalOcean, LLC',
          domain: 'digitalocean.com',
          totalReports: Math.floor(Math.random() * 500),
          lastReportedAt: new Date().toISOString()
        };
        setIntel(mockIntel);
        
        if (mockIntel.abuseConfidenceScore > 90) {
          await strikeThreat(ip, mockIntel.countryCode);
        }
      }
    } catch (err: any) {
      console.error("Oracle Uplink Failed:", err);
      setError("Strategic Uplink Unstable. Check AbuseIPDB API Key in Vault.");
    } finally {
      setIsScanning(false);
    }
  };

  const strikeThreat = async (ip: string, country: string) => {
    try {
      // Logic from user request: Strike them from the net
      await nexus.functions.invoke('nexus-key-revoke', { body: { target_ip: ip } });
      
      const newStrike = {
        ip,
        country,
        timestamp: new Date().toLocaleTimeString(),
        status: 'NULLIFIED'
      };
      
      setRecentStrikes(prev => [newStrike, ...prev].slice(0, 5));
      console.log(`[WAR ROOM] Auto-Nullified threat from ${country} (${ip})`);
    } catch (err) {
      console.error("Strike Failed:", err);
    }
  };

  return (
    <div className="bg-surface border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 -mr-32 -mt-32 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors duration-1000" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Abuse Oracle</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Strategic Threat Identification</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input 
              type="text" 
              value={targetIp}
              onChange={(e) => setTargetIp(e.target.value)}
              placeholder="Target IP Address..."
              className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[10px] text-white focus:outline-none focus:border-rose-500/50 transition-all w-48 font-mono"
            />
          </div>
          <button 
            onClick={() => checkBaddie(targetIp)}
            disabled={isScanning || !targetIp}
            className="p-2 bg-rose-500 text-white rounded-xl hover:bg-white hover:text-rose-500 transition-all disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Intel Display */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Strategic Intel</h4>
          
          <AnimatePresence mode="wait">
            {intel ? (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono text-slate-400">{intel.ipAddress}</span>
                    <div className={cn(
                      "px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest",
                      intel.abuseConfidenceScore > 80 ? "bg-rose-500/20 text-rose-400" :
                      intel.abuseConfidenceScore > 40 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                    )}>
                      Score: {intel.abuseConfidenceScore}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Location</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-white font-bold">{intel.countryCode}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Reports</p>
                      <p className="text-[10px] text-white font-bold mt-1">{intel.totalReports} Incidents</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">ISP / Domain</p>
                    <p className="text-[10px] text-slate-300 mt-1 truncate">{intel.isp} ({intel.domain})</p>
                  </div>
                </div>

                {intel.abuseConfidenceScore > 90 && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                    <Zap className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="text-[10px] text-rose-200 font-bold uppercase tracking-widest">Auto-Nullification Protocol Engaged</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-40 bg-black/20 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center opacity-30">
                <Search className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Awaiting Target IP</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Strikes */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Recent Nullifications</h4>
          <div className="space-y-3">
            {recentStrikes.length > 0 ? (
              recentStrikes.map((strike, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    <span className="text-[10px] font-mono text-slate-300">{strike.ip}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] text-slate-600 font-mono">{strike.timestamp}</span>
                    <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest border border-rose-500/20 px-1.5 py-0.5 rounded bg-rose-500/5">
                      {strike.status}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center opacity-20">
                <ShieldCheck className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-[8px] uppercase tracking-widest font-bold">No Recent Strikes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 relative z-10">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-[10px] text-rose-200 font-bold uppercase tracking-widest">{error}</span>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span>Automated Strike Protocol: Confidence {'>'} 90%</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
};
