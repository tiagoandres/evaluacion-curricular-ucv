'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip,
} from 'recharts';

interface RadarData {
    dimension: string;
    value: number;
    fullMark: number;
}

interface Props {
    data: RadarData[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RadarData }> }) {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="label">{d.dimension}</p>
                <p className="value">{`Puntuación: ${d.value.toFixed(2)} / 10`}</p>
            </div>
        );
    }
    return null;
}

export default function RadarPerformanceChart({ data }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glow-card p-8"
        >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Desempeño por Dimensión
            </h3>
            <p className="text-sm mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Evaluación integral en las 4 dimensiones clave
            </p>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="var(--border-primary)" />
                        <PolarAngleAxis
                            dataKey="dimension"
                            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 10]}
                            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                            axisLine={false}
                            tickCount={6}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Radar
                            name="Puntuación"
                            dataKey="value"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            dot={{ fill: '#818cf8', strokeWidth: 0, r: 4 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
