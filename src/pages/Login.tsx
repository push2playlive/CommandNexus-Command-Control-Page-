import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Globe, 
  Zap, 
  Cpu,
  Fingerprint,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { loginToNetwork, loginWithEmail, signUpWithEmail } from '../shared/nexus-client';
import { cn } from '../lib/utils';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginToNetwork();
    } catch (err: any) {
      setError(err.message || "Google Uplink Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        alert("Verification link sent to your email.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypass = () => {
    const mockUser = {
      id: 'dev-architect',
      email: 'architect@nexus.local',
      user_metadata: {
        full_name: 'Lead Architect',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Architect'
      }
    };
    localStorage.setItem('nexus_bypass_user', JSON.stringify(mockUser));
    window.location.reload(); // Trigger re-check
  };

  return (
    <div className="h-screen bg-void flex items-center justify-center p-6 relative overflow-y-auto custom-scrollbar">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-magenta/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-surface border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-neon-cyan/10 border border-neon-cyan/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.15)] group">
              <Shield className="w-10 h-10 text-neon-cyan group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tighter text-center">
              COMMAND<span className="text-neon-cyan">NEXUS</span>
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">
              Global Strategic Interface
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <p className="text-xs text-rose-200">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-neon-cyan transition-colors" />
                <input 
                  type="email"
                  required
                  placeholder="name@nexus.net"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Code</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-neon-cyan transition-colors" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm font-mono"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-neon-cyan text-void rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:bg-white disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Initialize Uplink' : 'Forge Identity'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">OR</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <Globe className="w-4 h-4 text-neon-cyan" />
            Connect via Google
          </button>

          <div className="mt-4">
            <button 
              onClick={handleBypass}
              className="w-full py-4 bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/20 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-neon-magenta hover:text-white transition-all flex items-center justify-center gap-3 group"
            >
              <Zap className="w-4 h-4 group-hover:animate-pulse" />
              Bypass Strategic Shield
            </button>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-bold text-slate-500 hover:text-neon-cyan uppercase tracking-widest transition-colors"
            >
              {isLogin ? "Need a new identity? Forge here" : "Already articulated? Uplink here"}
            </button>
          </div>

          {/* Connection Status */}
          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Nexus Bridge: Active</span>
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-neon-magenta rounded-full" />
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Encryption: AES-256</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex justify-center gap-8 opacity-30">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3 h-3" />
            <span className="text-[8px] font-mono uppercase tracking-widest">Biometric Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3" />
            <span className="text-[8px] font-mono uppercase tracking-widest">Neural Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span className="text-[8px] font-mono uppercase tracking-widest">Instant Sync</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
