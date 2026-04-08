import React, { useState } from 'react';
import { Globe, Shield, Save, Plus, Trash2 } from 'lucide-react';
import { nexus } from '../../shared/nexus-client';
import { cn } from '../../lib/utils';

interface ShellConfig {
  domain_url: string;
  shell_name: string;
  google_id: string;
  nexus_env: string;
}

export function ShellConfigInput() {
  const [config, setConfig] = useState<ShellConfig>({ 
    domain_url: '', 
    shell_name: '', 
    google_id: '',
    nexus_env: 'production'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [shells, setShells] = useState<ShellConfig[]>([]);

  const fetchShells = async () => {
    const { data, error } = await nexus.from('nexus_identities').select('*');
    if (!error && data) setShells(data);
  };

  React.useEffect(() => {
    fetchShells();
  }, []);

  const saveConfig = async () => {
    if (!config.domain_url || !config.shell_name) {
      alert("Domain and Name are required for identity injection.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await nexus
        .from('nexus_identities')
        .upsert({ 
          domain_url: config.domain_url, 
          shell_name: config.shell_name, 
          google_id: config.google_id,
          nexus_env: config.nexus_env
        });
        
      if (error) throw error;
      
      alert("Deed Declared: Shell Identity Forged.");
      fetchShells();
      setConfig({ domain_url: '', shell_name: '', google_id: '', nexus_env: 'production' });
    } catch (err: any) {
      console.error("Forge Error:", err.message);
      alert("Forge Failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const revokeIdentity = async (domain: string) => {
    const confirmed = window.confirm(`Revoke identity for ${domain}? This will disconnect the shell.`);
    if (confirmed) {
      const { error } = await nexus.from('nexus_identities').delete().eq('domain_url', domain);
      if (!error) {
        alert("Identity Quenched: Shell Disconnected.");
        fetchShells();
      }
    }
  };

  return (
    <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 -mr-32 -mt-32 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl">
          <Shield className="w-5 h-5 text-neon-cyan" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Identity Forge</h3>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Articulate the shell's DNA directly from the Bridge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Domain URL</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text"
              placeholder="e.g. mycanvaslab.com"
              value={config.domain_url}
              onChange={e => setConfig({...config, domain_url: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Shell Name</label>
          <input 
            type="text"
            placeholder="e.g. MyCanvas Studio"
            value={config.shell_name}
            onChange={e => setConfig({...config, shell_name: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Environment</label>
          <select 
            value={config.nexus_env}
            onChange={e => setConfig({...config, nexus_env: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm appearance-none"
          >
            <option value="production">Production</option>
            <option value="development">Development</option>
            <option value="maintenance">Maintenance</option>
            <option value="beta">Beta</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Google Client ID</label>
          <input 
            type="text"
            placeholder="your-google-client-id"
            value={config.google_id}
            onChange={e => setConfig({...config, google_id: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm font-mono"
          />
        </div>
      </div>

      <button 
        onClick={saveConfig}
        disabled={isSaving}
        className="w-full py-5 bg-neon-cyan text-void rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:bg-white disabled:opacity-50 flex items-center justify-center gap-3 relative z-10"
      >
        <Plus className="w-4 h-4" />
        Forge DNA
      </button>

      {shells.length > 0 && (
        <div className="mt-12 space-y-4 relative z-10">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Active Shell Identities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shells.map((s, i) => (
              <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-neon-cyan/30 transition-all">
                <div>
                  <p className="text-xs font-bold text-white">{s.shell_name}</p>
                  <p className="text-[9px] font-mono text-slate-500">{s.domain_url}</p>
                  <span className={cn(
                    "text-[8px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest",
                    s.nexus_env === 'production' ? "bg-emerald-500/10 text-emerald-400" : "bg-neon-cyan/10 text-neon-cyan"
                  )}>
                    {s.nexus_env}
                  </span>
                  <p className="text-[8px] font-mono text-slate-600 mt-1 truncate max-w-[150px]">
                    ID: {s.google_id || 'NONE'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => revokeIdentity(s.domain_url)}
                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
