"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import CopyToClipboard from "react-copy-to-clipboard";
import gsap from "gsap";
import Image from "next/image";
import ScreamImg from "@/public/images/GhostHack.png";
import Link from "next/link";
import { FaGithub, FaProjectDiagram, FaFilePdf } from "react-icons/fa";

const Page: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const mainRef = useRef<HTMLDivElement>(null);
    const h2Ref = useRef<HTMLHeadingElement>(null);
    const pRefs = useRef<HTMLParagraphElement[]>([]);
    pRefs.current = [];

    const screamWrapRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const copyContainerRef = useRef<HTMLDivElement>(null);

    // reset "Copied!" text
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    // page-load animation
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!mainRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { duration: 0.85, ease: "power3.out" },
            });

            tl.from(mainRef.current, {
                opacity: 0,
                duration: 0.55,
                ease: "power1.out",
            });

            if (h2Ref.current) {
                tl.from(
                    h2Ref.current,
                    { y: 22, opacity: 0, filter: "blur(10px)" },
                    "-=0.2"
                );
            }

            if (pRefs.current.length > 0) {
                tl.from(
                    pRefs.current,
                    { y: 16, opacity: 0, filter: "blur(8px)", stagger: 0.12 },
                    "-=0.35"
                );
            }

            if (copyContainerRef.current) {
                tl.from(
                    copyContainerRef.current,
                    { y: 12, opacity: 0, scale: 0.98 },
                    "-=0.25"
                );
            }

            if (screamWrapRef.current) {
                tl.from(
                    screamWrapRef.current,
                    { x: 28, opacity: 0, rotation: 1.5, scale: 0.985 },
                    "-=0.55"
                );
            }

            if (buttonRef.current) {
                tl.from(buttonRef.current, { scale: 0.96 }, "-=0.35");
            }
        }, mainRef);

        return () => ctx.revert();
    }, []);

    const addToRefs = (el: HTMLParagraphElement | null) => {
        if (el && !pRefs.current.includes(el)) {
            pRefs.current.push(el);
        }
    };

    return (
        <main
            ref={mainRef}
            className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-black text-slate-200"
        >
            <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 p-8 justify-items-center items-start">
                {/* Text Content */}
                <div className="bio p-6 flex flex-col gap-12">
                    <h2
                        ref={h2Ref}
                        className="text-slate-100 font-angel text-8xl  drop-shadow-[0_0_15px_rgba(0,255,255,0.25)] tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-teal-500 to-white first-letter:text-9xl first-letter:uppercase"
                    >
                        Welcome
                    </h2>

                    <p
                        ref={addToRefs}
                        className="text-slate-200 font-bitter text-xl tracking-wider leading-relaxed"
                    >
                        Hello, I’m Richy.<br></br>
                        An AI / Cybersecurity Engineer based in Liverpool, UK. <br></br> I build systems that think, defend, and evolve beyond human limits.
                    </p>

                    <p
                        ref={addToRefs}
                        className="text-slate-300 font-bitter text-xl tracking-wider leading-relaxed"
                    >
                        With a First-Class Honours degree in Computer Science and over a
                        decade in software engineering, I’ve developed AI models that detect
                        leukaemia years before symptoms appear, created honeypots that trap
                        attackers inside virtual environments, and built secure, scalable
                        platforms for major retail brands.
                    </p>

                    <p
                        ref={addToRefs}
                        className="text-slate-300 font-bitter text-xl tracking-wider leading-relaxed"
                    >
                        I love blending creativity with computation — practical, ethical,
                        and sometimes a little fun. Feel free to reach out… unless
                        it’s about Java ☕ — that’s still terrifying. 💀
                    </p>
                </div>

                {/* Image + Speech Bubble */}
                <div
                    ref={screamWrapRef}
                    className="scream-img p-6 relative flex flex-col gap-12 justify-center items-center"
                >
                    <Image
                        src={ScreamImg}
                        alt="Scream"
                        width={400}
                        height={400}
                        className="object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.25)] rounded-lg"
                        priority
                    />

                    {/* Speech Bubble - Social Links */}
                    <div className="speach-bubble-container mt-6">
                        <div className="speach-bubble bg-transparenttext-white p-6 rounded-lg shadow-lg font-bitter grid grid-cols-3 gap-4 justify-items-center items-center">
                            <Link
                                href="https://github.com/richardwaters9049"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center underline underline-offset-4 text-xl hover:scale-110 transition-transform"
                            >
                                <FaGithub className="text-5xl mb-3 text-purple-800" />
                                <span>GitHub</span>
                            </Link>
                            <Link
                                href="/projects"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center underline underline-offset-4 text-xl hover:scale-110 transition-transform"
                            >
                                <FaProjectDiagram className="text-5xl mb-3 text-orange-500" />
                                <span>Projects</span>
                            </Link>
                            <Link
                                href="/animations/files/RW-CV-Oct25.pdf"
                                download="RichardWaters-CV-Oct25.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center underline underline-offset-4 text-xl hover:scale-110 transition-transform"
                            >
                                <FaFilePdf className="text-5xl mb-3 text-red-600" />
                                <span>Download CV</span>
                            </Link>
                        </div>

                        <div
                            ref={copyContainerRef}
                            className="copy-container flex flex-row gap-6 items-center mt-6"
                        >
                            <p className="text-slate-200 font-bitter tracking-widest text-lg">
                                <strong className="text-2xl mb-2">Email:</strong> richardwaters866@gmail.com
                            </p>
                            <CopyToClipboard
                                text="richardwaters866@gmail.com"
                                onCopy={() => setCopied(true)}
                            >
                                <Button
                                    ref={buttonRef}
                                    className="copybtn text-white text-2xl px-6 py-7 font-angel bg-green-600 hover:bg-teal-900 transition-all duration-200 shadow-lg shadow-cyan-900"
                                >
                                    {copied ? "Copied! ✅" : "Copy Email"}
                                </Button>
                            </CopyToClipboard>
                        </div>
                    </div>
                </div>
            </section>
        </main >
    );
};

export default Page;
