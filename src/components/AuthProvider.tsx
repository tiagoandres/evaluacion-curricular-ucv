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
        let isMounted = true;

        // Fallback de seguridad: NUNCA dejar el estado en loading por más de 3.5 segundos
        const safetyTimer = setTimeout(() => {
            if (isMounted) {
                console.warn('Auth check safety timeout triggered. Ensuring app unlocks.');
                setLoading(false);
            }
        }, 3500);

        // Obtener sesión actual
        supabase.auth.getSession()
            .then(async ({ data: { session: s }, error }) => {
                if (!isMounted) return;
                if (error) {
                    console.error('Error al obtener sesión:', error);
                    setLoading(false);
                    return;
                }
                setSession(s);
                setUser(s?.user ?? null);
                if (s?.user) {
                    try {
                        const p = await obtenerPerfilUsuario(s.user.id);
                        if (isMounted) setPerfil(p);
                    } catch (e) {
                        console.error('Error al cargar perfil inicial:', e);
                    } finally {
                        if (isMounted) setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error('Error inesperado en getSession:', err);
                if (isMounted) setLoading(false);
            });

        // Suscribirse a cambios de auth posteriores (no bloqueante)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, s) => {
                if (!isMounted) return;
                setSession(s);
                setUser(s?.user ?? null);
                if (s?.user) {
                    obtenerPerfilUsuario(s.user.id)
                        .then((p) => {
                            if (isMounted) setPerfil(p);
                        })
                        .catch((err) => {
                            console.error('Error al cargar perfil en cambio de sesión:', err);
                        });
                } else {
                    setPerfil(null);
                }
            }
        );

        return () => {
            isMounted = false;
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await cerrarSesion();
        } catch (e) {
            console.error('Error cerrando sesión:', e);
        } finally {
            setPerfil(null);
            setUser(null);
            setSession(null);
        }
    }, []);

    // Rol y permisos derivados
    const rol = perfil?.rol ?? null;
    const modulosPermitidos = rol ? obtenerModulosPermitidos(rol) : [];

    // Filtros de datos según rol
    const filtrosDatos = React.useMemo(() => {
        if (!perfil) return {};

        if (perfil.rol === 'directora') {
            return {}; // Sin filtros - ve todo
        }

        // Si es jefe de departamento Y jefe de cátedra a la vez
        if (perfil.es_jefe_departamento && perfil.es_jefe_catedra) {
            return { departamento: perfil.departamento, catedra: perfil.catedra };
        }

        switch (perfil.rol) {
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
