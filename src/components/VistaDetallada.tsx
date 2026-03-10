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
    const [rowLimit, setRowLimit] = useState<number | 'all'>(15);

    const [sortConfig, setSortConfig] = useState<{
        key: keyof DocenteStats;
        direction: 'asc' | 'desc';
    } | null>(null);

    const [hoveredInfo, setHoveredInfo] = useState<{ docente: string, asignaturas: string, x: number, y: number } | null>(null);

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

    const displayedData = useMemo(() => {
        if (rowLimit === 'all') return tableData;
        return tableData.slice(0, rowLimit);
    }, [tableData, rowLimit]);

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

    const headers: { label: React.ReactNode; key: keyof DocenteStats }[] = [
        { label: 'Docente', key: 'docente' },
        { label: 'Evaluaciones', key: 'evaluaciones' },
        { label: <span className="text-center block leading-tight">Índice <br /> de Contenidos</span>, key: 'promedioContenidos' },
        { label: <span className="text-center block leading-tight">Índice <br /> de Evaluación</span>, key: 'promedioEvaluacion' },
        { label: <span className="text-center block leading-tight">Índice <br /> de Desempeño Docente</span>, key: 'promedioDesempeno' },
        { label: 'NPS', key: 'promedioNPS' },
    ];

    function getScoreColor(score: number, max: number): string {
        const percentage = score / max;
        if (percentage >= 0.9) return '#10b981';
        if (percentage >= 0.75) return '#22d3ee';
        if (percentage >= 0.6) return '#f59e0b';
        return '#ef4444';
    }

    return (
        <div className="space-y-6 w-full max-w-full overflow-hidden sm:overflow-visible">
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
                className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full"
            >
                <div className="flex items-center gap-3 flex-wrap flex-1">
                    <div className="flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
                        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>Filtros:</span>
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedCiclo}
                            onChange={(e) => handleCicloChange(e.target.value)}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full sm:w-auto"
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

                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedMencion}
                            onChange={(e) => handleMencionChange(e.target.value)}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full sm:w-auto"
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

                    <div className="relative w-full sm:w-auto flex-1 min-w-[200px]">
                        <select
                            value={selectedAsignatura}
                            onChange={(e) => setSelectedAsignatura(e.target.value)}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full truncate"
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
                            className="flex items-center justify-center gap-2 text-sm font-medium rounded-xl px-4 py-3 cursor-pointer transition-all shadow-sm hover:opacity-80 dark:hover:bg-gray-800 w-full sm:w-auto shrink-0"
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

                <div className="w-full lg:w-auto lg:min-w-[300px]">
                    <div className="relative w-full">
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
                    className="glow-card p-0 sm:p-5 overflow-hidden w-full flex flex-col"
                >
                    <div className="px-4 pt-4 sm:px-0 sm:pt-0 sm:pb-3 flex items-center">
                        <span className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-800/50 flex flex-wrap gap-2 animate-pulse transition-opacity">
                            <span className="font-bold">💡 Tip:</span> Ubique un mouse o tap encima del nombre de un docente para ver las asignaturas que dicta.
                        </span>
                    </div>

                    <div className="overflow-x-auto w-full p-4 sm:p-0">
                        <table className="data-table w-full text-sm sm:text-base">
                            <thead>
                                <tr>
                                    {headers.map((header) => (
                                        <th
                                            key={header.key}
                                            onClick={() => handleSort(header.key)}
                                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                                        >
                                            <div className="flex items-center gap-1.5 whitespace-normal min-w-max md:min-w-0">
                                                <div className="flex-1 flex justify-center">
                                                    {header.label}
                                                </div>
                                                <span className="text-gray-400 shrink-0">
                                                    {renderSortIcon(header.key)}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedData.map((row, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: i * 0.05 }}
                                    >
                                        <td
                                            className="font-semibold text-xs whitespace-nowrap cursor-help relative"
                                            onMouseMove={(e) => setHoveredInfo({ docente: row.docente, asignaturas: row.asignaturas, x: e.clientX, y: e.clientY })}
                                            onMouseLeave={() => setHoveredInfo(null)}
                                        >
                                            <span className="border-b border-dashed border-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block py-1">
                                                {row.docente}
                                            </span>
                                        </td>
                                        <td className="font-medium text-center">{row.evaluaciones}</td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioContenidos, 100) }}>
                                            {row.promedioContenidos.toFixed(1)}
                                        </td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioEvaluacion, 100) }}>
                                            {row.promedioEvaluacion.toFixed(1)}
                                        </td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioDesempeno, 100) }}>
                                            {row.promedioDesempeno.toFixed(1)}
                                        </td>
                                        <td className="text-center font-medium" style={{ color: getScoreColor(row.promedioNPS, 100) }}>
                                            {row.promedioNPS.toFixed(1)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {displayedData.length === 0 && (
                            <div className="py-10 text-center text-gray-500 font-medium">
                                No se encontraron resultados con los filtros actuales.
                            </div>
                        )}
                    </div>

                    {/* Pagination Options */}
                    {tableData.length > 0 && (
                        <div className="flex justify-end p-4 border-t mt-auto" style={{ borderColor: 'var(--border-primary)' }}>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>Mostrar:</span>
                                <select
                                    value={rowLimit}
                                    onChange={(e) => setRowLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="text-sm font-medium rounded-xl px-4 py-2 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm"
                                    style={{
                                        background: 'var(--bg-card)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-primary)',
                                    }}
                                >
                                    <option value={15}>15 registros</option>
                                    <option value={20}>20 registros</option>
                                    <option value={40}>40 registros</option>
                                    <option value="all">Todos los registros</option>
                                </select>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Custom fixed modal for hover context */}
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
                    <p className="font-bold text-sm mb-1">{hoveredInfo.docente}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Asignaturas dictadas</p>
                    <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{hoveredInfo.asignaturas}</p>
                </div>
            )}
        </div>
    );
}
