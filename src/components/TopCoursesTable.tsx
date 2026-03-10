'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Star } from 'lucide-react';

interface CourseData {
    asignatura: string;
    docentes: string;
    indice: number;
    contenidos: number;
    evaluacion: number;
    utilidad: number;
    count: number;
}

interface Props {
    data: CourseData[];
}

function getScoreColor(score: number, max: number): string {
    const percentage = score / max;
    if (percentage >= 0.9) return '#10b981';
    if (percentage >= 0.75) return '#22d3ee';
    if (percentage >= 0.6) return '#f59e0b';
    return '#ef4444';
}

export default function TopCoursesTable({ data }: Props) {
    const [hoveredInfo, setHoveredInfo] = useState<{ asignatura: string, docentes: string, x: number, y: number } | null>(null);
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
                            <th style={{ textAlign: 'center' }}>Nº Eval.</th>
                            <th style={{ textAlign: 'center' }}>Índice<br />Contenidos</th>
                            <th style={{ textAlign: 'center' }}>Índice<br />Evaluación</th>
                            <th style={{ textAlign: 'center' }}>Índice<br />Calidad</th>
                            <th style={{ textAlign: 'center' }}>Utilidad</th>
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
                                <td
                                    className="font-medium cursor-help relative"
                                    onMouseMove={(e) => setHoveredInfo({ asignatura: course.asignatura, docentes: course.docentes, x: e.clientX, y: e.clientY })}
                                    onMouseLeave={() => setHoveredInfo(null)}
                                >
                                    <span className="border-b border-dashed border-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block py-1">
                                        {course.asignatura}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                        {course.count}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-semibold" style={{ color: getScoreColor(course.contenidos, 100) }}>
                                            {course.contenidos.toFixed(1)}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-semibold" style={{ color: getScoreColor(course.evaluacion, 100) }}>
                                            {course.evaluacion.toFixed(1)}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-semibold" style={{ color: getScoreColor(course.indice, 100) }}>
                                            {course.indice.toFixed(1)}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-semibold" style={{ color: getScoreColor(course.utilidad, 10) }}>
                                            {course.utilidad.toFixed(1)}
                                        </span>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Hover tooltip for teachers */}
            {hoveredInfo && (
                <div
                    className="fixed z-[100] p-3 rounded-xl shadow-2xl border pointer-events-none max-w-[280px]"
                    style={{
                        top: hoveredInfo.y + 15,
                        left: hoveredInfo.x + 15,
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                    }}
                >
                    <p className="font-bold text-sm mb-1">{hoveredInfo.asignatura}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Docentes que la dictan:</p>
                    <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{hoveredInfo.docentes}</p>
                </div>
            )}
        </motion.div>
    );
}
