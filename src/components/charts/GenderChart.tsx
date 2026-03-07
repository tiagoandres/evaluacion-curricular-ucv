'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface GenderData {
    genero: string;
    cantidad: number;
    porcentaje: number;
}

interface Props {
    data: GenderData[];
}

const COLORS: Record<string, string> = {
    'Femenino': '#a78bfa',
    'Masculino': '#22d3ee',
    'Prefiero no decirlo': '#64748b',
    'Otro': '#fb7185',
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: GenderData }> }) {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="label">{d.genero}</p>
                <p className="value">{`${d.cantidad} (${d.porcentaje}%)`}</p>
            </div>
        );
    }
    return null;
}

export default function GenderChart({ data }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glow-card p-8"
        >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Distribución por Género
            </h3>
            <p className="text-sm mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Composición demográfica de los estudiantes
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-4">
                <div className="w-[180px] h-[180px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="cantidad"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.genero] || '#64748b'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col space-y-3 min-w-[180px]">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                            <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: COLORS[item.genero] || '#64748b' }}
                            />
                            <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>
                                {item.genero}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {item.porcentaje}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
