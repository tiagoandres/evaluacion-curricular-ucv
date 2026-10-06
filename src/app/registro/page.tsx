'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, UserPlus, KeyRound, Mail, User,
    Building2, BookOpen, Shield, ShieldCheck, Check,
    Search, ArrowLeft, AlertCircle, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    registrarUsuario,
    obtenerDocentesSinCuenta,
    obtenerDocentesYaRegistrados,
    obtenerDepartamentosSinJefe,
    obtenerCatedrasSinJefe,
    obtenerAsignaturasDocente,
    buscarDocentesSimilares,
    normalizarNombre,
} from '@/lib/auth';

export default function RegistroPage() {
    const router = useRouter();

    // Form state
    const [nombreInput, setNombreInput] = useState('');
    const [nombreDocenteBd, setNombreDocenteBd] = useState('');
    const [emailRecuperacion, setEmailRecuperacion] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [catedra, setCatedra] = useState('');
    const [esJefeCatedra, setEsJefeCatedra] = useState(false);
    const [esJefeDepartamento, setEsJefeDepartamento] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Data state
    const [docentes, setDocentes] = useState<string[]>([]);
    const [docentesYaRegistrados, setDocentesYaRegistrados] = useState<string[]>([]);
    const [departamentosDisponibles, setDepartamentosDisponibles] = useState<string[]>([]);
    const [catedrasDisponibles, setCatedrasDisponibles] = useState<string[]>([]);
    const [sugerenciasDocentes, setSugerenciasDocentes] = useState<string[]>([]);
    const [showSugerencias, setShowSugerencias] = useState(false);
    const [asignaturasDocente, setAsignaturasDocente] = useState<string[]>([]);
    const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);

    const sugerenciasRef = useRef<HTMLDivElement>(null);

    // Load initial data (solo docentes sin cuenta y opciones sin jefe)
    useEffect(() => {
        async function loadData() {
            const [docsSinCuenta, docsRegistrados, deps, cats] = await Promise.all([
                obtenerDocentesSinCuenta(),
                obtenerDocentesYaRegistrados(),
                obtenerDepartamentosSinJefe(),
                obtenerCatedrasSinJefe(),
            ]);
            setDocentes(docsSinCuenta);
            setDocentesYaRegistrados(docsRegistrados);
            setDepartamentosDisponibles(deps);
            setCatedrasDisponibles(cats);
        }
        loadData();
    }, []);

    // Cargar asignaturas evaluadas cuando se selecciona un docente
    useEffect(() => {
        if (nombreDocenteBd) {
            setLoadingAsignaturas(true);
            obtenerAsignaturasDocente(nombreDocenteBd)
                .then((asigs) => setAsignaturasDocente(asigs))
                .catch((err) => console.error('Error fetching asignaturas:', err))
                .finally(() => setLoadingAsignaturas(false));
        } else {
            setAsignaturasDocente([]);
        }
    }, [nombreDocenteBd]);

    // Fuzzy search docentes
    useEffect(() => {
        // Si ya hay un match confirmado, no mostrar sugerencias
        if (nombreDocenteBd) {
            setSugerenciasDocentes([]);
            setShowSugerencias(false);
            return;
        }
        if (nombreInput.length >= 2) {
            const resultados = buscarDocentesSimilares(nombreInput, docentes);
            setSugerenciasDocentes(resultados);
            setShowSugerencias(resultados.length > 0);
        } else {
            setSugerenciasDocentes([]);
            setShowSugerencias(false);
        }
    }, [nombreInput, docentes, nombreDocenteBd]);

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sugerenciasRef.current && !sugerenciasRef.current.contains(event.target as Node)) {
                setShowSugerencias(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Verificar si el nombre ingresado corresponde a un docente que ya tiene cuenta
    const docenteYaRegistradoEncontrado = React.useMemo(() => {
        if (!nombreInput || nombreInput.trim().length < 2) return null;
        const norm = normalizarNombre(nombreInput);
        return docentesYaRegistrados.find(d => {
            const nd = normalizarNombre(d);
            return nd === norm || (nd.includes(norm) && norm.length >= 4) || (norm.includes(nd) && nd.length >= 4);
        }) || null;
    }, [nombreInput, docentesYaRegistrados]);

    // Validation
    const passwordsMatch = password.length > 0 && password === passwordConfirm;
    const passwordLongEnough = password.length >= 6;
    const nombreValido = nombreDocenteBd.length > 0;
    const emailValido = emailRecuperacion.trim().length > 0;
    const deptoValido = !esJefeDepartamento || departamento.trim().length > 0;
    const catedraValida = !esJefeCatedra || catedra.trim().length > 0;

    const formValido =
        nombreValido &&
        !docenteYaRegistradoEncontrado &&
        emailValido &&
        deptoValido &&
        catedraValida &&
        passwordsMatch &&
        passwordLongEnough;

    const handleSelectDocente = (docente: string) => {
        setNombreInput(docente);
        setNombreDocenteBd(docente);
        setShowSugerencias(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formValido) return;

        setError('');
        setLoading(true);

        const result = await registrarUsuario({
            nombre_completo: nombreInput,
            nombre_docente_bd: nombreDocenteBd,
            email_recuperacion: emailRecuperacion.trim(),
            departamento: esJefeDepartamento ? departamento : undefined,
            catedra: esJefeCatedra ? catedra : undefined,
            es_jefe_catedra: esJefeCatedra,
            es_jefe_departamento: esJefeDepartamento,
            password,
        });

        if (!result.success) {
            let msg = result.error || 'Error al crear la cuenta.';
            if (msg.includes('User already registered')) {
                msg = 'Este correo electrónico ya está registrado. Intente iniciar sesión.';
            }
            setError(msg);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);

        // Redirect after short delay
        setTimeout(() => router.push('/'), 2000);
    };

    // Input style helper
    const inputStyle = {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        color: 'var(--text-primary)',
    };

    const focusHandlers = {
        onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)';
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.boxShadow = 'none';
        },
    };

    // Success state
    if (success) {
        return (
            <div className="min-h-screen grid-bg flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glow-card p-10 text-center max-w-md"
                    style={{ background: 'var(--bg-card)' }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                    >
                        <Check size={32} style={{ color: 'var(--success)' }} />
                    </motion.div>
                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        ¡Cuenta creada exitosamente!
                    </h2>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Bienvenido/a al sistema de evaluación curricular.
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Redirigiendo al dashboard...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4 py-10">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-[100px]"
                    style={{ background: 'var(--accent-primary)' }}
                />
                <div
                    className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-[100px]"
                    style={{ background: 'var(--purple-accent)' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-lg"
            >
                <div
                    className="glow-card p-8 md:p-10"
                    style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)' }}
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <img
                            src="/logo-escuela.png"
                            alt="Logo Escuela de Psicología UCV"
                            className="theme-logo-img h-12 w-auto mb-3"
                        />
                        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Crear Cuenta
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            Regístrese para ver su evaluación curricular
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 1. Nombre y Apellido con autocompletado y asignaturas */}
                        <div ref={sugerenciasRef} className="relative">
                            <label
                                htmlFor="reg-nombre"
                                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Nombre y Apellido
                            </label>
                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    id="reg-nombre"
                                    type="text"
                                    value={nombreInput}
                                    onChange={(e) => {
                                        setNombreInput(e.target.value);
                                        setNombreDocenteBd(''); // Reset match
                                        setAsignaturasDocente([]);
                                    }}
                                    onFocus={() => {
                                        if (sugerenciasDocentes.length > 0) setShowSugerencias(true);
                                    }}
                                    required
                                    placeholder="Escriba su nombre y apellido"
                                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                                    style={inputStyle}
                                    autoComplete="off"
                                />
                                {/* Match indicator */}
                                {nombreDocenteBd && (
                                    <Check
                                        size={16}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                                        style={{ color: 'var(--success)' }}
                                    />
                                )}
                            </div>

                            {/* Sugerencias dropdown */}
                            <AnimatePresence>
                                {showSugerencias && sugerenciasDocentes.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-primary)',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                        }}
                                    >
                                        {sugerenciasDocentes.map((docente, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleSelectDocente(docente)}
                                                className="w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center gap-2"
                                                style={{ color: 'var(--text-primary)' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <Search size={13} style={{ color: 'var(--text-muted)' }} />
                                                {docente}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Info text */}
                            {docenteYaRegistradoEncontrado && !nombreDocenteBd ? (
                                <div
                                    className="text-xs mt-2 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 border"
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.08)',
                                        color: 'var(--danger)',
                                        borderColor: 'rgba(239, 68, 68, 0.25)',
                                    }}
                                >
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <AlertCircle size={14} className="shrink-0" />
                                        <span>El/la docente <strong>{docenteYaRegistradoEncontrado}</strong> ya tiene una cuenta registrada.</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/login')}
                                        className="font-semibold underline cursor-pointer hover:opacity-80 shrink-0 text-left sm:text-right"
                                    >
                                        Iniciar sesión aquí
                                    </button>
                                </div>
                            ) : nombreInput.length >= 2 && !nombreDocenteBd && sugerenciasDocentes.length === 0 ? (
                                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                                    <AlertCircle size={12} />
                                    No se encontró un docente disponible para registrarse con ese nombre.
                                </p>
                            ) : null}
                            {nombreDocenteBd && (
                                <div className="mt-2 space-y-2">
                                    <p className="text-xs flex items-center gap-1 font-medium" style={{ color: 'var(--success)' }}>
                                        <Check size={12} />
                                        Docente encontrado: {nombreDocenteBd}
                                    </p>

                                    {/* Burbujas informativas de asignaturas evaluadas */}
                                    {loadingAsignaturas ? (
                                        <div className="flex items-center gap-2 text-xs py-1" style={{ color: 'var(--text-muted)' }}>
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                                            Cargando asignaturas evaluadas...
                                        </div>
                                    ) : asignaturasDocente.length > 0 ? (
                                        <div
                                            className="p-3 rounded-xl border"
                                            style={{
                                                background: 'rgba(99, 102, 241, 0.05)',
                                                borderColor: 'rgba(99, 102, 241, 0.18)',
                                            }}
                                        >
                                            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>
                                                <BookOpen size={13} />
                                                <span>Asignatura(s) en la(s) que fue evaluado:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {asignaturasDocente.map((asig, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                                                        style={{
                                                            background: 'rgba(99, 102, 241, 0.1)',
                                                            color: 'var(--text-primary)',
                                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                                        }}
                                                    >
                                                        {asig}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Roles adicionales con dropdowns condicionales */}
                        <div className="space-y-3 pt-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                Roles adicionales
                            </label>

                            {/* Checkbox y dropdown para Jefe de Departamento */}
                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
                                    style={{
                                        background: esJefeDepartamento ? 'rgba(99,102,241,0.08)' : 'transparent',
                                        border: `1px solid ${esJefeDepartamento ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={esJefeDepartamento}
                                        onChange={(e) => {
                                            const val = e.target.checked;
                                            setEsJefeDepartamento(val);
                                            if (!val) setDepartamento('');
                                        }}
                                        className="sr-only"
                                    />
                                    <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                        style={{
                                            background: esJefeDepartamento ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                            border: esJefeDepartamento ? 'none' : '1px solid var(--border-primary)',
                                        }}
                                    >
                                        {esJefeDepartamento && <Check size={13} color="#fff" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                            <ShieldCheck size={14} style={{ color: 'var(--accent-primary)' }} />
                                            Soy jefe de departamento
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            Podrá ver evaluaciones y vista detallada de todo su departamento
                                        </span>
                                    </div>
                                </label>

                                <AnimatePresence>
                                    {esJefeDepartamento && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden pl-3 pr-1 pt-1 pb-1"
                                        >
                                            <label
                                                htmlFor="reg-jefe-depto"
                                                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                Departamento
                                            </label>
                                            <div className="relative">
                                                <Building2
                                                    size={16}
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                                    style={{ color: 'var(--text-muted)' }}
                                                />
                                                <select
                                                    id="reg-jefe-depto"
                                                    value={departamento}
                                                    onChange={(e) => setDepartamento(e.target.value)}
                                                    required={esJefeDepartamento}
                                                    disabled={departamentosDisponibles.length === 0}
                                                    className="w-full pl-10 pr-8 py-3 rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                                    style={inputStyle}
                                                    {...focusHandlers}
                                                >
                                                    <option value="">
                                                        {departamentosDisponibles.length > 0 ? 'Seleccione su departamento' : 'Todos los departamentos ya tienen un jefe asignado'}
                                                    </option>
                                                    {departamentosDisponibles.map((d) => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {departamentosDisponibles.length === 0 && (
                                                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                                                    <AlertCircle size={12} />
                                                    Todos los departamentos ya tienen un jefe asignado en el sistema.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Checkbox y dropdown para Jefe de Cátedra */}
                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
                                    style={{
                                        background: esJefeCatedra ? 'rgba(99,102,241,0.08)' : 'transparent',
                                        border: `1px solid ${esJefeCatedra ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={esJefeCatedra}
                                        onChange={(e) => {
                                            const val = e.target.checked;
                                            setEsJefeCatedra(val);
                                            if (!val) setCatedra('');
                                        }}
                                        className="sr-only"
                                    />
                                    <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                        style={{
                                            background: esJefeCatedra ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                            border: esJefeCatedra ? 'none' : '1px solid var(--border-primary)',
                                        }}
                                    >
                                        {esJefeCatedra && <Check size={13} color="#fff" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                            <Shield size={14} style={{ color: 'var(--purple-accent)' }} />
                                            Soy jefe de cátedra
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            Podrá ver evaluaciones y vista detallada de toda su cátedra
                                        </span>
                                    </div>
                                </label>

                                <AnimatePresence>
                                    {esJefeCatedra && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden pl-3 pr-1 pt-1 pb-1"
                                        >
                                            <label
                                                htmlFor="reg-jefe-catedra"
                                                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                Cátedra
                                            </label>
                                            <div className="relative">
                                                <BookOpen
                                                    size={16}
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                                    style={{ color: 'var(--text-muted)' }}
                                                />
                                                <select
                                                    id="reg-jefe-catedra"
                                                    value={catedra}
                                                    onChange={(e) => setCatedra(e.target.value)}
                                                    required={esJefeCatedra}
                                                    disabled={catedrasDisponibles.length === 0}
                                                    className="w-full pl-10 pr-8 py-3 rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                                    style={inputStyle}
                                                    {...focusHandlers}
                                                >
                                                    <option value="">
                                                        {catedrasDisponibles.length > 0 ? 'Seleccione su cátedra' : 'Todas las cátedras ya tienen un jefe asignado'}
                                                    </option>
                                                    {catedrasDisponibles.map((c) => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {catedrasDisponibles.length === 0 && (
                                                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--warning)' }}>
                                                    <AlertCircle size={12} />
                                                    Todas las cátedras ya tienen un jefe asignado en el sistema.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* 6. Email de recuperación */}
                        <div>
                            <label
                                htmlFor="reg-email"
                                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Correo de recuperación
                            </label>
                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    id="reg-email"
                                    type="email"
                                    value={emailRecuperacion}
                                    onChange={(e) => setEmailRecuperacion(e.target.value)}
                                    required
                                    placeholder="su.correo@ejemplo.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                                    style={inputStyle}
                                    {...focusHandlers}
                                />
                            </div>
                            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                                Se usará para iniciar sesión y recuperar su contraseña
                            </p>
                        </div>

                        {/* 7. Contraseña */}
                        <div>
                            <label
                                htmlFor="reg-password"
                                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Crear contraseña
                            </label>
                            <div className="relative">
                                <KeyRound
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                                    style={inputStyle}
                                    {...focusHandlers}
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
                            {password.length > 0 && password.length < 6 && (
                                <p className="text-xs mt-1.5" style={{ color: 'var(--warning)' }}>
                                    La contraseña debe tener al menos 6 caracteres
                                </p>
                            )}
                        </div>

                        {/* 8. Repetir contraseña */}
                        <div>
                            <label
                                htmlFor="reg-password-confirm"
                                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Repetir contraseña
                            </label>
                            <div className="relative">
                                <KeyRound
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <input
                                    id="reg-password-confirm"
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    required
                                    placeholder="Repita su contraseña"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                                    style={{
                                        ...inputStyle,
                                        borderColor: passwordConfirm.length > 0
                                            ? (passwordsMatch ? 'var(--success)' : 'var(--danger)')
                                            : 'var(--border-primary)',
                                    }}
                                    {...focusHandlers}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-[rgba(99,102,241,0.1)]"
                                    style={{ color: 'var(--text-muted)' }}
                                    tabIndex={-1}
                                >
                                    {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {passwordConfirm.length > 0 && (
                                <p
                                    className="text-xs mt-1.5 flex items-center gap-1"
                                    style={{ color: passwordsMatch ? 'var(--success)' : 'var(--danger)' }}
                                >
                                    {passwordsMatch ? <Check size={12} /> : <X size={12} />}
                                    {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                                </p>
                            )}
                        </div>

                        {/* Error */}
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
                        <button
                            type="submit"
                            disabled={loading || !formValido}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: formValido
                                    ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                                    : 'var(--bg-secondary)',
                                color: formValido ? '#ffffff' : 'var(--text-muted)',
                                boxShadow: formValido ? '0 4px 14px var(--accent-glow)' : 'none',
                            }}
                        >
                            {loading ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Crear Cuenta
                                </>
                            )}
                        </button>
                    </form>

                    {/* Link to login */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => router.push('/login')}
                            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer mx-auto"
                            style={{ color: 'var(--accent-primary)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-secondary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                        >
                            <ArrowLeft size={14} />
                            ¿Ya tiene cuenta? Inicie sesión
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
                    Escuela de Psicología · Universidad Central de Venezuela
                </p>
            </motion.div>
        </div>
    );
}
