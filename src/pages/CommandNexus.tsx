import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Settings,
  Download,
  AlertTriangle,
  Zap,
  Users,
  Activity,
  Globe,
  FileText,
  Terminal,
  Cpu,
  Network,
  Play,
  History,
  Layout,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Lock,
  Database,
  Server,
  BarChart3,
  Clock,
  Cloud,
  Wind,
  Sun,
  Map as MapIcon,
  MousePointer2,
  MessageSquare,
  Code,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { scanFrontendCode } from '../services/geminiService';
import { ChatUplink } from '../components/chat/ChatUplink';
import { AccessControlWidget } from '../components/security/AccessControlWidget';
import { SecurityPulse } from '../components/security/SecurityPulse';
import { BaddieBlocker } from '../components/security/BaddieBlocker';
import { NetworkRadar } from '../components/security/NetworkRadar';
import { ShellConfigInput } from '../components/dashboard/ShellConfigInput';
import { IntegrationManager } from '../components/bridge/IntegrationManager';
import { AppRegistry } from '../components/bridge/AppRegistry';
import { NexusShare } from '../components/bridge/NexusShare';
import { IdentityForge } from '../components/bridge/IdentityForge';
import { MarketTrendsIntelligence } from '../components/sales/MarketTrendsIntelligence';
import { GoogleTrendsOracle } from '../components/security/GoogleTrendsOracle';
import { nexus, loginToNetwork } from '../shared/nexus-client';
import { useNexusHeartbeat } from '../hooks/useNexusHeartbeat';
import { useNexusCore } from '../hooks/useNexusCore';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';

// --- TYPES ---

type TabType = 'overview' | 'security' | 'sales' | 'whitelabel' | 'plans' | 'terminal' | 'chat' | 'nexus';

// --- MOCK DATA ---

const visitorData = [
  { name: '00:00', count: 400 },
  { name: '04:00', count: 300 },
  { name: '08:00', count: 600 },
  { name: '12:00', count: 800 },
  { name: '16:00', count: 500 },
  { name: '20:00', count: 900 },
  { name: '23:59', count: 1100 },
];

const salesData = [
  { name: 'Week 1', amount: 1200 },
  { name: 'Week 2', amount: 1900 },
  { name: 'Week 3', amount: 1500 },
  { name: 'Week 4', amount: 2400 },
];

const COLORS = ['#00f0ff', '#ff00ff', '#00ff00', '#ffff00'];

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, trend, color, subtext }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-surface border border-white/5 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden group"
  >
    <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-5 -mr-8 -mt-8 rounded-full", color)} />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{title}</p>
        <h3 className="text-2xl font-mono font-bold text-white mt-1">{value}</h3>
        {trend !== undefined && (
          <p className={cn("text-[10px] mt-2 font-bold", trend > 0 ? "text-emerald-400" : "text-rose-400")}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% <span className="text-slate-600 font-normal">vs last period</span>
          </p>
        )}
        {subtext && <p className="text-[10px] text-slate-600 mt-1">{subtext}</p>}
      </div>
      <div className={cn("p-3 rounded-xl shadow-lg", color, "shadow-current/20")}>
        <Icon className="w-5 h-5 text-void" />
      </div>
    </div>
  </motion.div>
);

const PricingTier = ({ title, price, features, recommended, onSelect }: any) => (
  <div className={cn(
    "p-8 rounded-3xl border transition-all duration-500 relative group",
    recommended 
      ? "bg-neon-cyan/5 border-neon-cyan shadow-[0_0_30px_rgba(0,240,255,0.1)] scale-105 z-10" 
      : "bg-surface border-white/5 hover:border-white/20"
  )}>
    {recommended && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon-cyan text-void text-[10px] font-bold uppercase tracking-widest rounded-full">
        Most Sophisticated
      </div>
    )}
    <h4 className="text-xl font-bold text-white tracking-tight">{title}</h4>
    <div className="mt-4 flex items-baseline">
      <span className="text-4xl font-mono font-bold text-white">${price}</span>
      <span className="text-slate-500 ml-2 text-xs uppercase tracking-widest">/mo</span>
    </div>
    <ul className="mt-8 space-y-4">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-center text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 mr-3 text-neon-cyan" />
          {f}
        </li>
      ))}
    </ul>
    <button 
      onClick={onSelect}
      className={cn(
        "w-full mt-8 py-4 rounded-xl font-bold transition-all uppercase tracking-widest text-xs",
        recommended 
          ? "bg-neon-cyan text-void hover:bg-white shadow-[0_0_15px_rgba(0,240,255,0.3)]" 
          : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
      )}
    >
      Initialize Uplink
    </button>
  </div>
);

// --- MAIN PAGE ---

export const CommandNexus = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [uplinks, setUplinks] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [declaredMissions, setDeclaredMissions] = useState<string[]>([]);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [transactionSort, setTransactionSort] = useState<'date' | 'amount'>('date');
  const [codeToScan, setCodeToScan] = useState(`function monitor() {
  const data = eval(window.location.search);
  document.getElementById('output').innerHTML = data;
}`);

  const { user: nexusUser, nexusData, isAuthenticated } = useNexusHeartbeat();
  const nexusCore = useNexusCore();

  const handleNexusLogout = async () => {
    localStorage.removeItem('nexus_bypass_user');
    await nexus.auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    // Fetch stats from backend
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats);

    // Fetch logs from backend
    fetch('/api/logs')
      .then(res => res.json())
      .then(setLogs);

    // Fetch uplinks from backend
    fetch('/api/uplinks')
      .then(res => res.json())
      .then(setUplinks);

    // Real-time listeners could be added here for Firebase
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const result = await scanFrontendCode(codeToScan);
      setScanResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoRepair = () => {
    if (scanResult?.repairedCode) {
      setCodeToScan(scanResult.repairedCode);
      setScanResult(null); // Clear result after repair to show it's applied
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const rows = [
        ["Metric", "Value"],
        ["Total Visitors", stats?.visitors || "0"],
        ["Security Score", "98/100"],
        ["Monthly Revenue", `$${stats?.sales || "0"}`],
        ["Active Apps", stats?.activeApps || "0"]
      ];
      const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "nexus_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("PDF Export initiated. Generating document...");
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'security', label: 'War Room', icon: ShieldCheck },
    { id: 'sales', label: 'Sales & Trends', icon: TrendingUp },
    { id: 'whitelabel', label: 'White Label', icon: Layers },
    { id: 'plans', label: 'Pricing', icon: DollarSign },
    { id: 'chat', label: 'Agent Chat', icon: MessageSquare },
    { id: 'nexus', label: 'Nexus Bridge', icon: Network },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-void text-slate-200 font-sans selection:bg-neon-cyan selection:text-void">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-surface border-r border-white/5 p-4 lg:p-6 z-50 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <img src="/input_file_0.png" alt="CommandNexus Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tighter hidden lg:block">COMMAND<span className="text-neon-cyan">NEXUS</span></h1>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                activeTab === tab.id 
                  ? "bg-neon-cyan text-void shadow-[0_0_20px_rgba(0,240,255,0.2)]" 
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-void" : "group-hover:text-neon-cyan")} />
              <span className="font-bold text-xs uppercase tracking-widest hidden lg:block">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-4 right-4 hidden lg:block">
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Uplink Status</span>
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse shadow-lg",
                nexusCore.env === 'production' ? "bg-emerald-500 shadow-emerald-500/50" : 
                nexusCore.env === 'maintenance' ? "bg-rose-500 shadow-rose-500/50" : "bg-neon-cyan shadow-neon-cyan/50"
              )} />
            </div>
            <p className="text-[10px] text-emerald-400 font-mono uppercase">
              {nexusCore.loading ? 'SYNCING_DNA...' : `${nexusCore.env}_STABLE`}
            </p>
            {!nexusCore.loading && (
              <p className="text-[8px] text-slate-600 font-mono mt-1 uppercase">
                NODE: {nexusCore.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-20 lg:ml-64 p-6 lg:p-10 h-screen overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-neon-cyan rounded-full" />
              <h2 className="text-xs uppercase tracking-[0.4em] font-bold text-slate-500">Command Center // {activeTab}</h2>
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">Strategic Operations</h3>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-white/5 hover:border-white/20 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-slate-300"
            >
              <Download className="w-4 h-4 text-neon-cyan" />
              Export CSV
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-5 py-2.5 bg-neon-cyan text-void rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Visitors" value={stats?.visitors?.toLocaleString() || "0"} icon={Users} trend={12} color="bg-neon-cyan" />
                <StatCard title="Security Score" value="98/100" icon={ShieldCheck} trend={2} color="bg-emerald-500" />
                <StatCard title="Monthly Revenue" value={`$${stats?.sales?.toLocaleString() || "0"}`} icon={DollarSign} trend={8} color="bg-neon-magenta" />
                <StatCard title="Active Apps" value={stats?.activeApps || "0"} icon={Layers} trend={5} color="bg-orange-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <Activity className="w-5 h-5 text-neon-cyan opacity-20" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Visitor Traffic Telemetry</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={visitorData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                          itemStyle={{ color: '#00f0ff' }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#00f0ff" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <BarChart3 className="w-5 h-5 text-neon-magenta opacity-20" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Revenue Distribution</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                          itemStyle={{ color: '#ff00ff' }}
                        />
                        <Bar dataKey="amount" fill="#ff00ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-surface border border-white/5 p-8 rounded-3xl">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Global Traffic Uplink</h4>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <div className="w-2 h-2 bg-neon-cyan rounded-full" />
                        Active
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <div className="w-2 h-2 bg-white/10 rounded-full" />
                        Idle
                      </div>
                    </div>
                  </div>
                  <div className="h-72 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                    <svg viewBox="0 0 800 400" className="w-full h-full opacity-10">
                      <path d="M150,100 Q200,50 250,100 T350,150 T450,100 T550,150 T650,100" fill="none" stroke="#00f0ff" strokeWidth="1" />
                      <circle cx="200" cy="120" r="3" fill="#00f0ff" className="animate-pulse" />
                      <circle cx="450" cy="180" r="3" fill="#00f0ff" className="animate-pulse" />
                      <circle cx="600" cy="140" r="3" fill="#00f0ff" className="animate-pulse" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Globe className="w-12 h-12 text-neon-cyan opacity-20 mb-4 animate-spin-slow" />
                      <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.3em]">Neural Network Active // Mapping Nodes...</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-white/5 p-8 rounded-3xl">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-8">System Logs</h4>
                  <div className="space-y-4 font-mono text-[10px]">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 border-b border-white/5 pb-3 group">
                        <span className="text-slate-600 shrink-0">{log.time}</span>
                        <span className={cn(
                          "transition-colors",
                          log.type === "success" ? "text-emerald-400 group-hover:text-emerald-300" :
                          log.type === "warning" ? "text-rose-400 group-hover:text-rose-300" : "text-neon-cyan group-hover:text-white"
                        )}>
                          {log.msg}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-8 py-3 text-[10px] font-bold text-slate-500 hover:text-neon-cyan transition-all uppercase tracking-[0.2em] border border-white/5 hover:border-neon-cyan/30 rounded-xl">
                    Access Full Archive →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="bg-surface border border-white/5 p-8 rounded-3xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest">Remote Server Uplinks</h4>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Live Telemetry from Distributed Nodes</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[9px] font-mono text-slate-400">
                        ACTIVE_NODES: {uplinks.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uplinks.map((node, i) => (
                      <div key={i} className="p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-neon-cyan/30 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                              node.status === 'online' ? "bg-neon-cyan/10 text-neon-cyan shadow-neon-cyan/5" : "bg-rose-500/10 text-rose-500 shadow-rose-500/5"
                            )}>
                              <Server className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white uppercase tracking-widest">{node.server_name}</h5>
                              <p className="text-[9px] text-slate-600 font-mono">{node.status === 'online' ? 'STABLE_UPLINK' : 'SIGNAL_DEGRADED'}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            node.status === 'online' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-rose-500 shadow-[0_0_10px_#f43f5e]"
                          )} />
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                              <span className="text-slate-500">CPU Load</span>
                              <span className="text-white">{node.cpu_usage}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${node.cpu_usage}%` }}
                                className="h-full bg-neon-cyan"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                              <span className="text-slate-500">Memory</span>
                              <span className="text-white">{node.ram_usage}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${node.ram_usage}%` }}
                                className="h-full bg-neon-magenta"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                              <span className="text-slate-500">Disk Usage</span>
                              <span className="text-white">{node.disk_usage}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${node.disk_usage}%` }}
                                className="h-full bg-emerald-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[8px] font-mono text-slate-700">LAST_SYNC: {new Date(node.updated_at).toLocaleTimeString()}</span>
                          <button className="text-[9px] font-bold text-neon-cyan uppercase tracking-widest hover:text-white transition-colors">Diagnostics →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AccessControlWidget />
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <NetworkRadar />
                </div>
                <div className="lg:col-span-1">
                  <GoogleTrendsOracle 
                    onDeclare={(topic) => setDeclaredMissions(prev => [...prev, topic])}
                    declaredMissions={declaredMissions}
                  />
                </div>
              </div>

              {declaredMissions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border border-neon-magenta/20 p-8 rounded-3xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-neon-magenta/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 bg-neon-magenta/10 border border-neon-magenta/20 rounded-xl">
                      <Zap className="w-5 h-5 text-neon-magenta" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Mission Control</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active Sovereign Dispatches</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {declaredMissions.map((mission) => (
                      <div key={mission} className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between group hover:border-neon-magenta/30 transition-all">
                        <div>
                          <p className="text-[10px] text-neon-magenta font-bold uppercase tracking-widest mb-2">Active Mission</p>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{mission}</h4>
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {['mycanvas.studio', 'utubechat.com', 'hygieneteam.nz'].map((domain, i) => (
                              <div key={domain} className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center text-[8px] font-bold text-slate-500" title={domain}>
                                {domain[0].toUpperCase()}
                              </div>
                            ))}
                          </div>
                          <button className="px-4 py-2 bg-white/5 hover:bg-neon-magenta hover:text-white border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all">
                            Dispatch Brief
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <BaddieBlocker />
                </div>
                <div className="lg:col-span-2">
                  <SecurityPulse />
                </div>
              </div>

              <div className="bg-surface border border-white/5 p-10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">AI Security Sentinel</h3>
                      <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Intelligent Vulnerability Detection & Neural Repair</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Engine: Gemini-3-Flash</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan to-neon-magenta opacity-10 group-hover:opacity-20 transition duration-1000 rounded-2xl blur"></div>
                      <div className="relative bg-black/60 rounded-2xl p-8 border border-white/10 font-mono text-xs leading-relaxed">
                        <div className="flex items-center justify-between mb-6 text-slate-500">
                          <div className="flex items-center gap-3">
                            <Code className="w-4 h-4" />
                            <span className="uppercase tracking-widest">Source_Analysis.tsx</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500/40" />
                            <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                          </div>
                        </div>
                        <textarea 
                          value={codeToScan}
                          onChange={(e) => setCodeToScan(e.target.value)}
                          className="w-full bg-transparent text-emerald-400 focus:outline-none resize-none h-48 custom-scrollbar"
                          spellCheck={false}
                        />
                        {isScanning && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                            <RefreshCw className="w-8 h-8 text-neon-cyan animate-spin mb-4" />
                            <p className="text-neon-cyan text-[10px] font-bold uppercase tracking-[0.3em]">Neural Scan in Progress...</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="flex-1 py-5 bg-neon-cyan text-void rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:bg-white disabled:opacity-50"
                      >
                        Execute AI Scan
                      </button>
                      {scanResult?.repairedCode && (
                        <button 
                          onClick={handleAutoRepair}
                          className="flex-1 py-5 bg-emerald-500 text-void rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-white"
                        >
                          Auto-Repair Neural Link
                        </button>
                      )}
                      <button className="flex-1 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all">
                        Manual Override
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4">Threat Intelligence</h4>
                    <AnimatePresence mode="wait">
                      {scanResult ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          {scanResult.vulnerabilities.map((v: any, i: number) => (
                            <div key={i} className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                              <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="w-4 h-4 text-rose-400" />
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{v.severity} Risk</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">{v.description}</p>
                              <div className="mt-3 pt-3 border-t border-rose-500/10">
                                <p className="text-[10px] text-emerald-400 font-mono">FIX: {v.suggestedFix}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                          <Search className="w-12 h-12 text-slate-500 mb-4" />
                          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">No Active Scan Data</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'plans' && (
            <motion.div 
              key="plans"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <PricingTier 
                title="Entry Level" 
                price="49" 
                features={[
                  "Basic Visitor Tracking",
                  "Manual Security Scans",
                  "Weekly Reports",
                  "1 Frontend Application",
                  "Standard Support"
                ]} 
              />
              <PricingTier 
                title="Professional" 
                price="149" 
                recommended
                features={[
                  "Real-time Monitoring",
                  "AI Security Scanning",
                  "Daily Reports (PDF/CSV)",
                  "5 Frontend Applications",
                  "White Label Dashboard",
                  "Priority Support"
                ]} 
              />
              <PricingTier 
                title="White Label Lease" 
                price="999" 
                features={[
                  "Unlimited Applications",
                  "Automated AI Repairs",
                  "Full Custom Branding",
                  "Custom Domain Mapping",
                  "Google Trends Integration",
                  "Dedicated Support Node"
                ]} 
              />
            </motion.div>
          )}

          {activeTab === 'whitelabel' && (
            <motion.div 
              key="whitelabel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <ShellConfigInput />

              <div className="bg-surface border border-white/5 p-10 rounded-3xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">White Label Lease Configuration</h3>
                  <div className="px-4 py-1 bg-neon-magenta/10 border border-neon-magenta/20 rounded-full text-[10px] font-bold text-neon-magenta uppercase tracking-widest">
                    Active Lease: ARCHITECT_TIER
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Domains (Lease Scope)</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['mycanvas.studio', 'mycanvaslab.com', 'utubechat.com', 'hygieneteam.nz'].map(domain => (
                          <div key={domain} className="px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                            {domain}
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Brand Identity</label>
                      <input 
                        type="text" 
                        placeholder="App Name (e.g. Nexus Prime)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Theme Synthesis</label>
                      <div className="flex gap-4">
                        <div className="relative group">
                          <input type="color" className="w-14 h-14 rounded-xl bg-transparent border-none cursor-pointer relative z-10" defaultValue="#00f0ff" />
                          <div className="absolute inset-0 bg-neon-cyan/20 rounded-xl blur group-hover:blur-md transition-all"></div>
                        </div>
                        <input 
                          type="text" 
                          defaultValue="#00f0ff"
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Uplink (Logo URL)</label>
                      <input 
                        type="text" 
                        placeholder="https://cdn.nexus.net/assets/logo.svg"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-neon-cyan/50 transition-all text-sm"
                      />
                    </div>
                    <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-500">
                      Deploy Rebranded Instance
                    </button>
                  </div>
                  
                  <div className="bg-black/40 rounded-3xl p-10 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="w-24 h-24 bg-white/5 rounded-3xl mb-6 flex items-center justify-center border border-white/10 relative z-10">
                      <Globe className="w-12 h-12 text-slate-500 group-hover:text-neon-cyan transition-colors duration-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white tracking-tight relative z-10">Live Instance Preview</h4>
                    <p className="text-slate-500 mt-3 text-xs leading-relaxed max-w-xs relative z-10 uppercase tracking-widest">Simulate the client-facing dashboard with current branding parameters.</p>
                    <button className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all relative z-10">
                      Initialize Preview
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sales' && (
            <motion.div 
              key="sales"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <MarketTrendsIntelligence />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {[
                  { domain: 'mycanvas.studio', sales: '$12.4k', trend: 15 },
                  { domain: 'mycanvaslab.com', sales: '$8.2k', trend: -4 },
                  { domain: 'utubechat.com', sales: '$24.1k', trend: 22 },
                  { domain: 'hygieneteam.nz', sales: '$5.6k', trend: 8 },
                ].map((site, i) => (
                  <div key={i} className="bg-surface border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{site.domain}</p>
                        <h3 className="text-xl font-mono font-bold text-white mt-1">{site.sales}</h3>
                        <p className={cn("text-[9px] mt-2 font-bold", site.trend > 0 ? "text-emerald-400" : "text-rose-400")}>
                          {site.trend > 0 ? '↑' : '↓'} {Math.abs(site.trend)}%
                        </p>
                      </div>
                      <Globe className="w-4 h-4 text-slate-700 group-hover:text-neon-cyan transition-colors" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-surface border border-white/5 p-8 rounded-3xl">
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest">Revenue Performance Matrix</h4>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg text-[10px] font-bold text-neon-cyan uppercase tracking-widest">All Domains</button>
                        <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all">Google Trends Uplink</button>
                      </div>
                    </div>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                          itemStyle={{ color: '#ff00ff' }}
                        />
                        <Line type="monotone" dataKey="amount" stroke="#ff00ff" strokeWidth={4} dot={{ fill: '#ff00ff', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} shadow="0 0 10px #ff00ff" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-white/5 p-8 rounded-3xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Recent Transactions</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                      {(['all', 'confirmed', 'pending'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setTransactionFilter(f)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                            transactionFilter === f ? "bg-neon-cyan text-void" : "text-slate-500 hover:text-white"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                      {(['date', 'amount'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setTransactionSort(s)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                            transactionSort === s ? "bg-neon-magenta text-white" : "text-slate-500 hover:text-white"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { user: "Alex Rivera", plan: "Professional", amount: 149, date: "Just now", status: "confirmed", timestamp: Date.now() },
                    { user: "Sarah Chen", plan: "Enterprise", amount: 499, date: "2 hours ago", status: "confirmed", timestamp: Date.now() - 2 * 3600000 },
                    { user: "Mike Johnson", plan: "Entry Level", amount: 49, date: "5 hours ago", status: "pending", timestamp: Date.now() - 5 * 3600000 },
                    { user: "Emma Wilson", plan: "Professional", amount: 149, date: "Yesterday", status: "confirmed", timestamp: Date.now() - 24 * 3600000 },
                    { user: "David Park", plan: "Enterprise", amount: 499, date: "2 days ago", status: "confirmed", timestamp: Date.now() - 48 * 3600000 },
                  ]
                    .filter(t => transactionFilter === 'all' || t.status === transactionFilter)
                    .sort((a, b) => {
                      if (transactionSort === 'date') return b.timestamp - a.timestamp;
                      return b.amount - a.amount;
                    })
                    .map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface border border-white/10 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs group-hover:border-neon-magenta transition-colors">
                            {t.user[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white">{t.user}</p>
                              <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                                t.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              )}>
                                {t.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{t.plan}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-emerald-400">${t.amount}</p>
                          <p className="text-[10px] text-slate-600">{t.date}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-[calc(100vh-250px)]"
            >
              <ChatUplink />
            </motion.div>
          )}

          {activeTab === 'nexus' && (
            <motion.div 
              key="nexus"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-surface border border-white/5 p-10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 -mr-48 -mt-48 rounded-full blur-3xl" />
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                      <Network className="w-8 h-8 text-neon-cyan" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Nexus Bridge</h3>
                      <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Centralized Authentication & Network Synchronization</p>
                    </div>
                  </div>
                  
                  {!isAuthenticated ? (
                    <button 
                      onClick={loginToNetwork}
                      className="px-8 py-4 bg-white text-void rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-neon-cyan"
                    >
                      Connect Google Account
                    </button>
                  ) : (
                    <button 
                      onClick={handleNexusLogout}
                      className="px-8 py-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all hover:bg-rose-500 hover:text-white"
                    >
                      Sever Uplink
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4">Uplink Identity</h4>
                      {isAuthenticated ? (
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                          <div className="flex items-center gap-4">
                            <img src={nexusUser?.user_metadata?.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full border border-neon-cyan/50" />
                            <div>
                              <p className="text-sm font-bold text-white">{nexusUser?.user_metadata?.full_name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{nexusUser?.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Nexus ID</p>
                              <p className="text-xs font-mono text-neon-cyan">{nexusData?.nexusId || 'SYNCING...'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Global Rank</p>
                              <p className="text-xs font-mono text-neon-magenta">{nexusData?.rank || 'ARCHITECT'}</p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-white/5">
                            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mb-1">Active Google ID</p>
                            <p className="text-[10px] font-mono text-slate-400 break-all">{nexusCore.gId || 'NOT_CONFIGURED'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-12 bg-black/20 border border-dashed border-white/10 rounded-2xl text-center">
                          <Lock className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                          <p className="text-xs text-slate-500 uppercase tracking-widest">Authentication Required for Nexus Sync</p>
                        </div>
                      )}
                    </div>

                    <AppRegistry />
                    <NexusShare />
                  </div>

                  <div className="space-y-10">
                    <IdentityForge />
                    
                    <div className="space-y-6">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-4">Network Nodes</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'utubechat.com', status: 'connected' },
                          { name: 'mycanvaslab.com', status: 'connected' },
                          { name: 'mycanvas.studio', status: 'active' },
                          { name: 'hygieneteam.nz', status: 'idle' },
                        ].map((node, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-neon-cyan/30 transition-all">
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-slate-500 group-hover:text-neon-cyan transition-colors" />
                              <span className="text-xs font-mono text-slate-300">{node.name}</span>
                            </div>
                            <div className={cn(
                              "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                              node.status === 'connected' ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                              node.status === 'active' ? "text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5" : "text-slate-500 border-white/10 bg-white/5"
                            )}>
                              {node.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <IntegrationManager />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'terminal' && (
            <motion.div 
              key="terminal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-black/60 border border-white/10 rounded-3xl p-8 font-mono text-xs h-[600px] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-neon-cyan" />
                  <span className="text-white uppercase tracking-widest">Nexus_Uplink_v4.2.0</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-4">
                <p className="text-slate-500">Initializing CommandNexus Kernel...</p>
                <p className="text-emerald-400">[OK] Database Connection Established</p>
                <p className="text-emerald-400">[OK] AI Security Engine Online (Gemini-3-Flash)</p>
                <p className="text-emerald-400">[OK] Telemetry Uplink Synchronized</p>
                <p className="text-neon-cyan mt-4">Welcome, Commander. System is ready for input.</p>
                <div className="flex gap-2 mt-4">
                  <span className="text-neon-cyan tracking-widest font-bold">nexus@root:~$</span>
                  <span className="text-white animate-pulse">_</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5">
                <input 
                  type="text" 
                  placeholder="Enter command..."
                  className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-700"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
