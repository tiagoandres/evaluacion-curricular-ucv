-- ============================================================
-- SISTEMA DE USUARIOS - Evaluación Curricular UCV
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================

-- 1. Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    nombre_normalizado TEXT NOT NULL,
    nombre_docente_bd TEXT NOT NULL,
    email_recuperacion TEXT NOT NULL,
    departamento TEXT NOT NULL,
    catedra TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'profesor' CHECK (rol IN ('profesor', 'jefe_catedra', 'jefe_departamento', 'directora')),
    es_jefe_catedra BOOLEAN NOT NULL DEFAULT FALSE,
    es_jefe_departamento BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_normalizado ON public.usuarios(nombre_normalizado);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_docente_bd ON public.usuarios(nombre_docente_bd);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_nombre_docente_bd_unique ON public.usuarios(nombre_docente_bd);

-- 3. Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS

-- Función auxiliar con SECURITY DEFINER para verificar rol sin activar RLS recursivamente
CREATE OR REPLACE FUNCTION public.es_directora()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'directora'
  );
$$;

-- Los usuarios pueden leer su propio registro
CREATE POLICY "Usuarios pueden leer su propio perfil"
    ON public.usuarios
    FOR SELECT
    USING (auth.uid() = id);

-- La directora puede leer todos los registros
CREATE POLICY "Directora puede leer todos los usuarios"
    ON public.usuarios
    FOR SELECT
    USING (public.es_directora());

-- Los usuarios pueden actualizar su propio registro
CREATE POLICY "Usuarios pueden actualizar su perfil"
    ON public.usuarios
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- La directora puede actualizar cualquier registro
CREATE POLICY "Directora puede actualizar cualquier usuario"
    ON public.usuarios
    FOR UPDATE
    USING (public.es_directora());

-- La directora puede eliminar usuarios
CREATE POLICY "Directora puede eliminar usuarios"
    ON public.usuarios
    FOR DELETE
    USING (public.es_directora());

-- Cualquier usuario autenticado puede insertar su propio registro (registro)
CREATE POLICY "Usuarios pueden crear su propio perfil"
    ON public.usuarios
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 5. Permitir lectura pública de datos_limpios (ya debería existir, pero por seguridad)
-- Si datos_limpios ya tiene RLS habilitado, asegurar que usuarios autenticados puedan leer
-- ALTER TABLE public.datos_limpios ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Usuarios autenticados pueden leer datos_limpios"
--     ON public.datos_limpios
--     FOR SELECT
--     USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ============================================================
-- NOTAS:
-- - La anon key actual permite leer datos_limpios sin autenticación.
--   Si quieres restringir esto, descomenta las líneas de arriba
--   y ajusta según tus necesidades.
-- - La tabla `usuarios` usa el id de auth.users como PK para
--   mantener la referencia directa con Supabase Auth.
-- ============================================================
