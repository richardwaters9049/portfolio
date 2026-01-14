"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

const projects = [
    {
        id: "01",
        title: "Password Cracker",
        description:
            "GPU-accelerated password cracking system built for security research, benchmarking, and threat modelling.",
        image: "/images/pw-crack-img.png",
        github: "https://github.com/yourname/password-cracker",
        demo: "https://demo-link.com",
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
        image: "/projects/toolkit.png",
        github: "https://github.com/yourname/security-toolkit",
        demo: "https://demo-link.com",
    },
];

export default function Projects() {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0, 0, 0.58, 1] }}
            className="p-6 bg-gradient-to-bl from-orange-500 to-white"
        >
            <Link
                href="/dashboard"
                className="text-2xl flex items-center gap-3 font-bitter tracking-wider"
            >
                <FaArrowLeft />
                <span>Back</span>
            </Link>

            <div className="w-full flex flex-col items-center mb-10">
                <h1
                    className="text-slate-100 font-angel drop-shadow-[0_0_15px_rgba(0,255,255,0.25)] tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-500 mb-8 project-title"
                >
                    Projects
                </h1>

                <p className="mt-4 text-xl text-gray-700 leading-relaxed font-bitter tracking-wider text-center max-w-3xl">
                    A curated selection of applied systems exploring artificial
                    intelligence, cybersecurity, and real-world problem solving. <br />
                    Each project is built as a functional proof-of-concept, prioritising clarity,
                    performance, and intent.
                </p>
            </div>

            <section className="project-grid p-6 flex flex-col gap-8">
                {projects.map((project) => (
                    <div key={project.id} className="pro-1 flex flex-col gap-6 p-6">
                        <h2 className="font-bitter text-3xl tracking-wider underline underline-offset-4">
                            {project.title}
                        </h2>
                        <p className="font-bitter text-lg tracking-wider">
                            {project.description}
                        </p>
                        <div className="btn-container flex gap-5">
                            <Link href={project.github} className="btn font-bitter underline-offset-4 underline">
                                GitHub
                            </Link>
                            <Link href={project.demo} className="btn font-bitter underline-offset-4 underline">
                                Demo
                            </Link>
                        </div>
                    </div>
                ))}
            </section>
        </motion.section>
    );
}
