'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    UsuarioPerfil,
    UserRole,
    obtenerPerfilUsuario,
    obtenerModulosPermitidos,
    cerrarSesion,
} from '@/lib/auth';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================
// TIPOS DEL CONTEXTO
// ============================================================

interface AuthContextType {
    // Estado de autenticación
    user: User | null;
    session: Session | null;
    perfil: UsuarioPerfil | null;
    loading: boolean;

    // Permisos
    rol: UserRole | null;
    modulosPermitidos: string[];

    // Filtros según rol (para componentes de datos)
    filtrosDatos: {
        departamento?: string;
        catedra?: string;
        docente?: string;
    };

    // Acciones
    logout: () => Promise<void>;
    refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar perfil del usuario
    const cargarPerfil = useCallback(async (userId: string) => {
        const p = await obtenerPerfilUsuario(userId);
        setPerfil(p);
    }, []);

    // Refreshear perfil
    const refreshPerfil = useCallback(async () => {
        if (user) {
            await cargarPerfil(user.id);
        }
    }, [user, cargarPerfil]);

    // Escuchar cambios de autenticación
    useEffect(() => {
        // Obtener sesión actual
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                cargarPerfil(s.user.id).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Suscribirse a cambios de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, s) => {
                setSession(s);
                setUser(s?.user ?? null);
                if (s?.user) {
                    await cargarPerfil(s.user.id);
                } else {
                    setPerfil(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [cargarPerfil]);

    // Logout
    const logout = useCallback(async () => {
        await cerrarSesion();
        setPerfil(null);
        setUser(null);
        setSession(null);
    }, []);

    // Rol y permisos derivados
    const rol = perfil?.rol ?? null;
    const modulosPermitidos = rol ? obtenerModulosPermitidos(rol) : [];

    // Filtros de datos según rol
    const filtrosDatos = React.useMemo(() => {
        if (!perfil) return {};

        switch (perfil.rol) {
            case 'directora':
                return {}; // Sin filtros - ve todo
            case 'jefe_departamento':
                return { departamento: perfil.departamento };
            case 'jefe_catedra':
                return { departamento: perfil.departamento, catedra: perfil.catedra };
            case 'profesor':
                return {
                    docente: perfil.nombre_docente_bd,
                    departamento: perfil.departamento,
                    catedra: perfil.catedra,
                };
            default:
                return {};
        }
    }, [perfil]);

    const value: AuthContextType = {
        user,
        session,
        perfil,
        loading,
        rol,
        modulosPermitidos,
        filtrosDatos,
        logout,
        refreshPerfil,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================
// HOOK
// ============================================================

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}
