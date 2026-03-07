'use client';

import React, { useState } from 'react';
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Users,
    BarChart3,
    FileText,
    Settings,
    GraduationCap,
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
}

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

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
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-screen z-50 flex flex-col border-r bg-white dark:bg-transparent"
            style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-8 pt-10 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--cyan-accent))',
                    }}
                >
                    <GraduationCap size={26} className="text-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                                Evaluación Curricular
                            </h1>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                Psicología UCV
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-6 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => !item.disabled && onModuleChange(item.id)}
                        disabled={item.disabled}
                        className={`
              w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
              transition-all duration-200 text-sm font-medium
              ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
                        style={{
                            background: item.active
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(34, 211, 238, 0.08))'
                                : 'transparent',
                            color: item.active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            borderLeft: item.active ? '3px solid var(--accent-primary)' : '3px solid transparent',
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
                        {item.disabled && !collapsed && (
                            <span
                                className="ml-auto px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
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
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
                <ThemeToggle collapsed={collapsed} />

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
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
                                className="font-medium"
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
