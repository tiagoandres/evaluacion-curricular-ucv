'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: { value: number; positive: boolean };
    color: string;
    delay?: number;
}

export default function KPICard({ title, value, subtitle, icon: Icon, color, delay = 0 }: KPICardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="glow-card p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden"
            style={{ minHeight: '130px' }}
        >
            <div className="flex items-center gap-2 mb-3">
                <Icon size={16} style={{ color: color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {title}
                </span>
            </div>

            <div className="text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {value}
            </div>

            {subtitle && (
                <div className="text-xs mt-2 leading-tight font-medium opacity-80" style={{ color: 'var(--text-secondary)' }}>
                    {subtitle}
                </div>
            )}
        </motion.div>
    );
}
