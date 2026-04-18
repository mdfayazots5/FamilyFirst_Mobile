import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ScoreTrendChartProps {
  data: {
    date: string;
    pillars: {
      discipline: number;
      learning: number;
      contribution: number;
      health: number;
      social: number;
    };
  }[];
}

const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    Discipline: d.pillars.discipline,
    Learning: d.pillars.learning,
    Contribution: d.pillars.contribution,
    Health: d.pillars.health,
    Social: d.pillars.social,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#9ca3af' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            hide 
            domain={[0, 100]} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
          <Line type="monotone" dataKey="Discipline" stroke="#6366f1" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="Learning" stroke="#10b981" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="Contribution" stroke="#f59e0b" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="Health" stroke="#ef4444" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="Social" stroke="#8b5cf6" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreTrendChart;
