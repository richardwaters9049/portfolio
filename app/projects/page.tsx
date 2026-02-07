"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import gsap from "gsap";
import Demowindow from "@/components/ui/demo-window";

const projects = [
    {
        id: "01",
        title: "Password Cracker",
        description:
            "GPU-accelerated password cracking system built for security research, benchmarking, and threat modelling.",
        image: "/images/pw-crack-img.png",
        github: "https://github.com/yourname/password-cracker",
        demo: "https://password-cracker.onrender.com/"
    },
    {
        id: "02",
        title: "LukaScope",
        description:
            "AI-driven system for early leukaemia detection, leveraging longitudinal medical data and predictive modelling.",
        image: "/images/lukascope.png",
        github: "https://github.com/yourname/lukascope",
        demo: "https://demo-link.com",
    },
    {
        id: "03",
        title: "Security Automation Toolkit",
        description:
            "CLI-first toolkit automating reconnaissance, audits, and repeatable security workflows.",
        image: "/images/pw-crack-img.png",
        github: "https://github.com/yourname/security-toolkit",
        demo: "https://demo-link.com",
    },
];

export default function Projects() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            /* Title animation */
            if (titleRef.current) {
                gsap.from(titleRef.current, {
                    opacity: 0,
                    y: 30,
                    letterSpacing: "0.2em",
                    duration: 1.1,
                    ease: "power3.out",
                });
            }

            /* Subtitle animation */
            if (subtitleRef.current) {
                gsap.from(subtitleRef.current, {
                    opacity: 0,
                    y: 20,
                    duration: 0.9,
                    ease: "power2.out",
                    delay: 0.3,
                });
            }

            /* Cards animation (unchanged, just delayed slightly) */
            gsap.set(cardsRef.current, {
                opacity: 1,
                y: 0,
            });

            gsap.from(cardsRef.current, {
                opacity: 0,
                y: 60,
                duration: 1.1,
                ease: "power3.out",
                stagger: 0.2,
                delay: 0.5,
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const addToRefs = (el: HTMLDivElement | null) => {
        if (el && !cardsRef.current.includes(el)) {
            cardsRef.current.push(el);
        }
    };

    return (
        <section
            ref={sectionRef}
            className="min-h-screen p-6 bg-gradient-to-bl from-orange-500 to-white"
        >
            {/* Back */}
            <Link
                href="/dashboard"
                className="text-2xl flex items-center gap-3 font-bitter tracking-wider mb-2"
            >
                <FaArrowLeft />
                <span>Back</span>
            </Link>

            {/* Header */}
            <div className="w-full flex flex-col items-center mb-16">
                <h1
                    ref={titleRef}
                    className="text-slate-100 font-angel drop-shadow-[0_0_15px_rgba(0,255,255,0.25)] tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-500 project-title"
                >
                    Projects
                </h1>

                {/* Demo Window Content */}

                {/* <Demowindow /> */}


                <p
                    ref={subtitleRef}
                    className="text-xl text-gray-700 leading-relaxed font-bitter tracking-wider text-center max-w-3xl"
                >
                    A curated selection of applied systems exploring artificial intelligence,
                    cybersecurity, and real-world problem solving.
                    <br />
                    Each project is built as a functional proof-of-concept, prioritising clarity,
                    performance, and intent.
                </p>
            </div>

            {/* Grid */}
            <div className="grid gap-12 max-w-6xl mx-auto">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        ref={addToRefs}
                        className="grid md:grid-cols-2 gap-10 items-center p-10 rounded-xl border border-black/10 bg-white/30 backdrop-blur-sm"
                    >
                        {/* Text */}
                        <div className="flex flex-col gap-6 max-[765px]:text-center">
                            <h2 className="font-bitter text-3xl tracking-wider underline underline-offset-4">
                                {project.title}
                            </h2>

                            <p className="font-bitter text-lg tracking-wider text-gray-800">
                                {project.description}
                            </p>

                            <div className="flex gap-6 font-bitter max-[765px]:justify-center">
                                <Link
                                    href={project.github}
                                    className="underline underline-offset-4 hover:opacity-70 transition"
                                >
                                    GitHub
                                </Link>
                                <Link
                                    href={project.demo}
                                    className="underline underline-offset-4 hover:opacity-70 transition"
                                >
                                    Demo
                                </Link>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="relative w-full h-[220px] rounded-lg overflow-hidden">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover transition-transform duration-500 hover:scale-105"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
