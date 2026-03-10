import { SurveyEntry } from './mockData';

// Filter data by cycle and/or mention
export function filterData(
    data: SurveyEntry[],
    ciclo?: string | 'all',
    departamento?: string | 'all',
    catedra?: string | 'all'
): SurveyEntry[] {
    let filtered = [...data];
    if (ciclo && ciclo !== 'all') {
        filtered = filtered.filter(d => d.ciclo === ciclo);
    }
    if (departamento && departamento !== 'all') {
        filtered = filtered.filter(d => d.departamento === departamento);
    }
    if (catedra && catedra !== 'all') {
        filtered = filtered.filter(d => d.catedra === catedra);
    }
    return filtered;
}

// Total number of evaluations
export function getTotalEvaluaciones(data: SurveyEntry[]): number {
    return data.length;
}

// Average utility (Q44)
export function getUtilidadGlobal(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => acc + d.utilidad_asignatura, 0);
    return parseFloat((sum / data.length).toFixed(1));
}

// Average NPS (Q45)
export function getNPSDocente(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => acc + d.nps_docente, 0);
    return parseFloat((sum / data.length).toFixed(1));
}

// Age distribution
export function getAgeDistribution(data: SurveyEntry[]): { edad: number; frecuencia: number }[] {
    const ageMap: Record<number, number> = {};
    data.forEach(d => {
        ageMap[d.edad] = (ageMap[d.edad] || 0) + 1;
    });
    return Object.entries(ageMap)
        .map(([edad, frecuencia]) => ({ edad: parseInt(edad), frecuencia }))
        .sort((a, b) => a.edad - b.edad);
}

// Gender distribution
export function getGenderDistribution(data: SurveyEntry[]): { genero: string; cantidad: number; porcentaje: number }[] {
    const genderMap: Record<string, number> = {};
    data.forEach(d => {
        genderMap[d.genero] = (genderMap[d.genero] || 0) + 1;
    });
    const total = data.length;
    return Object.entries(genderMap).map(([genero, cantidad]) => ({
        genero,
        cantidad,
        porcentaje: parseFloat(((cantidad / total) * 100).toFixed(1)),
    }));
}

// Removed getGestionScore as it is no longer needed

export function getContenidosScore(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => acc + (d.contenidosScore || 0), 0);
    return parseFloat((sum / data.length).toFixed(2));
}

export function getEvaluacionScore(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => acc + (d.evaluacionScore || 0), 0);
    return parseFloat((sum / data.length).toFixed(2));
}

export function getDesempenoDocenteScore(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => acc + (d.desempenoScore || 0), 0);
    return parseFloat((sum / data.length).toFixed(2));
}

export function getRadarData(data: SurveyEntry[]) {
    return [
        { dimension: 'Contenidos', value: getContenidosScore(data), fullMark: 100 },
        { dimension: 'Evaluación', value: getEvaluacionScore(data), fullMark: 100 },
        { dimension: 'Desempeño Docente', value: getDesempenoDocenteScore(data), fullMark: 100 },
    ];
}

// Satisfaction index -> Calidad Unidad Curricular
export function getCalidadCurricular(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => acc + (Number(d.calidad_unidad_curricular) || 0), 0);
    return parseFloat((sum / data.length).toFixed(2));
}

// Satisfaction by cycle (for bar chart)
export function getSatisfactionByCycle(allData: SurveyEntry[]) {
    const ciclosLocales = new Set(allData.map(d => d.ciclo).filter(c => c));
    const ciclos: string[] = Array.from(ciclosLocales);

    return ciclos.map(ciclo => {
        const filtered = allData.filter(d => d.ciclo === ciclo);
        return {
            ciclo,
            indice: getCalidadCurricular(filtered),
        };
    });
}

// Satisfaction by asignatura
export function getSatisfactionByAsignatura(data: SurveyEntry[]) {
    const courses = [...new Set(data.map(d => d.asignatura))];
    return courses.map(asignatura => {
        const filtered = data.filter(d => d.asignatura === asignatura);
        return {
            asignatura: asignatura,
            indice: filtered.length > 0 ? getCalidadCurricular(filtered) : 0,
        };
    });
}

// Top 5 best-rated courses (by satisfaction index)
export function getTopCourses(data: SurveyEntry[], limit: number = 5) {
    // Group by asignatura
    const courseMap: Record<string, SurveyEntry[]> = {};
    data.forEach(d => {
        if (!courseMap[d.asignatura]) courseMap[d.asignatura] = [];
        courseMap[d.asignatura].push(d);
    });

    const courseStats = Object.entries(courseMap).map(([asignatura, entries]) => {
        // Get unique docentes
        const docentes = [...new Set(entries.map(e => e.docente))];
        const indice = getCalidadCurricular(entries);
        const contenidos = getContenidosScore(entries);
        const evaluacion = getEvaluacionScore(entries);
        const utilidad = getUtilidadGlobal(entries);
        const count = entries.length;
        return { asignatura, docentes: docentes.join(', '), indice, contenidos, evaluacion, utilidad, count };
    });

    return courseStats
        .sort((a, b) => {
            // Calculate a weighted score: Index * log10(Evaluations + 1)
            // This balances high indices with high evaluation counts
            const rankScoreA = a.indice * Math.log10(a.count + 1);
            const rankScoreB = b.indice * Math.log10(b.count + 1);
            return rankScoreB - rankScoreA;
        })
        .slice(0, limit);
}

export function getUniqueDepartamentos(data: SurveyEntry[]): string[] {
    const departamentos = new Set(data.map(d => d.departamento).filter(m => m));
    return (Array.from(departamentos) as string[]).sort((a, b) => a.localeCompare(b, 'es'));
}

export function getUniqueCatedras(data: SurveyEntry[]): string[] {
    const catedras = new Set(data.map(d => d.catedra).filter(c => c));
    return (Array.from(catedras) as string[]).sort((a, b) => a.localeCompare(b, 'es'));
}

export function getUniqueAsignaturas(data: SurveyEntry[]): string[] {
    const asignaturas = new Set(data.map(d => d.asignatura).filter(a => a));
    return (Array.from(asignaturas) as string[]).sort((a, b) => a.localeCompare(b, 'es'));
}

export interface DocenteStats {
    docente: string;
    asignaturas: string;
    departamentos: string;
    evaluaciones: number;
    promedioContenidos: number;
    promedioEvaluacion: number;
    promedioDesempeno: number;
    promedioNPS: number;
}

export function getVistaDetalladaData(data: SurveyEntry[]): DocenteStats[] {
    const map: Record<string, SurveyEntry[]> = {};
    data.forEach(d => {
        if (!map[d.docente]) map[d.docente] = [];
        map[d.docente].push(d);
    });

    return Object.entries(map).map(([docente, entries]) => {
        const asignaturas = [...new Set(entries.map(e => e.asignatura))].sort().join(', ');
        const departamentos = [...new Set(entries.map(e => e.departamento))].sort().join(', ');
        return {
            docente,
            asignaturas,
            departamentos,
            evaluaciones: entries.length,
            promedioContenidos: getContenidosScore(entries),
            promedioEvaluacion: getEvaluacionScore(entries),
            promedioDesempeno: getDesempenoDocenteScore(entries),
            promedioNPS: getNPSDocente(entries)
        };
    });
}
