'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface AgeData {
    edad: number;
    frecuencia: number;
}

interface Props {
    data: AgeData[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`Edad: ${label}`}</p>
                <p className="value">{`Frecuencia: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
}

export default function AgeDistributionChart({ data }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glow-card p-8"
        >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Distribución por Edad
            </h3>
            <p className="text-sm mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Frecuencia de estudiantes por rango de edad
            </p>
            <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                        <XAxis
                            dataKey="edad"
                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                            axisLine={{ stroke: 'var(--border-primary)' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                            axisLine={{ stroke: 'var(--border-primary)' }}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="frecuencia"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#ageGradient)"
                            dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                            activeDot={{ fill: '#818cf8', strokeWidth: 0, r: 5 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
