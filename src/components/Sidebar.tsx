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
        { id: 'resumen', label: 'Resumen General', icon: <LayoutDashboard size={22} />, active: activeModule === 'resumen' },
        { id: 'asignaturas', label: 'Asignaturas', icon: <BookOpen size={22} />, active: false, disabled: true },
        { id: 'docentes', label: 'Docentes', icon: <Users size={22} />, active: false, disabled: true },
        { id: 'dimensiones', label: 'Dimensiones', icon: <BarChart3 size={22} />, active: false, disabled: true },
        { id: 'reportes', label: 'Reportes', icon: <FileText size={22} />, active: false, disabled: true },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 300 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-screen z-50 flex flex-col border-r bg-white dark:bg-transparent"
            style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
            }}
        >
            {/* Header / Logo */}
            <div
                className={`flex items-center transition-all duration-300 border-b ${collapsed ? 'p-4 pt-8 justify-center' : 'p-6 pt-10 gap-2'}`}
                style={{ borderColor: 'var(--border-primary)', minHeight: '120px' }}
            >
                {collapsed ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center shrink-0"
                    >
                        <span className="text-5xl font-serif" style={{ color: 'var(--text-primary)' }}>Ψ</span>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 overflow-hidden w-full whitespace-nowrap pl-2"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <span className="text-6xl font-serif leading-none h-[64px] flex items-center justify-center -mt-2">Ψ</span>
                        <div className="flex flex-col justify-center translate-y-[-4px]">
                            <span className="text-[17px] italic font-medium leading-tight opacity-80">Escuela de Psicología</span>
                            <span className="text-[34px] font-medium tracking-tight leading-[1.1]">UCV</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto space-y-2 transition-all duration-300 ${collapsed ? 'py-6 px-3' : 'py-8 px-6'}`}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => !item.disabled && onModuleChange(item.id)}
                        disabled={item.disabled}
                        className={`w-full flex items-center rounded-xl transition-all duration-200 text-sm font-medium ${collapsed ? 'justify-center py-3.5 px-0' : 'gap-4 px-4 py-3.5'
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
                                Colapsar
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
