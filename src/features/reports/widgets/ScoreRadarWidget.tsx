import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';

interface ScoreRadarWidgetProps {
  data: {
    discipline: number;
    learning: number;
    contribution: number;
    health: number;
    social: number;
  };
}

const ScoreRadarWidget: React.FC<ScoreRadarWidgetProps> = ({ data }) => {
  const chartData = [
    { subject: 'Discipline', A: data.discipline, fullMark: 100 },
    { subject: 'Learning', A: data.learning, fullMark: 100 },
    { subject: 'Contribution', A: data.contribution, fullMark: 100 },
    { subject: 'Health', A: data.health, fullMark: 100 },
    { subject: 'Social', A: data.social, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreRadarWidget;
