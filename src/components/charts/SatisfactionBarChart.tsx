'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface SatisfactionData {
    ciclo?: string;
    asignatura?: string;
    indice: number;
}

interface Props {
    data: SatisfactionData[];
    isByAsignatura?: boolean;
}

const BAR_COLORS = ['#6366f1', '#22d3ee', '#a78bfa', '#fb7185', '#f59e0b', '#10b981'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{label}</p>
                <p className="value">{`Calidad: ${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }
    return null;
}

export default function SatisfactionBarChart({ data, isByAsignatura = false }: Props) {
    const dataKey = isByAsignatura ? 'asignatura' : 'ciclo';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glow-card p-5 flex flex-col justify-between"
        >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                {isByAsignatura ? 'Calidad por Asignatura' : 'Calidad por Ciclo'}
            </h3>
            <p className="text-xs mb-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isByAsignatura
                    ? 'Comparativa de la calidad de unidad curricular entre asignaturas de la mención'
                    : 'Comparativa de calidad entre Ciclo Básico, Mención y Teorías Psicológicas'
                }
            </p>
            <div className="w-full h-[300px] mt-2 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 10, left: -10, bottom: isByAsignatura ? 60 : 5 }}
                    >
                        <defs>
                            {BAR_COLORS.map((color, i) => (
                                <linearGradient key={i} id={`barGradient${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.5} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                        <XAxis
                            dataKey={dataKey}
                            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                            axisLine={{ stroke: 'var(--border-primary)' }}
                            tickLine={false}
                            angle={isByAsignatura ? -35 : 0}
                            textAnchor={isByAsignatura ? 'end' : 'middle'}
                            interval={0}
                        />
                        <YAxis
                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                            axisLine={{ stroke: 'var(--border-primary)' }}
                            tickLine={false}
                            domain={[0, 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="indice" radius={[6, 6, 0, 0]} maxBarSize={60}>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={`url(#barGradient${index % BAR_COLORS.length})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
