import React, { useState } from 'react';
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview,
  SandpackFileExplorer
} from "@codesandbox/sandpack-react";
import { 
  ChevronLeft, 
  Maximize2, 
  Download, 
  Share2, 
  Video,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BuildMode = ({ initialCode, onBack }: { initialCode?: string, onBack: () => void }) => {
  const [code, setCode] = useState(initialCode || `import React from "react";
import { motion } from "framer-motion";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-2xl"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Hello MyCanvas</h1>
        <p className="text-slate-400">AI-Generated React Component</p>
      </motion.div>
    </div>
  );
}
`);

  return (
    <div className="fixed inset-0 z-50 bg-void flex flex-col">
      {/* Build Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white uppercase tracking-widest">Build Mode</span>
            <span className="text-[10px] text-neon-cyan font-mono">project_alpha_v1.tsx</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5 transition-colors">
            <Video className="w-4 h-4 text-neon-magenta" />
            Generate Promo
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-void rounded-xl text-xs font-bold hover:bg-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Share2 className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Build Area */}
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          template="react"
          theme="dark"
          files={{
            "/App.js": code,
          }}
          customSetup={{
            dependencies: {
              "framer-motion": "latest",
              "lucide-react": "latest",
              "clsx": "latest",
              "tailwind-merge": "latest"
            }
          }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
        >
          <SandpackLayout className="h-full border-none">
            <div className="w-[30%] border-r border-white/5 flex flex-col bg-surface">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Chat History</span>
                <Zap className="w-3 h-3 text-neon-cyan" />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-400">Commander: Create a modern landing page hero with neon accents and motion animations.</p>
                </div>
                <div className="bg-neon-cyan/5 p-3 rounded-xl border border-neon-cyan/20">
                  <p className="text-xs text-neon-cyan">Guru: Generating React structure using framer-motion for smooth transitions...</p>
                </div>
              </div>
              <div className="p-4 border-t border-white/5">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Refine code..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-neon-cyan/30"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative">
                <SandpackPreview 
                  className="h-full" 
                  showOpenInCodeSandbox={false}
                  showRefreshButton={true}
                />
              </div>
              <div className="h-[40%] border-t border-white/5">
                <SandpackCodeEditor 
                  className="h-full" 
                  showTabs={true}
                  showLineNumbers={true}
                />
              </div>
            </div>
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
};
