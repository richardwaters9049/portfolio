'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

type JasonVidProps = {
    onFinish?: () => void;
};

const JasonVid = ({ onFinish }: JasonVidProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fade IN container/video on mount
    useEffect(() => {
        if (!containerRef.current || !videoRef.current) return;

        // container is black, fade in video itself
        gsap.fromTo(
            videoRef.current,
            { opacity: 0, scale: 1.02 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: 'power2.out',
            }
        );
    }, []);

    // Handle video end
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !onFinish) return;

        const handleEnded = () => {
            // Fade out video to reveal black and then navigate
            gsap.to(video, {
                opacity: 0,
                scale: 0.98,
                duration: 0.6,
                ease: 'power2.in',
                onComplete: onFinish,
            });
        };

        video.addEventListener('ended', handleEnded);
        return () => video.removeEventListener('ended', handleEnded);
    }, [onFinish]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
            <video
                ref={videoRef}
                src="/animations/jason-hack.mp4"
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default JasonVid;
