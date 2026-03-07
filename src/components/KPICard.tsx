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
            className="glow-card p-8 flex flex-col justify-between"
            style={{ minHeight: '160px' }}
        >
            <div className="flex items-start justify-between relative z-10 mb-6">
                <p className="text-sm font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                    {title}
                </p>
                <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{
                        background: `${color}15`,
                        color: color,
                    }}
                >
                    <Icon size={24} />
                </div>
            </div>

            <div className="relative z-10">
                <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: delay + 0.2 }}
                    className="text-5xl font-extrabold tracking-tight mb-3"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {value}
                </motion.p>

                {subtitle && (
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
