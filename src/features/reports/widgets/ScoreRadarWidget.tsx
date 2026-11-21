import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import type { PillarScores } from '../repositories/ReportsRepository';

/** Pillar display labels — the five ChildProfile pillars, each scored 0–20. */
export const PILLAR_LABELS: Record<keyof PillarScores, string> = {
  study: 'Study',
  cleanliness: 'Cleanliness',
  discipline: 'Discipline',
  screenControl: 'Screen Control',
  responsibility: 'Responsibility',
};

export const PILLAR_MAX = 20;

interface ScoreRadarWidgetProps {
  data: PillarScores;
}

const ScoreRadarWidget: React.FC<ScoreRadarWidgetProps> = ({ data }) => {
  const chartData = (Object.keys(PILLAR_LABELS) as (keyof PillarScores)[]).map((key) => ({
    subject: PILLAR_LABELS[key],
    A: data[key],
    fullMark: PILLAR_MAX,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
          />
          <PolarRadiusAxis domain={[0, PILLAR_MAX]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#1A2E4A"
            fill="#C8922A"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreRadarWidget;
