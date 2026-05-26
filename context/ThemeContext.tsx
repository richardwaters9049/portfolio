'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'light' | 'dark';

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
    setPageTheme: (page: string, theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const PAGE_DEFAULTS: Record<string, Theme> = {
    '/': 'dark', // home page always dark
    '/dashboard': 'dark',
    '/projects': 'light',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check for page-specific theme preference first
        const pageKey = `theme-${pathname}`;
        const pageStored = localStorage.getItem(pageKey) as Theme | null;
        
        // Fall back to page default, then global theme, then dark
        if (pageStored === 'light' || pageStored === 'dark') {
            setTheme(pageStored);
        } else if (PAGE_DEFAULTS[pathname]) {
            setTheme(PAGE_DEFAULTS[pathname]);
        } else {
            const globalStored = localStorage.getItem('theme') as Theme | null;
            if (globalStored === 'light' || globalStored === 'dark') {
                setTheme(globalStored);
            } else {
                setTheme('dark');
            }
        }
        setMounted(true);
    }, [pathname]);

    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        // Store both page-specific and global theme
        const pageKey = `theme-${pathname}`;
        localStorage.setItem(pageKey, theme);
        localStorage.setItem('theme', theme);
    }, [theme, mounted, pathname]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setPageTheme = (page: string, newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem(`theme-${page}`, newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setPageTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
