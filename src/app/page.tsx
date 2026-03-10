'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ResumenGeneral from '@/components/ResumenGeneral';
import VistaDetallada from '@/components/VistaDetallada';
import Asignaturas from '@/components/Asignaturas';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [activeModule, setActiveModule] = useState('resumen');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  React.useEffect(() => {
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
            let dateObj = new Date(dateStr);

            // Convertir explícitamente de YYYY-DD-MM a YYYY-MM-DD para evitar el parsing invertido de Javascript
            const match = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(.*)?$/);
            if (match) {
              const [, year, day, month, rest] = match;
              let timeStr = (rest || '').trim();
              if (timeStr && !timeStr.startsWith('T')) timeStr = `T${timeStr}`;

              dateObj = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${timeStr}`);
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

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center grid-bg">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
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
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Escuela de Psicología · Universidad Central de Venezuela
          </span>
        </motion.div>

        {/* Module content */}
        {activeModule === 'resumen' && <ResumenGeneral />}
        {activeModule === 'vista-detallada' && <VistaDetallada />}
        {activeModule === 'asignaturas' && <Asignaturas />}
      </main>
    </div>
  );
}
