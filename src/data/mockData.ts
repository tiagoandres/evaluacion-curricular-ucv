// Mock data for Evaluación Integral de la Unidad Curricular
// Based on Google Form structure from UCV Escuela de Psicología

export type Ciclo = 'Ciclo Básico' | 'Mención' | 'Teorías Psicológicas';
export type Genero = 'Femenino' | 'Masculino' | 'Prefiero no decirlo' | 'Otro';
export type Mencion = 'Asesoramiento Psicológico y Orientación' | 'Psicología Clínica' | 'Psicología Escolar' | 'Psicología Industrial y Organizacional';

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface SurveyEntry {
  id: number;
  ciclo: Ciclo;
  mencion?: Mencion;
  edad: number;
  genero: Genero;
  asignatura: string;
  docente: string;
  // Dimensión: Gestión Académica (Q29-Q33)
  gestion_programa_presentado: LikertValue;
  gestion_programa_cumplido: LikertValue;
  gestion_objetivos_claros: LikertValue;
  gestion_coherencia_plan: LikertValue;
  gestion_pensamiento_critico: LikertValue;
  // Dimensión: Contenidos y Recursos (Q34-Q38)
  contenidos_profundidad: LikertValue;
  contenidos_organizacion: LikertValue;
  contenidos_bibliografia: LikertValue;
  contenidos_objetivos_cumplidos: LikertValue;
  contenidos_estrategias: LikertValue;
  // Dimensión: Evaluación (Q39-Q40)
  evaluacion_metodos: LikertValue;
  evaluacion_retroalimentacion: LikertValue;
  // Dimensión: Desempeño Docente (Q41-Q43)
  docente_dominio: LikertValue;
  docente_participacion: LikertValue;
  docente_puntualidad: LikertValue;
  // Métricas finales
  utilidad_asignatura: number; // 1-10
  nps_docente: number; // 1-10
}

// Course-Professor mappings from the PDF
const cicloBasicoCourses: { asignatura: string; docentes: string[] }[] = [
  { asignatura: 'Psicología General I', docentes: ['Salvador Rivera', 'Alcides Robles'] },
  { asignatura: 'Psicología General II', docentes: ['Zerimar Luces', 'Jesús Martinez'] },
  { asignatura: 'Psicología General III', docentes: ['Edgar Alfonzo', 'David García'] },
  { asignatura: 'Estadística I', docentes: ['María Fernanda López', 'Carlos Mendoza'] },
  { asignatura: 'Estadística II', docentes: ['Carlos Mendoza', 'Ana Rodríguez'] },
  { asignatura: 'Estadística III', docentes: ['Ana Rodríguez'] },
  { asignatura: 'Teoría Social', docentes: ['Roberto Sánchez', 'Patricia Morales'] },
  { asignatura: 'Neurofisiología', docentes: ['Daniela Torres', 'Gabriel Herrera'] },
  { asignatura: 'Estructura Social Venezolana', docentes: ['Luisa Ramírez'] },
  { asignatura: 'Psicología Social', docentes: ['Fernando Castro', 'Adriana Díaz'] },
  { asignatura: 'Psicología Evolutiva', docentes: ['Carmen Gutiérrez', 'Pedro Navarro'] },
  { asignatura: 'Psicometría', docentes: ['Miguel Ángel Flores', 'Diana Vargas'] },
  { asignatura: 'Metodología de la Investigación I', docentes: ['Isabel Reyes', 'Andrés Paredes'] },
  { asignatura: 'Métodos Cuantitativos', docentes: ['Carlos Mendoza'] },
  { asignatura: 'Métodos Cualitativos', docentes: ['Luisa Ramírez', 'Roberto Sánchez'] },
  { asignatura: 'Psicología Experimental', docentes: ['Gabriel Herrera', 'Diana Vargas'] },
  { asignatura: 'Psicología de la Personalidad', docentes: ['Adriana Díaz', 'Carmen Gutiérrez'] },
  { asignatura: 'Historia de la Psicología', docentes: ['Pedro Navarro', 'Salvador Rivera'] },
];

const mencionCourses: Record<Mencion, { asignatura: string; docentes: string[] }[]> = {
  'Asesoramiento Psicológico y Orientación': [
    { asignatura: 'Comunicación Interpersonal', docentes: ['Laura Méndez', 'Ricardo Blanco'] },
    { asignatura: 'Instrumentos de Asesoramiento', docentes: ['Sofía Pérez', 'Manuel Rivas'] },
    { asignatura: 'Asesoramiento Psicológico', docentes: ['Laura Méndez', 'Jorge Delgado'] },
    { asignatura: 'Orientación Vocacional', docentes: ['Ricardo Blanco', 'Sofía Pérez'] },
  ],
  'Psicología Clínica': [
    { asignatura: 'Psicología Clínica Dinámica', docentes: ['Alejandro Vega', 'Natalia Suárez'] },
    { asignatura: 'Evaluación Psicológica', docentes: ['Beatriz Márquez', 'Hugo Jiménez'] },
    { asignatura: 'Psicopatología', docentes: ['Alejandro Vega', 'Beatriz Márquez'] },
    { asignatura: 'Intervención Clínica', docentes: ['Natalia Suárez', 'Hugo Jiménez'] },
  ],
  'Psicología Escolar': [
    { asignatura: 'Psicología Educativa', docentes: ['Teresa Acosta', 'Ramón Quintero'] },
    { asignatura: 'Evaluación Educativa', docentes: ['Elena Fuentes', 'Ramón Quintero'] },
    { asignatura: 'Orientación Escolar', docentes: ['Teresa Acosta', 'Elena Fuentes'] },
    { asignatura: 'Diseño Instruccional', docentes: ['Ramón Quintero'] },
  ],
  'Psicología Industrial y Organizacional': [
    { asignatura: 'Análisis de Cargos', docentes: ['Víctor Leal', 'Claudia Montes'] },
    { asignatura: 'Teorías y Sistemas Organizacionales', docentes: ['Marcos Salazar', 'Víctor Leal'] },
    { asignatura: 'Selección de Personal', docentes: ['Claudia Montes', 'Marcos Salazar'] },
    { asignatura: 'Desarrollo Organizacional', docentes: ['Víctor Leal'] },
  ],
};

const teoriasPsicologicas = {
  asignatura: 'Teorías Psicológicas',
  docentes: ['Francisco Rivero', 'Martha Colmenares'],
};

const menciones: Mencion[] = [
  'Asesoramiento Psicológico y Orientación',
  'Psicología Clínica',
  'Psicología Escolar',
  'Psicología Industrial y Organizacional',
];

// Random number helpers
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randLikert(bias: number = 3): LikertValue {
  // bias 1-5, higher bias = higher average scores
  const weights = {
    1: [0.4, 0.3, 0.15, 0.1, 0.05],
    2: [0.2, 0.35, 0.25, 0.15, 0.05],
    3: [0.05, 0.15, 0.3, 0.3, 0.2],
    4: [0.03, 0.07, 0.2, 0.35, 0.35],
    5: [0.02, 0.03, 0.1, 0.3, 0.55],
  };
  const w = weights[Math.max(1, Math.min(5, Math.round(bias))) as 1 | 2 | 3 | 4 | 5];
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < w.length; i++) {
    cumulative += w[i];
    if (r <= cumulative) return (i + 1) as LikertValue;
  }
  return 3;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEntry(id: number): SurveyEntry {
  const cicloRand = Math.random();
  let ciclo: Ciclo;
  let mencion: Mencion | undefined;
  let asignatura: string;
  let docente: string;

  if (cicloRand < 0.5) {
    ciclo = 'Ciclo Básico';
    const course = pickRandom(cicloBasicoCourses);
    asignatura = course.asignatura;
    docente = pickRandom(course.docentes);
  } else if (cicloRand < 0.9) {
    ciclo = 'Mención';
    mencion = pickRandom(menciones);
    const course = pickRandom(mencionCourses[mencion]);
    asignatura = course.asignatura;
    docente = pickRandom(course.docentes);
  } else {
    ciclo = 'Teorías Psicológicas';
    asignatura = teoriasPsicologicas.asignatura;
    docente = pickRandom(teoriasPsicologicas.docentes);
  }

  const generoRand = Math.random();
  const genero: Genero =
    generoRand < 0.62 ? 'Femenino' :
    generoRand < 0.92 ? 'Masculino' :
    generoRand < 0.97 ? 'Prefiero no decirlo' : 'Otro';

  // Quality bias per course (simulate some courses being better than others)
  const qualityBias = 2.5 + Math.random() * 2.5; // 2.5-5

  return {
    id,
    ciclo,
    mencion,
    edad: randInt(18, 35),
    genero,
    asignatura,
    docente,
    gestion_programa_presentado: randLikert(qualityBias),
    gestion_programa_cumplido: randLikert(qualityBias),
    gestion_objetivos_claros: randLikert(qualityBias),
    gestion_coherencia_plan: randLikert(qualityBias + 0.3),
    gestion_pensamiento_critico: randLikert(qualityBias - 0.2),
    contenidos_profundidad: randLikert(qualityBias),
    contenidos_organizacion: randLikert(qualityBias + 0.2),
    contenidos_bibliografia: randLikert(qualityBias - 0.3),
    contenidos_objetivos_cumplidos: randLikert(qualityBias),
    contenidos_estrategias: randLikert(qualityBias),
    evaluacion_metodos: randLikert(qualityBias + 0.1),
    evaluacion_retroalimentacion: randLikert(qualityBias - 0.2),
    docente_dominio: randLikert(qualityBias + 0.5),
    docente_participacion: randLikert(qualityBias + 0.3),
    docente_puntualidad: randLikert(qualityBias),
    utilidad_asignatura: Math.min(10, Math.max(1, Math.round(qualityBias * 2 + (Math.random() - 0.5) * 3))),
    nps_docente: Math.min(10, Math.max(1, Math.round(qualityBias * 2 + (Math.random() - 0.5) * 4))),
  };
}

// Generate seeded data (we use a fixed seed approach by generating once)
function generateAllData(): SurveyEntry[] {
  const entries: SurveyEntry[] = [];
  for (let i = 1; i <= 156; i++) {
    entries.push(generateEntry(i));
  }
  return entries;
}

export const surveyData: SurveyEntry[] = generateAllData();

export { cicloBasicoCourses, mencionCourses, teoriasPsicologicas, menciones };
