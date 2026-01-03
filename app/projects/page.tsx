"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import LeftArrow from "@/public/images/barrow.png"
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

import { Variants } from 'framer-motion';

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.25,
        },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 80 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'tween',
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function Projects() {
    return (
        <section className="p-6 bg-gradient-to-bl from-orange-500 to-white">
            <Link href="/dashboard" className="text-2xl flex items-center gap-3 font-bitter tracking-wider">
                <FaArrowLeft />
                <span>Back</span>
            </Link>
            <div className="w-full flex flex-col items-center mb-10">
                <h1 className="font-angel r_rose text-center">
                    Projects
                </h1>

                <p className="mt-4 text-2xl text-gray-700 leading-relaxed font-bitter tracking-wider text-center max-w-3xl">
                    A curated selection of applied systems exploring artificial
                    intelligence, cybersecurity, and real-world problem solving. Each
                    project is built as a functional proof-of-concept, prioritising clarity,
                    performance, and intent.
                </p>
            </div>

            <section className="project-grid p-6 flex flex-col gap-8">
                <div className="pro-1 flex flex-col gap-6 p-6">
                    <h2 className="font-bitter text-3xl tracking-wider underline underline-offset-4">Password Cracker</h2>
                    <p className="font-bitter text-lg tracking-wider">GPU-accelerated password cracking system built for security research, benchmarking, and threat modelling.</p>
                    <div className="btn-container flex gap-5">
                        <Link href="https://github.com/yourname/password-cracker" className="btn font-bitter underline-offset-4 underline">GitHub</Link>
                        <Link href="https://demo-link.com" className="btn font-bitter underline-offset-4 underline">Demo</Link>
                    </div>
                </div>
                <div className="pro-2 flex flex-col gap-5 p-6">
                    <h2 className="font-bitter text-3xl tracking-wider underline underline-offset-4">LukaScope</h2>
                    <p className="font-bitter text-lg tracking-wider">AI-driven system for early leukaemia detection, leveraging longitudinal medical data and predictive modelling.</p>
                </div>
                <div className="pro-3 flex flex-col gap-5 p-6">
                    <h2 className="font-bitter text-3xl tracking-wider underline underline-offset-4">Security Automation Toolkit</h2>
                    <p className="font-bitter text-lg tracking-wider">CLI-first toolkit automating reconnaissance, audits, and repeatable security workflows.</p>
                </div>
            </section>

        </section>
    );
}
