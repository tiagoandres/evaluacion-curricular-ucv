'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { iniciarSesion } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await iniciarSesion(email, password);

        if (!result.success) {
            // Traducir errores comunes de Supabase
            let msg = result.error || 'Error al iniciar sesión.';
            if (msg.includes('Invalid login credentials')) {
                msg = 'Correo o contraseña incorrectos.';
            } else if (msg.includes('Email not confirmed')) {
                msg = 'Revise su correo electrónico para confirmar su cuenta.';
            }
            setError(msg);
            setLoading(false);
            return;
        }

        router.push('/');
    };

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-[100px]"
                    style={{ background: 'var(--accent-primary)' }}
                />
                <div
                    className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-[100px]"
                    style={{ background: 'var(--cyan-accent)' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div
                    className="glow-card p-8 md:p-10"
                    style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)' }}
                >
                    {/* Logo & Title */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col items-center mb-8"
                    >
                        <img
                            src="/logo-escuela.png"
                            alt="Logo Escuela de Psicología UCV"
                            className="theme-logo-img h-14 w-auto mb-4"
                        />
                        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Evaluación Curricular
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            Escuela de Psicología · UCV
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <label
                                htmlFor="login-email"
                                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="su.correo@ejemplo.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-primary)',
                                        color: 'var(--text-primary)',
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label
                                htmlFor="login-password"
                                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Contraseña
                            </label>
                            <div className="relative">
                                <KeyRound
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-primary)',
                                        color: 'var(--text-primary)',
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-[rgba(99,102,241,0.1)]"
                                    style={{ color: 'var(--text-muted)' }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-sm px-4 py-3 rounded-xl"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--danger)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                color: '#ffffff',
                                boxShadow: '0 4px 14px var(--accent-glow)',
                            }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {loading ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Iniciar Sesión
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="mt-6 flex flex-col items-center gap-3"
                    >
                        <button
                            onClick={() => router.push('/registro')}
                            className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                            style={{ color: 'var(--accent-primary)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-secondary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                        >
                            <UserPlus size={14} />
                            ¿No tiene cuenta? Regístrese aquí
                        </button>
                    </motion.div>
                </div>

                {/* Footer text */}
                <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
                    Escuela de Psicología · Universidad Central de Venezuela
                </p>
            </motion.div>
        </div>
    );
}
