'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
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

function CustomAngleTick({ payload, x, y, cx, cy, fill, fontSize, className, textAnchor }: any) {
    const isTop = payload.value === 'Contenidos';
    const isRight = payload.value === 'Evaluación';
    const isLeft = payload.value === 'Desempeño Docente';

    let xOffset = 0;
    let yOffset = 0;

    if (isTop) yOffset = -10;
    if (isRight) { xOffset = 15; yOffset = 8; }
    if (isLeft) { xOffset = -15; yOffset = 8; }

    return (
        <text
            x={x + xOffset}
            y={y + yOffset}
            fill={fill}
            fontSize={fontSize}
            className={className}
            textAnchor={isRight ? 'start' : isLeft ? 'end' : 'middle'}
        >
            {payload.value}
        </text>
    );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RadarData }> }) {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="label">{d.dimension}</p>
                <p className="value">{`Puntuación: ${d.value.toFixed(2)} / 100`}</p>
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
            className="glow-card p-6 rounded-2xl flex flex-col justify-between"
        >
            <div className="flex items-center gap-3 shrink-0 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                    <Activity size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Desempeño por Dimensión</h4>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Evaluación integral en las 3 dimensiones clave</p>
                </div>
            </div>
            <div className="w-full h-[300px] mt-2 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="56%" outerRadius="88%" data={data}>
                        <PolarGrid stroke="var(--border-primary)" />
                        <PolarAngleAxis
                            dataKey="dimension"
                            tick={<CustomAngleTick fill="var(--text-secondary)" fontSize={11} />}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
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
