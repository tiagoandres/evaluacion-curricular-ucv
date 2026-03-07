import { SurveyEntry, Ciclo, Mencion, surveyData, cicloBasicoCourses, mencionCourses, teoriasPsicologicas } from './mockData';

// Filter data by cycle and/or mention
export function filterData(
    data: SurveyEntry[],
    ciclo?: Ciclo | 'all',
    mencion?: Mencion | 'all'
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

// Calculate dimension scores (average of Likert items, converted to 0-10 scale)
function likertToScale(value: number): number {
    // Likert 1-5 → scale 0-10
    return ((value - 1) / 4) * 10;
}

export function getGestionScore(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => {
        const avg = (d.gestion_programa_presentado + d.gestion_programa_cumplido +
            d.gestion_objetivos_claros + d.gestion_coherencia_plan + d.gestion_pensamiento_critico) / 5;
        return acc + likertToScale(avg);
    }, 0);
    return parseFloat((sum / data.length).toFixed(2));
}

export function getContenidosScore(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => {
        const avg = (d.contenidos_profundidad + d.contenidos_organizacion +
            d.contenidos_bibliografia + d.contenidos_objetivos_cumplidos + d.contenidos_estrategias) / 5;
        return acc + likertToScale(avg);
    }, 0);
    return parseFloat((sum / data.length).toFixed(2));
}

export function getEvaluacionScore(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => {
        const avg = (d.evaluacion_metodos + d.evaluacion_retroalimentacion) / 2;
        return acc + likertToScale(avg);
    }, 0);
    return parseFloat((sum / data.length).toFixed(2));
}

export function getDesempenoDocenteScore(data: SurveyEntry[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => {
        const avg = (d.docente_dominio + d.docente_participacion + d.docente_puntualidad) / 3;
        return acc + likertToScale(avg);
    }, 0);
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

// Satisfaction index = sum of 4 dimension scores
export function getSatisfactionIndex(data: SurveyEntry[]): number {
    return parseFloat((
        getGestionScore(data) +
        getContenidosScore(data) +
        getEvaluacionScore(data) +
        getDesempenoDocenteScore(data)
    ).toFixed(2));
}

// Satisfaction by cycle (for bar chart)
export function getSatisfactionByCycle(allData: SurveyEntry[]) {
    const ciclos: Ciclo[] = ['Ciclo Básico', 'Mención', 'Teorías Psicológicas'];
    return ciclos.map(ciclo => {
        const filtered = allData.filter(d => d.ciclo === ciclo);
        return {
            ciclo,
            indice: getSatisfactionIndex(filtered),
        };
    });
}

// Satisfaction by asignatura for a specific mention
export function getSatisfactionByAsignatura(data: SurveyEntry[], mencion: Mencion) {
    const courses = mencionCourses[mencion];
    return courses.map(course => {
        const filtered = data.filter(d => d.asignatura === course.asignatura);
        return {
            asignatura: course.asignatura,
            indice: filtered.length > 0 ? getSatisfactionIndex(filtered) : 0,
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
        const indice = getSatisfactionIndex(entries);
        return { asignatura, docentes: docentes.join(', '), indice, nps };
    });

    return courseStats
        .sort((a, b) => b.indice - a.indice)
        .slice(0, limit);
}

// Get all unique mentions from data
export function getUniqueMenciones(): Mencion[] {
    return [
        'Asesoramiento Psicológico y Orientación',
        'Psicología Clínica',
        'Psicología Escolar',
        'Psicología Industrial y Organizacional',
    ];
}
