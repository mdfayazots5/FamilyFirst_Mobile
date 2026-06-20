import React, { useState } from 'react';
import { TrendingUp, Users, BarChart2, Clock, Download } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const kpis = [
  { label: 'Daily Active',   value: '1,240', change: '+12%', icon: <Users className="w-5 h-5 text-primary" />,  positive: true },
  { label: 'Weekly Users',   value: '3,480', change: '+8%',  icon: <TrendingUp className="w-5 h-5 text-accent" />, positive: true },
  { label: 'Monthly Users',  value: '8,920', change: '+15%', icon: <BarChart2 className="w-5 h-5 text-success" />, positive: true },
  { label: 'Avg Session',    value: '12m',   change: '-2%',  icon: <Clock className="w-5 h-5 text-amber-500" />,  positive: false },
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
  { name: 'Attendance', usage: 89, color: '#1A2E4A' },
  { name: 'Tasks',      usage: 76, color: '#C8922A' },
  { name: 'Feedback',   usage: 62, color: '#C1121F' },
  { name: 'Rewards',    usage: 54, color: '#2D6A4F' },
  { name: 'Calendar',   usage: 38, color: '#4A7FA5' },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Static heatmap — no Math.random()
const heatmapData: Record<string, number[]> = {
  Mon: [0,0,0,0,0,0,1,2,3,2,1,1,1,1,1,1,1,2,2,2,1,0,0,0],
  Tue: [0,0,0,0,0,0,1,2,3,2,1,1,1,2,1,1,1,2,3,2,1,0,0,0],
  Wed: [0,0,0,0,0,0,1,3,3,2,1,1,2,1,1,1,1,2,2,2,1,0,0,0],
  Thu: [0,0,0,0,0,0,1,2,2,2,1,1,1,1,1,1,2,3,3,2,1,0,0,0],
  Fri: [0,0,0,0,0,1,1,2,3,2,1,1,1,1,1,1,1,2,3,3,2,1,0,0],
  Sat: [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,3,3,2,1,0,0],
  Sun: [0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,0,0],
};

const heatColors = ['#f1f5f9', '#C8D8E8', '#1A2E4A'];

const AnalyticsScreen: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="px-4 py-5 space-y-6 pb-24 page-enter">

      {/* Date Range Toggle */}
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold text-sm text-primary">Platform Analytics</p>
        <div className="flex gap-1 bg-white border border-black/5 rounded-xl p-1">
          {['7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`h-8 px-3 rounded-lg font-body font-semibold text-xs transition-all ${
                dateRange === range ? 'bg-primary text-white' : 'text-gray-400'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => (
          <FFCard key={i} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-ff-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                {kpi.icon}
              </div>
              <FFBadge variant={kpi.positive ? 'success' : 'alert'}>{kpi.change}</FFBadge>
            </div>
            <p className="font-numbers font-medium text-2xl text-primary tabular-nums">{kpi.value}</p>
            <p className="font-body text-xs text-gray-400 mt-0.5 uppercase tracking-wider">{kpi.label}</p>
          </FFCard>
        ))}
      </div>

      {/* Activity Trend */}
      <div className="space-y-3">
        <FFSectionHeader
          icon={<TrendingUp className="w-[18px] h-[18px]" />}
          title="Activity Trend"
          rightAction={
            <button className="font-body text-xs text-accent font-semibold flex items-center gap-1">
              <Download className="w-3 h-3" /> Export
            </button>
          }
        />
        <FFCard className="p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1A2E4A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A2E4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9BA8B5', fontFamily: 'Nunito' }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9BA8B5', fontFamily: 'Nunito' }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px', border: 'none',
                  boxShadow: '0 2px 12px rgba(26,46,74,0.08)',
                  fontSize: '12px', fontFamily: 'Nunito',
                }}
                cursor={{ stroke: '#1A2E4A', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="dau"
                stroke="#1A2E4A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDau)"
                dot={{ r: 4, fill: '#1A2E4A', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#C8922A', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </FFCard>
      </div>

      {/* Feature Usage */}
      <div className="space-y-3">
        <FFSectionHeader icon={<BarChart2 className="w-[18px] h-[18px]" />} title="Feature Usage" />
        <FFCard className="p-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureUsage} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#1A2E4A', fontFamily: 'Nunito' }}
                width={72}
              />
              <Tooltip
                cursor={{ fill: '#f8f4ee', radius: 8 }}
                contentStyle={{
                  borderRadius: '12px', border: 'none',
                  boxShadow: '0 2px 12px rgba(26,46,74,0.08)',
                  fontSize: '12px', fontFamily: 'Nunito',
                }}
              />
              <Bar dataKey="usage" radius={[0, 8, 8, 0]} barSize={20}>
                {featureUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FFCard>
      </div>

      {/* Engagement Heatmap */}
      <div className="space-y-3">
        <FFSectionHeader icon={<BarChart2 className="w-[18px] h-[18px]" />} title="Engagement Heatmap" />
        <FFCard className="p-4">
          <div className="flex flex-col gap-2">
            {days.map(day => (
              <div key={day} className="flex items-center gap-2">
                <span className="font-body text-xs text-gray-400 w-7 flex-shrink-0">{day}</span>
                <div className="flex flex-1 gap-0.5">
                  {heatmapData[day].map((v, h) => (
                    <div
                      key={h}
                      className="flex-1 aspect-square rounded-[2px]"
                      style={{ backgroundColor: heatColors[v] ?? heatColors[0] }}
                      title={`${day} ${h}:00`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 px-9">
            <span className="font-body text-xs text-gray-400">12 AM</span>
            <div className="flex items-center gap-3">
              {(['Low', 'Med', 'High'] as const).map((label, i) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: heatColors[i] }} />
                  <span className="font-body text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
            <span className="font-body text-xs text-gray-400">11 PM</span>
          </div>
        </FFCard>
      </div>

    </div>
  );
};

export default AnalyticsScreen;
