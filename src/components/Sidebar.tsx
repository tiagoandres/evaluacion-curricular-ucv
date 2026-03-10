'use client';

import React from 'react';
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Users,
    BarChart3,
    FileText,
    Table
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    disabled?: boolean;
}

interface SidebarProps {
    activeModule: string;
    onModuleChange: (id: string) => void;
    collapsed: boolean;
    onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({ activeModule, onModuleChange, collapsed, onCollapse }: SidebarProps) {
    const navItems: NavItem[] = [
        { id: 'resumen', label: 'Resumen General', icon: <LayoutDashboard size={18} />, active: activeModule === 'resumen' },
        { id: 'vista-detallada', label: 'Vista Detallada', icon: <Table size={18} />, active: activeModule === 'vista-detallada' },
        { id: 'asignaturas', label: 'Asignaturas', icon: <BookOpen size={18} />, active: false, disabled: true },
        { id: 'docentes', label: 'Docentes', icon: <Users size={18} />, active: false, disabled: true },
        { id: 'dimensiones', label: 'Dimensiones', icon: <BarChart3 size={18} />, active: false, disabled: true },
        { id: 'reportes', label: 'Reportes', icon: <FileText size={18} />, active: false, disabled: true },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-screen z-50 flex flex-col border-r bg-white dark:bg-transparent"
            style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
            }}
        >
            {/* Header / Logo */}
            <div
                className={`flex items-center transition-all duration-300 border-b ${collapsed ? 'p-4 pt-6 justify-center' : 'p-5 pt-8 gap-2'}`}
                style={{ borderColor: 'var(--border-primary)', minHeight: '100px' }}
            >
                {collapsed ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center shrink-0"
                    >
                        <img src="/logo-escuela.png" alt="Logo Escuela" className="theme-logo-img h-[36px] w-auto object-contain transition-all" />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2.5 w-full pl-1"
                    >
                        <img src="/logo-escuela.png" alt="Logo Escuela" className="theme-logo-img h-[46px] w-auto shrink-0 object-contain transition-all" />
                        <div className="flex flex-col justify-center">
                            <span className="theme-logo-text text-[14px] italic font-medium leading-[1.3]">Escuela de Psicología</span>
                            <span className="theme-logo-text text-[26px] font-medium tracking-tight leading-[1.1]">UCV</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto space-y-2 transition-all duration-300 ${collapsed ? 'py-5 px-3' : 'py-6 px-5'}`}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => !item.disabled && onModuleChange(item.id)}
                        disabled={item.disabled}
                        className={`w-full flex items-center rounded-xl transition-all duration-200 text-sm font-medium ${collapsed ? 'justify-center py-2.5 px-0' : 'gap-3 px-4 py-2.5'
                            } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{
                            background: item.active
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(34, 211, 238, 0.08))'
                                : 'transparent',
                            color: item.active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            borderLeft: (!collapsed && item.active) ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                            if (!item.disabled && !item.active) {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!item.disabled && !item.active) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }
                        }}
                    >
                        <span className="shrink-0">{item.icon}</span>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {/* Pronto Badge (only when open) */}
                        {item.disabled && !collapsed && (
                            <span
                                className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                                style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                Pronto
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className={`border-t space-y-3 transition-all duration-300 ${collapsed ? 'p-3' : 'p-4'}`} style={{ borderColor: 'var(--border-primary)' }}>
                <ThemeToggle collapsed={collapsed} />

                <button
                    onClick={() => onCollapse(!collapsed)}
                    className={`w-full flex items-center rounded-xl text-sm transition-all duration-200 cursor-pointer ${collapsed ? 'justify-center py-2.5 px-0' : 'justify-center gap-2 px-3 py-2.5'
                        }`}
                    style={{
                        color: 'var(--text-muted)',
                        background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="font-medium whitespace-nowrap"
                            >
                                Ocultar
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
