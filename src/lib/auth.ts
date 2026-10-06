import { supabase } from './supabase';

// ============================================================
// TIPOS DEL SISTEMA DE USUARIOS
// ============================================================

export type UserRole = 'profesor' | 'jefe_catedra' | 'jefe_departamento' | 'directora';

export interface UsuarioPerfil {
    id: string;
    nombre_completo: string;
    nombre_normalizado: string;
    nombre_docente_bd: string;
    email_recuperacion: string;
    departamento: string;
    catedra: string;
    rol: UserRole;
    es_jefe_catedra: boolean;
    es_jefe_departamento: boolean;
    created_at: string;
}

export interface RegistroFormData {
    nombre_completo: string;
    nombre_docente_bd: string;
    email_recuperacion: string;
    departamento?: string;
    catedra?: string;
    es_jefe_catedra: boolean;
    es_jefe_departamento: boolean;
    password: string;
}

// ============================================================
// NORMALIZACIÓN DE NOMBRES
// ============================================================

/**
 * Normaliza un nombre eliminando acentos, tildes, convirtiendo a minúsculas,
 * y normalizando espacios. Usado para fuzzy matching entre el input del
 * profesor y los nombres en la base de datos.
 */
export function normalizarNombre(nombre: string): string {
    return nombre
        .normalize('NFD')                     // Descomponer caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '')      // Eliminar marcas diacríticas
        .toLowerCase()                         // Todo a minúsculas
        .trim()                               // Eliminar espacios al inicio y final
        .replace(/\s+/g, ' ');                // Normalizar espacios múltiples
}

/**
 * Calcula un score de similitud entre dos strings normalizados.
 * Retorna un valor entre 0 y 1 (1 = match exacto).
 */
export function calcularSimilitud(a: string, b: string): number {
    const na = normalizarNombre(a);
    const nb = normalizarNombre(b);

    // Match exacto normalizado
    if (na === nb) return 1;

    // Uno contiene al otro
    if (na.includes(nb) || nb.includes(na)) return 0.85;

    // Similitud por palabras compartidas
    const wordsA = na.split(' ');
    const wordsB = nb.split(' ');
    const shared = wordsA.filter(w => wordsB.some(wb => wb.includes(w) || w.includes(wb)));
    const wordScore = shared.length / Math.max(wordsA.length, wordsB.length);

    return wordScore * 0.8;
}

// ============================================================
// FUNCIONES DE DATOS
// ============================================================

/**
 * Obtiene la lista de docentes únicos de la tabla datos_limpios.
 */
export async function obtenerDocentesUnicos(): Promise<string[]> {
    const { data, error } = await supabase
        .from('datos_limpios')
        .select('docente_evaluado');

    if (error || !data) {
        console.error('Error fetching docentes:', error);
        return [];
    }

    const docentes = new Set(data.map((d: { docente_evaluado: string }) => d.docente_evaluado).filter(Boolean));
    return Array.from(docentes).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Obtiene la lista de docentes de datos_limpios que aún NO tienen una cuenta registrada en usuarios.
 */
export async function obtenerDocentesSinCuenta(): Promise<string[]> {
    const [todosDocentes, { data: usuariosRegistrados, error }] = await Promise.all([
        obtenerDocentesUnicos(),
        supabase.from('usuarios').select('nombre_docente_bd'),
    ]);

    if (error || !usuariosRegistrados) {
        console.error('Error fetching registered users:', error);
        return todosDocentes;
    }

    const registrados = new Set(
        usuariosRegistrados
            .map((u: { nombre_docente_bd: string }) => normalizarNombre(u.nombre_docente_bd))
            .filter(Boolean)
    );

    return todosDocentes.filter(d => !registrados.has(normalizarNombre(d)));
}

/**
 * Obtiene la lista de docentes que ya tienen una cuenta registrada en la tabla usuarios.
 */
export async function obtenerDocentesYaRegistrados(): Promise<string[]> {
    const { data, error } = await supabase.from('usuarios').select('nombre_docente_bd');
    if (error || !data) return [];
    return data.map((u: { nombre_docente_bd: string }) => u.nombre_docente_bd).filter(Boolean);
}

/**
 * Obtiene los departamentos únicos de la tabla datos_limpios.
 */
export async function obtenerDepartamentosUnicos(): Promise<string[]> {
    const { data, error } = await supabase
        .from('datos_limpios')
        .select('departamento_evaluado');

    if (error || !data) {
        console.error('Error fetching departamentos:', error);
        return [];
    }

    const departamentos = new Set(data.map((d: { departamento_evaluado: string }) => d.departamento_evaluado).filter(Boolean));
    return Array.from(departamentos).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Obtiene las cátedras únicas de la tabla datos_limpios, opcionalmente filtradas por departamento.
 */
export async function obtenerCatedrasUnicas(departamento?: string): Promise<string[]> {
    let query = supabase.from('datos_limpios').select('catedra_evaluada');

    if (departamento) {
        query = query.eq('departamento_evaluado', departamento);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error('Error fetching catedras:', error);
        return [];
    }

    const catedras = new Set(data.map((d: { catedra_evaluada: string }) => d.catedra_evaluada).filter(Boolean));
    return Array.from(catedras).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Busca docentes que coincidan con el input del usuario (fuzzy matching).
 */
export function buscarDocentesSimilares(input: string, docentes: string[], limit: number = 8): string[] {
    if (!input || input.trim().length < 2) return [];

    const inputNorm = normalizarNombre(input);

    const scored = docentes.map(docente => ({
        docente,
        score: calcularSimilitud(input, docente),
        // Bonus si empieza con el mismo texto
        startsBonus: normalizarNombre(docente).startsWith(inputNorm) ? 0.15 : 0,
    }));

    return scored
        .map(s => ({ ...s, totalScore: s.score + s.startsBonus }))
        .filter(s => s.totalScore > 0.2)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit)
        .map(s => s.docente);
}

/**
 * Obtiene el departamento y cátedra evaluados para un docente (el primer registro encontrado).
 */
export async function obtenerDeptoCatedraDocente(nombreDocente: string): Promise<{ departamento: string; catedra: string }> {
    const { data, error } = await supabase
        .from('datos_limpios')
        .select('departamento_evaluado, catedra_evaluada')
        .eq('docente_evaluado', nombreDocente)
        .limit(1);

    if (error || !data || data.length === 0) {
        return { departamento: '', catedra: '' };
    }

    return {
        departamento: data[0].departamento_evaluado || '',
        catedra: data[0].catedra_evaluada || '',
    };
}

/**
 * Obtiene el departamento al que pertenece una cátedra (el primer registro).
 */
export async function obtenerDepartamentoDeCatedra(catedra: string): Promise<string> {
    const { data, error } = await supabase
        .from('datos_limpios')
        .select('departamento_evaluado')
        .eq('catedra_evaluada', catedra)
        .limit(1);

    if (error || !data || data.length === 0) {
        return '';
    }

    return data[0].departamento_evaluado || '';
}

/**
 * Obtiene los departamentos de datos_limpios que aún no tienen un jefe de departamento registrado en usuarios.
 */
export async function obtenerDepartamentosSinJefe(): Promise<string[]> {
    const todosDeptos = await obtenerDepartamentosUnicos();
    const { data: jefes, error } = await supabase
        .from('usuarios')
        .select('departamento')
        .eq('es_jefe_departamento', true);

    if (error) {
        console.error('Error fetching jefes de departamento:', error);
        return todosDeptos;
    }

    const deptosConJefe = new Set((jefes || []).map(j => j.departamento).filter(Boolean));
    return todosDeptos.filter(d => !deptosConJefe.has(d));
}

/**
 * Obtiene las cátedras de datos_limpios que aún no tienen un jefe de cátedra registrado en usuarios.
 */
export async function obtenerCatedrasSinJefe(): Promise<string[]> {
    const todasCatedras = await obtenerCatedrasUnicas();
    const { data: jefes, error } = await supabase
        .from('usuarios')
        .select('catedra')
        .eq('es_jefe_catedra', true);

    if (error) {
        console.error('Error fetching jefes de catedra:', error);
        return todasCatedras;
    }

    const catedrasConJefe = new Set((jefes || []).map(j => j.catedra).filter(Boolean));
    return todasCatedras.filter(c => !catedrasConJefe.has(c));
}

// ============================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================

/**
 * Determina el rol basado en el nombre y las selecciones del formulario.
 */
export function determinarRol(
    nombreDocente: string,
    esJefeCatedra: boolean,
    esJefeDepartamento: boolean
): UserRole {
    // Verificar si es la directora
    const normalizado = normalizarNombre(nombreDocente);
    if (normalizado === 'aysbel gonzalez' || normalizado === 'aysbel gonzales') {
        return 'directora';
    }

    // Jefe de departamento tiene prioridad
    if (esJefeDepartamento) return 'jefe_departamento';
    if (esJefeCatedra) return 'jefe_catedra';
    return 'profesor';
}

/**
 * Registra un nuevo usuario en Supabase Auth y crea su perfil.
 */
export async function registrarUsuario(formData: RegistroFormData): Promise<{
    success: boolean;
    error?: string;
    userId?: string;
}> {
    try {
        // Verificar que el docente no tenga cuenta ya
        const { data: existente } = await supabase
            .from('usuarios')
            .select('id')
            .eq('nombre_docente_bd', formData.nombre_docente_bd)
            .maybeSingle();

        if (existente) {
            return { success: false, error: 'Este docente ya tiene una cuenta registrada.' };
        }

        // Resolver departamento y cátedra automáticamente si no se proporcionaron
        let departamentoFinal = formData.departamento || '';
        let catedraFinal = formData.catedra || '';

        if (!departamentoFinal || !catedraFinal) {
            const deptoCatAuto = await obtenerDeptoCatedraDocente(formData.nombre_docente_bd);
            if (!departamentoFinal) {
                if (catedraFinal) {
                    const deptoDeCat = await obtenerDepartamentoDeCatedra(catedraFinal);
                    departamentoFinal = deptoDeCat || deptoCatAuto.departamento;
                } else {
                    departamentoFinal = deptoCatAuto.departamento;
                }
            }
            if (!catedraFinal) {
                catedraFinal = deptoCatAuto.catedra;
            }
        }

        // Si se registra como jefe de departamento, validar que el departamento no tenga jefe ya registrado
        if (formData.es_jefe_departamento && departamentoFinal) {
            const { data: jefeExistente } = await supabase
                .from('usuarios')
                .select('id')
                .eq('departamento', departamentoFinal)
                .eq('es_jefe_departamento', true)
                .maybeSingle();

            if (jefeExistente) {
                return { success: false, error: `Ya existe un jefe registrado para el departamento "${departamentoFinal}".` };
            }
        }

        // Si se registra como jefe de cátedra, validar que la cátedra no tenga jefe ya registrado
        if (formData.es_jefe_catedra && catedraFinal) {
            const { data: jefeExistente } = await supabase
                .from('usuarios')
                .select('id')
                .eq('catedra', catedraFinal)
                .eq('es_jefe_catedra', true)
                .maybeSingle();

            if (jefeExistente) {
                return { success: false, error: `Ya existe un jefe registrado para la cátedra "${catedraFinal}".` };
            }
        }

        // Limpiar cualquier sesión anterior colgada
        await supabase.auth.signOut();

        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email_recuperacion,
            password: formData.password,
        });

        if (authError || !authData.user) {
            return { success: false, error: authError?.message || 'Error al crear la cuenta.' };
        }

        // Si signUp no dejó la sesión activa, iniciar sesión explícitamente
        if (!authData.session) {
            await supabase.auth.signInWithPassword({
                email: formData.email_recuperacion,
                password: formData.password,
            });
        }

        // Determinar rol
        const rol = determinarRol(
            formData.nombre_docente_bd,
            formData.es_jefe_catedra,
            formData.es_jefe_departamento
        );

        const esDirectora = rol === 'directora';

        // Crear perfil en tabla usuarios
        const { error: perfilError } = await supabase.from('usuarios').insert({
            id: authData.user.id,
            nombre_completo: formData.nombre_completo,
            nombre_normalizado: normalizarNombre(formData.nombre_completo),
            nombre_docente_bd: formData.nombre_docente_bd,
            email_recuperacion: formData.email_recuperacion,
            departamento: departamentoFinal,
            catedra: catedraFinal,
            rol: rol,
            es_jefe_catedra: esDirectora ? true : formData.es_jefe_catedra,
            es_jefe_departamento: esDirectora ? true : formData.es_jefe_departamento,
        });

        if (perfilError) {
            // Si falla la creación del perfil, intentar eliminar el usuario auth
            console.error('Error creating profile:', perfilError);
            return { success: false, error: 'Error al crear el perfil: ' + perfilError.message };
        }

        return { success: true, userId: authData.user.id };
    } catch (err) {
        console.error('Registration error:', err);
        return { success: false, error: 'Error inesperado durante el registro.' };
    }
}

/**
 * Inicia sesión con email y contraseña.
 */
export async function iniciarSesion(email: string, password: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function cerrarSesion(): Promise<void> {
    await supabase.auth.signOut();
}

/**
 * Obtiene el perfil del usuario actual.
 * Incluye retry para dar tiempo a que la sesión se propague en RLS.
 */
export async function obtenerPerfilUsuario(userId: string): Promise<UsuarioPerfil | null> {
    // Primer intento
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (data) {
        return data as UsuarioPerfil;
    }

    if (error) {
        console.warn('First attempt to fetch profile failed:', error.message, '- retrying in 1s...');
    }

    // Retry después de 1 segundo (la sesión puede tardar en propagarse)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: data2, error: error2 } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error2) {
        console.error('Error fetching user profile (retry):', error2.message);
        return null;
    }

    return data2 as UsuarioPerfil | null;
}

/**
 * Obtiene las asignaturas que imparte un docente.
 */
export async function obtenerAsignaturasDocente(nombreDocente: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('datos_limpios')
        .select('asignatura_evaluada')
        .eq('docente_evaluado', nombreDocente);

    if (error || !data) return [];

    const asignaturas = new Set(data.map((d: { asignatura_evaluada: string }) => d.asignatura_evaluada).filter(Boolean));
    return Array.from(asignaturas).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Envía un email de recuperación de contraseña.
 */
export async function recuperarContrasena(email: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================================
// FUNCIONES DE PERMISOS
// ============================================================

/**
 * Retorna los módulos del sidebar visibles según el rol del usuario.
 */
export function obtenerModulosPermitidos(rol: UserRole): string[] {
    switch (rol) {
        case 'directora':
            return ['resumen', 'asignaturas', 'docentes', 'vista-detallada', 'admin-usuarios'];
        case 'jefe_departamento':
            return ['asignaturas', 'docentes', 'vista-detallada'];
        case 'jefe_catedra':
            return ['asignaturas', 'docentes', 'vista-detallada'];
        case 'profesor':
            return ['docentes'];
        default:
            return ['docentes'];
    }
}
