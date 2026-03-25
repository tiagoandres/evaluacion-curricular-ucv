import React from 'react';
import { Users, BookOpen, FileText, TrendingUp, Star } from 'lucide-react';

export default function ReportePDFDocente({ metrics, docenteName, asignaturaInfo }: any) {
    if (!metrics) return null;

    function getScoreColorLight(score: number): string {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#eab308';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    }

    const StaticHorizontalBar = ({ title, data }: { title: string, data: { yes: number, no: number } }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', color: '#000000' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', lineHeight: '1.25', paddingRight: '48px' }}>{title}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', marginTop: '4px', fontWeight: '600' }}>
                <span style={{ color: '#4f46e5' }}>Sí: {data.yes.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: '16px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginTop: '4px', backgroundColor: '#e5e7eb', lineHeight: '16px' }}>
                <div style={{ width: `${data.yes}%`, backgroundColor: '#6366f1', height: '100%', flexShrink: 0 }}></div>
                <div style={{ width: `${data.no}%`, backgroundColor: '#f43f5e', height: '100%', flexShrink: 0 }}></div>
            </div>
            {data.no > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 'bold' }}>No: {data.no.toFixed(1)}%</span>
                </div>
            )}
        </div>
    );

    const StaticFrequencyBar = ({ title, data }: { title: string, data: any }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', color: '#000000' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', lineHeight: '1.25' }}>{title}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', marginTop: '4px', fontWeight: '600' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {data.nada > 0 && <span style={{ color: '#ef4444' }}>Nada: {data.nada.toFixed(1)}%</span>}
                    {data.poco > 0 && <span style={{ color: '#f97316' }}>Poco: {data.poco.toFixed(1)}%</span>}
                    {data.algo > 0 && <span style={{ color: '#eab308' }}>Algo: {data.algo.toFixed(1)}%</span>}
                    {data.bastante > 0 && <span style={{ color: '#14b8a6' }}>Bastante: {data.bastante.toFixed(1)}%</span>}
                    {data.mucho > 0 && <span style={{ color: '#10b981' }}>Mucho: {data.mucho.toFixed(1)}%</span>}
                </div>
            </div>
            <div style={{ width: '100%', height: '16px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginTop: '4px', backgroundColor: '#e5e7eb' }}>
                {data.nada > 0 && <div style={{ width: `${data.nada}%`, backgroundColor: '#f43f5e', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.poco > 0 && <div style={{ width: `${data.poco}%`, backgroundColor: '#fb923c', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.algo > 0 && <div style={{ width: `${data.algo}%`, backgroundColor: '#fbbf24', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.bastante > 0 && <div style={{ width: `${data.bastante}%`, backgroundColor: '#2dd4bf', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.mucho > 0 && <div style={{ width: `${data.mucho}%`, backgroundColor: '#10b981', height: '100%', flexShrink: 0 }}></div>}
            </div>
        </div>
    );

    const StaticContenidosBar = ({ title, data }: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px', width: '100%', color: '#000000' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', lineHeight: '1.25' }}>{title}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', marginTop: '4px', fontWeight: '600' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {data.totalDesacuerdo > 0 && <span style={{ color: '#ef4444' }}>Total. en Desacuerdo: {data.totalDesacuerdo.toFixed(1)}%</span>}
                    {data.desacuerdo > 0 && <span style={{ color: '#f97316' }}>En Desacuerdo: {data.desacuerdo.toFixed(1)}%</span>}
                    {data.acuerdo > 0 && <span style={{ color: '#14b8a6' }}>De Acuerdo: {data.acuerdo.toFixed(1)}%</span>}
                    {data.totalAcuerdo > 0 && <span style={{ color: '#10b981' }}>Total. de Acuerdo: {data.totalAcuerdo.toFixed(1)}%</span>}
                </div>
            </div>
            <div style={{ width: '100%', height: '20px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginTop: '4px', backgroundColor: '#e5e7eb', lineHeight: '20px' }}>
                {data.totalDesacuerdo > 0 && <div style={{ width: `${data.totalDesacuerdo}%`, backgroundColor: '#f43f5e', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.desacuerdo > 0 && <div style={{ width: `${data.desacuerdo}%`, backgroundColor: '#fb923c', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.acuerdo > 0 && <div style={{ width: `${data.acuerdo}%`, backgroundColor: '#2dd4bf', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.totalAcuerdo > 0 && <div style={{ width: `${data.totalAcuerdo}%`, backgroundColor: '#10b981', height: '100%', flexShrink: 0 }}></div>}
            </div>
        </div>
    );

    const StaticEvaluacionBar = ({ title, data }: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px', width: '100%', color: '#000000' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', lineHeight: '1.25' }}>{title}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', marginTop: '4px', fontWeight: '600' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {data.nunca > 0 && <span style={{ color: '#ef4444' }}>Nunca: {data.nunca.toFixed(1)}%</span>}
                    {data.raraVez > 0 && <span style={{ color: '#f97316' }}>Rara vez: {data.raraVez.toFixed(1)}%</span>}
                    {data.aVeces > 0 && <span style={{ color: '#eab308' }}>A veces: {data.aVeces.toFixed(1)}%</span>}
                    {data.casiSiempre > 0 && <span style={{ color: '#14b8a6' }}>Casi Siem: {data.casiSiempre.toFixed(1)}%</span>}
                    {data.siempre > 0 && <span style={{ color: '#10b981' }}>Siempre: {data.siempre.toFixed(1)}%</span>}
                </div>
            </div>
            <div style={{ width: '100%', height: '20px', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginTop: '4px', backgroundColor: '#e5e7eb', lineHeight: '20px' }}>
                {data.nunca > 0 && <div style={{ width: `${data.nunca}%`, backgroundColor: '#f43f5e', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.raraVez > 0 && <div style={{ width: `${data.raraVez}%`, backgroundColor: '#fb923c', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.aVeces > 0 && <div style={{ width: `${data.aVeces}%`, backgroundColor: '#fbbf24', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.casiSiempre > 0 && <div style={{ width: `${data.casiSiempre}%`, backgroundColor: '#2dd4bf', borderRight: '1px solid rgba(255,255,255,0.2)', height: '100%', flexShrink: 0 }}></div>}
                {data.siempre > 0 && <div style={{ width: `${data.siempre}%`, backgroundColor: '#10b981', height: '100%', flexShrink: 0 }}></div>}
            </div>
        </div>
    );

    const StaticNPSGauge = ({ avg }: { avg: number }) => {
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
        const needleAngle = valToAngle(Math.min(Math.max(avg, 1), 10));
        const activeColor = avg <= 6.0 ? '#ef4444' : avg <= 8.0 ? '#f59e0b' : '#10b981';

        return (
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px', margin: '0 auto', overflow: 'visible', userSelect: 'none', paddingBottom: '16px' }}>
                <svg width="100%" viewBox="0 0 320 180" style={{ overflow: 'visible' }} xmlns="http://www.w3.org/2000/svg">
                    <path d={arcPath(1, 10)} fill="none" stroke="#e2e8f0" strokeWidth={strokeW + 6} strokeLinecap="round" />
                    <path d={arcPath(1, 6.15)} fill="none" stroke="#ef4444" strokeWidth={strokeW} strokeLinecap="round" opacity={0.95} />
                    <path d={arcPath(6.15, 8.15)} fill="none" stroke="#f59e0b" strokeWidth={strokeW} strokeLinecap="round" opacity={0.95} />
                    <path d={arcPath(8.15, 10)} fill="none" stroke="#10b981" strokeWidth={strokeW} strokeLinecap="round" opacity={0.95} />
                    <text x={cx} y={cy + 54} textAnchor="middle" style={{ fontSize: '48px', fontWeight: '900' }} fill={activeColor}>{avg.toFixed(1)}</text>
                    <text x={cx} y={cy + 72} textAnchor="middle" style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em' }} fill="#64748b">Promedio NPS</text>
                    <g transform={`translate(${cx}, ${cy}) rotate(${ -needleAngle })`}>
                        <path d={`M 0 -2.5 L 0 2.5 L ${R - strokeW/2 + 2} 0.5 L ${R - strokeW/2 + 2} -0.5 Z`} fill={activeColor} />
                        <circle cx="0" cy="0" r="4.5" fill="#ffffff" stroke={activeColor} strokeWidth="3" />
                    </g>
                </svg>
            </div>
        );
    };

    const StaticNPSBars = ({ data }: { data: any }) => {
        if (!data || !data.scores) return null;
        const faceOf = (v: number) => {
            if (v <= 6) return (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#ef4444" opacity="0.9" />
                    <circle cx="9" cy="9.5" r="1.2" fill="white" />
                    <circle cx="15" cy="9.5" r="1.2" fill="white" />
                    <path d="M8.5 15.5 Q12 12.5 15.5 15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
            );
            if (v <= 8) return (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#fbbf24" opacity="0.9" />
                    <circle cx="9" cy="9.5" r="1.2" fill="white" />
                    <circle cx="15" cy="9.5" r="1.2" fill="white" />
                    <line x1="8.5" y1="15" x2="15.5" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
            return (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#34d399" opacity="0.9" />
                    <circle cx="9" cy="9.5" r="1.2" fill="white" />
                    <circle cx="15" cy="9.5" r="1.2" fill="white" />
                    <path d="M8.5 13 Q12 17 15.5 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
            );
        };
        const maxPct = Math.max(...data.scores.map((s:any) => s.pct), 1);
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'flex-end', gap: '4px', paddingLeft: '24px', paddingRight: '24px', marginTop: '16px', height: '112px' }}>
                    {data.scores.map((s:any) => {
                        const barH = Math.max((s.pct / maxPct) * 80, s.pct > 0 ? 4 : 0);
                        const c = s.value <= 6 ? '#f87171' : s.value <= 8 ? '#fbbf24' : '#34d399';
                        const textC = s.value <= 6 ? '#ef4444' : s.value <= 8 ? '#d97706' : '#10b981';
                        return (
                            <div key={s.value} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', height: '100%' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: textC, opacity: s.pct > 0 ? 1 : 0 }}>{s.pct > 0 ? `${s.pct.toFixed(1)}%` : ''}</span>
                                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${barH}px`, backgroundColor: c }} />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: textC }}>{s.value}</span>
                                    {faceOf(s.value)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    const PageContainer = ({ id, children }: { id: string, children: React.ReactNode }) => (
        <div
            id={id}
            className="w-[800px] min-h-[1131px]"
            style={{ 
                boxSizing: 'border-box', 
                backgroundColor: '#ffffff', 
                color: '#0f172a', 
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                fontFamily: 'sans-serif'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', marginBottom: '32px', borderBottom: '2px solid #e2e8f0' }}>
                <div style={{ paddingRight: '16px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.025em', color: '#1e293b', margin: 0 }}>{docenteName}</h2>
                    <p style={{ fontWeight: '500', color: '#64748b', margin: '4px 0 0 0' }}>{asignaturaInfo !== 'all' ? asignaturaInfo : 'Análisis del perfil general (Todas las asignaturas evaluadas)'}</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontSize: '20px', fontWeight: '700', fontStyle: 'italic', letterSpacing: '-0.025em', marginBottom: '4px', color: '#94a3b8' }}>Escuela de Psicología UCV</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Desempeño Docente</span>
                </div>
            </div>
            {children}
            <div style={{ marginTop: 'auto', paddingTop: '32px', textAlign: 'center', fontSize: '10px', fontWeight: '500', borderTop: '1px solid #e2e8f0', color: '#94a3b8' }}>
                Generado automáticamente - Evaluaciones Curriculares
            </div>
        </div>
    );

    return (
        <div style={{ position: 'absolute', top: '-20000px', left: '-20000px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* PAGE 1: NPS, Recursos, Gestión */}
            <PageContainer id="docente-pdf-page-1">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' }}>
                    {[
                        { icon: <Users size={18} color="#94a3b8" />, label: 'Evaluaciones', val: metrics.count, col: '#1e293b' },
                        { icon: <TrendingUp size={18} color="#2dd4bf" />, label: 'Desempeño', val: metrics.avgDesempenoDocente.toFixed(1), col: getScoreColorLight(metrics.avgDesempenoDocente) },
                        { icon: <BookOpen size={18} color="#c084fc" />, label: 'Contenidos', val: metrics.avgContenidos.toFixed(1), col: getScoreColorLight(metrics.avgContenidos) },
                        { icon: <FileText size={18} color="#f472b6" />, label: 'Evaluación', val: metrics.avgEvaluacion.toFixed(1), col: getScoreColorLight(metrics.avgEvaluacion) },
                        { icon: <Star size={18} color="#fbbf24" />, label: 'Calidad U.C.', val: metrics.avgCalidad.toFixed(1), col: getScoreColorLight(metrics.avgCalidad) },
                    ].map((item, i) => (
                        <div key={i} style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ marginBottom: '4px' }}>{item.icon}</div>
                            <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', color: '#64748b' }}>{item.label}</span>
                            <span style={{ fontSize: '24px', fontWeight: '900', color: item.col }}>{item.val}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '24px', padding: '24px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', margin: 0 }}>Net Promoter Score - ¿Probabilidad de tomar otro curso?</h3>
                    <StaticNPSGauge avg={metrics.npsData?.avgNps || 0} />
                    <StaticNPSBars data={metrics.npsData} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', margin: 0 }}>Gestión Docente (Respuestas Sí/No)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <StaticHorizontalBar title="Entregó el Programa de la Asignatura" data={metrics.gestion!.g1} />
                            <StaticHorizontalBar title="Entregó cronograma detallado" data={metrics.gestion!.g2} />
                            <StaticHorizontalBar title="Horario de consultas" data={metrics.gestion!.g3} />
                        </div>
                    </div>
                </div>
            </PageContainer>

            {/* PAGE 2: Recursos Pedagógicos */}
            <PageContainer id="docente-pdf-page-2">
                <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', margin: 0 }}>Frecuencia de Uso: Recursos Pedagógicos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <StaticFrequencyBar title="Material de lectura" data={metrics.recursos!.r13} />
                        <StaticFrequencyBar title="Discusión en clase" data={metrics.recursos!.r14} />
                        <StaticFrequencyBar title="Recursos adicionales" data={metrics.recursos!.r15} />
                    </div>
                </div>
            </PageContainer>

            {/* PAGE 3: Desempeño Docente */}
            <PageContainer id="docente-pdf-page-3">
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', height: '40px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ccfbf1', flexShrink: 0 }}>
                            <TrendingUp size={20} color="#0d9488" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0d9488', margin: 0, lineHeight: '40px' }}>
                            Desempeño Docente
                        </h2>
                        <div style={{ marginLeft: 'auto', fontSize: '24px', fontWeight: '900', color: getScoreColorLight(metrics.avgDesempenoDocente), lineHeight: '40px' }}>
                            {metrics.avgDesempenoDocente.toFixed(1)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ 100</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.5', marginBottom: '24px', padding: '16px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                        Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <StaticContenidosBar title="1. El/La Docente revisó los contenidos del Programa de la Asignatura al principio del curso" data={metrics.desempenoData.d1} />
                        <StaticContenidosBar title="2. El/La Docente dio muestras de haber planificado las actividades de aula" data={metrics.desempenoData.d2} />
                        <StaticContenidosBar title="3. El/La Docente cumplió el horario de clase" data={metrics.desempenoData.d3} />
                        <StaticContenidosBar title="4. El/La Docente cubrió los contenidos del Programa de la Asignatura" data={metrics.desempenoData.d4} />
                        <StaticContenidosBar title="5. El/La Docente posee dominio pleno del contenido dictado en la materia" data={metrics.desempenoData.d5} />
                        <StaticContenidosBar title="6. El/La Docente mantuvo una actitud y trato respetuoso con los estudiantes" data={metrics.desempenoData.d6} />
                        <StaticContenidosBar title="7. El/La Docente lograba mantener su interés durante toda la sesión de clases" data={metrics.desempenoData.d7} />
                    </div>
                </div>
            </PageContainer>

            {/* PAGE 4: Desempeño Docente (Cont.) */}
            <PageContainer id="docente-pdf-page-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', height: '40px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ccfbf1', flexShrink: 0 }}>
                        <TrendingUp size={20} color="#0d9488" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0d9488', margin: 0, lineHeight: '40px' }}>
                        Desempeño Docente (Cont.)
                    </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <StaticContenidosBar title="8. El/La Docente mostró auténtico interés en el aprendizaje de los estudiantes" data={metrics.desempenoData.d8} />
                    <StaticContenidosBar title="9. El/La Docente tuvo una buena disposición para atender a los estudiantes fuera del aula" data={metrics.desempenoData.d9} />
                    <StaticContenidosBar title="10. El/La Docente explicó la manera de evaluar la Asignatura" data={metrics.desempenoData.d10} />
                </div>
            </PageContainer>

            {/* PAGE 5: Índice de Contenidos */}
            <PageContainer id="docente-pdf-page-5">
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', height: '40px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3e8ff', flexShrink: 0 }}>
                            <BookOpen size={20} color="#9333ea" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#9333ea', margin: 0, lineHeight: '40px' }}>
                            Índice de Contenidos
                        </h2>
                        <div style={{ marginLeft: 'auto', fontSize: '24px', fontWeight: '900', color: getScoreColorLight(metrics.avgContenidos), lineHeight: '40px' }}>
                            {metrics.avgContenidos.toFixed(1)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ 100</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.5', marginBottom: '24px', padding: '16px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                        Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <StaticContenidosBar title="1. El Programa expresa el propósito y las competencias que se van a lograr con la Asignatura" data={metrics.contenidosData.c1} />
                        <StaticContenidosBar title="2. El Programa le orientó en el proceso de su aprendizaje" data={metrics.contenidosData.c2} />
                        <StaticContenidosBar title="3. Los temas se presentaron con la profundidad adecuada" data={metrics.contenidosData.c3} />
                        <StaticContenidosBar title="4. Los contenidos están organizados de forma lógica" data={metrics.contenidosData.c4} />
                        <StaticContenidosBar title="5. La asignatura le ha proporcionado la habilidad de tener una perspectiva más amplia de los temas tratados" data={metrics.contenidosData.c5} />
                        <StaticContenidosBar title="6. Los temas resultaron interesantes" data={metrics.contenidosData.c6} />
                    </div>
                </div>
            </PageContainer>

            {/* PAGE 6: Índice de Contenidos (Cont.) */}
            <PageContainer id="docente-pdf-page-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', height: '40px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3e8ff', flexShrink: 0 }}>
                        <BookOpen size={20} color="#9333ea" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#9333ea', margin: 0, lineHeight: '40px' }}>
                        Índice de Contenidos (Cont.)
                    </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <StaticContenidosBar title="7. El número de temas tratados puede ser asimilado por los estudiantes" data={metrics.contenidosData.c7} />
                    <StaticContenidosBar title="8. El contenido permite desarrollar la competencia propuesta" data={metrics.contenidosData.c8} />
                    <StaticContenidosBar title="9. El contenido está actualizado" data={metrics.contenidosData.c9} />
                    <StaticContenidosBar title="10. Se siente satisfecho con el contenido" data={metrics.contenidosData.c10} />
                    <StaticContenidosBar title="11. La asignatura estimula la capacidad intelectual y crítica del estudiante" data={metrics.contenidosData.c11} />
                    <StaticContenidosBar title="12. Se indica su vinculación con otros conocimientos y/o asignaturas" data={metrics.contenidosData.c12} />
                </div>
            </PageContainer>

            {/* PAGE 7: Evaluación */}
            <PageContainer id="docente-pdf-page-7">
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', height: '40px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fce7f3', flexShrink: 0 }}>
                            <FileText size={20} color="#db2777" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#db2777', margin: 0, lineHeight: '40px' }}>
                            Índice de Evaluación
                        </h2>
                        <div style={{ marginLeft: 'auto', fontSize: '24px', fontWeight: '900', color: getScoreColorLight(metrics.avgEvaluacion), lineHeight: '40px' }}>
                            {metrics.avgEvaluacion.toFixed(1)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ 100</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.5', marginBottom: '24px', padding: '16px', borderRadius: '12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                        Este indice es calculado sumando el valor de la opcion seleccionada en cada uno de los ítems que lo componen para luego llevarlo a una escala que va de 0 a 100.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <StaticEvaluacionBar title="1. Incluyeron actividades de evaluación del contenido dado en clases" data={metrics.evaluacionData.e1} />
                        <StaticEvaluacionBar title="2. Conoció los resultados de las evaluaciones a tiempo para corregir errores y superar sus dificultades académicas de forma inmediata" data={metrics.evaluacionData.e2} />
                        <StaticEvaluacionBar title="3. Las evaluaciones incluyeron diversidad de procedimientos" data={metrics.evaluacionData.e3} />
                        <StaticEvaluacionBar title="4. Las evaluaciones promovieron la participación activa del estudiante" data={metrics.evaluacionData.e4} />
                        <StaticEvaluacionBar title="5. Las evaluaciones incluyeron autoevaluación (Usted se evaluó a si mismo/a)" data={metrics.evaluacionData.e5} />
                        <StaticEvaluacionBar title="6. Las evaluaciones incluyeron coevaluación (Usted evaluó a sus compañeros en algún momento)" data={metrics.evaluacionData.e6} />
                    </div>
                </div>
            </PageContainer>
        </div>
    );
}
