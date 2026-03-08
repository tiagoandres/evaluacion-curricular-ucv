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
    gestionScore: Math.min(10, ((row.total_gestion || 0) / 3) * 10),
    contenidosScore: Math.min(10, ((row.total_contenido_recursos || 0) / 48) * 10),
    evaluacionScore: Math.min(10, ((row.total_evaluacion || 0) / 24) * 10),
    desempenoScore: Math.min(10, ((row.total_desempeño_docente || 0) / 30) * 10),
    calidad_unidad_curricular: row.calidad_unidad_curricular || 0,
    utilidad_asignatura: row.utilidad || 0,
    nps_docente: row.nps || 0,
  };
}

export const surveyData: SurveyEntry[] = [];
