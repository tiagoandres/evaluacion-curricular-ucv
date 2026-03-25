export interface SurveyEntry {
  id: string | number;
  ciclo: string;
  departamento?: string | null;
  catedra?: string | null;
  edad: number;
  genero: string;
  asignatura: string;
  docente: string;
  gestionScore: number; // 0-100
  contenidosScore: number; // 0-100
  evaluacionScore: number; // 0-100
  desempenoScore: number; // 0-100
  calidad_unidad_curricular: number; // 0-100
  utilidad_asignatura: number; // 1-10
  nps_docente: number; // 1-10
  desempenoEstudiantil: number; // 0-100
  // Nuevos campos Asignaturas
  gestion1: string;
  gestion2: string;
  gestion3: string;
  contenido_recursos13: string;
  contenido_recursos14: string;
  contenido_recursos15: string;
  contenido_recursos16: string;
  evaluacion1: string;
  evaluacion2: string;
  evaluacion3: string;
  evaluacion4: string;
  evaluacion5: string;
  evaluacion6: string;
  // Contenidos 1-12
  contenido_recursos1: string;
  contenido_recursos2: string;
  contenido_recursos3: string;
  contenido_recursos4: string;
  contenido_recursos5: string;
  contenido_recursos6: string;
  contenido_recursos7: string;
  contenido_recursos8: string;
  contenido_recursos9: string;
  contenido_recursos10: string;
  contenido_recursos11: string;
  contenido_recursos12: string;
  // Autoevaluación Estudiante
  autoevaluacion1?: string;
  autoevaluacion2?: string;
  autoevaluacion3?: string;
  autoevaluacion4?: string;
  autoevaluacion5?: string;
  autoevaluacion6?: string;
  autoevaluacion7?: string;
  autoevaluacion8?: string;
  autoevaluacion9?: string;
  // Desempeño Docente (individual questions)
  desempenoDocente1?: string;
  desempenoDocente2?: string;
  desempenoDocente3?: string;
  desempenoDocente4?: string;
  desempenoDocente5?: string;
  desempenoDocente6?: string;
  desempenoDocente7?: string;
  desempenoDocente8?: string;
  desempenoDocente9?: string;
  desempenoDocente10?: string;
  // Desempeño Docente numérico (1-4)
  desempenoDocente1Num?: number;
  desempenoDocente2Num?: number;
  desempenoDocente3Num?: number;
  desempenoDocente4Num?: number;
  desempenoDocente5Num?: number;
  desempenoDocente6Num?: number;
  desempenoDocente7Num?: number;
  desempenoDocente8Num?: number;
  desempenoDocente9Num?: number;
  desempenoDocente10Num?: number;
}

export function mapSupabaseRowToSurveyEntry(row: any): SurveyEntry {
  return {
    id: row.marca_temporal || Math.random().toString(),
    ciclo: row.ciclo_evaluado || 'Desconocido',
    departamento: row.departamento_evaluado,
    catedra: row.catedra_evaluada,
    edad: row.edad || 0,
    genero: row.genero || 'Otro',
    asignatura: row.asignatura_evaluada || 'Desconocida',
    docente: row.docente_evaluado || 'Desconocido',
    gestionScore: row.gestion_transformado || 0,
    contenidosScore: row.contenidos_transformado || 0,
    evaluacionScore: row.evaluacion_transformado || 0,
    desempenoScore: row.desempeño_docente_transformado || row.desempeno_docente_transformado || 0,
    calidad_unidad_curricular: row.indice_calidad_curricular_transformado || 0,
    utilidad_asignatura: row.utilidad || 0,
    nps_docente: row.nps || 0,
    desempenoEstudiantil: row.indice_calidad_estudiantil_transformado || 0,
    // Nuevos campos Asignaturas
    gestion1: row.gestion1 || '',
    gestion2: row.gestion2 || '',
    gestion3: row.gestion3 || '',
    contenido_recursos13: row.contenido_recursos13 || '',
    contenido_recursos14: row.contenido_recursos14 || '',
    contenido_recursos15: row.contenido_recursos15 || '',
    contenido_recursos16: row.contenido_recursos16 || '',
    evaluacion1: row.evaluacion1 || row.evaluacion_1 || row.Evaluacion1 || row.evaluación1 || row.evaluación_1 || '',
    evaluacion2: row.evaluacion2 || row.evaluacion_2 || row.Evaluacion2 || row.evaluación2 || row.evaluación_2 || '',
    evaluacion3: row.evaluacion3 || row.evaluacion_3 || row.Evaluacion3 || row.evaluación3 || row.evaluación_3 || '',
    evaluacion4: row.evaluacion4 || row.evaluacion_4 || row.Evaluacion4 || row.evaluación4 || row.evaluación_4 || '',
    evaluacion5: row.evaluacion5 || row.evaluacion_5 || row.Evaluacion5 || row.evaluación5 || row.evaluación_5 || '',
    evaluacion6: row.evaluacion6 || row.evaluacion_6 || row.Evaluacion6 || row.evaluación6 || row.evaluación_6 || '',
    contenido_recursos1: row.contenido_recursos1 || '',
    contenido_recursos2: row.contenido_recursos2 || '',
    contenido_recursos3: row.contenido_recursos3 || '',
    contenido_recursos4: row.contenido_recursos4 || '',
    contenido_recursos5: row.contenido_recursos5 || '',
    contenido_recursos6: row.contenido_recursos6 || '',
    contenido_recursos7: row.contenido_recursos7 || '',
    contenido_recursos8: row.contenido_recursos8 || '',
    contenido_recursos9: row.contenido_recursos9 || '',
    contenido_recursos10: row.contenido_recursos10 || '',
    contenido_recursos11: row.contenido_recursos11 || '',
    contenido_recursos12: row.contenido_recursos12 || '',
    autoevaluacion1: row.autoevaluacion_estudiante1 || '',
    autoevaluacion2: row.autoevaluacion_estudiante2 || '',
    autoevaluacion3: row.autoevaluacion_estudiante3 || '',
    autoevaluacion4: row.autoevaluacion_estudiante4 || '',
    autoevaluacion5: row.autoevaluacion_estudiante5 || '',
    autoevaluacion6: row.autoevaluacion_estudiante6 || '',
    autoevaluacion7: row.autoevaluacion_estudiante7 || '',
    autoevaluacion8: row.autoevaluacion_estudiante8 || '',
    autoevaluacion9: row.autoevaluacion_estudiante9 || '',
    desempenoDocente1: row['desempeño_docente1'] || row.desempeno_docente1 || '',
    desempenoDocente2: row['desempeño_docente2'] || row.desempeno_docente2 || '',
    desempenoDocente3: row['desempeño_docente3'] || row.desempeno_docente3 || '',
    desempenoDocente4: row['desempeño_docente4'] || row.desempeno_docente4 || '',
    desempenoDocente5: row['desempeño_docente5'] || row.desempeno_docente5 || '',
    desempenoDocente6: row['desempeño_docente6'] || row.desempeno_docente6 || '',
    desempenoDocente7: row['desempeño_docente7'] || row.desempeno_docente7 || '',
    desempenoDocente8: row['desempeño_docente8'] || row.desempeno_docente8 || '',
    desempenoDocente9: row['desempeño_docente9'] || row.desempeno_docente9 || '',
    desempenoDocente10: row['desempeño_docente10'] || row.desempeno_docente10 || '',
    desempenoDocente1Num: parseFloat(row['desempeño_docente1_num'] || row.desempeno_docente1_num) || undefined,
    desempenoDocente2Num: parseFloat(row['desempeño_docente2_num'] || row.desempeno_docente2_num) || undefined,
    desempenoDocente3Num: parseFloat(row['desempeño_docente3_num'] || row.desempeno_docente3_num) || undefined,
    desempenoDocente4Num: parseFloat(row['desempeño_docente4_num'] || row.desempeno_docente4_num) || undefined,
    desempenoDocente5Num: parseFloat(row['desempeño_docente5_num'] || row.desempeno_docente5_num) || undefined,
    desempenoDocente6Num: parseFloat(row['desempeño_docente6_num'] || row.desempeno_docente6_num) || undefined,
    desempenoDocente7Num: parseFloat(row['desempeño_docente7_num'] || row.desempeno_docente7_num) || undefined,
    desempenoDocente8Num: parseFloat(row['desempeño_docente8_num'] || row.desempeno_docente8_num) || undefined,
    desempenoDocente9Num: parseFloat(row['desempeño_docente9_num'] || row.desempeno_docente9_num) || undefined,
    desempenoDocente10Num: parseFloat(row['desempeño_docente10_num'] || row.desempeno_docente10_num) || undefined,
  };
}

export const surveyData: SurveyEntry[] = [];
