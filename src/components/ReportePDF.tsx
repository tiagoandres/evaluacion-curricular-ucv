import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { Users, Layers, BookOpen, FileText, ThumbsUp } from 'lucide-react';

export default function ReportePDF({ metrics, asignaturaName, departamentoName }: any) {
    if (!metrics) return null;

    // Helper to get score color directly in light mode
    function getScoreColorLight(score: number): string {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#eab308';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    }

    const StaticEvaluacionBar = ({ title, data }: any) => (
        <div className="flex flex-col gap-1 mb-6 w-full" style={{ color: '#000000' }}>
            <span className="text-[13px] font-bold leading-snug">{title}</span>
            <div className="flex justify-between items-center text-[10px] mt-1 font-semibold">
                <div className="flex gap-2">
                    {data.nunca > 0 && <span style={{ color: '#ef4444' }}>Nunca: {data.nunca.toFixed(1)}%</span>}
                    {data.raraVez > 0 && <span style={{ color: '#f97316' }}>Rara vez: {data.raraVez.toFixed(1)}%</span>}
                    {data.aVeces > 0 && <span style={{ color: '#eab308' }}>A veces: {data.aVeces.toFixed(1)}%</span>}
                    {data.casiSiempre > 0 && <span style={{ color: '#14b8a6' }}>Casi Siem: {data.casiSiempre.toFixed(1)}%</span>}
                    {data.siempre > 0 && <span style={{ color: '#10b981' }}>Siempre: {data.siempre.toFixed(1)}%</span>}
                </div>
            </div>
            <div className="w-full h-5 rounded overflow-hidden flex mt-1" style={{ backgroundColor: '#e5e7eb', lineHeight: '20px' }}>
                {data.nunca > 0 && <div style={{ width: `${data.nunca}%`, backgroundColor: '#f43f5e', borderRight: '1px solid rgba(255,255,255,0.2)' }} className="h-full shrink-0"></div>}
                {data.raraVez > 0 && <div style={{ width: `${data.raraVez}%`, backgroundColor: '#fb923c', borderRight: '1px solid rgba(255,255,255,0.2)' }} className="h-full shrink-0"></div>}
                {data.aVeces > 0 && <div style={{ width: `${data.aVeces}%`, backgroundColor: '#fbbf24', borderRight: '1px solid rgba(255,255,255,0.2)' }} className="h-full shrink-0"></div>}
                {data.casiSiempre > 0 && <div style={{ width: `${data.casiSiempre}%`, backgroundColor: '#2dd4bf', borderRight: '1px solid rgba(255,255,255,0.2)' }} className="h-full shrink-0"></div>}
                {data.siempre > 0 && <div style={{ width: `${data.siempre}%`, backgroundColor: '#10b981' }} className="h-full shrink-0"></div>}
            </div>
        </div>
    );

    const StaticContenidosBar = ({ title, data }: any) => (
        <div className="flex flex-col gap-1 mb-5 w-full" style={{ color: '#000000' }}>
            <span className="text-[13px] font-bold leading-snug">{title}</span>
            <div className="flex justify-between items-center text-[10px] mt-1 font-semibold">
                <div className="flex gap-2">
                    {data.totalDesacuerdo > 0 && <span style={{ color: '#ef4444' }}>Tot. Desacuerdo: {data.totalDesacuerdo.toFixed(1)}%</span>}
                    {data.desacuerdo > 0 && <span style={{ color: '#f97316' }}>En Desacuerdo: {data.desacuerdo.toFixed(1)}%</span>}
                    {data.acuerdo > 0 && <span style={{ color: '#14b8a6' }}>De Acuerdo: {data.acuerdo.toFixed(1)}%</span>}
                    {data.totalAcuerdo > 0 && <span style={{ color: '#10b981' }}>Tot. Acuerdo: {data.totalAcuerdo.toFixed(1)}%</span>}
                </div>
            </div>
            <div className="w-full h-5 rounded overflow-hidden flex mt-1" style={{ backgroundColor: '#e5e7eb', lineHeight: '20px' }}>
                {data.totalDesacuerdo > 0 && <div style={{ width: `${data.totalDesacuerdo}%`, backgroundColor: '#f43f5e', borderRight: '1px solid rgba(255,255,255,0.2)' }} className="h-full shrink-0"></div>}
                {data.desacuerdo > 0 && <div style={{ width: `${data.desacuerdo}%`, backgroundColor: '#fb923c', borderRight: '1px solid rgba(255,255,255,0.2)' }} className="h-full shrink-0"></div>}
                {data.acuerdo > 0 && <div style={{ width: `${data.acuerdo}%`, backgroundColor: '#2dd4bf', borderRight: '1px solid rgba(255,255,255,0.2)' }} className="h-full shrink-0"></div>}
                {data.totalAcuerdo > 0 && <div style={{ width: `${data.totalAcuerdo}%`, backgroundColor: '#10b981' }} className="h-full shrink-0"></div>}
            </div>
        </div>
    );

    const PageContainer = ({ id, children }: { id: string, children: React.ReactNode }) => (
        <div
            id={id}
            className="w-[800px] min-h-[1131px] p-12 flex flex-col font-sans relative"
            style={{ boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#f3f4f6', borderWidth: '1px', borderStyle: 'solid' }}
        >
            <div className="flex justify-between items-center pb-4 mb-8" style={{ borderBottom: '2px solid #e2e8f0' }}>
                <div className="pr-4">
                    <h2 className="text-2xl font-black tracking-tight" style={{ color: '#1e293b' }}>{asignaturaName}</h2>
                    <p className="font-medium" style={{ color: '#64748b' }}>{departamentoName}</p>
                </div>
                <div className="text-right flex flex-col items-end shrink-0">
                    <span className="text-xl font-bold italic tracking-tight mb-1" style={{ color: '#94a3b8' }}>Escuela de Psicología UCV</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Reporte Curricular</span>
                </div>
            </div>
            {children}
            <div className="mt-auto pt-8 text-center text-[10px] font-medium" style={{ borderTop: '1px solid #e2e8f0', color: '#94a3b8' }}>
                Generado automáticamente - Evaluaciones Curriculares
            </div>
        </div>
    );

    return (
        <div className="fixed top-[-20000px] left-[-20000px] z-[-9999] opacity-1 pointer-events-none flex flex-col gap-8">

            {/* PAGINA 1: Resumen de la Asignatura */}
            <PageContainer id="pdf-page-1">
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl text-center flex flex-col items-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Users size={20} className="mb-2" color="#94a3b8" />
                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Encuestas</span>
                        <span className="text-3xl font-black" style={{ color: '#1e293b' }}>{metrics.count}</span>
                    </div>
                    <div className="p-4 rounded-xl text-center flex flex-col items-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <BookOpen size={20} className="mb-2" color="#c084fc" />
                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Contenidos</span>
                        <span className="text-3xl font-black" style={{ color: getScoreColorLight(metrics.avgContenidos) }}>{metrics.avgContenidos.toFixed(1)}</span>
                    </div>
                    <div className="p-4 rounded-xl text-center flex flex-col items-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <FileText size={20} className="mb-2" color="#f472b6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Evaluación</span>
                        <span className="text-3xl font-black" style={{ color: getScoreColorLight(metrics.avgEvaluacion) }}>{metrics.avgEvaluacion.toFixed(1)}</span>
                    </div>
                    <div className="p-4 rounded-xl text-center flex flex-col items-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Layers size={20} className="mb-2" color="#818cf8" />
                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Calidad</span>
                        <span className="text-3xl font-black" style={{ color: getScoreColorLight(metrics.avgCalidad) }}>{metrics.avgCalidad.toFixed(1)}</span>
                    </div>
                </div>

                <div className="mb-8 p-6 rounded-xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: '#1e293b' }}>
                        <ThumbsUp size={18} color="#10b981" /> Utilidad de la Asignatura
                    </h3>
                    <div className="flex gap-8 items-center">
                        <div className="w-[180px] h-[180px]">
                            <PieChart width={180} height={180}>
                                <Pie data={metrics.utilidad} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" isAnimationActive={false}>
                                    {metrics.utilidad.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </div>
                        <div className="flex-1 flex flex-col gap-3 justify-center">
                            {metrics.utilidad.map((u: any, i: number) => (
                                <div key={i} className="flex items-center justify-between pb-2 last:border-0 last:pb-0" style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: u.color }} />
                                        <span className="font-semibold" style={{ color: '#334155' }}>{u.name.split(' (')[0]}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold" style={{ color: '#0f172a' }}>{u.value.toFixed(1)}%</div>
                                        <div className="text-[10px]" style={{ color: '#64748b' }}>{u.count} res.</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {metrics.docentes?.length > 0 && (
                    <div className="p-6 rounded-xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: '#1e293b' }}>
                            <Users size={18} color="#818cf8" /> Docentes Evaluados ({metrics.docentes.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {metrics.docentes.map((doc: string, i: number) => (
                                <span key={i} className="px-3 text-xs font-bold rounded-lg shadow-sm inline-block text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#334155', height: '28px', lineHeight: '26px' }}>
                                    {doc}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </PageContainer>

            {/* PAGINA 2: Indice de Contenidos */}
            <PageContainer id="pdf-page-2">
                <div className="flex items-center gap-3 mb-4" style={{ height: '40px' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                        <BookOpen size={20} color="#9333ea" />
                    </div>
                    <h2 className="text-2xl font-black" style={{ color: '#9333ea', lineHeight: '40px', margin: 0 }}>
                        Índice de contenidos
                    </h2>
                    <div className="ml-auto text-3xl font-black" style={{ color: getScoreColorLight(metrics.avgContenidos), lineHeight: '40px' }}>
                        {metrics.avgContenidos.toFixed(1)} <span className="text-sm" style={{ color: '#94a3b8' }}>/ 100</span>
                    </div>
                </div>
                <p className="text-sm font-medium leading-relaxed mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                    Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                </p>

                <div className="space-y-0">
                    <StaticContenidosBar title="El Programa expresa el propósito y las competencias que se van a lograr con la Asignatura" data={metrics.contenidosData.c1} />
                    <StaticContenidosBar title="El Programa le orientó en el proceso de su aprendizaje" data={metrics.contenidosData.c2} />
                    <StaticContenidosBar title="Los temas se presentaron con la profundidad adecuada" data={metrics.contenidosData.c3} />
                    <StaticContenidosBar title="Los contenidos están organizados de forma lógica" data={metrics.contenidosData.c4} />
                    <StaticContenidosBar title="La asignatura le ha proporcionado la habilidad de tener una perspectiva más amplia de los temas tratados" data={metrics.contenidosData.c5} />
                    <StaticContenidosBar title="Los temas resultaron interesantes" data={metrics.contenidosData.c6} />
                    <StaticContenidosBar title="El número de temas tratados puede ser asimilado por los estudiantes" data={metrics.contenidosData.c7} />
                    <StaticContenidosBar title="El contenido permite desarrollar la competencia propuesta" data={metrics.contenidosData.c8} />
                    <StaticContenidosBar title="El contenido está actualizado" data={metrics.contenidosData.c9} />
                </div>
            </PageContainer>

            {/* PAGINA 3: Indice de Contenidos (Continuacion) */}
            <PageContainer id="pdf-page-3">
                <div className="flex items-center gap-3 mb-4" style={{ height: '40px' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                        <BookOpen size={20} color="#9333ea" />
                    </div>
                    <h2 className="text-2xl font-black" style={{ color: '#9333ea', lineHeight: '40px', margin: 0 }}>
                        Índice de contenidos (Cont.)
                    </h2>
                </div>

                <div className="space-y-0">
                    <StaticContenidosBar title="Se siente satisfecho con el contenido" data={metrics.contenidosData.c10} />
                    <StaticContenidosBar title="La asignatura estimula la capacidad intelectual y crítica del estudiante" data={metrics.contenidosData.c11} />
                    <StaticContenidosBar title="Se indica su vinculación con otros conocimientos y/o asignaturas" data={metrics.contenidosData.c12} />
                </div>
            </PageContainer>

            {/* PAGINA 4: Indice de Evaluacion */}
            <PageContainer id="pdf-page-4">
                <div className="flex items-center gap-3 mb-4" style={{ height: '40px' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                        <FileText size={20} color="#db2777" />
                    </div>
                    <h2 className="text-2xl font-black" style={{ color: '#db2777', lineHeight: '40px', margin: 0 }}>
                        Índice de evaluación
                    </h2>
                    <div className="ml-auto text-3xl font-black" style={{ color: getScoreColorLight(metrics.avgEvaluacion), lineHeight: '40px' }}>
                        {metrics.avgEvaluacion.toFixed(1)} <span className="text-sm" style={{ color: '#94a3b8' }}>/ 100</span>
                    </div>
                </div>
                <p className="text-sm font-medium leading-relaxed mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                    Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                </p>

                <div className="space-y-0">
                    <StaticEvaluacionBar title="Incluyeron actividades de evaluación del contenido dado en clases" data={metrics.evaluacionesData.e1} />
                    <StaticEvaluacionBar title="Conoció los resultados de las evaluaciones a tiempo para corregir errores y superar sus dificultades académicas de forma inmediata" data={metrics.evaluacionesData.e2} />
                    <StaticEvaluacionBar title="Las evaluaciones incluyeron diversidad de procedimientos" data={metrics.evaluacionesData.e3} />
                    <StaticEvaluacionBar title="Las evaluaciones promovieron la participación activa del estudiante" data={metrics.evaluacionesData.e4} />
                    <StaticEvaluacionBar title="Las evaluaciones incluyeron autoevaluación (Usted se evaluó a si mismo/a)" data={metrics.evaluacionesData.e5} />
                    <StaticEvaluacionBar title="Las evaluaciones incluyeron coevaluación (Usted evaluó a sus compañeros en algún momento)" data={metrics.evaluacionesData.e6} />
                </div>
            </PageContainer>
        </div>
    );
}
