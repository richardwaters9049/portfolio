"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="relative p-2 rounded-full transition-colors duration-300
                       hover:bg-white/10 dark:hover:bg-white/10
                       hover:bg-black/10"
        >
            {theme === "dark" ? (
                <Sun className="h-6 w-6 text-yellow-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
                <Moon className="h-6 w-6 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
            )}
        </button>
    );
}
