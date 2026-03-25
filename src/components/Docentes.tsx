'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Filter, Search, X, Users, BookOpen, Layers, FileText, TrendingUp, Star, CheckCircle2, Loader2, Download, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { mapSupabaseRowToSurveyEntry, SurveyEntry } from '@/data/mockData';
import ReportePDFDocente from './ReportePDFDocente'; // Assuming this component is in the same directory

export default function Docentes() {
    const [surveyData, setSurveyData] = useState<SurveyEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCiclo, setSelectedCiclo] = useState<string | 'all'>('all');
    const [selectedDepartamento, setSelectedDepartamento] = useState<string | 'all'>('all');
    const [selectedCatedra, setSelectedCatedra] = useState<string | 'all'>('all');
    const [selectedAsignatura, setSelectedAsignatura] = useState<string | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [availableTeachers, setAvailableTeachers] = useState<string[]>([]);

    // New states for subject selection when searching by teacher
    const [isSubjModalOpen, setIsSubjModalOpen] = useState(false);
    const [availableSubjs, setAvailableSubjs] = useState<string[]>([]);

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

    // Derived unique options (filters)
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

    const catedras = useMemo(() => {
        let options = surveyData;
        if (selectedCiclo !== 'all') options = options.filter(d => d.ciclo === selectedCiclo);
        if (selectedDepartamento !== 'all') options = options.filter(d => d.departamento === selectedDepartamento);
        const set = new Set(options.map(d => d.catedra).filter(Boolean));
        return Array.from(set).sort() as string[];
    }, [surveyData, selectedCiclo, selectedDepartamento]);

    const asignaturasOptions = useMemo(() => {
        let options = surveyData;
        if (selectedCiclo !== 'all') options = options.filter(d => d.ciclo === selectedCiclo);
        if (selectedDepartamento !== 'all') options = options.filter(d => d.departamento === selectedDepartamento);
        if (selectedCatedra !== 'all') options = options.filter(d => d.catedra === selectedCatedra);
        const set = new Set(options.map(d => d.asignatura).filter(Boolean));
        return Array.from(set).sort() as string[];
    }, [surveyData, selectedCiclo, selectedDepartamento, selectedCatedra]);

    const handleClearFilters = () => {
        setSelectedCiclo('all');
        setSelectedDepartamento('all');
        setSelectedCatedra('all');
        setSelectedAsignatura('all');
        setSearchQuery('');
        setSelectedTeacher(null);
    };

    const searchDropdownResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();

        const teachersMap = new Map();

        surveyData.forEach(entry => {
            if (entry.docente.toLowerCase().includes(query) || entry.asignatura.toLowerCase().includes(query)) {
                if (!teachersMap.has(entry.docente)) {
                    teachersMap.set(entry.docente, {
                        docente: entry.docente,
                        departamentos: new Set([entry.departamento])
                    });
                } else {
                    teachersMap.get(entry.docente).departamentos.add(entry.departamento);
                }
            }
        });

        return Array.from(teachersMap.values()).map(t => ({
            docente: t.docente,
            departamentos: Array.from(t.departamentos).join(', ')
        })).slice(0, 8);
    }, [searchQuery, surveyData]);

    const handleTeacherSelect = (teacher: string) => {
        const teacherSubjs = Array.from(new Set(
            surveyData.filter(d => d.docente === teacher).map(d => d.asignatura)
        )).sort();

        if (teacherSubjs.length > 1) {
            setSelectedTeacher(teacher);
            setAvailableSubjs(teacherSubjs);
            setIsSubjModalOpen(true);
        } else if (teacherSubjs.length === 1) {
            setSelectedTeacher(teacher);
            setSelectedAsignatura(teacherSubjs[0]);
            setSearchQuery(teacher);
        } else {
            setSelectedTeacher(teacher);
            setSearchQuery(teacher);
        }

        setIsTeacherModalOpen(false);
        setIsSearchFocused(false);
    };

    const handleSubjSelect = (subj: string) => {
        setSelectedAsignatura(subj);
        setSearchQuery(selectedTeacher || '');
        setIsSubjModalOpen(false);
    };

    const [isContenidosModalOpen, setIsContenidosModalOpen] = useState(false);
    const [isEvaluacionModalOpen, setIsEvaluacionModalOpen] = useState(false);
    const [isDesempenoModalOpen, setIsDesempenoModalOpen] = useState(false);

    // PDF generation state
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const hasActiveFilters = selectedCiclo !== 'all' || selectedDepartamento !== 'all' || selectedCatedra !== 'all' || selectedAsignatura !== 'all' || searchQuery !== '';

    // Calculation of metrics for the selected teacher and subject
    const selectedEntries = useMemo(() => {
        if (!selectedTeacher) return [];
        let filtered = surveyData.filter(d => d.docente === selectedTeacher);
        if (selectedAsignatura !== 'all') {
            filtered = filtered.filter(d => d.asignatura === selectedAsignatura);
        }
        return filtered;
    }, [surveyData, selectedTeacher, selectedAsignatura]);

    const metrics = useMemo(() => {
        if (selectedEntries.length === 0) return null;

        const count = selectedEntries.length;
        const avgCalidad = selectedEntries.reduce((acc, curr) => acc + curr.calidad_unidad_curricular, 0) / count;
        const avgContenidos = selectedEntries.reduce((acc, curr) => acc + curr.contenidosScore, 0) / count;
        const avgEvaluacion = selectedEntries.reduce((acc, curr) => acc + curr.evaluacionScore, 0) / count;
        const avgDesempenoDocente = selectedEntries.reduce((acc, curr) => acc + (curr.desempenoScore || 0), 0) / count;

        // Same scales as Asignaturas module
        const calcAcuerdoFrequency = (field: keyof SurveyEntry) => {
            let totalAcuerdo = 0, acuerdo = 0, desacuerdo = 0, totalDesacuerdo = 0, total = 0;
            selectedEntries.forEach(d => {
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
            return total === 0 ? { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 } : {
                totalAcuerdo: (totalAcuerdo / total) * 100,
                acuerdo: (acuerdo / total) * 100,
                desacuerdo: (desacuerdo / total) * 100,
                totalDesacuerdo: (totalDesacuerdo / total) * 100,
            };
        };

        const calcEvaluacionFrequency = (field: keyof SurveyEntry) => {
            let siempre = 0, casiSiempre = 0, aVeces = 0, raraVez = 0, nunca = 0, total = 0;
            selectedEntries.forEach(d => {
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

        const calcYesNo = (field: keyof SurveyEntry) => {
            let yes = 0, no = 0, total = 0;
            selectedEntries.forEach(d => {
                const val = d[field];
                if (val === undefined || val === null || val === '') return;
                const s = String(val).toLowerCase().trim();
                // Map '1', 'si', 'sí', 'true', etc. 
                if (s === 'sí' || s === 'si' || s === '1' || val === 1 || s === 'true') yes++;
                else if (s === 'no' || s === '0' || val === 0 || s === 'false') no++;
                else return;
                total++;
            });
            return total === 0 ? { yes: 0, no: 0 } : {
                yes: (yes / total) * 100,
                no: (no / total) * 100
            };
        };

        const calcFrequency = (field: keyof SurveyEntry) => {
            let nada = 0, poco = 0, algo = 0, bastante = 0, mucho = 0, total = 0;
            selectedEntries.forEach(d => {
                const val = d[field];
                if (val === undefined || val === null || val === '') return;
                const s = String(val).toLowerCase().trim();
                if (s === 'mucho' || s === '4' || val === 4) mucho++;
                else if (s === 'bastante' || s === '3' || val === 3) bastante++;
                else if (s === 'algo' || s === '2' || val === 2) algo++;
                else if (s === 'poco' || s === '1' || val === 1) poco++;
                else if (s === 'nada' || s === '0' || val === 0) nada++;
                else return;
                total++;
            });
            return total === 0 ? { nada: 0, poco: 0, algo: 0, bastante: 0, mucho: 0 } : {
                nada: (nada / total) * 100,
                poco: (poco / total) * 100,
                algo: (algo / total) * 100,
                bastante: (bastante / total) * 100,
                mucho: (mucho / total) * 100
            };
        };

        return {
            count,
            avgCalidad,
            avgContenidos,
            avgEvaluacion,
            avgDesempenoDocente,
            contenidosData: {
                c1: calcAcuerdoFrequency('contenido_recursos1'),
                c2: calcAcuerdoFrequency('contenido_recursos2'),
                c3: calcAcuerdoFrequency('contenido_recursos3'),
                c4: calcAcuerdoFrequency('contenido_recursos4'),
                c5: calcAcuerdoFrequency('contenido_recursos5'),
                c6: calcAcuerdoFrequency('contenido_recursos6'),
                c7: calcAcuerdoFrequency('contenido_recursos7'),
                c8: calcAcuerdoFrequency('contenido_recursos8'),
                c9: calcAcuerdoFrequency('contenido_recursos9'),
                c10: calcAcuerdoFrequency('contenido_recursos10'),
                c11: calcAcuerdoFrequency('contenido_recursos11'),
                c12: calcAcuerdoFrequency('contenido_recursos12'),
            },
            evaluacionData: {
                e1: calcEvaluacionFrequency('evaluacion1'),
                e2: calcEvaluacionFrequency('evaluacion2'),
                e3: calcEvaluacionFrequency('evaluacion3'),
                e4: calcEvaluacionFrequency('evaluacion4'),
                e5: calcEvaluacionFrequency('evaluacion5'),
                e6: calcEvaluacionFrequency('evaluacion6'),
            },
            desempenoData: {
                d1: calcAcuerdoFrequency('desempenoDocente1'),
                d2: calcAcuerdoFrequency('desempenoDocente2'),
                d3: calcAcuerdoFrequency('desempenoDocente3'),
                d4: calcAcuerdoFrequency('desempenoDocente4'),
                d5: calcAcuerdoFrequency('desempenoDocente5'),
                d6: calcAcuerdoFrequency('desempenoDocente6'),
                d7: calcAcuerdoFrequency('desempenoDocente7'),
                d8: calcAcuerdoFrequency('desempenoDocente8'),
                d9: calcAcuerdoFrequency('desempenoDocente9'),
                d10: calcAcuerdoFrequency('desempenoDocente10'),
            },
            gestion: {
                g1: calcYesNo('gestion1'),
                g2: calcYesNo('gestion2'),
                g3: calcYesNo('gestion3'),
            },
            recursos: {
                r13: calcFrequency('contenido_recursos13'),
                r14: calcFrequency('contenido_recursos14'),
                r15: calcFrequency('contenido_recursos15'),
            },
            comentariosRecursos16: selectedEntries
                .map(e => e.contenido_recursos16)
                .filter(c => c !== null && c !== undefined && String(c).trim() !== ''),
            radarData: [
                { key: 'd1', label: 'Revisión del programa', fullQuestion: 'El/La Docente revisó los contenidos del Programa de la Asignatura al principio del curso', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente1Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente1Num !== undefined && c.desempenoDocente1Num !== 0).length, 1) },
                { key: 'd2', label: 'Planificación de actividades', fullQuestion: 'El/La Docente dio muestras de haber planificado las actividades de aula', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente2Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente2Num !== undefined && c.desempenoDocente2Num !== 0).length, 1) },
                { key: 'd3', label: 'Cumplimiento del horario', fullQuestion: 'El/La Docente cumplió el horario de clase', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente3Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente3Num !== undefined && c.desempenoDocente3Num !== 0).length, 1) },
                { key: 'd4', label: 'Cobertura de los contenidos', fullQuestion: 'El/La Docente cubrió los contenidos del Programa de la Asignatura', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente4Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente4Num !== undefined && c.desempenoDocente4Num !== 0).length, 1) },
                { key: 'd5', label: 'Dominio del contenido', fullQuestion: 'El/La Docente posee dominio pleno del contenido dictado en la materia', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente5Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente5Num !== undefined && c.desempenoDocente5Num !== 0).length, 1) },
                { key: 'd6', label: 'Respeto por los estudiantes', fullQuestion: 'El/La Docente mantuvo una actitud y trato respetuoso con los estudiantes', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente6Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente6Num !== undefined && c.desempenoDocente6Num !== 0).length, 1) },
                { key: 'd7', label: 'Enganche de los estudiantes', fullQuestion: 'El/La Docente lograba mantener su interés durante toda la sesión de clases', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente7Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente7Num !== undefined && c.desempenoDocente7Num !== 0).length, 1) },
                { key: 'd8', label: 'Interés por el aprendizaje', fullQuestion: 'El/La Docente mostró auténtico interés en el aprendizaje de los estudiantes', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente8Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente8Num !== undefined && c.desempenoDocente8Num !== 0).length, 1) },
                { key: 'd9', label: 'Disposición fuera del aula', fullQuestion: 'El/La Docente tuvo una buena disposición para atender a los estudiantes fuera del aula', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente9Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente9Num !== undefined && c.desempenoDocente9Num !== 0).length, 1) },
                { key: 'd10', label: 'Explicación de la evaluación', fullQuestion: 'El/La Docente explicó la manera de evaluar la Asignatura', avg: selectedEntries.reduce((a, c) => a + (c.desempenoDocente10Num || 0), 0) / Math.max(selectedEntries.filter(c => c.desempenoDocente10Num !== undefined && c.desempenoDocente10Num !== 0).length, 1) },
            ],
            npsData: (() => {
                const total = selectedEntries.filter(e => e.nps_docente > 0).length;
                if (total === 0) return null;
                const counts: Record<number, number> = {};
                for (let i = 1; i <= 10; i++) counts[i] = 0;
                selectedEntries.forEach(e => {
                    const v = Math.round(e.nps_docente);
                    if (v >= 1 && v <= 10) counts[v]++;
                });
                const scores = Array.from({ length: 10 }, (_, i) => ({
                    value: i + 1,
                    count: counts[i + 1],
                    pct: total > 0 ? (counts[i + 1] / total) * 100 : 0,
                }));
                const detractors = scores.filter(s => s.value <= 6).reduce((a, s) => a + s.pct, 0);
                const passives = scores.filter(s => s.value >= 7 && s.value <= 8).reduce((a, s) => a + s.pct, 0);
                const promoters = scores.filter(s => s.value >= 9).reduce((a, s) => a + s.pct, 0);
                const npsScore = Math.round(promoters - detractors);
                const avgNps = selectedEntries.filter(e => e.nps_docente > 0).reduce((a, e) => a + e.nps_docente, 0) / Math.max(total, 1);
                return { scores, detractors, passives, promoters, npsScore, total, avgNps };
            })(),
        };
    }, [selectedEntries]);

    const handleGenerarPDF = async () => {
        if (!selectedTeacher || !metrics) {
            console.warn("No hay docente o métricas seleccionadas para generar el PDF");
            return;
        }
        console.log("Iniciando generación de PDF para:", selectedTeacher);
        setIsGeneratingPDF(true);
        
        // Delay to allow React to render the hidden PDF template if it hasn't
        setTimeout(async () => {
            try {
                console.log("Cargando jsPDF...");
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pages = [
                    'docente-pdf-page-1', 
                    'docente-pdf-page-2', 
                    'docente-pdf-page-3', 
                    'docente-pdf-page-4', 
                    'docente-pdf-page-5', 
                    'docente-pdf-page-6',
                    'docente-pdf-page-7'
                ];

                for (let i = 0; i < pages.length; i++) {
                    const pageId = pages[i];
                    console.log(`Capturando página ${i + 1}: ${pageId}`);
                    const el = document.getElementById(pageId);
                    
                    if (el) {
                        // useCORS and allowTaint help with images
                        // scale 2 for better quality
                        const canvas = await html2canvas(el, { 
                            scale: 2, 
                            useCORS: true, 
                            logging: true, // Enable logging to see the "lab" error source if it persists
                            backgroundColor: '#ffffff'
                        });
                        
                        const imgData = canvas.toDataURL('image/png');
                        const imgProps = pdf.getImageProperties(imgData);
                        const captureHeight = pdfWidth / (imgProps.width / imgProps.height);
                        
                        if (i > 0) pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, captureHeight);
                        console.log(`Página ${i + 1} añadida al PDF`);
                    } else {
                        console.error(`No se encontró el elemento con ID: ${pageId}`);
                    }
                }
                
                const fileName = `Reporte_Docente_${selectedTeacher.replace(/\s/g, '_')}_${selectedAsignatura.replace(/\s/g, '_')}.pdf`;
                console.log("Guardando PDF como:", fileName);
                pdf.save(fileName);
                console.log("Proceso de PDF completado exitosamente");
            } catch (err) {
                console.error("Error crítico al generar PDF:", err);
                alert("Hubo un error al generar el PDF. Revisa la consola para más detalles.");
            } finally {
                setIsGeneratingPDF(false);
            }
        }, 800);
    };


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
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(99,102,241,0.2))' }}>
                        <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            Seguimiento de Docentes
                        </h2>
                        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Análisis individual del cuerpo docente
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
                                setSelectedCatedra('all');
                                setSelectedAsignatura('all');
                            }}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full sm:w-auto border border-gray-200 dark:border-gray-800 focus:border-emerald-500"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            <option value="all">Todos los Ciclos</option>
                            {ciclos.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="relative w-full sm:w-auto flex-1 min-w-[140px]">
                        <select
                            value={selectedDepartamento}
                            onChange={(e) => {
                                setSelectedDepartamento(e.target.value);
                                setSelectedCatedra('all');
                                setSelectedAsignatura('all');
                            }}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full truncate border border-gray-200 dark:border-gray-800 focus:border-emerald-500"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            <option value="all">Todos los Departamentos</option>
                            {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="relative w-full sm:w-auto flex-1 min-w-[140px]">
                        <select
                            value={selectedCatedra}
                            onChange={(e) => {
                                setSelectedCatedra(e.target.value);
                                setSelectedAsignatura('all');
                            }}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full truncate border border-gray-200 dark:border-gray-800 focus:border-emerald-500"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            <option value="all">Todas las Cátedras</option>
                            {catedras.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="relative w-full sm:w-auto flex-1 min-w-[140px]">
                        <select
                            value={selectedAsignatura}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedAsignatura(val);
                                if (val !== 'all') {
                                    const teachers = Array.from(new Set(
                                        surveyData.filter(d => d.asignatura === val).map(d => d.docente)
                                    )).sort();
                                    setAvailableTeachers(teachers);
                                    setIsTeacherModalOpen(true);
                                }
                            }}
                            className="text-sm font-medium rounded-xl px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm w-full truncate border border-gray-200 dark:border-gray-800 focus:border-emerald-500"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            <option value="all">Todas las Asignaturas</option>
                            {asignaturasOptions.map(a => <option key={a} value={a}>{a}</option>)}
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
                            placeholder="Buscar docente..."
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsSearchFocused(true);
                            }}
                            className="w-full text-sm font-medium rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:border-emerald-500 transition-all shadow-sm border border-gray-200 dark:border-gray-800"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    {/* Auto-complete dropdown */}
                    <AnimatePresence>
                        {isSearchFocused && searchQuery.trim() !== '' && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute mt-2 w-full z-50 rounded-xl shadow-xl border overflow-hidden max-h-[300px] overflow-y-auto"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                            >
                                {searchDropdownResults.length === 0 ? (
                                    <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                        No se encontraron coincidencias.
                                    </div>
                                ) : (
                                    <ul className="py-1">
                                        {searchDropdownResults.map((match, i) => (
                                            <li
                                                key={i}
                                                onClick={() => handleTeacherSelect(match.docente)}
                                                className="px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer flex flex-col transition-colors"
                                            >
                                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{match.docente}</span>
                                                <span className="text-[11px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{match.departamentos || 'Varios / Sin Dpto'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Metrics Content */}
            {!loading && metrics && (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-2">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
                                {selectedTeacher}
                            </h3>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                {selectedAsignatura !== 'all' ? selectedAsignatura : 'Todas sus asignaturas evaluadas'}
                            </p>
                        </div>
                        <button
                            onClick={handleGenerarPDF}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            {isGeneratingPDF ? 'Generando PDF...' : 'Generar PDF'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
                        <KPICard
                            title="Evaluaciones Totales"
                            value={metrics.count.toString()}
                            icon={<Users className="text-blue-400" size={14} />}
                        />
                        <KPICard
                            title="Índice Contenidos"
                            value={metrics.avgContenidos}
                            icon={<BookOpen className="text-purple-400" size={14} />}
                            onClickDetail={() => setIsContenidosModalOpen(true)}
                        />
                        <KPICard
                            title="Índice Evaluación"
                            value={metrics.avgEvaluacion}
                            icon={<FileText className="text-pink-400" size={14} />}
                            onClickDetail={() => setIsEvaluacionModalOpen(true)}
                        />
                        <KPICard
                            title="Desempeño Docente"
                            value={metrics.avgDesempenoDocente}
                            icon={<TrendingUp className="text-teal-400" size={14} />}
                            onClickDetail={() => setIsDesempenoModalOpen(true)}
                        />
                        <KPICard
                            title="Valoración U.C."
                            value={metrics.avgCalidad}
                            icon={<Star className="text-amber-400" size={14} />}
                        />
                    </div>

                    {/* Radar + NPS grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {metrics.radarData && metrics.radarData.some(d => d.avg > 0) && (
                            <DecagonRadarChart data={metrics.radarData} />
                        )}
                        {metrics.npsData && (
                            <NPSChart data={metrics.npsData} />
                        )}
                    </div>

                    {/* New layout: left (Recursos + Comentarios), right (Gestión) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
                        {/* LEFT COLUMN */}
                        <div className="flex flex-col gap-5">
                            {/* Component 2: Recursos pedagógicos */}
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glow-card p-6 sm:p-8 rounded-2xl w-full">
                                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                                            <BookOpen size={18} />
                                        </div>
                                        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recursos pedagógicos: Frecuencia de uso</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-2 text-[10px] sm:text-[11px] font-semibold bg-gray-50 dark:bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800/60">
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Nada</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-orange-400 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Poco</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Algo</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-teal-400 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Bastante</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-sm"></div><span style={{ color: 'var(--text-secondary)' }}>Mucho</span></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <FrequencyBar title="Material de lectura" data={metrics.recursos!.r13} />
                                    <FrequencyBar title="Discusión en clase" data={metrics.recursos!.r14} />
                                    <FrequencyBar title="Recursos pedagógicos adicionales" data={metrics.recursos!.r15} />
                                </div>
                            </motion.div>

                            {/* Component 3: Comentarios Recursos (Number 16) */}
                            {metrics.comentariosRecursos16.length > 0 && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glow-card p-6 rounded-2xl w-full flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Comentarios: Recursos Pedagógicos adicionales</h3>
                                    </div>
                                    <CommentsSlider comments={metrics.comentariosRecursos16} />
                                </motion.div>
                            )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-5">
                            {/* Component 1: Gestión */}
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glow-card p-6 sm:p-8 rounded-2xl flex flex-col justify-start h-full">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                                        <HelpCircle size={18} />
                                    </div>
                                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Gestión (Respuestas Si/No)</h3>
                                </div>
                                <div className="w-full flex flex-col justify-around gap-8">
                                    <HorizontalBar title="Al comienzo del semestre le entregaron el Programa de la Asignatura" data={metrics.gestion!.g1} />
                                    <HorizontalBar title="Al comienzo del semestre le entregaron un cronograma que incluyera: los temas de cada clase, materiales de lectura y fecha de evaluaciones" data={metrics.gestion!.g2} />
                                    <HorizontalBar title="Esta asignatura tiene horario de consultas fuera del horario de clase" data={metrics.gestion!.g3} />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Placeholder / Empty State */}
            {!loading && !metrics && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-3xl mt-8"
                    style={{ borderColor: 'var(--border-primary)' }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-800/50">
                        <Search className="text-gray-400" size={28} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {selectedTeacher ? `Seleccione una asignatura para ${selectedTeacher}` : 'Módulo de Docentes'}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {selectedTeacher
                            ? 'Seleccione una asignatura del filtro o buscador para ver el análisis.'
                            : 'Busque un docente para comenzar el análisis individual.'}
                    </p>
                </motion.div>
            )}

            <DetailModal
                isOpen={isContenidosModalOpen}
                onClose={() => setIsContenidosModalOpen(false)}
                title="Detalle de Contenidos y Recursos"
                icon={<BookOpen className="text-purple-500" size={24} />}
                score={metrics?.avgContenidos}
                gradient="from-purple-500 to-indigo-400"
            >
                <p className="text-sm font-medium leading-relaxed mb-8 p-4 rounded-xl bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/50 theme-tip-text">
                    Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                </p>
                <div className="space-y-6">
                    <ContenidosBar title="1. El Programa expresa el propósito y las competencias que se van a lograr con la Asignatura" data={metrics?.contenidosData.c1 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="2. El Programa le orientó en el proceso de su aprendizaje" data={metrics?.contenidosData.c2 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="3. Los temas se presentaron con la profundidad adecuada" data={metrics?.contenidosData.c3 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="4. Los contenidos están organizados de forma lógica" data={metrics?.contenidosData.c4 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="5. La asignatura le ha proporcionado la habilidad de tener una perspectiva más amplia de los temas tratados" data={metrics?.contenidosData.c5 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="6. Los temas resultaron interesantes" data={metrics?.contenidosData.c6 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="7. El número de temas tratados puede ser asimilado por los estudiantes" data={metrics?.contenidosData.c7 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="8. El contenido permite desarrollar la competencia propuesta" data={metrics?.contenidosData.c8 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="9. El contenido está actualizado" data={metrics?.contenidosData.c9 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="10. Se siente satisfecho con el contenido" data={metrics?.contenidosData.c10 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="11. La asignatura estimula la capacidad intelectual y crítica del estudiante" data={metrics?.contenidosData.c11 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="12. Se indica su vinculación con otros conocimientos y/o asignaturas" data={metrics?.contenidosData.c12 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                </div>
            </DetailModal>

            <DetailModal
                isOpen={isEvaluacionModalOpen}
                onClose={() => setIsEvaluacionModalOpen(false)}
                title="Detalle de Evaluación"
                icon={<FileText className="text-pink-500" size={24} />}
                score={metrics?.avgEvaluacion}
                gradient="from-pink-500 to-rose-400"
            >
                <p className="text-sm font-medium leading-relaxed mb-8 p-4 rounded-xl bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/50 theme-tip-text">
                    Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                </p>
                <div className="space-y-6">
                    <EvaluacionBar title="1. Incluyeron actividades de evaluación del contenido dado en clases" data={metrics?.evaluacionData.e1 || { siempre: 0, casiSiempre: 0, aVeces: 0, raraVez: 0, nunca: 0 }} />
                    <EvaluacionBar title="2. Conoci? los resultados de las evaluaciones a tiempo para corregir errores y superar sus dificultades acad?micas de forma inmediata" data={metrics?.evaluacionData.e2 || { siempre: 0, casiSiempre: 0, aVeces: 0, raraVez: 0, nunca: 0 }} />
                    <EvaluacionBar title="3. Las evaluaciones incluyeron diversidad de procedimientos" data={metrics?.evaluacionData.e3 || { siempre: 0, casiSiempre: 0, aVeces: 0, raraVez: 0, nunca: 0 }} />
                    <EvaluacionBar title="4. Las evaluaciones promovieron la participación activa del estudiante" data={metrics?.evaluacionData.e4 || { siempre: 0, casiSiempre: 0, aVeces: 0, raraVez: 0, nunca: 0 }} />
                    <EvaluacionBar title="5. Las evaluaciones incluyeron autoevaluación (Usted se evalu? a si mismo/a)" data={metrics?.evaluacionData.e5 || { siempre: 0, casiSiempre: 0, aVeces: 0, raraVez: 0, nunca: 0 }} />
                    <EvaluacionBar title="6. Las evaluaciones incluyeron coevaluación (Usted evalu? a sus compa?eros en algón momento)" data={metrics?.evaluacionData.e6 || { siempre: 0, casiSiempre: 0, aVeces: 0, raraVez: 0, nunca: 0 }} />
                </div>
            </DetailModal>

            <DetailModal
                isOpen={isDesempenoModalOpen}
                onClose={() => setIsDesempenoModalOpen(false)}
                title="Detalle de Desempeño Docente"
                icon={<TrendingUp className="text-teal-500" size={24} />}
                score={metrics?.avgDesempenoDocente}
                gradient="from-teal-500 to-emerald-400"
            >
                <p className="text-sm font-medium leading-relaxed mb-8 p-4 rounded-xl bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/50 theme-tip-text">
                    Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                </p>
                <div className="space-y-6">
                    <ContenidosBar title="1. El/La Docente revisó los contenidos del Programa de la Asignatura al principio del curso" data={metrics?.desempenoData.d1 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="2. El/La Docente dio muestras de haber planificado las actividades de aula" data={metrics?.desempenoData.d2 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="3. El/La Docente cumplió el horario de clase" data={metrics?.desempenoData.d3 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="4. El/La Docente cubrió los contenidos del Programa de la Asignatura" data={metrics?.desempenoData.d4 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="5. El/La Docente posee dominio pleno del contenido dictado en la materia" data={metrics?.desempenoData.d5 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="6. El/La Docente mantuvo una actitud y trato respetuoso con los estudiantes" data={metrics?.desempenoData.d6 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="7. El/La Docente lograba mantener su interés durante toda la sesión de clases" data={metrics?.desempenoData.d7 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="8. El/La Docente mostró auténtico interés en el aprendizaje de los estudiantes" data={metrics?.desempenoData.d8 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="9. El/La Docente tuvo una buena disposición para atender a los estudiantes fuera del aula" data={metrics?.desempenoData.d9 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                    <ContenidosBar title="10. El/La Docente explicó la manera de evaluar la Asignatura" data={metrics?.desempenoData.d10 || { totalAcuerdo: 0, acuerdo: 0, desacuerdo: 0, totalDesacuerdo: 0 }} />
                </div>
            </DetailModal>

            {/* Teacher Selection Modal */}
            <AnimatePresence>
                {isTeacherModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Seleccione un docente</h3>
                                    <button
                                        onClick={() => setIsTeacherModalOpen(false)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} style={{ color: 'var(--text-muted)' }} />
                                    </button>
                                </div>

                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    Asignatura: <span className="font-bold">{selectedAsignatura}</span>
                                </p>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {availableTeachers.map((teacher) => (
                                        <button
                                            key={teacher}
                                            onClick={() => handleTeacherSelect(teacher)}
                                            className="w-full text-left px-4 py-3 rounded-xl border transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 group"
                                            style={{ borderColor: 'var(--border-primary)', background: 'rgba(var(--bg-card-rgb), 0.5)' }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400" style={{ color: 'var(--text-primary)' }}>
                                                    {teacher}
                                                </span>
                                                <Users size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Asignatura Selection Modal (When searching by teacher) */}
            <AnimatePresence>
                {isSubjModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Seleccione una asignatura</h3>
                                    <button
                                        onClick={() => setIsSubjModalOpen(false)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} style={{ color: 'var(--text-muted)' }} />
                                    </button>
                                </div>

                                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    Docente: <span className="font-bold">{selectedTeacher}</span>
                                </p>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {availableSubjs.map((subj) => (
                                        <button
                                            key={subj}
                                            onClick={() => handleSubjSelect(subj)}
                                            className="w-full text-left px-4 py-3 rounded-xl border transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 group"
                                            style={{ borderColor: 'var(--border-primary)', background: 'rgba(var(--bg-card-rgb), 0.5)' }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400" style={{ color: 'var(--text-primary)' }}>
                                                    {subj}
                                                </span>
                                                <BookOpen size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hidden PDF component */}
            {!loading && metrics && (
                 <ReportePDFDocente metrics={metrics} docenteName={selectedTeacher} asignaturaInfo={selectedAsignatura} />
            )}
        </div>
    );
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
}

function KPICard({ title, value, icon, onClickDetail }: { title: string, value: string | number, icon: React.ReactNode, onClickDetail?: () => void }) {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
    const isPercentage = typeof value === 'string' ? value.includes('%') : true;

    return (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glow-card p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
                <div className="text-3xl font-extrabold tracking-tight" style={{ color: typeof numericValue === 'number' && isPercentage ? getScoreColor(numericValue) : 'var(--text-primary)' }}>
                    {typeof value === 'number' ? value.toFixed(1) : value}
                </div>
                {onClickDetail && (
                    <button
                        onClick={onClickDetail}
                        className="px-3 py-1.5 shrink-0 text-[10px] font-bold rounded-lg bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 transition-colors shadow-sm cursor-pointer z-10"
                        style={{ color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                    >
                        Ver detalle
                    </button>
                )}
            </div>
            {title === "Evaluaciones Totales" && (
                <div className="text-[10px] mt-1 font-medium text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Encuestas validadas
                </div>
            )}
        </motion.div>
    );
}


function DetailModal({ isOpen, onClose, title, icon, children, score, gradient }: { isOpen: boolean, onClose: () => void, title: string, icon: React.ReactNode, children: React.ReactNode, score?: number, gradient: string }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col border border-white/10"
                        style={{ background: 'var(--bg-card)' }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-20"
                        >
                            <X size={20} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" />
                        </button>

                        <div className="p-8 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-primary)' }}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                                    {icon}
                                </div>
                                <h2 className={`text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
                                    {title}
                                </h2>
                            </div>

                            <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-800/10 border border-gray-100 dark:border-gray-800/50 shrink-0 mr-8">
                                {score !== undefined && (
                                    <>
                                        <span className="text-2xl font-black" style={{ color: getScoreColor(score) }}>{score.toFixed(1)}</span>
                                        <span className="text-[10px] font-semibold opacity-40 uppercase tracking-wider">/ 100</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}


function ContenidosBar({ title, data }: { title: string, data: { totalAcuerdo: number, acuerdo: number, desacuerdo: number, totalDesacuerdo: number } }) {
    return (
        <div className="flex flex-col gap-2 mb-6 w-full">
            <span className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{title}</span>
            <div className="flex flex-wrap justify-between items-center text-[10px] mt-1 font-bold italic">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {data.totalDesacuerdo > 0 && <span className="text-rose-500">Totalmente en Desacuerdo: {data.totalDesacuerdo.toFixed(1)}%</span>}
                    {data.desacuerdo > 0 && <span className="text-orange-500">En Desacuerdo: {data.desacuerdo.toFixed(1)}%</span>}
                    {data.acuerdo > 0 && <span className="text-teal-500">De Acuerdo: {data.acuerdo.toFixed(1)}%</span>}
                    {data.totalAcuerdo > 0 && <span className="text-emerald-500">Totalmente de Acuerdo: {data.totalAcuerdo.toFixed(1)}%</span>}
                </div>
            </div>
            <div className="w-full h-4 rounded-lg overflow-hidden flex bg-slate-200 dark:bg-gray-800/80 shadow-inner">
                {data.totalDesacuerdo > 0 && <div style={{ width: `${data.totalDesacuerdo}%` }} className="h-full bg-rose-500 transition-all duration-700 border-r border-white/10"></div>}
                {data.desacuerdo > 0 && <div style={{ width: `${data.desacuerdo}%` }} className="h-full bg-orange-400 transition-all duration-700 border-r border-white/10"></div>}
                {data.acuerdo > 0 && <div style={{ width: `${data.acuerdo}%` }} className="h-full bg-teal-400 transition-all duration-700 border-r border-white/10"></div>}
                {data.totalAcuerdo > 0 && <div style={{ width: `${data.totalAcuerdo}%` }} className="h-full bg-emerald-500 transition-all duration-700"></div>}
            </div>
        </div>
    );
}

function EvaluacionBar({ title, data }: { title: string, data: { siempre: number, casiSiempre: number, aVeces: number, raraVez: number, nunca: number } }) {
    return (
        <div className="flex flex-col gap-2 mb-6 w-full">
            <span className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{title}</span>
            <div className="flex flex-wrap justify-between items-center text-[10px] mt-1 font-bold">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {data.nunca > 0 && <span className="text-rose-500">Nunca: {data.nunca.toFixed(1)}%</span>}
                    {data.raraVez > 0 && <span className="text-orange-500">Rara vez: {data.raraVez.toFixed(1)}%</span>}
                    {data.aVeces > 0 && <span className="text-amber-500">A veces: {data.aVeces.toFixed(1)}%</span>}
                    {data.casiSiempre > 0 && <span className="text-teal-500">Casi Siempre: {data.casiSiempre.toFixed(1)}%</span>}
                    {data.siempre > 0 && <span className="text-emerald-500">Siempre: {data.siempre.toFixed(1)}%</span>}
                </div>
            </div>
            <div className="w-full h-4 rounded-lg overflow-hidden flex bg-slate-200 dark:bg-gray-800/80 shadow-inner">
                {data.nunca > 0 && <div style={{ width: `${data.nunca}%` }} className="h-full bg-rose-500 transition-all duration-700 border-r border-white/10"></div>}
                {data.raraVez > 0 && <div style={{ width: `${data.raraVez}%` }} className="h-full bg-orange-400 transition-all duration-700 border-r border-white/10"></div>}
                {data.aVeces > 0 && <div style={{ width: `${data.aVeces}%` }} className="h-full bg-amber-400 transition-all duration-700 border-r border-white/10"></div>}
                {data.casiSiempre > 0 && <div style={{ width: `${data.casiSiempre}%` }} className="h-full bg-teal-400 transition-all duration-700 border-r border-white/10"></div>}
                {data.siempre > 0 && <div style={{ width: `${data.siempre}%` }} className="h-full bg-emerald-500 transition-all duration-700"></div>}
            </div>
        </div>
    );
}

type RadarDatum = { key: string; label: string; fullQuestion: string; avg: number };

function DecagonRadarChart({ data }: { data: RadarDatum[] }) {
    const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });

    const N = 10;
    const cx = 260;
    const cy = 260;
    const maxR = 180;   // radius for value = 3
    const minVal = 0;
    const maxVal = 3;

    // Levels to draw (0, 1, 2, 3)
    const levels = [0, 1, 2, 3];

    // Angle: start from top (-90?), go clockwise
    const angleOf = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;

    const toXY = (idx: number, val: number) => {
        const r = ((val - minVal) / (maxVal - minVal)) * maxR;
        const a = angleOf(idx);
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };

    const toXYFull = (idx: number, val: number) => {
        const r = ((val - minVal) / (maxVal - minVal)) * maxR;
        const a = angleOf(idx);
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };

    // Build polygon path for a given level value
    const levelPath = (val: number) => {
        return data.map((_, i) => {
            const { x, y } = toXYFull(i, val);
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(' ') + ' Z';
    };

    // Data polygon path
    const dataPath = data.map((d, i) => {
        const safeAvg = Math.min(Math.max(d.avg || minVal, minVal), maxVal);
        const { x, y } = toXY(i, safeAvg);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ') + ' Z';

    // Label positioning ? push outward a bit more
    const labelOffset = 28;
    const labelXY = (i: number) => {
        const a = angleOf(i);
        const r = maxR + labelOffset;
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };

    const svgWidth = 520;
    const svgHeight = 520;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glow-card rounded-2xl p-6 w-full"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500">
                    <TrendingUp size={18} />
                </div>
                <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Perfil de Desempeño Docente</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Escala de 0 a 3. Pase el cursor sobre cada vértice para ver el detalle</p>
                </div>
            </div>

            <div className="relative flex justify-center items-center overflow-visible">
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="overflow-visible"
                >
                    {/* Grid level rings */}
                    {levels.map((lv) => (
                        <path
                            key={lv}
                            d={levelPath(lv)}
                            fill="none"
                            stroke={lv === 3 ? 'rgba(20,184,166,0.3)' : 'rgba(148,163,184,0.15)'}
                            strokeWidth={lv === 3 ? 1.5 : 1}
                            strokeDasharray={lv < 3 ? '4 4' : undefined}
                        />
                    ))}

                    {/* Level value labels (on the right axis) */}
                    {levels.map((lv) => {
                        const { x, y } = toXYFull(0, lv);
                        return (
                            <text key={`lv-${lv}`} x={x + 6} y={y + 4} fontSize="9" fill="rgba(100,116,139,0.8)" textAnchor="start">
                                {lv}
                            </text>
                        );
                    })}

                    {/* Axis spokes */}
                    {data.map((_, i) => {
                        const { x, y } = toXYFull(i, maxVal);
                        return (
                            <line
                                key={`spoke-${i}`}
                                x1={cx} y1={cy}
                                x2={x} y2={y}
                                stroke="rgba(148,163,184,0.2)"
                                strokeWidth={1}
                            />
                        );
                    })}

                    {/* Data area */}
                    <path
                        d={dataPath}
                        fill="rgba(20,184,166,0.15)"
                        stroke="#14b8a6"
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {data.map((d, i) => {
                        const safeAvg = Math.min(Math.max(d.avg || minVal, minVal), maxVal);
                        const { x, y } = toXY(i, safeAvg);
                        const isHovered = hoveredIdx === i;
                        return (
                            <g key={`point-${i}`}>
                                <circle
                                    cx={x} cy={y} r={isHovered ? 8 : 5}
                                    fill={isHovered ? '#14b8a6' : '#fff'}
                                    stroke="#14b8a6"
                                    strokeWidth={isHovered ? 3 : 2}
                                    style={{ cursor: 'pointer', transition: 'r 0.15s, fill 0.15s' }}
                                    onMouseEnter={(e) => {
                                        setHoveredIdx(i);
                                        const svgEl = (e.currentTarget as SVGCircleElement).closest('svg')!.getBoundingClientRect();
                                        setTooltipPos({ x: e.clientX - svgEl.left, y: e.clientY - svgEl.top });
                                    }}
                                    onMouseMove={(e) => {
                                        const svgEl = (e.currentTarget as SVGCircleElement).closest('svg')!.getBoundingClientRect();
                                        setTooltipPos({ x: e.clientX - svgEl.left, y: e.clientY - svgEl.top });
                                    }}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                                {isHovered && (
                                    <text
                                        x={x} y={y - 13}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="bold"
                                        fill="#14b8a6"
                                    >
                                        {safeAvg.toFixed(2)}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Labels */}
                    {data.map((d, i) => {
                        const { x, y } = labelXY(i);
                        const a = angleOf(i) * (180 / Math.PI);
                        const isRight = Math.cos(angleOf(i)) > 0.1;
                        const isLeft = Math.cos(angleOf(i)) < -0.1;
                        const anchor = isRight ? 'start' : isLeft ? 'end' : 'middle';
                        const isHovered = hoveredIdx === i;
                        return (
                            <text
                                key={`label-${i}`}
                                x={x}
                                y={y}
                                textAnchor={anchor}
                                dominantBaseline="middle"
                                fontSize="11"
                                fontWeight={isHovered ? '800' : '600'}
                                fill={isHovered ? '#14b8a6' : 'var(--text-primary, #0f172a)'}
                                style={{ cursor: 'default', transition: 'fill 0.15s, font-weight 0.15s' }}
                            >
                                {d.label}
                            </text>
                        );
                    })}
                </svg>

                {/* Tooltip */}
                <AnimatePresence>
                    {hoveredIdx !== null && (
                        <motion.div
                            key="tooltip"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute pointer-events-none z-50 max-w-[220px] p-3 rounded-2xl shadow-2xl border text-sm"
                            style={{
                                left: tooltipPos.x + 12,
                                top: tooltipPos.y - 60,
                                background: 'var(--bg-card)',
                                borderColor: 'rgba(20,184,166,0.3)',
                            }}
                        >
                            <p className="font-black text-teal-500 text-base mb-1">
                                {(Math.min(Math.max(data[hoveredIdx].avg || 0, 0), 3)).toFixed(2)} / 3
                            </p>
                            <p className="font-bold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                                {data[hoveredIdx].label}
                            </p>
                            <p className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                                {data[hoveredIdx].fullQuestion}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

type NPSData = {
    scores: { value: number; count: number; pct: number }[];
    detractors: number;
    passives: number;
    promoters: number;
    npsScore: number;
    total: number;
    avgNps: number;
};

function NPSGauge({ avg }: { avg: number }) {
    // Premium Semicircle gauge. Left=1, Right=10. Angle: 180deg -> 0deg
    const cx = 160, cy = 115, R = 95, strokeW = 18;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const pt = (deg: number, r: number) => ({
        x: cx + r * Math.cos(toRad(deg)),
        y: cy - r * Math.sin(toRad(deg)),
    });

    const valToAngle = (v: number) => 180 - ((v - 1) / 9) * 180;

    const arcPath = (fromVal: number, toVal: number) => {
        const a1 = valToAngle(fromVal);
        const a2 = valToAngle(toVal);
        const p1 = pt(a1, R);
        const p2 = pt(a2, R);
        return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    };

    const segments = [
        { from: 1, to: 6, color: '#ef4444' },
        { from: 6, to: 8, color: '#f59e0b' },
        { from: 8, to: 10, color: '#10b981' },
    ];

    const needleAngle = valToAngle(Math.min(Math.max(avg, 1), 10));
    const activeColor = avg <= 6.0 ? '#ef4444' : avg <= 8.0 ? '#f59e0b' : '#10b981';

    return (
        <div className="relative w-full max-w-[320px] mx-auto overflow-visible select-none pb-4">
            <svg width="100%" viewBox="0 0 320 180" className="overflow-visible drop-shadow-sm">

                {/* Background Full Arc Track */}
                <path d={arcPath(1, 10)} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={strokeW + 6} strokeLinecap="round" />

                {/* Colored Segment Arcs */}
                {segments.map((s, i) => {
                    const gap = 0.15;
                    const f = s.from === 1 ? s.from : s.from + gap;
                    const t = s.to === 10 ? s.to : s.to - gap;
                    if (f >= t) return null;
                    return (
                        <path key={i} d={arcPath(f, t)} fill="none" stroke={s.color} strokeWidth={strokeW} strokeLinecap="round" className="drop-shadow-sm" opacity={0.95} />
                    );
                })}

                {/* Score Value (Centered Below Pivot) */}
                <text x={cx} y={cy + 54} textAnchor="middle" className="text-5xl font-black drop-shadow-sm" fill={activeColor}>
                    {avg.toFixed(1)}
                </text>
                <text x={cx} y={cy + 72} textAnchor="middle" className="text-[10px] font-bold uppercase tracking-[0.2em]" fill="var(--text-muted)">
                    Promedio NPS
                </text>

                {/* Animated Dynamic Needle */}
                <g transform={`translate(${cx}, ${cy})`}>
                    <motion.g
                        initial={{ rotate: -180 }}
                        animate={{ rotate: -needleAngle }}
                        transition={{ type: "spring", stiffness: 45, damping: 15, delay: 0.15 }}
                        style={{ originX: "50%", originY: "50%" }}
                    >
                        {/* Invisible bounding box circle to force Framer Motion's origin to be exact 0,0 */}
                        <circle cx="0" cy="0" r="100" opacity="0" pointerEvents="none" />

                        {/* Glow under pointer */}
                        <circle cx="0" cy="0" r="16" fill={activeColor} opacity="0.15" className="blur-md" />
                        <circle cx="0" cy="0" r="9" fill={activeColor} opacity="0.25" />

                        {/* Needle body */}
                        <path
                            d={`M 0 -2.5 L 0 2.5 L ${R - strokeW / 2 + 2} 0.5 L ${R - strokeW / 2 + 2} -0.5 Z`}
                            fill={activeColor}
                        />

                        {/* Pivot dot */}
                        <circle cx="0" cy="0" r="4.5" fill="var(--bg-card, #ffffff)" stroke={activeColor} strokeWidth="3" />
                    </motion.g>
                </g>
            </svg>
        </div>
    );
}

function NPSChart({ data }: { data: NPSData }) {
    const [hovered, setHovered] = React.useState<number | null>(null);

    const colorOf = (v: number) => {
        if (v <= 6) return { bar: '#f87171', text: '#ef4444' };
        if (v <= 8) return { bar: '#fbbf24', text: '#d97706' };
        return { bar: '#34d399', text: '#10b981' };
    };

    const faceOf = (v: number) => {
        if (v <= 6) return (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <circle cx="12" cy="12" r="10" fill="#ef4444" opacity="0.9" />
                <circle cx="9" cy="9.5" r="1.2" fill="white" />
                <circle cx="15" cy="9.5" r="1.2" fill="white" />
                <path d="M8.5 15.5 Q12 12.5 15.5 15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
        );
        if (v <= 8) return (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <circle cx="12" cy="12" r="10" fill="#fbbf24" opacity="0.9" />
                <circle cx="9" cy="9.5" r="1.2" fill="white" />
                <circle cx="15" cy="9.5" r="1.2" fill="white" />
                <line x1="8.5" y1="15" x2="15.5" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        );
        return (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <circle cx="12" cy="12" r="10" fill="#34d399" opacity="0.9" />
                <circle cx="9" cy="9.5" r="1.2" fill="white" />
                <circle cx="15" cy="9.5" r="1.2" fill="white" />
                <path d="M8.5 13 Q12 17 15.5 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
        );
    };

    const maxPct = Math.max(...data.scores.map(s => s.pct), 1);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glow-card rounded-2xl w-full flex flex-col pt-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500"><Users size={18} /></div>
                <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Net Promoter Score - ¿Qué tan probable es que tome otro curso con el Docente?</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Distribucion de valoraciones - {data.total} respuestas</p>
                </div>
            </div>

            {/* Gauge */}
            <div className="px-6">
                <NPSGauge avg={data.avgNps} />
            </div>

            {/* Bars with faces below number */}
            <div className="flex items-end gap-1 px-6 mt-2" style={{ height: '120px' }}>
                {data.scores.map((s) => {
                    const c = colorOf(s.value);
                    const barH = Math.max((s.pct / maxPct) * 60, s.pct > 0 ? 4 : 0);
                    const isHov = hovered === s.value;
                    return (
                        <div
                            key={s.value}
                            className="flex-1 flex flex-col items-center justify-end gap-0.5 h-full cursor-default"
                            onMouseEnter={() => setHovered(s.value)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <span
                                className="text-[11px] sm:text-[12px] font-black transition-opacity mb-0.5"
                                style={{
                                    color: c.text,
                                    opacity: s.pct > 0 ? (hovered !== null && !isHov ? 0.35 : 1) : 0
                                }}
                            >
                                {s.pct > 0 ? `${s.pct.toFixed(1)}%` : ''}
                            </span>
                            <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.5, delay: s.value * 0.04 }}
                                className="w-full rounded-t-lg origin-bottom"
                                style={{ height: `${barH}px`, background: c.bar, opacity: hovered !== null && !isHov ? 0.35 : 1, transition: 'opacity 0.15s' }}
                            />
                            <div className="flex flex-col items-center gap-1 mt-1">
                                <span className="text-[11px] font-extrabold leading-none" style={{ color: isHov ? c.text : 'var(--text-muted)' }}>{s.value}</span>
                                {faceOf(s.value)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Vertical Bars */}
            <div className="flex w-full items-end gap-3 sm:gap-6 mt-8 h-52 px-4 sm:px-6">
                {([
                    { label: 'Detractores', pct: data.detractors, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: '#f87171' },
                    { label: 'Pasivos', pct: data.passives, color: '#d97706', bg: 'rgba(217,119,6,0.15)', border: '#fbbf24' },
                    { label: 'Promotores', pct: data.promoters, color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: '#34d399' },
                ] as const).map((seg, i) => {
                    const barH = Math.max((seg.pct / 100) * 75, 2); // 75% max height
                    return (
                        <div key={seg.label} className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-xl sm:text-2xl font-black mb-2" style={{ color: seg.color }}>
                                {seg.pct.toFixed(1)}%
                            </span>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${barH}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                                className="w-full rounded-t-xl border-t-[5px]"
                                style={{ background: seg.bg, borderColor: seg.border }}
                            />
                            <div className="w-full flex items-center justify-center pt-3 pb-6">
                                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-center" style={{ color: seg.color }}>
                                    {seg.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function HorizontalBar({ title, data }: { title: string, data: { yes: number, no: number } }) {
    return (
        <div className="flex flex-col gap-2 relative">
            <span className="text-sm font-semibold leading-relaxed mb-3 mr-14" style={{ color: 'var(--text-primary)' }}>{title}</span>
            <div className="flex justify-between items-center text-[11px] sm:text-xs font-black absolute top-0 right-0">
                <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">Sí: <span className="text-indigo-800 dark:text-indigo-300">{data.yes.toFixed(1)}%</span></span>
            </div>
            <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-rose-100 dark:bg-rose-950/30 shadow-inner">
                {/* La parte en "Sí" domina en morado, la parte en "No" en rosa fuerte según maqueta */}
                <div style={{ width: `${data.yes}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 shadow-[2px_0_8px_rgba(99,102,241,0.3)] shrink-0"></div>
                <div style={{ width: `${data.no}%` }} className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500 shrink-0"></div>
            </div>
            {data.no > 0 && (
                <div className="w-full flex justify-end mt-0.5">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">No: {data.no.toFixed(1)}%</span>
                </div>
            )}
        </div>
    );
}

function FrequencyBar({ title, data }: { title: string, data: { mucho: number, bastante: number, algo: number, poco: number, nada: number } }) {
    return (
        <div className="flex flex-col gap-3 w-full group cursor-default">
            <span className="text-xs font-bold leading-tight h-[2rem] flex items-center group-hover:text-indigo-500 transition-colors" style={{ color: 'var(--text-primary)' }}>{title}</span>
            <div className="w-full h-6 rounded-lg overflow-hidden flex bg-slate-200 dark:bg-gray-800/80 shadow-inner border border-slate-200/50 dark:border-gray-700/50">
                {data.nada > 0 && (
                    <div style={{ width: `${data.nada}%` }} className="h-full bg-rose-500 transition-all duration-700 border-r border-white/10 shrink-0 flex items-center justify-center overflow-hidden" title={`Nada: ${data.nada.toFixed(1)}%`}>
                        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate px-1">{data.nada.toFixed(1)}%</span>
                    </div>
                )}
                {data.poco > 0 && (
                    <div style={{ width: `${data.poco}%` }} className="h-full bg-orange-400 transition-all duration-700 border-r border-white/10 shrink-0 flex items-center justify-center overflow-hidden" title={`Poco: ${data.poco.toFixed(1)}%`}>
                        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate px-1">{data.poco.toFixed(1)}%</span>
                    </div>
                )}
                {data.algo > 0 && (
                    <div style={{ width: `${data.algo}%` }} className="h-full bg-amber-400 transition-all duration-700 border-r border-white/10 shrink-0 flex items-center justify-center overflow-hidden" title={`Algo: ${data.algo.toFixed(1)}%`}>
                        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate px-1">{data.algo.toFixed(1)}%</span>
                    </div>
                )}
                {data.bastante > 0 && (
                    <div style={{ width: `${data.bastante}%` }} className="h-full bg-teal-400 transition-all duration-700 border-r border-white/10 shrink-0 flex items-center justify-center overflow-hidden" title={`Bastante: ${data.bastante.toFixed(1)}%`}>
                        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate px-1">{data.bastante.toFixed(1)}%</span>
                    </div>
                )}
                {data.mucho > 0 && (
                    <div style={{ width: `${data.mucho}%` }} className="h-full bg-emerald-500 transition-all duration-700 shrink-0 flex items-center justify-center overflow-hidden" title={`Mucho: ${data.mucho.toFixed(1)}%`}>
                        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate px-1">{data.mucho.toFixed(1)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function CommentsSlider({ comments }: { comments: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prev = () => {
        setCurrentIndex((i) => (i === 0 ? comments.length - 1 : i - 1));
    };

    const next = () => {
        setCurrentIndex((i) => (i === comments.length - 1 ? 0 : i + 1));
    };

    if (comments.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <button
                    onClick={prev}
                    className="p-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition transition-colors"
                >
                    <ChevronLeft size={18} className="text-indigo-500" />
                </button>
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 rounded-xl text-sm italic shadow-sm text-center"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            "{comments[currentIndex]}"
                        </motion.div>
                    </AnimatePresence>
                </div>
                <button
                    onClick={next}
                    className="p-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition transition-colors"
                >
                    <ChevronRight size={18} className="text-indigo-500" />
                </button>
            </div>
            <div className="flex justify-center mt-1 pb-1 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                {currentIndex + 1} de {comments.length}
            </div>
        </div>
    );
}
