import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ShieldCheck, Zap, Bot, User, Sparkles, Target, Crosshair } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DispatcherButton } from '../sales/DispatcherButton';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  role: 'USER' | 'MOD' | 'SYSTEM' | 'AI';
}

const AGENTS = [
  { id: 'guru', name: 'GURU_AI', description: 'Neural Intelligence Node', color: 'text-neon-magenta', provider: 'gemini' },
  { id: 'vance', name: 'CMDR_VANCE', description: 'Tactical Fleet Command', color: 'text-neon-cyan', provider: 'openai' },
  { id: 'watchtower', name: 'WATCHTOWER', description: 'Global Surveillance Grid', color: 'text-amber-400', provider: 'gemini' },
  { id: 'nexus', name: 'NEXUS_CORE', description: 'Central Kernel Authority', color: 'text-emerald-400', provider: 'openai' },
  { id: 'chronos', name: 'CHRONOS', description: 'Temporal Data Analyst', color: 'text-amber-400', provider: 'gemini' },
];

export function ChatUplink() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'System', text: 'Secure uplink established. Channel encrypted.', timestamp: 'Now', role: 'SYSTEM' },
    { id: '2', user: 'Observer_Alpha', text: 'Telemetry looks stable from sector 4.', timestamp: '1m ago', role: 'USER' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [marketTarget, setMarketTarget] = useState('canva.com');
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAgentMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notify user when agent changes
  const handleAgentChange = (agent: typeof AGENTS[0]) => {
    if (agent.id === selectedAgent.id) return;
    
    setSelectedAgent(agent);
    
    const systemMsg: ChatMessage = {
      id: Date.now().toString(),
      user: 'System',
      text: `Neural link switched to ${agent.name} (${agent.provider.toUpperCase()}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'SYSTEM'
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Simulate incoming ambient messages (as requested by user code)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const users = ['Unit_7', 'Echo_Base', 'Rover_2', 'Cmdr_Vance', 'Watchtower'];
        const texts = [
          'Confirming visual on target.',
          'Signal strength fluctuating.',
          'Requesting status update.',
          'Packet loss detected in sector 9.',
          'Holding position.',
          'Video feed is clear.',
          'Audio sync looks good.',
        ];
        const newUser = users[Math.floor(Math.random() * users.length)];
        const newText = texts[Math.floor(Math.random() * texts.length)];
        
        const msg: ChatMessage = {
          id: Date.now().toString(),
          user: newUser,
          text: newText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: 'USER'
        };
        setMessages(prev => [...prev.slice(-50), msg]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setInputValue('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      user: 'COMMANDER',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'MOD'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Call our backend proxy based on the selected agent's ID
      const endpoint = `/api/chat-agents/${selectedAgent.id}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          provider: selectedAgent.provider,
          messages: messages.concat(userMsg).map(m => ({
            role: m.role === 'AI' ? 'assistant' : m.role === 'MOD' ? 'user' : 'user',
            content: m.text
          })),
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('Uplink failed');

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user: selectedAgent.name,
        text: data.output,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: 'AI'
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        user: 'System',
        text: 'Error: Neural link interrupted. Check console for logs.',
        timestamp: 'Now',
        role: 'SYSTEM'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 flex flex-col gap-4 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-all duration-500 relative", 
              selectedAgent.color.replace('text-', 'bg-').replace('400', '500/10').replace('magenta', 'magenta/10').replace('cyan', 'cyan/10').replace('emerald', 'emerald/10')
            )}>
              <motion.div 
                key={selectedAgent.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1 }}
                className={cn("absolute inset-0 rounded-lg blur-md", selectedAgent.color.replace('text-', 'bg-'))}
              />
              <Bot className={cn("w-4 h-4 relative z-10 transition-colors duration-500", selectedAgent.color, "drop-shadow-[0_0_5px_currentColor]")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Agent Uplink</h4>
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all group"
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", selectedAgent.color.replace('text-', 'bg-'))} />
                    <span className={cn("text-[9px] font-mono font-bold uppercase", selectedAgent.color)}>{selectedAgent.name}</span>
                    <Zap className={cn("w-3 h-3 transition-transform duration-300", isAgentMenuOpen ? "rotate-180" : "rotate-0", selectedAgent.color)} />
                  </button>

                  <AnimatePresence>
                    {isAgentMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-surface border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
                      >
                        <div className="p-2 border-b border-white/5 bg-white/5">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2">Select Neural Node</span>
                        </div>
                        <div className="p-1">
                          {AGENTS.map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => {
                                handleAgentChange(agent);
                                setIsAgentMenuOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-start gap-3 p-3 rounded-xl transition-all group/item",
                                selectedAgent.id === agent.id 
                                  ? "bg-white/5 border border-white/10" 
                                  : "hover:bg-white/5 border border-transparent"
                              )}
                            >
                              <div className={cn(
                                "p-2 rounded-lg transition-all duration-500 relative",
                                selectedAgent.id === agent.id 
                                  ? agent.color.replace('text-', 'bg-').replace('400', '500/20').replace('magenta', 'magenta/20').replace('cyan', 'cyan/20').replace('emerald', 'emerald/20') 
                                  : "bg-black/40"
                              )}>
                                {selectedAgent.id === agent.id && (
                                  <motion.div 
                                    layoutId="agent-glow"
                                    className={cn("absolute inset-0 rounded-lg blur-sm opacity-30", agent.color.replace('text-', 'bg-'))}
                                  />
                                )}
                                <Bot className={cn(
                                  "w-4 h-4 relative z-10 transition-all duration-500", 
                                  selectedAgent.id === agent.id ? cn(agent.color, "drop-shadow-[0_0_3px_currentColor]") : "text-slate-600 group-hover/item:text-slate-400"
                                )} />
                              </div>
                              <div className="flex flex-col items-start text-left">
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", 
                                  selectedAgent.id === agent.id ? agent.color : "text-slate-400 group-hover/item:text-slate-200"
                                )}>
                                  {agent.name}
                                </span>
                                <span className="text-[8px] text-slate-500 uppercase tracking-tighter mt-0.5">
                                  {agent.description}
                                </span>
                                <div className="mt-1.5 flex items-center gap-2">
                                  <span className="text-[7px] font-mono text-slate-600 uppercase border border-white/5 px-1 rounded bg-black/20">
                                    {agent.provider.toUpperCase()}
                                  </span>
                                  {selectedAgent.id === agent.id && (
                                    <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                      Active
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">STATUS: CONNECTED // PROVIDER: {selectedAgent.provider.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-500 font-mono uppercase">Live_Feed</span>
          </div>
        </div>

      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10" 
        ref={scrollRef}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex flex-col",
            msg.role === 'SYSTEM' ? 'items-center my-4' : 'items-start',
            msg.role === 'AI' ? 'items-end' : ''
          )}>
            {msg.role === 'SYSTEM' ? (
              <span className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                {msg.text}
              </span>
            ) : (
              <div className={cn(
                "max-w-[85%] group",
                msg.role === 'AI' ? 'text-right' : 'text-left'
              )}>
                <div className={cn(
                  "flex items-center gap-2 mb-1.5",
                  msg.role === 'AI' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  {msg.role === 'MOD' && <ShieldCheck size={12} className="text-neon-cyan" />}
                  {msg.role === 'AI' && (
                    <Sparkles 
                      size={12} 
                      className={cn(
                        AGENTS.find(a => a.name === msg.user)?.color || 'text-neon-magenta'
                      )} 
                    />
                  )}
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    msg.role === 'MOD' ? 'text-neon-cyan' : 
                    msg.role === 'AI' ? (AGENTS.find(a => a.name === msg.user)?.color || 'text-neon-magenta') : 'text-slate-500'
                  )}>
                    {msg.user}
                  </span>
                  <span className="text-[9px] text-slate-700 font-mono">{msg.timestamp}</span>
                </div>
                <div className={cn(
                  "text-xs p-4 rounded-2xl border transition-all duration-300",
                  msg.role === 'MOD' 
                    ? 'bg-neon-cyan/5 border-neon-cyan/20 text-slate-200 rounded-tl-none' 
                    : msg.role === 'AI'
                    ? 'bg-neon-magenta/5 border-neon-magenta/20 text-slate-200 rounded-tr-none shadow-[0_0_20px_rgba(255,0,255,0.05)]'
                    : 'bg-white/5 border-white/5 text-slate-400 rounded-tl-none'
                )}>
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1.5 flex-row-reverse">
              <Sparkles size={12} className={cn("animate-pulse", selectedAgent.color.replace('text-', 'text-'))} />
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", selectedAgent.color)}>
                {selectedAgent.name}
              </span>
            </div>
            <div className={cn(
              "p-4 rounded-2xl rounded-tr-none border",
              selectedAgent.color.replace('text-', 'bg-').replace('text-', 'border-').replace('400', '500/20').replace('magenta', 'magenta/20').replace('cyan', 'cyan/20').replace('emerald', 'emerald/20')
            )}>
              <div className="flex gap-1">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce", selectedAgent.color.replace('text-', 'bg-'))} style={{ animationDelay: '0ms' }} />
                <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce", selectedAgent.color.replace('text-', 'bg-'))} style={{ animationDelay: '150ms' }} />
                <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce", selectedAgent.color.replace('text-', 'bg-'))} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-6 border-t border-white/5 bg-black/60 backdrop-blur-2xl">
        {/* Market Dispatcher Quick-Action */}
        <div className="mb-6 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <Crosshair className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Market Dispatcher</span>
              <span className="text-[8px] text-slate-500 font-mono">STATUS: READY_FOR_OFFENSE</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={marketTarget}
                onChange={(e) => setMarketTarget(e.target.value)}
                placeholder="Target Domain..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-rose-500/50 font-mono"
              />
              <DispatcherButton targetDomain={marketTarget} className="flex-1" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSend} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan to-neon-magenta opacity-10 group-focus-within:opacity-30 transition duration-500 rounded-xl blur"></div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Broadcast command to agents..."
              disabled={isTyping}
              className="w-full bg-void border border-white/10 rounded-xl pl-5 pr-14 py-4 text-sm text-white focus:outline-none focus:border-neon-cyan/50 font-mono transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isTyping}
              className="absolute right-3 p-2 text-slate-500 hover:text-neon-cyan transition-all hover:scale-110 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3 text-neon-cyan" />
              Direct Uplink
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Bot className="w-3 h-3 text-neon-magenta" />
              AI Assisted
            </div>
          </div>
          <span className="text-[9px] text-slate-700 font-mono uppercase">Encryption: AES-256-GCM</span>
        </div>
      </form>
    </div>
  </div>
  );
}
