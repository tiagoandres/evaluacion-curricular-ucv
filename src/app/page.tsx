'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ResumenGeneral from '@/components/ResumenGeneral';
import { motion } from 'framer-motion';

export default function Home() {
  const [activeModule, setActiveModule] = useState('resumen');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center grid-bg">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#6366f1] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen grid-bg">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

      {/* Main content */}
      <main
        className="flex-1 transition-all duration-300 ease-out"
        style={{
          marginLeft: '280px', // sidebar width
          padding: '40px 60px',
        }}
      >
        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-6 pb-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full pulse-indicator"
                style={{ background: '#10b981' }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Datos Mock — Actualización pendiente
              </span>
            </div>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Escuela de Psicología · Universidad Central de Venezuela
          </span>
        </motion.div>

        {/* Module content */}
        {activeModule === 'resumen' && <ResumenGeneral />}
      </main>
    </div>
  );
}
