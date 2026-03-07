"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-full h-10"></div>; // Placeholder
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
            style={{
                color: "var(--text-primary)",
                background: "rgba(99, 102, 241, 0.08)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
            }}
            aria-label="Toggle Dark Mode"
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <AnimatePresence>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap"
                    >
                        {isDark ? "Modo Claro" : "Modo Oscuro"}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
