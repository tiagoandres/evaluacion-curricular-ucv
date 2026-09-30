'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Trash2, Edit3, Shield, ShieldCheck, Crown,
    User, X, Check, Loader2, AlertTriangle, Building2, BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UsuarioPerfil, UserRole } from '@/lib/auth';

const rolLabels: Record<UserRole, string> = {
    directora: 'Directora',
    jefe_departamento: 'Jefe de Departamento',
    jefe_catedra: 'Jefe de Cátedra',
    profesor: 'Profesor',
};

const rolIcons: Record<UserRole, React.ReactNode> = {
    directora: <Crown size={14} />,
    jefe_departamento: <ShieldCheck size={14} />,
    jefe_catedra: <Shield size={14} />,
    profesor: <User size={14} />,
};

const rolColors: Record<UserRole, string> = {
    directora: 'var(--warning)',
    jefe_departamento: 'var(--accent-primary)',
    jefe_catedra: 'var(--purple-accent)',
    profesor: 'var(--text-muted)',
};

export default function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<UsuarioPerfil | null>(null);
    const [editRol, setEditRol] = useState<UserRole>('profesor');
    const [editJefeDep, setEditJefeDep] = useState(false);
    const [editJefeCat, setEditJefeCat] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch all users
    useEffect(() => {
        fetchUsuarios();
    }, []);

    async function fetchUsuarios() {
        setLoading(true);
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setUsuarios(data as UsuarioPerfil[]);
        }
        setLoading(false);
    }

    // Filtered users
    const filteredUsuarios = useMemo(() => {
        if (!searchQuery) return usuarios;
        const q = searchQuery.toLowerCase();
        return usuarios.filter(u =>
            u.nombre_completo.toLowerCase().includes(q) ||
            u.departamento.toLowerCase().includes(q) ||
            u.catedra.toLowerCase().includes(q) ||
            u.rol.toLowerCase().includes(q)
        );
    }, [usuarios, searchQuery]);

    // Delete user
    async function handleDelete(userId: string) {
        setActionLoading(true);
        const { error } = await supabase.from('usuarios').delete().eq('id', userId);
        if (!error) {
            setUsuarios(prev => prev.filter(u => u.id !== userId));
        }
        setDeleteConfirm(null);
        setActionLoading(false);
    }

    // Edit user role
    function startEdit(user: UsuarioPerfil) {
        setEditingUser(user);
        setEditRol(user.rol);
        setEditJefeDep(user.es_jefe_departamento);
        setEditJefeCat(user.es_jefe_catedra);
    }

    async function handleSaveEdit() {
        if (!editingUser) return;
        setActionLoading(true);

        const { error } = await supabase
            .from('usuarios')
            .update({
                rol: editRol,
                es_jefe_departamento: editJefeDep,
                es_jefe_catedra: editJefeCat,
            })
            .eq('id', editingUser.id);

        if (!error) {
            setUsuarios(prev => prev.map(u =>
                u.id === editingUser.id
                    ? { ...u, rol: editRol, es_jefe_departamento: editJefeDep, es_jefe_catedra: editJefeCat }
                    : u
            ));
        }
        setEditingUser(null);
        setActionLoading(false);
    }

    return (
        <div>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(99,102,241,0.1)' }}
                    >
                        <Users size={20} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    Administración de Usuarios
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                    {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
                </p>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <div className="relative max-w-md">
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre, departamento, cátedra..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </div>
            </motion.div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="glow-card overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Departamento</th>
                                    <th>Cátedra</th>
                                    <th>Rol</th>
                                    <th>Jefe Dep.</th>
                                    <th>Jefe Cát.</th>
                                    <th>Registro</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsuarios.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                                    style={{ background: 'rgba(99,102,241,0.1)', color: rolColors[user.rol] }}
                                                >
                                                    {rolIcons[user.rol]}
                                                </div>
                                                <span className="font-medium text-sm">{user.nombre_completo}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm flex items-center gap-1.5">
                                                <Building2 size={12} style={{ color: 'var(--text-muted)' }} />
                                                {user.departamento}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm flex items-center gap-1.5">
                                                <BookOpen size={12} style={{ color: 'var(--text-muted)' }} />
                                                {user.catedra}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                style={{
                                                    background: `${rolColors[user.rol]}15`,
                                                    color: rolColors[user.rol],
                                                }}
                                            >
                                                {rolIcons[user.rol]}
                                                {rolLabels[user.rol]}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            {user.es_jefe_departamento ? (
                                                <Check size={16} style={{ color: 'var(--success)' }} />
                                            ) : (
                                                <X size={16} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {user.es_jefe_catedra ? (
                                                <Check size={16} style={{ color: 'var(--success)' }} />
                                            ) : (
                                                <X size={16} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(user.created_at).toLocaleDateString('es-VE', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-center gap-1">
                                                {user.rol !== 'directora' && (
                                                    <>
                                                        <button
                                                            onClick={() => startEdit(user)}
                                                            className="p-1.5 rounded-lg transition-colors cursor-pointer"
                                                            title="Editar rol"
                                                            style={{ color: 'var(--accent-primary)' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(user.id)}
                                                            className="p-1.5 rounded-lg transition-colors cursor-pointer"
                                                            title="Eliminar usuario"
                                                            style={{ color: 'var(--danger)' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsuarios.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-10">
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                No se encontraron usuarios.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="glow-card p-6 max-w-sm w-full"
                            style={{ background: 'var(--bg-card)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                                    <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
                                </div>
                                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    ¿Eliminar usuario?
                                </h3>
                            </div>
                            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                                Esta acción no se puede deshacer. El usuario perderá acceso al sistema.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-primary)',
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
                                    style={{
                                        background: 'var(--danger)',
                                        color: '#ffffff',
                                    }}
                                >
                                    {actionLoading ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Role Modal */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setEditingUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="glow-card p-6 max-w-sm w-full"
                            style={{ background: 'var(--bg-card)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                Editar rol
                            </h3>
                            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                                {editingUser.nombre_completo}
                            </p>

                            <div className="space-y-3 mb-5">
                                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                    Rol principal
                                </label>
                                <select
                                    value={editRol}
                                    onChange={(e) => setEditRol(e.target.value as UserRole)}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-primary)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    <option value="profesor">Profesor</option>
                                    <option value="jefe_catedra">Jefe de Cátedra</option>
                                    <option value="jefe_departamento">Jefe de Departamento</option>
                                </select>

                                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                    <input type="checkbox" checked={editJefeDep} onChange={(e) => setEditJefeDep(e.target.checked)} className="rounded" />
                                    Es jefe de departamento
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                    <input type="checkbox" checked={editJefeCat} onChange={(e) => setEditJefeCat(e.target.checked)} className="rounded" />
                                    Es jefe de cátedra
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-primary)',
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        color: '#ffffff',
                                    }}
                                >
                                    {actionLoading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
