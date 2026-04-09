import React, { useState, useEffect, useRef } from 'react';
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
  const [marketTarget, setMarketTarget] = useState('canva.com');
  const scrollRef = useRef<HTMLDivElement>(null);

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
      // Call our backend proxy based on the selected agent's provider
      const endpoint = selectedAgent.provider === 'openai' ? '/api/chat-agents/openai' : '/api/chat-agents/gemini';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
            <div className="p-2 bg-neon-cyan/10 rounded-lg">
              <Bot className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Agent Uplink</h4>
              <p className="text-[10px] text-emerald-400 font-mono">STATUS: CONNECTED</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-500 font-mono uppercase">Live_Feed</span>
          </div>
        </div>

        {/* Agent Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl border transition-all flex flex-col items-start gap-1 relative",
                selectedAgent.id === agent.id 
                  ? "bg-white/10 border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.1)] ring-2 ring-white/20 scale-[1.02]" 
                  : "bg-transparent border-white/5 hover:border-white/10 opacity-70 hover:opacity-100"
              )}
            >
              {selectedAgent.id === agent.id && (
                <div className={cn("absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse", agent.color.replace('text-', 'bg-'))} />
              )}
              <span className={cn("text-[9px] font-bold uppercase tracking-widest", agent.color)}>
                {agent.name}
              </span>
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[8px] text-slate-500 uppercase tracking-tighter">
                  {agent.description}
                </span>
                <span className="text-[7px] text-slate-600 font-mono border border-white/5 px-1 rounded bg-black/20">
                  {agent.provider.toUpperCase()}
                </span>
              </div>
            </button>
          ))}
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
                  {msg.role === 'AI' && <Sparkles size={12} className="text-neon-magenta" />}
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    msg.role === 'MOD' ? 'text-neon-cyan' : 
                    msg.role === 'AI' ? 'text-neon-magenta' : 'text-slate-500'
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
              selectedAgent.id === 'guru' ? 'bg-neon-magenta/5 border-neon-magenta/20' :
              selectedAgent.id === 'vance' ? 'bg-neon-cyan/5 border-neon-cyan/20' :
              selectedAgent.id === 'watchtower' ? 'bg-amber-500/5 border-amber-500/20' :
              'bg-emerald-500/5 border-emerald-500/20'
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
