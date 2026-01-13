'use client';

import { Fullscreen } from 'lucide-react';
import React, { useRef } from 'react';

const JasonVid = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const toggleFullscreen = () => {
        if (!videoRef.current) return;

        if (!document.fullscreenElement) {
            videoRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className='relative w-full h-screen p-8 bg-black'>
            <video
                ref={videoRef}
                src="/animations/jason-hack.mp4"
                autoPlay
                loop
                muted
                className='w-full h-full object-contain'
            />
            <button
                onClick={toggleFullscreen}
                className='absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors'
                aria-label='Toggle fullscreen'
            >
                <Fullscreen size={10} />
            </button>
        </div>
    );
};

export default JasonVid;
