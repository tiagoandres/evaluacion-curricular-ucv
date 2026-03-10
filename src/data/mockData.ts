export interface SurveyEntry {
  id: string | number;
  ciclo: string;
  mencion?: string | null;
  edad: number;
  genero: string;
  asignatura: string;
  docente: string;
  gestionScore: number; // 0-10
  contenidosScore: number; // 0-10
  evaluacionScore: number; // 0-10
  desempenoScore: number; // 0-10
  calidad_unidad_curricular: number; // 0-100
  utilidad_asignatura: number; // 1-10
  nps_docente: number; // 1-10
}

export function mapSupabaseRowToSurveyEntry(row: any): SurveyEntry {
  return {
    id: row.marca_temporal || Math.random().toString(),
    ciclo: row.ciclo_evaluado || 'Desconocido',
    mencion: row.mencion_evaluada,
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
  };
}

export const surveyData: SurveyEntry[] = [];
