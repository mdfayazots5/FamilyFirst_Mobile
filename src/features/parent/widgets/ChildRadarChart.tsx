import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface RadarData {
  subject: string;
  score: number;
  fullMark: number;
}

interface ChildRadarChartProps {
  data: RadarData[];
}

const ChildRadarChart: React.FC<ChildRadarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#f1f5f9" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 20]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#1A2E4A"
            strokeWidth={3}
            fill="#C892A2"
            fillOpacity={0.3}
            animationBegin={300}
            animationDuration={1500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChildRadarChart;
