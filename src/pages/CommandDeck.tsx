import React, { useState, useEffect } from 'react';
import { AgentSelector, AgentType } from '../components/dashboard/AgentSelector';
import { LiveGlobe } from '../components/war-room/LiveGlobe';
import { BuildMode } from '../components/builder/BuildMode';
import { supabase } from '../lib/supabase';
import { 
  Terminal, 
  Cpu, 
  Network, 
  Zap, 
  MessageSquare, 
  Code, 
  Play, 
  History,
  Layout,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandDeck = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('commander');
  const [isBuildMode, setIsBuildMode] = useState(false);
  const [command, setCommand] = useState('');
  const [credits, setCredits] = useState(50);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch credits from user_credits table
      const fetchCredits = async () => {
        const { data, error } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          setCredits(data.balance);
        }
      };
      fetchCredits();
    }
  }, [user]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Login error:', error);
  };

  const handleSendCommand = () => {
    if (command.trim()) {
      setIsBuildMode(true);
    }
  };

  if (isBuildMode) {
    return <BuildMode onBack={() => setIsBuildMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-void p-6 lg:p-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-neon-cyan rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Terminal className="w-5 h-5 text-void" />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter text-white">MYCANVAS<span className="text-neon-cyan">.DESIGN</span></h1>
          </div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">Strategic Command Interface // v2.5.0</p>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 bg-surface border border-white/5 p-2 rounded-xl">
              <div className="flex flex-col items-end px-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Credits</span>
                <span className="text-sm font-mono text-neon-cyan font-bold">{credits.toFixed(2)} NC</span>
              </div>
              <button className="px-4 py-2 bg-neon-cyan text-void font-bold text-xs rounded-lg hover:bg-white transition-colors uppercase tracking-widest">
                Refill
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-6 py-3 bg-surface border border-neon-cyan/30 text-neon-cyan font-bold text-xs rounded-xl hover:bg-neon-cyan hover:text-void transition-all uppercase tracking-widest"
            >
              <LogIn className="w-4 h-4" />
              Initialize Uplink
            </button>
          )}
        </div>
      </header>

      {/* Agent Selection */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Cpu className="w-4 h-4" />
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Select Active Agent</h2>
        </div>
        <AgentSelector selectedAgent={selectedAgent} onSelect={setSelectedAgent} />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: War Room & Stats */}
        <div className="space-y-8">
          <div className="bg-surface border border-white/5 rounded-3xl p-1 overflow-hidden">
            <LiveGlobe />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-neon-cyan mb-2">
                <Network className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Network</span>
              </div>
              <div className="text-2xl font-mono font-bold">99.9%</div>
              <div className="text-[10px] text-slate-500 mt-1">Uptime Stable</div>
            </div>
            <div className="bg-surface border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-neon-magenta mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Latency</span>
              </div>
              <div className="text-2xl font-mono font-bold">12ms</div>
              <div className="text-[10px] text-slate-500 mt-1">Edge Optimized</div>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Chat & Preview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-white/5 rounded-3xl p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6 border-bottom border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-bold text-white uppercase tracking-widest text-sm">Agent Uplink: {selectedAgent}</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <History className="w-4 h-4 text-slate-500" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Layout className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-4 h-4 text-neon-cyan" />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-white/5">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Uplink established. I am the <span className="text-neon-cyan font-bold uppercase">{selectedAgent}</span>. 
                    Ready to execute your architectural vision. What shall we build today, Commander?
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                placeholder={`Command the ${selectedAgent}...`}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-colors pr-16"
              />
              <button 
                onClick={handleSendCommand}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-neon-cyan text-void rounded-xl hover:bg-white transition-colors"
              >
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
          © 2026 MyCanvas.design // Neural Interface v4.2
        </p>
        <div className="flex gap-6">
          <button className="text-[10px] text-slate-600 hover:text-neon-cyan transition-colors uppercase tracking-widest font-bold">System Logs</button>
          <button className="text-[10px] text-slate-600 hover:text-neon-cyan transition-colors uppercase tracking-widest font-bold">Documentation</button>
          <button className="text-[10px] text-slate-600 hover:text-neon-cyan transition-colors uppercase tracking-widest font-bold">Security Protocols</button>
        </div>
      </footer>
    </div>
  );
};
