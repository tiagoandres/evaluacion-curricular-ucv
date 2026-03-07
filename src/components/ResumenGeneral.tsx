'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Star, UserCheck, Filter, ChevronDown } from 'lucide-react';
import { surveyData } from '@/data/mockData';
import {
    filterData,
    getTotalEvaluaciones,
    getUtilidadGlobal,
    getNPSDocente,
    getAgeDistribution,
    getGenderDistribution,
    getRadarData,
    getSatisfactionByCycle,
    getSatisfactionByAsignatura,
    getTopCourses,
    getUniqueMenciones,
} from '@/data/dataUtils';
import type { Ciclo, Mencion } from '@/data/mockData';

import KPICard from './KPICard';
import AgeDistributionChart from './charts/AgeDistributionChart';
import GenderChart from './charts/GenderChart';
import RadarPerformanceChart from './charts/RadarPerformanceChart';
import SatisfactionBarChart from './charts/SatisfactionBarChart';
import TopCoursesTable from './TopCoursesTable';

export default function ResumenGeneral() {
    const [selectedCiclo, setSelectedCiclo] = useState<Ciclo | 'all'>('all');
    const [selectedMencion, setSelectedMencion] = useState<Mencion | 'all'>('all');

    const menciones = getUniqueMenciones();

    // Filtered data based on cycle and mention selections
    const filteredData = useMemo(() => {
        let data = [...surveyData];
        if (selectedCiclo !== 'all') {
            data = data.filter(d => d.ciclo === selectedCiclo);
        }
        if (selectedMencion !== 'all') {
            data = data.filter(d => d.mencion === selectedMencion);
        }
        return data;
    }, [selectedCiclo, selectedMencion]);

    // KPI values (affected by both filters)
    const totalEvaluaciones = getTotalEvaluaciones(filteredData);
    const utilidadGlobal = getUtilidadGlobal(filteredData);
    const npsDocente = getNPSDocente(filteredData);

    // Demographics (not affected by filters for general overview)
    const ageData = getAgeDistribution(surveyData);
    const genderData = getGenderDistribution(surveyData);

    // Radar data (affected by filters)
    const radarData = getRadarData(filteredData);

    // Satisfaction bar chart (shows by cycle when no mention filter, by asignatura when mention selected)
    const isByAsignatura = selectedMencion !== 'all';
    const satisfactionData = useMemo(() => {
        if (isByAsignatura) {
            return getSatisfactionByAsignatura(surveyData, selectedMencion as Mencion);
        }
        return getSatisfactionByCycle(surveyData);
    }, [selectedMencion, isByAsignatura]);

    // Top courses (affected by filters)
    const topCourses = getTopCourses(filteredData);

    const handleCicloChange = (value: string) => {
        setSelectedCiclo(value as Ciclo | 'all');
        if (value === 'Ciclo Básico') {
            setSelectedMencion('all');
        }
    };

    const handleMencionChange = (value: string) => {
        setSelectedMencion(value as Mencion | 'all');
        if (value !== 'all') {
            setSelectedCiclo('Mención');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Demographics row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AgeDistributionChart data={ageData} />
                <GenderChart data={genderData} />
            </div>

            {/* Radar + Satisfaction Bar charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RadarPerformanceChart data={radarData} />
                <SatisfactionBarChart data={satisfactionData} isByAsignatura={isByAsignatura} />
            </div>

            {/* Top Courses Table */}
            <TopCoursesTable data={topCourses} />
        </div>
    );
}
