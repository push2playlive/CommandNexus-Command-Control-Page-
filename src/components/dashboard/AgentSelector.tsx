import React from 'react';
import { Shield, Brain, Palette, CheckCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export type AgentType = 'commander' | 'guru' | 'artist' | 'verifier';

interface Agent {
  id: AgentType;
  name: string;
  role: string;
  icon: any;
  color: string;
  description: string;
}

const agents: Agent[] = [
  {
    id: 'commander',
    name: 'Commander',
    role: 'Admin / Strategy',
    icon: Shield,
    color: 'text-neon-cyan border-neon-cyan/50 bg-neon-cyan/5',
    description: 'High-level orchestration and system management.'
  },
  {
    id: 'guru',
    name: 'Guru',
    role: 'Knowledge / Logic',
    icon: Brain,
    color: 'text-purple-400 border-purple-500/50 bg-purple-500/5',
    description: 'Deep reasoning and architectural insights.'
  },
  {
    id: 'artist',
    name: 'Artist',
    role: 'Creative / Visuals',
    icon: Palette,
    color: 'text-neon-magenta border-neon-magenta/50 bg-neon-magenta/5',
    description: 'Visual generation and aesthetic direction.'
  },
  {
    id: 'verifier',
    name: 'Verifier',
    role: 'QA / Security',
    icon: CheckCircle,
    color: 'text-neon-green border-neon-green/50 bg-neon-green/5',
    description: 'Code verification and security auditing.'
  }
];

interface AgentSelectorProps {
  selectedAgent: AgentType;
  onSelect: (id: AgentType) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ selectedAgent, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {agents.map((agent) => (
        <motion.button
          key={agent.id}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(agent.id)}
          className={cn(
            "relative p-5 rounded-2xl border transition-all duration-300 text-left group",
            agent.color,
            selectedAgent === agent.id 
              ? "ring-2 ring-offset-2 ring-offset-void ring-current shadow-[0_0_20px_rgba(0,240,255,0.2)]" 
              : "opacity-60 hover:opacity-100"
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-black/40">
              <agent.icon className="w-6 h-6" />
            </div>
            {selectedAgent === agent.id && (
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            )}
          </div>
          <h3 className="font-bold text-white tracking-tight">{agent.name}</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mt-1">{agent.role}</p>
          <p className="text-xs text-slate-400 mt-3 line-clamp-2 group-hover:text-slate-300 transition-colors">
            {agent.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
};
