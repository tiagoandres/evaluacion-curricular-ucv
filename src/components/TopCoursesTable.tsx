'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

interface CourseData {
    asignatura: string;
    docentes: string;
    indice: number;
    nps: number;
}

interface Props {
    data: CourseData[];
}

function getScoreColor(score: number): string {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#22d3ee';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
}

function getNPSColor(nps: number): string {
    if (nps >= 8) return '#10b981';
    if (nps >= 6) return '#22d3ee';
    if (nps >= 4) return '#f59e0b';
    return '#ef4444';
}

export default function TopCoursesTable({ data }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="glow-card p-5"
        >
            <div className="flex items-center gap-3 mb-2">
                <Trophy size={16} style={{ color: '#f59e0b' }} />
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Top 5 Asignaturas (Mayor Calidad)
                </h3>
            </div>
            <p className="text-xs mb-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Asignaturas con mayor calidad de unidad curricular
            </p>

            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Asignatura</th>
                            <th>Docentes</th>
                            <th>Calidad</th>
                            <th>NPS Docente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((course, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.8 + i * 0.08 }}
                            >
                                <td>
                                    <span
                                        className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                        style={{
                                            background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                                i === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
                                                    i === 2 ? 'linear-gradient(135deg, #cd7f32, #a0522d)' :
                                                        'rgba(99, 102, 241, 0.15)',
                                            color: i < 3 ? '#fff' : 'var(--text-secondary)',
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                </td>
                                <td className="font-medium">{course.asignatura}</td>
                                <td>
                                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {course.docentes}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99, 102, 241, 0.1)', maxWidth: '80px' }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(100, Math.max(0, course.indice))}%`,
                                                    background: getScoreColor(course.indice),
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold" style={{ color: getScoreColor(course.indice) }}>
                                            {course.indice.toFixed(1)}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                        style={{
                                            background: `${getNPSColor(course.nps)}15`,
                                            color: getNPSColor(course.nps),
                                        }}
                                    >
                                        <TrendingUp size={12} />
                                        {course.nps.toFixed(1)}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
