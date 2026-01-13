'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JasonVid from './jasonVid';

export default function TransitionOverlay({ isActive }: { isActive: boolean }) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent scrolling when overlay is active
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isActive]);

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                >
                    <div className="w-full h-full">
                        <JasonVid />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
