'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, ChevronUp, ChevronDown, ChevronsUpDown, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { mapSupabaseRowToSurveyEntry, SurveyEntry } from '@/data/mockData';
import { getVistaDetalladaData, getUniqueMenciones, getUniqueAsignaturas, DocenteStats } from '@/data/dataUtils';

export default function VistaDetallada() {
    const [surveyData, setSurveyData] = useState<SurveyEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCiclo, setSelectedCiclo] = useState<string | 'all'>('all');
    const [selectedMencion, setSelectedMencion] = useState<string | 'all'>('all');
    const [selectedAsignatura, setSelectedAsignatura] = useState<string | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [sortConfig, setSortConfig] = useState<{
        key: keyof DocenteStats;
        direction: 'asc' | 'desc';
    } | null>(null);

    useEffect(() => {
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

    const menciones = useMemo(() => getUniqueMenciones(surveyData), [surveyData]);
    const asignaturas = useMemo(() => getUniqueAsignaturas(surveyData), [surveyData]);

    const filteredEntries = useMemo(() => {
        let filtered = [...surveyData];
        if (selectedCiclo !== 'all') {
            filtered = filtered.filter(d => d.ciclo && d.ciclo.trim() === selectedCiclo.trim());
        }
        if (selectedMencion !== 'all') {
            filtered = filtered.filter(d => d.mencion && d.mencion.trim() === selectedMencion.trim());
        }
        if (selectedAsignatura !== 'all') {
            filtered = filtered.filter(d => d.asignatura && d.asignatura.trim() === selectedAsignatura.trim());
        }
        return filtered;
    }, [surveyData, selectedCiclo, selectedMencion, selectedAsignatura]);

    const tableData = useMemo(() => {
        let data = getVistaDetalladaData(filteredEntries);

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(d =>
                d.docente.toLowerCase().includes(query) ||
                d.asignaturas.toLowerCase().includes(query)
            );
        }

        if (sortConfig) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    }, [filteredEntries, searchQuery, sortConfig]);

    const handleSort = (key: keyof DocenteStats) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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

    const renderSortIcon = (columnName: keyof DocenteStats) => {
        if (sortConfig?.key !== columnName) {
            return <ChevronsUpDown size={14} className="opacity-40" />;
        }
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    const handleClearFilters = () => {
        setSelectedCiclo('all');
        setSelectedMencion('all');
        setSelectedAsignatura('all');
        setSearchQuery('');
    };

    const hasActiveFilters = selectedCiclo !== 'all' || selectedMencion !== 'all' || selectedAsignatura !== 'all' || searchQuery !== '';

    const headers: { label: string; key: keyof DocenteStats }[] = [
        { label: 'Docente', key: 'docente' },
        { label: 'Asignatura que dicta', key: 'asignaturas' },
        { label: 'Evaluaciones', key: 'evaluaciones' },
        { label: 'Gestión', key: 'promedioGestion' },
        { label: 'Contenidos y Recursos', key: 'promedioContenidos' },
        { label: 'Evaluación', key: 'promedioEvaluacion' },
        { label: 'Desempeño Docente', key: 'promedioDesempeno' },
        { label: 'Calidad', key: 'promedioCalidad' },
    ];

    function getScoreColor(score: number, max: number): string {
        const percentage = score / max;
        if (percentage >= 0.9) return '#10b981';
        if (percentage >= 0.75) return '#22d3ee';
        if (percentage >= 0.6) return '#f59e0b';
        return '#ef4444';
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
            >
                <div>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Vista Detallada
                    </h2>
                    <p className="text-base mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Desglose de datos por docente y métricas
                    </p>
                </div>
            </motion.div>

            {/* Filters Area */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between"
            >
                <div className="flex items-center gap-4 flex-wrap">
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

                    <div className="relative">
                        <select
                            value={selectedAsignatura}
                            onChange={(e) => setSelectedAsignatura(e.target.value)}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full max-w-[250px] truncate"
                            style={{
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                            }}
                        >
                            <option value="all">Todas las Asignaturas</option>
                            {asignaturas.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-3 cursor-pointer transition-all shadow-sm hover:opacity-80 dark:hover:bg-gray-800"
                            style={{
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                            }}
                        >
                            <X size={16} className="text-red-500" />
                            Borrar
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto mt-4 xl:mt-0">
                    <div className="relative w-full min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={16} />
                        <input
                            type="text"
                            placeholder="Buscar docente o asignatura..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-sm font-medium rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 transition-all shadow-sm"
                            style={{
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Table Area */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="glow-card p-5"
                >
                    <div className="overflow-x-auto">
                        <table className="data-table w-full">
                            <thead>
                                <tr>
                                    {headers.map((header) => (
                                        <th
                                            key={header.key}
                                            onClick={() => handleSort(header.key)}
                                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                                        >
                                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                {header.label}
                                                <span className="text-gray-400">
                                                    {renderSortIcon(header.key)}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: i * 0.05 }}
                                    >
                                        <td className="font-semibold whitespace-nowrap">{row.docente}</td>
                                        <td>
                                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                {row.asignaturas}
                                            </span>
                                        </td>
                                        <td className="font-medium text-center">{row.evaluaciones}</td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioGestion, 10) }}>
                                            {row.promedioGestion.toFixed(1)}
                                        </td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioContenidos, 10) }}>
                                            {row.promedioContenidos.toFixed(1)}
                                        </td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioEvaluacion, 10) }}>
                                            {row.promedioEvaluacion.toFixed(1)}
                                        </td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioDesempeno, 10) }}>
                                            {row.promedioDesempeno.toFixed(1)}
                                        </td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioCalidad, 100) }}>
                                            {row.promedioCalidad.toFixed(1)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {tableData.length === 0 && (
                            <div className="py-10 text-center text-gray-500 font-medium">
                                No se encontraron resultados con los filtros actuales.
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
