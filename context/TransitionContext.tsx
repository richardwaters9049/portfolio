'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type TransitionContextType = {
    isTransitioning: boolean;
    startTransition: (path: string) => void;
};

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    const startTransition = (path: string) => {
        setIsTransitioning(true);
        // Wait for the animation to complete before navigating
        setTimeout(() => {
            router.push(path);
            // Reset the transition state after navigation
            setTimeout(() => setIsTransitioning(false), 1000);
        }, 1000); // Match this with your animation duration
    };

    return (
        <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}

export function useTransition() {
    const context = useContext(TransitionContext);
    if (context === undefined) {
        throw new Error('useTransition must be used within a TransitionProvider');
    }
    return context;
}
