'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X, BookOpen, ThumbsUp, HelpCircle, Layers, CheckCircle2, FileText, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { mapSupabaseRowToSurveyEntry, SurveyEntry } from '@/data/mockData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import ReportePDF from './ReportePDF';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Asignaturas() {
    const [surveyData, setSurveyData] = useState<SurveyEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCiclo, setSelectedCiclo] = useState<string | 'all'>('all');
    const [selectedDepartamento, setSelectedDepartamento] = useState<string | 'all'>('all');
    const [selectedAsignatura, setSelectedAsignatura] = useState<string | 'all'>('all');

    // For Search Auto-complete
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Modals
    const [isEvaluacionModalOpen, setIsEvaluacionModalOpen] = useState(false);
    const [isContenidosModalOpen, setIsContenidosModalOpen] = useState(false);

    // PDF Generation
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);

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

    // Derived unique options subject to prior filters
    const ciclos = useMemo(() => {
        const set = new Set(surveyData.map(d => d.ciclo).filter(Boolean));
        return Array.from(set).sort();
    }, [surveyData]);

    const departamentos = useMemo(() => {
        let options = surveyData;
        if (selectedCiclo !== 'all') options = options.filter(d => d.ciclo === selectedCiclo);
        const set = new Set(options.map(d => d.departamento).filter(Boolean));
        return Array.from(set).sort() as string[];
    }, [surveyData, selectedCiclo]);

    const availableAsignaturas = useMemo(() => {
        let options = surveyData;
        if (selectedCiclo !== 'all') options = options.filter(d => d.ciclo === selectedCiclo);
        if (selectedDepartamento !== 'all') options = options.filter(d => d.departamento === selectedDepartamento);

        // Group by name + department to handle duplicates
        const map = new Map<string, { nombre: string, departamento: string }>();
        options.forEach(d => {
            if (!d.asignatura) return;
            const dep = d.departamento || 'Sin departamento';
            const key = `${d.asignatura}|${dep}`;
            if (!map.has(key)) {
                map.set(key, { nombre: d.asignatura, departamento: dep });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [surveyData, selectedCiclo, selectedDepartamento]);

    // Handle Search dropdown click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtered matches for the search bar
    const searchResults = useMemo(() => {
        if (!searchQuery) return availableAsignaturas;
        const query = searchQuery.toLowerCase();
        return availableAsignaturas.filter(a =>
            a.nombre.toLowerCase().includes(query) ||
            a.departamento.toLowerCase().includes(query)
        );
    }, [searchQuery, availableAsignaturas]);

    // Derived subject data if an Asignatura is selected
    const subjectDataList = useMemo(() => {
        if (selectedAsignatura === 'all') return [];
        // Extract the original subject name since the dropdown value might include the department identifier if we encoded it, 
        // but let's store selectedAsignatura as "Nombre|Departamento" to uniquely identify it.
        const [nombre, dep] = selectedAsignatura.split('|');
        return surveyData.filter(d =>
            d.asignatura === nombre &&
            (d.departamento || 'Sin departamento') === dep
        );
    }, [selectedAsignatura, surveyData]);

    const handleSelectAsignatura = (nombre: string, departamento: string) => {
        setSelectedAsignatura(`${nombre}|${departamento}`);
        setSearchQuery('');
        setIsSearchFocused(false);
    };

    const handleClearFilters = () => {
        setSelectedCiclo('all');
        setSelectedDepartamento('all');
        setSelectedAsignatura('all');
        setSearchQuery('');
    };

    const handleGenerarPDF = async () => {
        setIsGeneratingPDF(true);
        // Delay to allow React to render the hidden PDF template if it hasn't
        setTimeout(async () => {
            try {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pages = ['pdf-page-1', 'pdf-page-2', 'pdf-page-3', 'pdf-page-4'];

                for (let i = 0; i < pages.length; i++) {
                    const el = document.getElementById(pages[i]);
                    if (el) {
                        const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
                        const imgData = canvas.toDataURL('image/png');
                        const imgProps = pdf.getImageProperties(imgData);
                        const captureHeight = pdfWidth / (imgProps.width / imgProps.height);
                        if (i > 0) pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, captureHeight);
                    }
                }
                pdf.save(`Reporte_Curricular_${selectedAsignatura.split('|')[0] || 'Asignatura'}.pdf`);
            } catch (err) {
                console.error("Error al generar PDF:", err);
            } finally {
                setIsGeneratingPDF(false);
            }
        }, 500);
    };

    const hasActiveFilters = selectedCiclo !== 'all' || selectedDepartamento !== 'all' || selectedAsignatura !== 'all';

    // Calculation of metrics
    const metrics = useMemo(() => {
        if (subjectDataList.length === 0) return null;

        const count = subjectDataList.length;
        const avgCalidad = subjectDataList.reduce((acc, curr) => acc + curr.calidad_unidad_curricular, 0) / count;
        const avgContenidos = subjectDataList.reduce((acc, curr) => acc + curr.contenidosScore, 0) / count;
        const avgEvaluacion = subjectDataList.reduce((acc, curr) => acc + curr.evaluacionScore, 0) / count;

        // Gestión (Yes/No stats)
        const calcYesNo = (field: keyof SurveyEntry) => {
            let yes = 0, no = 0, total = 0;
            subjectDataList.forEach(d => {
                const val = (d[field] as string)?.toLowerCase()?.trim() || '';
                if (val === 'sí' || val === 'si' || val === 'yes') yes++;
                else if (val === 'no') no++;

                if (val) total++;
            });
            return total === 0 ? { yes: 0, no: 0 } : { yes: (yes / total) * 100, no: (no / total) * 100 };
        };

        const g1 = calcYesNo('gestion1');
        const g2 = calcYesNo('gestion2');
        const g3 = calcYesNo('gestion3');

        // Recursos (Frecuencia stats)
        const calcFrequency = (field: keyof SurveyEntry) => {
            let mucho = 0, bastante = 0, algo = 0, poco = 0, nada = 0, total = 0;
            subjectDataList.forEach(d => {
                const val = (d[field] as string)?.toLowerCase()?.trim() || '';
                if (val === 'mucho') mucho++;
                else if (val === 'bastante') bastante++;
                else if (val === 'algo') algo++;
                else if (val === 'poco') poco++;
                else if (val === 'nada') nada++;

                if (['mucho', 'bastante', 'algo', 'poco', 'nada'].includes(val)) total++;
            });

            return total === 0 ? { mucho: 0, bastante: 0, algo: 0, poco: 0, nada: 0 } : {
                mucho: (mucho / total) * 100,
                bastante: (bastante / total) * 100,
                algo: (algo / total) * 100,
                poco: (poco / total) * 100,
                nada: (nada / total) * 100
            };
        };

        const r13 = calcFrequency('contenido_recursos13');
        const r14 = calcFrequency('contenido_recursos14');
        const r15 = calcFrequency('contenido_recursos15');

        const calcEvaluacionFrequency = (field: keyof SurveyEntry) => {
            let siempre = 0, casiSiempre = 0, aVeces = 0, raraVez = 0, nunca = 0, total = 0;
            subjectDataList.forEach(d => {
                const rawVal = d[field];
                if (rawVal === undefined || rawVal === null || rawVal === '') return;

                const strVal = String(rawVal).toLowerCase().trim();
                const numVal = parseFloat(strVal);

                if (strVal === '4' || strVal === 'siempre' || numVal === 4) siempre++;
                else if (strVal === '3' || strVal === 'casi siempre' || numVal === 3) casiSiempre++;
                else if (strVal === '2' || strVal === 'a veces' || numVal === 2) aVeces++;
                else if (strVal === '1' || strVal === 'rara vez' || numVal === 1) raraVez++;
                else if (strVal === '0' || strVal === 'nunca' || numVal === 0) nunca++;
                else return;

                total++;
            });

            return total === 0 ? { siempre: 0, casiSiempre: 0, aVeces: 0, raraVez: 0, nunca: 0 } : {
                siempre: (siempre / total) * 100,
                casiSiempre: (casiSiempre / total) * 100,
                aVeces: (aVeces / total) * 100,
                raraVez: (raraVez / total) * 100,
                nunca: (nunca / total) * 100
            };
        };

        const e1 = calcEvaluacionFrequency('evaluacion1');
        const e2 = calcEvaluacionFrequency('evaluacion2');
        const e3 = calcEvaluacionFrequency('evaluacion3');
        const e4 = calcEvaluacionFrequency('evaluacion4');
        const e5 = calcEvaluacionFrequency('evaluacion5');
        const e6 = calcEvaluacionFrequency('evaluacion6');

        // Contenidos (Acuerdo scale)
        const calcAcuerdoFrequency = (field: keyof SurveyEntry) => {
            let totalAcuerdo = 0, acuerdo = 0, desacuerdo = 0, totalDesacuerdo = 0, total = 0;
            subjectDataList.forEach(d => {
                const rawVal = d[field];
                if (rawVal === undefined || rawVal === null || rawVal === '') return;
                const strVal = String(rawVal).toLowerCase().trim();
                const numVal = parseFloat(strVal);
                if (strVal === '4' || strVal === 'totalmente de acuerdo' || numVal === 4) totalAcuerdo++;
                else if (strVal === '3' || strVal === 'de acuerdo' || numVal === 3) acuerdo++;
                else if (strVal === '2' || strVal === 'en desacuerdo' || numVal === 2) desacuerdo++;
                else if (strVal === '1' || strVal === 'totalmente en desacuerdo' || numVal === 1) totalDesacuerdo++;
                else return;
                total++;
            });
            return total === 0
                ? { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }
                : {
                    totalAcuerdo: (totalAcuerdo / total) * 100,
                    acuerdo: (acuerdo / total) * 100,
                    desacuerdo: (desacuerdo / total) * 100,
                    totalDesacuerdo: (totalDesacuerdo / total) * 100,
                };
        };

        const c1 = calcAcuerdoFrequency('contenido_recursos1');
        const c2 = calcAcuerdoFrequency('contenido_recursos2');
        const c3 = calcAcuerdoFrequency('contenido_recursos3');
        const c4 = calcAcuerdoFrequency('contenido_recursos4');
        const c5 = calcAcuerdoFrequency('contenido_recursos5');
        const c6 = calcAcuerdoFrequency('contenido_recursos6');
        const c7 = calcAcuerdoFrequency('contenido_recursos7');
        const c8 = calcAcuerdoFrequency('contenido_recursos8');
        const c9 = calcAcuerdoFrequency('contenido_recursos9');
        const c10 = calcAcuerdoFrequency('contenido_recursos10');
        const c11 = calcAcuerdoFrequency('contenido_recursos11');
        const c12 = calcAcuerdoFrequency('contenido_recursos12');

        // Utilidad
        let poco = 0, algo = 0, bastante = 0, totalU = 0;
        subjectDataList.forEach(d => {
            const u = d.utilidad_asignatura;
            if (u === undefined || u === null) return;
            if (u <= 4) poco++;
            else if (u <= 7) algo++;
            else bastante++;
            totalU++;
        });

        const utilidadStats = totalU === 0 ? [] : [
            { name: 'Poco útil (0-4)', value: (poco / totalU) * 100, color: '#ef4444', count: poco },
            { name: 'Algo útil (5-7)', value: (algo / totalU) * 100, color: '#eab308', count: algo },
            { name: 'Bastante útil (>7)', value: (bastante / totalU) * 100, color: '#10b981', count: bastante },
        ];

        const docentes = Array.from(new Set(subjectDataList.map(d => d.docente).filter(d => d && d !== 'Desconocido')));

        return {
            count,
            avgCalidad,
            avgContenidos,
            avgEvaluacion,
            gestion: { g1, g2, g3 },
            recursos: { r13, r14, r15 },
            evaluacionesData: { e1, e2, e3, e4, e5, e6 },
            contenidosData: { c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12 },
            utilidad: utilidadStats,
            docentes,
        };
    }, [subjectDataList]);

    function getScoreColor(score: number): string {
        if (score >= 70) return '#10b981'; // Verde
        if (score >= 50) return '#eab308'; // Amarillo
        if (score >= 30) return '#f97316'; // Naranja
        return '#ef4444'; // Rojo
    }

    const HorizontalBar = ({ title, data }: { title: string, data: { yes: number, no: number } }) => (
        <div className="flex flex-col gap-1.5 mb-5 w-full">
            <div className="flex justify-between items-start gap-4 text-xs sm:text-sm font-medium">
                <span style={{ color: 'var(--text-secondary)' }} className="text-balance leading-snug">{title}</span>
                <span className="font-bold whitespace-nowrap shrink-0" style={{ color: 'var(--text-primary)' }}>
                    Sí: {data.yes.toFixed(1)}%
                </span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.yes}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-indigo-500"
                />
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.no}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-rose-400"
                />
            </div>
            <div className="flex justify-end text-[10px] font-semibold text-rose-500">
                No: {data.no.toFixed(1)}%
            </div>
        </div>
    );

    const FrequencyBar = ({ title, data }: { title: string, data: { mucho: number, bastante: number, algo: number, poco: number, nada: number } }) => (
        <div className="flex flex-col gap-2 mb-6 w-full pt-2">
            <div className="flex justify-between text-sm font-semibold">
                <span style={{ color: 'var(--text-primary)' }}>{title}</span>
            </div>

            {/* Combo Bar (Nada -> Poco -> Algo -> Bastante -> Mucho) */}
            <div className="w-full h-6 rounded-md bg-gray-200 dark:bg-gray-800 overflow-hidden flex mt-2 shadow-inner group">
                {data.nada > 0 && (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${data.nada}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-rose-500 relative flex items-center justify-center overflow-hidden" title={`Nada: ${data.nada.toFixed(1)}%`}>
                        <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.nada.toFixed(0)}%</span>
                    </motion.div>
                )}
                {data.poco > 0 && (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${data.poco}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="h-full bg-orange-400 relative flex items-center justify-center overflow-hidden" title={`Poco: ${data.poco.toFixed(1)}%`}>
                        <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.poco.toFixed(0)}%</span>
                    </motion.div>
                )}
                {data.algo > 0 && (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${data.algo}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-amber-400 relative flex items-center justify-center overflow-hidden" title={`Algo: ${data.algo.toFixed(1)}%`}>
                        <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.algo.toFixed(0)}%</span>
                    </motion.div>
                )}
                {data.bastante > 0 && (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${data.bastante}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                        className="h-full bg-teal-400 relative flex items-center justify-center overflow-hidden" title={`Bastante: ${data.bastante.toFixed(1)}%`}>
                        <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.bastante.toFixed(0)}%</span>
                    </motion.div>
                )}
                {data.mucho > 0 && (
                    <motion.div initial={{ width: 0 }} animate={{ width: `${data.mucho}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                        className="h-full bg-emerald-500 relative flex items-center justify-center overflow-hidden" title={`Mucho: ${data.mucho.toFixed(1)}%`}>
                        <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.mucho.toFixed(0)}%</span>
                    </motion.div>
                )}
            </div>
        </div>
    );

    const ContenidosBar = ({ title, data }: { title: string, data: { totalAcuerdo: number, acuerdo: number, desacuerdo: number, totalDesacuerdo: number } }) => (
        <div className="flex flex-col gap-2 mb-6 w-full pt-2">
            <div className="flex justify-between text-sm font-semibold">
                <span style={{ color: 'var(--text-primary)' }} className="text-balance leading-snug">{title}</span>
            </div>

            <div className="flex justify-between items-center text-[11px] mt-1 font-semibold">
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end w-full">
                    {data.totalDesacuerdo > 0 && <span style={{ color: '#ef4444' }}>Tot. Desacuerdo: {data.totalDesacuerdo.toFixed(1)}%</span>}
                    {data.desacuerdo > 0 && <span style={{ color: '#f97316' }}>En Desacuerdo: {data.desacuerdo.toFixed(1)}%</span>}
                    {data.acuerdo > 0 && <span style={{ color: '#2dd4bf' }}>De Acuerdo: {data.acuerdo.toFixed(1)}%</span>}
                    {data.totalAcuerdo > 0 && <span style={{ color: '#10b981' }}>Tot. Acuerdo: {data.totalAcuerdo.toFixed(1)}%</span>}
                </div>
            </div>

            <div className="w-full h-6 rounded-md overflow-hidden mt-1" style={{ background: 'transparent' }}>
                <div className="w-full h-full flex group bg-gray-200 dark:bg-gray-700">
                    {data.totalDesacuerdo > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.totalDesacuerdo}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-rose-500 relative flex items-center justify-center overflow-hidden shrink-0" title={`Tot. Desacuerdo: ${data.totalDesacuerdo.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.totalDesacuerdo.toFixed(0)}%</span>
                        </motion.div>
                    )}
                    {data.desacuerdo > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.desacuerdo}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                            className="h-full bg-orange-400 relative flex items-center justify-center overflow-hidden shrink-0" title={`En Desacuerdo: ${data.desacuerdo.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.desacuerdo.toFixed(0)}%</span>
                        </motion.div>
                    )}
                    {data.acuerdo > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.acuerdo}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="h-full bg-teal-400 relative flex items-center justify-center overflow-hidden shrink-0" title={`De Acuerdo: ${data.acuerdo.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.acuerdo.toFixed(0)}%</span>
                        </motion.div>
                    )}
                    {data.totalAcuerdo > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.totalAcuerdo}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            className="h-full bg-emerald-500 relative flex items-center justify-center overflow-hidden shrink-0" title={`Tot. Acuerdo: ${data.totalAcuerdo.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.totalAcuerdo.toFixed(0)}%</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );

    const EvaluacionBar = ({ title, data }: { title: string, data: { siempre: number, casiSiempre: number, aVeces: number, raraVez: number, nunca: number } }) => (
        <div className="flex flex-col gap-2 mb-6 w-full pt-2">
            <div className="flex justify-between text-sm font-semibold">
                <span style={{ color: 'var(--text-primary)' }} className="text-balance leading-snug">{title}</span>
            </div>

            <div className="flex justify-between items-center text-[11px] mt-1 font-semibold">
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end w-full">
                    {data.nunca > 0 && <span style={{ color: '#ef4444' }}>Nunca: {data.nunca.toFixed(1)}%</span>}
                    {data.raraVez > 0 && <span style={{ color: '#f97316' }}>Rara vez: {data.raraVez.toFixed(1)}%</span>}
                    {data.aVeces > 0 && <span style={{ color: '#fbbf24' }}>A veces: {data.aVeces.toFixed(1)}%</span>}
                    {data.casiSiempre > 0 && <span style={{ color: '#2dd4bf' }}>Casi Siempre: {data.casiSiempre.toFixed(1)}%</span>}
                    {data.siempre > 0 && <span style={{ color: '#10b981' }}>Siempre: {data.siempre.toFixed(1)}%</span>}
                </div>
            </div>

            {/* Combo Bar (Nunca -> Rara Vez -> A veces -> Casi Siempre -> Siempre) */}
            <div className="w-full h-6 rounded-md overflow-hidden mt-1" style={{ background: 'transparent' }}>
                <div className="w-full h-full flex group bg-gray-200 dark:bg-gray-700">
                    {data.nunca > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.nunca}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-rose-500 relative flex items-center justify-center overflow-hidden shrink-0" title={`Nunca: ${data.nunca.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.nunca.toFixed(0)}%</span>
                        </motion.div>
                    )}
                    {data.raraVez > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.raraVez}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                            className="h-full bg-orange-400 relative flex items-center justify-center overflow-hidden shrink-0" title={`Rara vez: ${data.raraVez.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.raraVez.toFixed(0)}%</span>
                        </motion.div>
                    )}
                    {data.aVeces > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.aVeces}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="h-full bg-amber-400 relative flex items-center justify-center overflow-hidden shrink-0" title={`A veces: ${data.aVeces.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.aVeces.toFixed(0)}%</span>
                        </motion.div>
                    )}
                    {data.casiSiempre > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.casiSiempre}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            className="h-full bg-teal-400 relative flex items-center justify-center overflow-hidden shrink-0" title={`Casi Siempre: ${data.casiSiempre.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.casiSiempre.toFixed(0)}%</span>
                        </motion.div>
                    )}
                    {data.siempre > 0 && (
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.siempre}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                            className="h-full bg-emerald-500 relative flex items-center justify-center overflow-hidden shrink-0" title={`Siempre: ${data.siempre.toFixed(1)}%`}>
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{data.siempre.toFixed(0)}%</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 w-full max-w-full pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-2"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))' }}>
                        <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            Rendimiento por Asignatura
                        </h2>
                        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Análisis integral de cada materia evaluada
                        </p>
                    </div>
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
                            onChange={(e) => {
                                setSelectedCiclo(e.target.value);
                                setSelectedDepartamento('all');
                                setSelectedAsignatura('all');
                            }}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full sm:w-auto border border-gray-200 dark:border-gray-800"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            <option value="all">Todos los Ciclos</option>
                            {ciclos.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedDepartamento}
                            onChange={(e) => {
                                setSelectedDepartamento(e.target.value);
                                setSelectedAsignatura('all');
                            }}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full truncate flex-1 min-w-[200px] border border-gray-200 dark:border-gray-800"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            <option value="all">Todos los Departamentos</option>
                            {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center justify-center gap-2 text-sm font-medium rounded-xl px-4 py-3 cursor-pointer transition-all shadow-sm hover:opacity-80 dark:hover:bg-gray-800 w-full sm:w-auto shrink-0 border border-gray-200 dark:border-gray-800"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            <X size={16} className="text-red-500" />
                            Borrar
                        </button>
                    )}
                </div>

                <div className="w-full lg:w-auto lg:min-w-[320px] relative" ref={searchRef}>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={16} />
                        <input
                            type="text"
                            placeholder="Buscar asignatura..."
                            value={isSearchFocused ? searchQuery : (selectedAsignatura !== 'all' ? selectedAsignatura.split('|')[0] : '')}
                            onFocus={() => { setIsSearchFocused(true); setSearchQuery(''); }}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-sm font-medium rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:border-indigo-500 transition-all shadow-sm border border-gray-200 dark:border-gray-800"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    {/* Auto-complete dropdown */}
                    <AnimatePresence>
                        {isSearchFocused && availableAsignaturas.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute mt-2 w-full z-50 rounded-xl shadow-xl border overflow-hidden max-h-[300px] overflow-y-auto"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                            >
                                {searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                        No se encontraron asignaturas.
                                    </div>
                                ) : (
                                    <ul className="py-1">
                                        {searchResults.map((a, i) => (
                                            <li
                                                key={i}
                                                onClick={() => handleSelectAsignatura(a.nombre, a.departamento)}
                                                className="px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer flex flex-col transition-colors"
                                            >
                                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{a.nombre}</span>
                                                <span className="text-[11px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.departamento}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
            ) : selectedAsignatura === 'all' || !metrics ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-3xl mt-8"
                    style={{ borderColor: 'var(--border-primary)' }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-800/50">
                        <Search className="text-gray-400" size={28} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Ninguna asignatura seleccionada</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Utiliza el buscador o los filtros para seleccionar una asignatura y ver su rendimiento.
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6 mt-6"
                >
                    {/* Header display of selected subject */}
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-2">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                                {selectedAsignatura.split('|')[0]}
                            </h3>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                {selectedAsignatura.split('|')[1]}
                            </p>
                        </div>
                        <button
                            onClick={handleGenerarPDF}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            {isGeneratingPDF ? 'Generando PDF...' : 'Generar PDF'}
                        </button>
                    </div>

                    {/* Docentes Evaluados Card */}
                    {metrics.docentes && metrics.docentes.length > 0 && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glow-card p-5 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                                    <UsersIcon />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Docentes evaluados</h4>
                                    <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{metrics.docentes.length} {metrics.docentes.length === 1 ? 'registrado' : 'registrados'}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {metrics.docentes.map((doc, i) => (
                                    <span key={i} className="px-3 py-1.5 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm theme-teacher-tag">
                                        {doc}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* KPIs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glow-card p-6 rounded-2xl flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3">
                                <UsersIcon />
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Evaluaciones Totales</span>
                            </div>
                            <div className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                                {metrics.count}
                            </div>
                            <div className="text-xs mt-2 font-medium text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Encuestas validadas
                            </div>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glow-card p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="text-purple-400" size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Índice Contenidos (0-100)</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 mt-2">
                                <div className="text-5xl font-extrabold tracking-tight" style={{ color: getScoreColor(metrics.avgContenidos) }}>
                                    {metrics.avgContenidos.toFixed(1)}
                                </div>
                                <button onClick={() => setIsContenidosModalOpen(true)} className="px-4 py-2 shrink-0 text-xs font-semibold rounded-lg bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 transition-colors shadow-sm cursor-pointer z-10" style={{ color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                    Ver detalle
                                </button>
                            </div>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glow-card p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="text-pink-400" size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Índice Evaluación (0-100)</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 mt-2">
                                <div className="text-5xl font-extrabold tracking-tight" style={{ color: getScoreColor(metrics.avgEvaluacion) }}>
                                    {metrics.avgEvaluacion.toFixed(1)}
                                </div>
                                <button onClick={() => setIsEvaluacionModalOpen(true)} className="px-4 py-2 shrink-0 text-xs font-semibold rounded-lg bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 transition-colors shadow-sm cursor-pointer z-10" style={{ color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                    Ver detalle
                                </button>
                            </div>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glow-card p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                                <Layers className="text-indigo-400" size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Calidad Curricular (0-100)</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 mt-2">
                                <div className="text-5xl font-extrabold tracking-tight" style={{ color: getScoreColor(metrics.avgCalidad) }}>
                                    {metrics.avgCalidad.toFixed(1)}
                                </div>
                                <div className="max-w-[120px] text-right text-[10px] leading-tight font-medium opacity-80" style={{ color: 'var(--text-muted)' }}>
                                    Compuesto por contenidos + evaluación
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Advanced Metrics / Bento Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Utilidad Segment */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glow-card p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-6">
                                <ThumbsUp size={18} className="text-emerald-500" />
                                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Utilidad de la Asignatura</h3>
                            </div>
                            <p className="text-xs mb-6 font-medium" style={{ color: 'var(--text-muted)' }}>
                                Porcentaje de estudiantes según su percepción de utilidad.
                            </p>

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-48 h-48 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={metrics.utilidad}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {metrics.utilidad.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                                                contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-col gap-4 w-full">
                                    {metrics.utilidad.map((u, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-800/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: u.color }} />
                                                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{u.value.toFixed(1)}%</div>
                                                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.count} evals</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Gestión docente (Yes/No) */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glow-card p-6 rounded-2xl flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-6">
                                <HelpCircle size={18} className="text-indigo-500" />
                                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Gestión (Respuestas Si/No)</h3>
                            </div>

                            <HorizontalBar title="Al comienzo del semestre le entregaron el Programa de la Asignatura" data={metrics.gestion.g1} />
                            <HorizontalBar title="Al comienzo del semestre le entregaron un cronograma que incluyera: los temas de cada clase, materiales delectura y fecha de evaluaciones" data={metrics.gestion.g2} />
                            <HorizontalBar title="Esta asignatura tiene horario de consultas fuera del horario de clase" data={metrics.gestion.g3} />

                        </motion.div>

                    </div>

                    {/* Recursos Pedagógicos */}
                    <div className="grid grid-cols-1">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glow-card p-6 sm:p-8 rounded-2xl w-full">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-orange-500 shrink-0" />
                                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recursos pedagógicos: Frecuencia de uso en la asignatura</h3>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold bg-gray-50 dark:bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800/60">
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Nada</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-orange-400 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Poco</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Algo</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-teal-400 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Bastante</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Mucho</span></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                <FrequencyBar title="Material de lectura" data={metrics.recursos.r13} />
                                <FrequencyBar title="Discusión en clase" data={metrics.recursos.r14} />
                                <FrequencyBar title="Recursos pedagógicos adicionales" data={metrics.recursos.r15} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Evaluacion Modal */}
                    <AnimatePresence>
                        {isEvaluacionModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsEvaluacionModalOpen(false)}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                                >
                                    <button
                                        onClick={() => setIsEvaluacionModalOpen(false)}
                                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <X size={20} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" />
                                    </button>

                                    <div className="flex items-center justify-between gap-3 mb-4 pr-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-500/10 text-pink-500">
                                                <FileText size={20} />
                                            </div>
                                            <h2 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
                                                Índice de evaluación
                                            </h2>
                                        </div>
                                        <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 shrink-0">
                                            <span className="text-2xl font-black" style={{ color: getScoreColor(metrics.avgEvaluacion) }}>{metrics.avgEvaluacion.toFixed(1)}</span>
                                            <span className="text-[10px] font-semibold text-pink-400 uppercase tracking-wider">/ 100</span>
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium leading-relaxed mb-8 p-4 rounded-xl bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/50 theme-tip-text">
                                        Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                                    </p>

                                    <div className="space-y-6">
                                        <EvaluacionBar title="1. Incluyeron actividades de evaluación del contenido dado en clases" data={metrics.evaluacionesData.e1} />
                                        <EvaluacionBar title="2. Conoció los resultados de las evaluaciones a tiempo para corregir errores y superar sus dificultades académicas de forma inmediata" data={metrics.evaluacionesData.e2} />
                                        <EvaluacionBar title="3. Las evaluaciones incluyeron diversidad de procedimientos" data={metrics.evaluacionesData.e3} />
                                        <EvaluacionBar title="4. Las evaluaciones promovieron la participación activa del estudiante" data={metrics.evaluacionesData.e4} />
                                        <EvaluacionBar title="5. Las evaluaciones incluyeron autoevaluación (Usted se evaluó a si mismo/a)" data={metrics.evaluacionesData.e5} />
                                        <EvaluacionBar title="6. Las evaluaciones incluyeron coevaluación (Usted evaluó a sus compañeros en algún momento)" data={metrics.evaluacionesData.e6} />
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Contenidos Modal */}
                    <AnimatePresence>
                        {isContenidosModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsContenidosModalOpen(false)}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                                >
                                    <button
                                        onClick={() => setIsContenidosModalOpen(false)}
                                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <X size={20} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" />
                                    </button>

                                    <div className="flex items-center justify-between gap-3 mb-4 pr-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-500">
                                                <BookOpen size={20} />
                                            </div>
                                            <h2 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-400">
                                                Índice de contenidos
                                            </h2>
                                        </div>
                                        <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 shrink-0">
                                            <span className="text-2xl font-black" style={{ color: getScoreColor(metrics.avgContenidos) }}>{metrics.avgContenidos.toFixed(1)}</span>
                                            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">/ 100</span>
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium leading-relaxed mb-8 p-4 rounded-xl bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/50 theme-tip-text">
                                        Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                                    </p>

                                    <div className="space-y-6">
                                        <ContenidosBar title="1. El Programa expresa el propósito y las competencias que se van a lograr con la Asignatura" data={metrics.contenidosData.c1} />
                                        <ContenidosBar title="2. El Programa le orientó en el proceso de su aprendizaje" data={metrics.contenidosData.c2} />
                                        <ContenidosBar title="3. Los temas se presentaron con la profundidad adecuada" data={metrics.contenidosData.c3} />
                                        <ContenidosBar title="4. Los contenidos están organizados de forma lógica" data={metrics.contenidosData.c4} />
                                        <ContenidosBar title="5. La asignatura le ha proporcionado la habilidad de tener una perspectiva más amplia de los temas tratados" data={metrics.contenidosData.c5} />
                                        <ContenidosBar title="6. Los temas resultaron interesantes" data={metrics.contenidosData.c6} />
                                        <ContenidosBar title="7. El número de temas tratados puede ser asimilado por los estudiantes" data={metrics.contenidosData.c7} />
                                        <ContenidosBar title="8. El contenido permite desarrollar la competencia propuesta" data={metrics.contenidosData.c8} />
                                        <ContenidosBar title="9. El contenido está actualizado" data={metrics.contenidosData.c9} />
                                        <ContenidosBar title="10. Se siente satisfecho con el contenido" data={metrics.contenidosData.c10} />
                                        <ContenidosBar title="11. La asignatura estimula la capacidad intelectual y crítica del estudiante" data={metrics.contenidosData.c11} />
                                        <ContenidosBar title="12. Se indica su vinculación con otros conocimientos y/o asignaturas" data={metrics.contenidosData.c12} />
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Hidden component only present to render the off-screen PDF pages */}
            {selectedAsignatura !== 'all' && metrics && (
                <ReportePDF metrics={metrics} asignaturaName={selectedAsignatura.split('|')[0]} departamentoName={selectedAsignatura.split('|')[1]} />
            )}
        </div>
    );
}

function UsersIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    )
}
