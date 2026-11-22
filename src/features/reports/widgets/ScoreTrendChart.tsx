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
import type { ScoreHistoryPoint } from '../repositories/ReportsRepository';
import { PILLAR_LABELS, PILLAR_MAX } from './ScoreRadarWidget';
import { APP_LOCALE } from '../../../core/utils/format';

interface ScoreTrendChartProps {
  data: ScoreHistoryPoint[];
}

// Recharts SVG stroke requires hex strings — CSS tokens don't apply here
const PILLAR_STROKES = {
  study: '#1A2E4A',
  cleanliness: '#2D6A4F',
  discipline: '#C8922A',
  screenControl: '#C1121F',
  responsibility: '#6366f1',
} as const;

const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString(APP_LOCALE, { month: 'short', day: 'numeric' }),
    [PILLAR_LABELS.study]: d.pillars.study,
    [PILLAR_LABELS.cleanliness]: d.pillars.cleanliness,
    [PILLAR_LABELS.discipline]: d.pillars.discipline,
    [PILLAR_LABELS.screenControl]: d.pillars.screenControl,
    [PILLAR_LABELS.responsibility]: d.pillars.responsibility,
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
            domain={[0, PILLAR_MAX]}
          />
          <Tooltip
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
          {(Object.keys(PILLAR_STROKES) as (keyof typeof PILLAR_STROKES)[]).map((key) => (
            <Line key={key} type="monotone" dataKey={PILLAR_LABELS[key]} stroke={PILLAR_STROKES[key]} strokeWidth={3} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreTrendChart;
