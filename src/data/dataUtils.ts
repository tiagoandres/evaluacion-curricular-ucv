import { SurveyEntry } from './mockData';

// Filter data by cycle and/or mention
export function filterData(
    data: SurveyEntry[],
    ciclo?: string | 'all',
    mencion?: string | 'all'
): SurveyEntry[] {
    let filtered = [...data];
    if (ciclo && ciclo !== 'all') {
        filtered = filtered.filter(d => d.ciclo === ciclo);
    }
    if (mencion && mencion !== 'all') {
        filtered = filtered.filter(d => d.mencion === mencion);
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

export function getGestionScore(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => acc + (d.gestionScore || 0), 0);
    return parseFloat((sum / data.length).toFixed(2));
}

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
        { dimension: 'Gestión', value: getGestionScore(data), fullMark: 10 },
        { dimension: 'Contenidos y Recursos', value: getContenidosScore(data), fullMark: 10 },
        { dimension: 'Evaluación', value: getEvaluacionScore(data), fullMark: 10 },
        { dimension: 'Desempeño Docente', value: getDesempenoDocenteScore(data), fullMark: 10 },
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

// Satisfaction by asignatura for a specific mention
export function getSatisfactionByAsignatura(data: SurveyEntry[], mencion: string) {
    const filteredForMention = data.filter(d => d.mencion === mencion);
    const courses = [...new Set(filteredForMention.map(d => d.asignatura))];
    return courses.map(asignatura => {
        const filtered = filteredForMention.filter(d => d.asignatura === asignatura);
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
        const nps = getNPSDocente(entries);
        const indice = getCalidadCurricular(entries);
        return { asignatura, docentes: docentes.join(', '), indice, nps };
    });

    return courseStats
        .sort((a, b) => b.indice - a.indice)
        .slice(0, limit);
}

// Get all unique mentions from data
export function getUniqueMenciones(data: SurveyEntry[]): string[] {
    const menciones = new Set(data.map(d => d.mencion).filter(m => m));
    return Array.from(menciones) as string[];
}
