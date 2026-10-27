-- ============================================================
-- Protege roles y jefaturas en public.usuarios (RLS por si sola no limita columnas)
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

-- 1. Lista de correos autorizados a ser "directora".
--    IMPORTANTE: agregar aqui el correo real de la directora ANTES de aplicar el resto,
--    p. ej.: INSERT INTO public.directoras_autorizadas VALUES ('correo@ejemplo.com');
CREATE TABLE IF NOT EXISTS public.directoras_autorizadas (
    email TEXT PRIMARY KEY
);
ALTER TABLE public.directoras_autorizadas ENABLE ROW LEVEL SECURITY;
-- Sin politicas: nadie la lee ni escribe desde la API; solo el SQL Editor / service role.

-- 2. Al crear el perfil: nadie puede autoasignarse "directora" si su correo no esta autorizado.
CREATE OR REPLACE FUNCTION public.usuarios_validar_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.rol = 'directora' AND NOT EXISTS (
        SELECT 1 FROM public.directoras_autorizadas d
        WHERE lower(d.email) = lower(NEW.email_recuperacion)
          AND lower(d.email) = lower((SELECT email FROM auth.users WHERE id = NEW.id))
    ) THEN
        RAISE EXCEPTION 'No autorizado para el rol directora';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuarios_validar_insert ON public.usuarios;
CREATE TRIGGER trg_usuarios_validar_insert
    BEFORE INSERT ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.usuarios_validar_insert();

-- 3. Al actualizar: quien no es directora no puede cambiar rol, jefaturas, departamento ni catedra.
--    (auth.uid() IS NULL = SQL Editor / service role, se permite.)
CREATE OR REPLACE FUNCTION public.usuarios_proteger_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.es_directora() THEN
        NEW.rol                  := OLD.rol;
        NEW.es_jefe_catedra      := OLD.es_jefe_catedra;
        NEW.es_jefe_departamento := OLD.es_jefe_departamento;
        NEW.departamento         := OLD.departamento;
        NEW.catedra              := OLD.catedra;
        NEW.nombre_docente_bd    := OLD.nombre_docente_bd;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuarios_proteger_update ON public.usuarios;
CREATE TRIGGER trg_usuarios_proteger_update
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.usuarios_proteger_update();

-- 4. Jefaturas unicas a nivel de base de datos (hoy solo se valida en el cliente).
CREATE UNIQUE INDEX IF NOT EXISTS idx_un_jefe_departamento
    ON public.usuarios(departamento) WHERE es_jefe_departamento AND rol <> 'directora';
CREATE UNIQUE INDEX IF NOT EXISTS idx_un_jefe_catedra
    ON public.usuarios(catedra) WHERE es_jefe_catedra AND rol <> 'directora';

-- 5. (Opcional, requiere adaptar el registro) Restringir lectura de datos_limpios a usuarios autenticados.
--    El registro lista docentes antes de iniciar sesion, por eso NO se activa aqui.
-- ALTER TABLE public.datos_limpios ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Autenticados leen datos_limpios" ON public.datos_limpios
--     FOR SELECT TO authenticated USING (true);
