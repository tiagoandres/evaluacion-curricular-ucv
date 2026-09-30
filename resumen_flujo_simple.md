# Resumen de Funcionamiento: Proyecto de Evaluación Curricular - Escuela de Psicología UCV

## Elaborado por: Santiago Cárdenas

Este documento detalla el flujo de información y la arquitectura técnica del sistema de evaluación integral de unidades curriculares de la Escuela de Psicología de la Universidad Central de Venezuela.

## 1. El Ciclo de Datos

El sistema está diseñado para transformar las opiniones de los estudiantes en conocimiento accionable para la mejora académica siguiendo este flujo:

1. **Captura**: El estudiante completa el formulario en Google Forms.
2. **Centralización**: Las respuestas se agrupan en una hoja de cálculo de Google.
3. **Automatización**: Un script (Google Apps Script) procesa y limpia los datos.
4. **Sincronización**: Los datos limpios se envían a la base de datos Supabase donde se transforman y cargan.
5. **Visualización**: La App Web (Next.js) consume los datos y genera dashboards.
6. **Reportes**: Se generan informes detallados en PDF para docentes y asignaturas.

## 2. Etapas del Proceso

### Fase 1: Recolección (Google Forms)
El proceso inicia cuando los estudiantes completan el instrumento de evaluación. Este formulario consta de **74 preguntas** que cubren:
* **Gestión de la Unidad Curricular**: Cumplimiento de cronogramas y programas.
* **Contenidos y Recursos**: Calidad y pertinencia de los materiales.
* **Evaluación**: Claridad y diversidad de procedimientos.
* **Desempeño Docente**: Actitud, dominio y pedagogía.
* **Autovaloración**: Compromiso del propio estudiante.

### Fase 2: Automatización y Almacenamiento (Apps Script & Supabase)
Para evitar la carga manual, se utiliza un script que:
1. Escucha cada nueva respuesta en la hoja de cálculo de Google.
2. Realiza una **limpieza de datos** (corrección de acentos, estandarización de nombres).
3. Inserta los registros en la tabla `datos_brutos` en **Supabase**, garantizando que la aplicación siempre tenga acceso a la información actualizada.
4. Se generó la tabla  `datos_limpios` en la que se extraen, transforman y cargan los datos de `datos_brutos` y que alimentan a la app web.

### Fase 3: Visualización e Inteligencia (App Web Next.js)
La aplicación web permite a los coordinadores explorar los resultados:
* **Resumen General**: Vista macro de indicadores clave y demografía.
* **Filtros Jerárquicos**: Segmentación por Ciclo, Departamento, Cátedra y Asignatura.
* **Vista Detallada**: Ranking de docentes basado en el índice de satisfacción.
* **Reportes Individuales**: Generación automática de informes en PDF personalizados.

## 3. Especificaciones Técnicas
* **Frontend**: Next.js 15, React 19, Tailwind CSS.
* **Backend**: Supabase (PostgreSQL).
* **Gráficos**: Recharts.
* **Reportes**: @react-pdf/renderer.