import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldCheck, Zap, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  role: 'USER' | 'MOD' | 'SYSTEM' | 'AI';
}

export function ChatUplink() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'System', text: 'Secure uplink established. Channel encrypted.', timestamp: 'Now', role: 'SYSTEM' },
    { id: '2', user: 'Observer_Alpha', text: 'Telemetry looks stable from sector 4.', timestamp: '1m ago', role: 'USER' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
      // Call our backend proxy for Gemini
      const response = await fetch('/api/chat-agents/gemini', {
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
        user: 'GURU_AI',
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
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
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
              <Sparkles size={12} className="text-neon-magenta animate-pulse" />
              <span className="text-[10px] font-bold text-neon-magenta uppercase tracking-widest">GURU_AI</span>
            </div>
            <div className="bg-neon-magenta/5 border border-neon-magenta/20 p-4 rounded-2xl rounded-tr-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-neon-magenta rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-neon-magenta rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-neon-magenta rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="relative group">
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
  );
}
