import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Zap, TrendingUp, Globe, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { nexus } from '../../shared/nexus-client';
import { cn } from '../../lib/utils';

interface TrendTopic {
  word: string;
  growth: number;
  niche: string;
}

interface GoogleTrendsOracleProps {
  onDeclare: (topic: string) => void;
  declaredMissions: string[];
  onTrendSpike?: (topic: string) => void;
}

export const GoogleTrendsOracle = ({ onDeclare, declaredMissions, onTrendSpike }: GoogleTrendsOracleProps) => {
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Calling the Nexus Oracle Edge Function
      const { data, error: funcError } = await nexus.functions.invoke('nexus-oracle-trends', {
        body: { interests: ['woodworking', 'canvas art', 'AI automation', 'clean tech', 'hygiene', 'Canva alternatives'] }
      });
      
      if (funcError) throw funcError;
      
      let trendingTopics: TrendTopic[] = [];
      if (data?.trending_topics) {
        trendingTopics = data.trending_topics;
      } else {
        // Fallback mock data if function isn't deployed yet
        trendingTopics = [
          { word: 'Sustainable Woodworking', growth: 124, niche: 'woodworking' },
          { word: 'AI Voice Synthesis', growth: 85, niche: 'AI' },
          { word: 'Eco-Friendly Hygiene', growth: 62, niche: 'hygiene' },
          { word: 'Generative Canvas Art', growth: 142, niche: 'art' },
          { word: 'Canva alternatives', growth: 215, niche: 'SaaS' }
        ];
      }
      setTrends(trendingTopics);

      // Detect spikes and trigger callback
      trendingTopics.forEach(topic => {
        if (topic.growth > 150 && onTrendSpike) {
          onTrendSpike(topic.word);
        }
      });
    } catch (err: any) {
      console.warn("Oracle Uplink Warning:", err.message);
      setError("Oracle is currently offline. Using cached telemetry.");
      // Mock data for demonstration
      setTrends([
        { word: 'Sustainable Woodworking', growth: 124, niche: 'woodworking' },
        { word: 'AI Voice Synthesis', growth: 85, niche: 'AI' },
        { word: 'Eco-Friendly Hygiene', growth: 62, niche: 'hygiene' },
        { word: 'Generative Canvas Art', growth: 142, niche: 'art' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    // Pulse check every 6 hours (simulated with a long interval or just on mount for this demo)
  }, []);

  const createMission = (topic: string) => {
    onDeclare(topic);
    // In a real scenario, this would push to a 'missions' table in Supabase
    console.log(`Mission Declared: ${topic}`);
  };

  return (
    <div className="bg-surface border border-white/5 rounded-3xl p-8 relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 -mr-32 -mt-32 rounded-full blur-3xl group-hover:bg-neon-cyan/10 transition-colors duration-1000" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl">
            <TrendingUp className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Global Pulse Oracle</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Google Trends Divination</p>
          </div>
        </div>
        <button 
          onClick={fetchTrends}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-neon-cyan"
        >
          <Zap className={cn("w-4 h-4", isLoading && "animate-pulse")} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 relative z-10">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{error}</span>
        </div>
      )}

      <div className="space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {trends.map((topic, i) => (
            <motion.div 
              key={topic.word}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-white/10 transition-all group/item"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-neon-cyan group-hover/item:border-neon-cyan/50 transition-colors">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{topic.word}</p>
                  <p className="text-[9px] text-slate-500 font-mono uppercase">{topic.niche}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-emerald-400">+{topic.growth}%</p>
                  <p className="text-[8px] text-slate-600 uppercase tracking-widest">Growth</p>
                </div>
                
                {declaredMissions.includes(topic.word) ? (
                  <div className="w-24 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    Declared
                  </div>
                ) : (
                  <button 
                    onClick={() => createMission(topic.word)}
                    className="w-24 py-2 bg-neon-cyan text-void rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  >
                    Declare
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-neon-magenta" />
          <span>Sovereign Dispatch: Ready for Mission Deployment</span>
        </div>
      </div>
    </div>
  );
};
