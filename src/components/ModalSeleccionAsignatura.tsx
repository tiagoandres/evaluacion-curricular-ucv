'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ChevronRight } from 'lucide-react';

interface ModalSeleccionAsignaturaProps {
    isOpen: boolean;
    asignaturas: string[];
    onSelect: (asignatura: string) => void;
    onClose?: () => void;
    /** Si true, el modal no se puede cerrar sin seleccionar (primera vez) */
    forzarSeleccion?: boolean;
}

export default function ModalSeleccionAsignatura({
    isOpen,
    asignaturas,
    onSelect,
    onClose,
    forzarSeleccion = false,
}: ModalSeleccionAsignaturaProps) {
    if (!isOpen || asignaturas.length === 0) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={!forzarSeleccion ? onClose : undefined}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="glow-card w-full max-w-md overflow-hidden"
                        style={{ background: 'var(--bg-card)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-6 py-5 border-b"
                            style={{ borderColor: 'var(--border-primary)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(99,102,241,0.1)' }}
                                >
                                    <BookOpen size={20} style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        Seleccione una asignatura
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        Tiene resultados en {asignaturas.length} asignatura{asignaturas.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            {!forzarSeleccion && onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl transition-colors cursor-pointer"
                                    style={{ color: 'var(--text-muted)' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                            {asignaturas.map((asignatura, i) => (
                                <motion.button
                                    key={asignatura}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => onSelect(asignatura)}
                                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group"
                                    style={{
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-primary)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                                    }}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <BookOpen size={15} style={{ color: 'var(--accent-secondary)' }} />
                                        {asignatura}
                                    </span>
                                    <ChevronRight
                                        size={16}
                                        style={{ color: 'var(--text-muted)' }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
