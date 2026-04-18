import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar,
  Filter,
  Download,
  ChevronRight,
  Zap,
  MousePointer2,
  Globe,
  Radio,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  Signal,
  Eye,
  Workflow
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const AnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30d');

  // High-Command KPIs
  const kpis = [
    { label: 'DAILY_UNITS_ACTIVE', value: '1,240', change: '+12%', icon: <Eye size={20} />, color: 'text-primary' },
    { label: 'WEEKLY_SIGNAL_STRENGTH', value: '3,480', change: '+8%', icon: <Signal size={20} />, color: 'text-accent' },
    { label: 'MONTHLY_TOTAL_ENGAGEMENT', value: '8,920', change: '+15%', icon: <Activity size={20} />, color: 'text-success' },
    { label: 'AVG_SESSION_BURST', value: '12m', change: '-2%', icon: <Zap size={20} />, color: 'text-amber-500' },
  ];

  const trendData = [
    { date: '01 Oct', dau: 850 },
    { date: '05 Oct', dau: 920 },
    { date: '10 Oct', dau: 1100 },
    { date: '15 Oct', dau: 1050 },
    { date: '20 Oct', dau: 1200 },
    { date: '25 Oct', dau: 1150 },
    { date: '30 Oct', dau: 1240 },
  ];

  const featureUsage = [
    { name: 'ATTENDANCE', usage: 89, color: '#2C3B3F' },
    { name: 'OPERATIONS', usage: 76, color: '#FF7F50' },
    { name: 'INTELLIGENCE', usage: 62, color: '#ef4444' },
    { name: 'REWARDS', usage: 54, color: '#10b981' },
    { name: 'SECURITY', usage: 12, color: '#6366f1' },
  ];

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* High-Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <TrendingUp size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">STRATEGIC_INTELLIGENCE</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">QUANTUM_TELEMETRY_ONLINE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Command Intel
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-2 p-2 bg-gray-50 rounded-3xl border border-black/[0.03] shadow-inner overflow-hidden">
               {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-6 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic ${
                      dateRange === range 
                        ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                        : 'text-gray-400 hover:text-primary transition-colors'
                    }`}
                  >
                    {range}
                  </button>
                ))}
            </div>
            <button className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90">
              <Download size={28} />
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-24">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <FFCard className="p-10 border-none bg-white shadow-3xl shadow-black/[0.01] group hover:scale-[1.05] transition-all rounded-[48px] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                   {kpi.icon}
                </div>
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center bg-gray-50 shadow-sm border border-black/[0.02] ${kpi.color}`}>
                    {React.cloneElement(kpi.icon as React.ReactElement, { size: 28 })}
                  </div>
                  <FFBadge variant={kpi.change.startsWith('+') ? 'success' : 'alert'} size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none scale-90">
                    {kpi.change}
                  </FFBadge>
                </div>
                <div className="relative z-10">
                  <h4 className="text-4xl lg:text-5xl font-display font-black text-primary italic tracking-tighter tabular-nums leading-none mb-3">{kpi.value}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">{kpi.label}</p>
                </div>
              </FFCard>
            </motion.div>
          ))}
        </div>

        {/* DAU Trend Protocol */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Activity size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">TEMPORAL_WAVELENGTH_ARRAY</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <FFCard className="p-12 h-[500px] border-none bg-white shadow-3xl shadow-black/[0.01] rounded-[56px] overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Workflow size={140} strokeWidth={1} />
             </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2C3B3F" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2C3B3F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1', letterSpacing: '0.2em' }}
                  dy={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1', letterSpacing: '0.1em' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '32px', 
                    border: 'none', 
                    boxShadow: '0 40px 60px -15px rgb(0 0 0 / 0.1)', 
                    padding: '24px',
                    backgroundColor: '#fff',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    fontWeight: '900',
                    letterSpacing: '0.2em',
                    fontStyle: 'italic'
                  }}
                  cursor={{ stroke: '#2C3B3F', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="dau" 
                  stroke="#2C3B3F" 
                  strokeWidth={6} 
                  fillOpacity={1} 
                  fill="url(#colorDau)" 
                  dot={{ r: 8, fill: '#2C3B3F', strokeWidth: 4, stroke: '#fff' }}
                  activeDot={{ r: 12, strokeWidth: 0, fill: '#FF7F50' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </FFCard>
        </section>

        {/* Feature Usage & Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Feature Saturation */}
          <section className="space-y-12">
            <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                <Layers size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">SATURATION_INDEX</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            
            <FFCard className="p-12 h-[450px] border-none bg-white shadow-3xl shadow-black/[0.01] rounded-[56px] overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Terminal size={140} strokeWidth={1} />
               </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsage} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#2C3B3F', letterSpacing: '0.1em' }}
                    width={110}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 16 }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', textTransform: 'uppercase', fontStyle: 'italic' }}
                  />
                  <Bar dataKey="usage" radius={[0, 20, 20, 0]} barSize={40}>
                    {featureUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </FFCard>
          </section>

          {/* Engagement Heatmap Vector */}
          <section className="space-y-12">
            <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                <Globe size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">DENSITY_MATRIX</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <FFCard className="p-12 border-none bg-white shadow-3xl shadow-black/[0.01] rounded-[56px] overflow-hidden relative group">
              <div className="flex flex-col gap-3">
                {days.map(day => (
                  <div key={day} className="flex gap-4 items-center">
                    <span className="text-[10px] font-black text-gray-300 w-10 italic tracking-tighter uppercase">{day}</span>
                    <div className="flex flex-1 gap-2">
                      {hours.map(hour => {
                        const isPeak = (hour >= 7 && hour <= 9) || (hour >= 19 && hour <= 21);
                        const intensity = isPeak ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3;
                        return (
                          <motion.div 
                            key={hour}
                            whileHover={{ scale: 1.5, zIndex: 10 }}
                            title={`${day} ${hour}:00 // INTENSITY: ${(intensity * 100).toFixed(1)}%`}
                            className="flex-1 aspect-square rounded-[6px] cursor-help relative group/pixel"
                            style={{ 
                              backgroundColor: intensity > 0.6 ? '#FF7F50' : intensity > 0.3 ? '#2C3B3F' : '#f1f5f9',
                              opacity: intensity < 0.1 ? 0.3 : 1
                            }}
                          >
                             <div className="absolute inset-0 bg-white opacity-0 group-hover/pixel:opacity-20 transition-opacity rounded-[3px]" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-12 px-14 items-center">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic">00:00_TERMINUS</span>
                <div className="flex gap-4 items-center">
                   <div className="w-3 h-3 bg-[#f1f5f9] rounded-sm" />
                   <div className="w-3 h-3 bg-[#2C3B3F] rounded-sm" />
                   <div className="w-3 h-3 bg-[#FF7F50] rounded-sm" />
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic">23:59_APEX</span>
              </div>
            </FFCard>
          </section>
        </div>

        <footer className="text-center py-24 space-y-6">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.8em] italic opacity-40 leading-relaxed">STATION_ENGINE // Analytics Matrix v4.4.2</p>
        </footer>
      </main>
    </div>
  );
};

export default AnalyticsScreen;

