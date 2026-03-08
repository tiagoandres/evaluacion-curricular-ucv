'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Star, UserCheck, Filter, ChevronDown } from 'lucide-react';
import { mapSupabaseRowToSurveyEntry, SurveyEntry } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import {
    filterData,
    getTotalEvaluaciones,
    getUtilidadGlobal,
    getNPSDocente,
    getRadarData,
    getSatisfactionByCycle,
    getSatisfactionByAsignatura,
    getTopCourses,
    getUniqueMenciones,
} from '@/data/dataUtils';


import KPICard from './KPICard';
import RadarPerformanceChart from './charts/RadarPerformanceChart';
import SatisfactionBarChart from './charts/SatisfactionBarChart';
import TopCoursesTable from './TopCoursesTable';

export default function ResumenGeneral() {
    const [selectedCiclo, setSelectedCiclo] = useState<string | 'all'>('all');
    const [selectedMencion, setSelectedMencion] = useState<string | 'all'>('all');

    // DB state
    const [surveyData, setSurveyData] = useState<SurveyEntry[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        async function fetchInfo() {
            setLoading(true);
            const { data, error } = await supabase.from('datos_limpios').select('*');
            if (error) {
                console.error('Error fetching data:', error);
            } else if (data) {
                setSurveyData(data.map(mapSupabaseRowToSurveyEntry));
            }
            setLoading(false);
        }
        fetchInfo();
    }, []);

    const menciones = getUniqueMenciones(surveyData);

    // Filtered data based on cycle and mention selections
    const filteredData = useMemo(() => {
        let data = [...surveyData];
        if (selectedCiclo && selectedCiclo !== 'all') {
            data = data.filter(d => d.ciclo && d.ciclo.trim() === selectedCiclo.trim());
        }
        if (selectedMencion && selectedMencion !== 'all') {
            data = data.filter(d => d.mencion && d.mencion.trim() === selectedMencion.trim());
        }
        return data;
    }, [selectedCiclo, selectedMencion, surveyData]);

    // KPI values (affected by both filters)
    const totalEvaluaciones = getTotalEvaluaciones(filteredData);
    const utilidadGlobal = getUtilidadGlobal(filteredData);
    const npsDocente = getNPSDocente(filteredData);

    // Radar data (affected by filters)
    const radarData = getRadarData(filteredData);

    // Satisfaction bar chart (shows by cycle when no mention filter, by asignatura when mention selected)
    const isByAsignatura = selectedMencion !== 'all';
    const satisfactionData = useMemo(() => {
        if (isByAsignatura) {
            return getSatisfactionByAsignatura(filteredData, selectedMencion as string);
        }
        return getSatisfactionByCycle(filteredData);
    }, [selectedMencion, isByAsignatura, filteredData]);

    // Top courses (affected by filters)
    const topCourses = getTopCourses(filteredData);

    const handleCicloChange = (value: string) => {
        setSelectedCiclo(value);
        if (value !== 'Mención') {
            setSelectedMencion('all');
        }
    };

    const handleMencionChange = (value: string) => {
        setSelectedMencion(value);
        if (value !== 'all') {
            setSelectedCiclo('Mención');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
                <div>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Resumen General
                    </h2>
                    <p className="text-base mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Visión general de la valoración estudiantil · Escuela de Psicología UCV
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>Filtros:</span>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedCiclo}
                            onChange={(e) => handleCicloChange(e.target.value)}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm"
                            style={{
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                            }}
                        >
                            <option value="all">Todos los Ciclos</option>
                            <option value="Ciclo Básico">Ciclo Básico</option>
                            <option value="Mención">Mención</option>
                            <option value="Teorías Psicológicas">Teorías Psicológicas</option>
                        </select>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedMencion}
                            onChange={(e) => handleMencionChange(e.target.value)}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm"
                            style={{
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                            }}
                        >
                            <option value="all">Todas las Menciones</option>
                            {menciones.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KPICard
                        title="Total Evaluaciones"
                        value={totalEvaluaciones}
                        subtitle="Respuestas registradas"
                        icon={ClipboardList}
                        color="#6366f1"
                        delay={0}
                    />
                    <KPICard
                        title="Utilidad Global"
                        value={`${utilidadGlobal}/10`}
                        subtitle="Promedio de utilidad percibida"
                        icon={Star}
                        color="#22d3ee"
                        delay={0.1}
                    />
                    <KPICard
                        title="NPS Docente"
                        value={`${npsDocente}/10`}
                        subtitle="Promedio de recomendación docente"
                        icon={UserCheck}
                        color="#a78bfa"
                        delay={0.2}
                    />
                </div>
            )}

            {/* Radar + Satisfaction Bar charts */}
            {!loading && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <RadarPerformanceChart data={radarData} />
                        <SatisfactionBarChart data={satisfactionData} isByAsignatura={isByAsignatura} />
                    </div>

                    {/* Top Courses Table */}
                    <TopCoursesTable data={topCourses} />
                </>
            )}
        </div>
    );
}
