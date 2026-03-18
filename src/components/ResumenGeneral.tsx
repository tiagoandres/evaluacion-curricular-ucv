'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Star, UserCheck, Filter, ChevronDown, X, LayoutDashboard } from 'lucide-react';
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
    getUniqueDepartamentos,
    getUniqueCatedras,
} from '@/data/dataUtils';


import KPICard from './KPICard';
import RadarPerformanceChart from './charts/RadarPerformanceChart';
import SatisfactionBarChart from './charts/SatisfactionBarChart';
import TopCoursesTable from './TopCoursesTable';

export default function ResumenGeneral() {
    const [selectedCiclo, setSelectedCiclo] = useState<string | 'all'>('all');
    const [selectedDepartamento, setSelectedDepartamento] = useState<string | 'all'>('all');
    const [selectedCatedra, setSelectedCatedra] = useState<string | 'all'>('all');

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

    const departamentos = useMemo(() => {
        let optionsData = [...surveyData];
        if (selectedCiclo && selectedCiclo !== 'all') {
            optionsData = optionsData.filter(d => d.ciclo && d.ciclo.trim() === selectedCiclo.trim());
        }
        return getUniqueDepartamentos(optionsData);
    }, [surveyData, selectedCiclo]);

    const catedras = useMemo(() => {
        let optionsData = [...surveyData];
        if (selectedCiclo && selectedCiclo !== 'all') {
            optionsData = optionsData.filter(d => d.ciclo && d.ciclo.trim() === selectedCiclo.trim());
        }
        if (selectedDepartamento && selectedDepartamento !== 'all') {
            optionsData = optionsData.filter(d => d.departamento && d.departamento.trim() === selectedDepartamento.trim());
        }
        return getUniqueCatedras(optionsData);
    }, [surveyData, selectedCiclo, selectedDepartamento]);

    // Filtered data based on cycle, departamento and catedra
    const filteredData = useMemo(() => {
        let data = [...surveyData];
        if (selectedCiclo && selectedCiclo !== 'all') {
            data = data.filter(d => d.ciclo && d.ciclo.trim() === selectedCiclo.trim());
        }
        if (selectedDepartamento && selectedDepartamento !== 'all') {
            data = data.filter(d => d.departamento && d.departamento.trim() === selectedDepartamento.trim());
        }
        if (selectedCatedra && selectedCatedra !== 'all') {
            data = data.filter(d => d.catedra && d.catedra.trim() === selectedCatedra.trim());
        }
        return data;
    }, [selectedCiclo, selectedDepartamento, selectedCatedra, surveyData]);

    // KPI values (affected by both filters)
    const totalEvaluaciones = getTotalEvaluaciones(filteredData);
    const utilidadGlobal = getUtilidadGlobal(filteredData);
    const npsDocente = getNPSDocente(filteredData);

    // Radar data (affected by filters)
    const radarData = getRadarData(filteredData);

    // Satisfaction bar chart
    const isByAsignatura = selectedDepartamento !== 'all' || selectedCatedra !== 'all';
    const satisfactionData = useMemo(() => {
        if (isByAsignatura) {
            return getSatisfactionByAsignatura(filteredData);
        }
        return getSatisfactionByCycle(filteredData);
    }, [isByAsignatura, filteredData]);

    // Top courses (affected by filters)
    const topCourses = getTopCourses(filteredData);

    const handleCicloChange = (value: string) => {
        setSelectedCiclo(value);
        if (value !== 'all' && value !== 'Mención' && value !== 'Ciclo Básico' && value !== 'Teorías Psicológicas') {
            setSelectedDepartamento('all');
            setSelectedCatedra('all');
        }
    };

    const handleDepartamentoChange = (value: string) => {
        setSelectedDepartamento(value);
    };

    const handleCatedraChange = (value: string) => {
        setSelectedCatedra(value);
    };

    const hasActiveFilters = selectedCiclo !== 'all' || selectedDepartamento !== 'all' || selectedCatedra !== 'all';

    const handleClearFilters = () => {
        setSelectedCiclo('all');
        setSelectedDepartamento('all');
        setSelectedCatedra('all');
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
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner shrink-0" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))' }}>
                        <LayoutDashboard size={20} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            Resumen General
                        </h2>
                        <p className="text-base mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Visión general de la valoración estudiantil · Escuela de Psicología UCV
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full mt-4">
                    <div className="flex items-center gap-3 flex-wrap flex-1">
                        <div className="flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
                            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>Filtros:</span>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={selectedCiclo}
                                onChange={(e) => handleCicloChange(e.target.value)}
                                className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full sm:w-auto border border-slate-300 dark:border-gray-800 focus:border-indigo-500"
                                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                            >
                                <option value="all">Todos los Ciclos</option>
                                <option value="Ciclo Básico">Ciclo Básico</option>
                                <option value="Mención">Mención</option>
                                <option value="Teorías Psicológicas">Teorías Psicológicas</option>
                            </select>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={selectedDepartamento}
                                onChange={(e) => handleDepartamentoChange(e.target.value)}
                                className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full truncate flex-1 min-w-[200px] border border-slate-300 dark:border-gray-800 focus:border-indigo-500"
                                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                            >
                                <option value="all">Todos los Departamentos</option>
                                {departamentos.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={selectedCatedra}
                                onChange={(e) => handleCatedraChange(e.target.value)}
                                className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full truncate flex-1 min-w-[200px] border border-slate-300 dark:border-gray-800 focus:border-indigo-500"
                                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                            >
                                <option value="all">Todas las Cátedras</option>
                                {catedras.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center justify-center gap-2 text-sm font-medium rounded-xl px-4 py-3 cursor-pointer transition-all shadow-sm hover:opacity-80 dark:hover:bg-gray-800 w-full sm:w-auto shrink-0 border border-slate-300 dark:border-gray-800"
                                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                            >
                                <X size={16} className="text-red-500" />
                                <span>Borrar Filtros</span>
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
