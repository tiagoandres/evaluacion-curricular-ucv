'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import ResumenGeneral from '@/components/ResumenGeneral';
import VistaDetallada from '@/components/VistaDetallada';
import Asignaturas from '@/components/Asignaturas';
import Docentes from '@/components/Docentes';
import AdminUsuarios from '@/components/AdminUsuarios';
import ModalSeleccionAsignatura from '@/components/ModalSeleccionAsignatura';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { obtenerAsignaturasDocente, cerrarSesion } from '@/lib/auth';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, perfil, loading: authLoading, rol, modulosPermitidos, filtrosDatos, logout } = useAuth();

  const [activeModule, setActiveModule] = useState('resumen');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Estado para profesores con múltiples asignaturas
  const [asignaturasDocente, setAsignaturasDocente] = useState<string[]>([]);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<string | null>(null);
  const [showModalAsignatura, setShowModalAsignatura] = useState(false);
  const [modalAsignaturaInicial, setModalAsignaturaInicial] = useState(true);

  useEffect(() => {
    setMounted(true);

    async function fetchLastUpdate() {
      const { data, error } = await supabase
        .from('datos_limpios')
        .select('marca_temporal')
        .order('marca_temporal', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        // Format date string (e.g. from "2026-08-03T14:47:28" to local format)
        try {
            const dateStr = data[0].marca_temporal;
            if (dateStr) {
              // El formato de la DB ahora es YYYY-MM-DD HH:MM:SS o similar
              // Reemplazamos el espacio por 'T' para asegurar compatibilidad con ISO en todos los navegadores
              const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
              let dateObj = new Date(isoStr);

              // Fallback en caso de que el parsing falle
              if (isNaN(dateObj.getTime())) {
                dateObj = new Date(dateStr);
              }

            setLastUpdate(dateObj.toLocaleDateString('es-VE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }));
          }
        } catch (e) {
          console.error("Error formatting date", e);
        }
      }
    }
    fetchLastUpdate();
  }, []);

  // Redirigir a login si no hay sesión
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Cargar asignaturas del docente (para profesores regulares)
  useEffect(() => {
    if (perfil && perfil.rol === 'profesor') {
      obtenerAsignaturasDocente(perfil.nombre_docente_bd).then((asigs) => {
        setAsignaturasDocente(asigs);
        if (asigs.length > 1) {
          // Mostrar modal de selección al entrar a docentes
          setShowModalAsignatura(true);
          setModalAsignaturaInicial(true);
        } else if (asigs.length === 1) {
          setAsignaturaSeleccionada(asigs[0]);
        }
      });
    }
  }, [perfil]);

  // Asegurar que activeModule siempre sea un módulo permitido para el rol del usuario
  useEffect(() => {
    if (perfil && modulosPermitidos.length > 0) {
      if (!modulosPermitidos.includes(activeModule)) {
        setActiveModule(modulosPermitidos[0]);
      }
    }
  }, [perfil, modulosPermitidos, activeModule]);

  // Cuando el profesor navega a docentes, mostrar el modal si tiene múltiples asignaturas
  useEffect(() => {
    if (activeModule === 'docentes' && perfil?.rol === 'profesor' && asignaturasDocente.length > 1 && !asignaturaSeleccionada) {
      setShowModalAsignatura(true);
      setModalAsignaturaInicial(true);
    }
  }, [activeModule, perfil, asignaturasDocente, asignaturaSeleccionada]);

  const handleSelectAsignatura = useCallback((asignatura: string) => {
    setAsignaturaSeleccionada(asignatura);
    setShowModalAsignatura(false);
    setModalAsignaturaInicial(false);
  }, []);

  const handleCambiarAsignatura = useCallback(() => {
    setShowModalAsignatura(true);
    setModalAsignaturaInicial(false);
  }, []);

  // Mientras carga autenticación inicial
  if (!mounted || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center grid-bg flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Cargando sesión...
        </p>
      </div>
    );
  }

  // Si no hay usuario autenticado (redirigiendo a login)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center grid-bg flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Redirigiendo a inicio de sesión...
        </p>
        <a
          href="/login"
          className="text-xs transition-colors hover:underline mt-1"
          style={{ color: 'var(--accent-primary)' }}
        >
          Haga clic aquí si no es redirigido automáticamente
        </a>
      </div>
    );
  }

  // Si hay usuario pero no perfil (por ejemplo, registro borrado o no existe)
  if (!perfil) {
    return (
      <div className="flex min-h-screen items-center justify-center grid-bg flex-col gap-4 p-4 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No se encontró un perfil asociado a esta cuenta.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
          >
            Reintentar
          </button>
          <button
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
            className="text-xs px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors"
            style={{ color: '#fff', background: 'var(--accent-primary)', border: 'none' }}
          >
            Cerrar sesión e ir a Login
          </button>
          <a
            href="/registro"
            className="text-xs px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors inline-block"
            style={{ color: 'var(--accent-primary)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            Crear nueva cuenta
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen grid-bg">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      {/* Main content */}
      <main
        className="flex-1 transition-all duration-300 ease-out min-w-0 px-4 md:px-10 py-6"
        style={{
          marginLeft: sidebarCollapsed ? '72px' : '260px', // Updated open width to 260px for a more compact look
        }}
      >
        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-4 pb-3 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full pulse-indicator"
                style={{ background: '#10b981' }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {lastUpdate ? `Último registro hecho el ${lastUpdate}` : 'Cargando última actualización...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Botón "Cambiar asignatura" para profesores con múltiples asignaturas */}
            {perfil.rol === 'profesor' && asignaturasDocente.length > 1 && asignaturaSeleccionada && activeModule === 'docentes' && (
              <button
                onClick={handleCambiarAsignatura}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                style={{
                  color: 'var(--accent-primary)',
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
              >
                <RefreshCw size={12} />
                Cambiar asignatura
              </button>
            )}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Escuela de Psicología · Universidad Central de Venezuela
            </span>
          </div>
        </motion.div>

        {/* Module content - con filtros según rol */}
        {activeModule === 'resumen' && modulosPermitidos.includes('resumen') && <ResumenGeneral />}
        {activeModule === 'asignaturas' && modulosPermitidos.includes('asignaturas') && <Asignaturas filtroRol={filtrosDatos} />}
        {activeModule === 'docentes' && modulosPermitidos.includes('docentes') && (
          <Docentes
            filtroRol={filtrosDatos}
            asignaturaForzada={perfil.rol === 'profesor' ? asignaturaSeleccionada : undefined}
            onSelectAsignatura={handleSelectAsignatura}
          />
        )}
        {activeModule === 'vista-detallada' && modulosPermitidos.includes('vista-detallada') && <VistaDetallada />}
        {activeModule === 'admin-usuarios' && modulosPermitidos.includes('admin-usuarios') && <AdminUsuarios />}
      </main>

      {/* Modal de selección de asignatura para profesores */}
      <ModalSeleccionAsignatura
        isOpen={showModalAsignatura && activeModule === 'docentes'}
        asignaturas={asignaturasDocente}
        onSelect={handleSelectAsignatura}
        onClose={() => setShowModalAsignatura(false)}
        forzarSeleccion={modalAsignaturaInicial && !asignaturaSeleccionada}
      />
    </div>
  );
}
