"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import CopyToClipboard from "react-copy-to-clipboard";
import gsap from "gsap";
import Nav from "@/components/ui/nav";

const Page: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const mainRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const h2Ref = useRef<HTMLHeadingElement>(null);
    const pRefs = useRef<HTMLParagraphElement[]>([]);
    pRefs.current = [];

    const buttonRef = useRef<HTMLButtonElement>(null);
    const copyContainerRef = useRef<HTMLDivElement>(null);
    const maskRef = useRef<HTMLDivElement>(null);

    // reset "Copied!" text
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    // intro animation (no slide-in for mask)
    useEffect(() => {
        const timeline = gsap.timeline({
            defaults: { duration: 1, ease: "power2.out" },
        });

        if (
            navRef.current &&
            mainRef.current &&
            h2Ref.current &&
            pRefs.current.length > 0 &&
            buttonRef.current &&
            copyContainerRef.current &&
            maskRef.current
        ) {
            timeline
                .fromTo(navRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1 })
                .fromTo(mainRef.current, { opacity: 0 }, { opacity: 1 }, "-=0.75")
                .fromTo(
                    h2Ref.current,
                    { opacity: 0, y: -50 },
                    { opacity: 1, y: 0 },
                    "-=0.75"
                )
                .fromTo(
                    pRefs.current,
                    { opacity: 0, x: -50 },
                    { opacity: 1, x: 0, stagger: 0.2 },
                    "-=0.5"
                )
                .fromTo(
                    copyContainerRef.current,
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, ease: "power1.out" },
                    "+=0.2"
                )
                .fromTo(
                    maskRef.current,
                    { opacity: 0 },
                    { opacity: 1, ease: "power2.out" },
                    "-=0.2"
                );
        }
    }, []);

    // auto-scroll after 3 s
    useEffect(() => {
        const scrollTimer = setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 3000);
        return () => clearTimeout(scrollTimer);
    }, []);

    // soft, slow glow pulse on mask
    useEffect(() => {
        if (maskRef.current) {
            gsap.to(maskRef.current, {
                opacity: 0.9,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
            gsap.to(maskRef.current, {
                filter: "drop-shadow(0 0 10px rgba(0,255,255,0.3))",
                repeat: -1,
                yoyo: true,
                duration: 2.5,
                ease: "sine.inOut",
            });
        }
    }, []);

    const addToRefs = (el: HTMLParagraphElement) => {
        if (el && !pRefs.current.includes(el)) {
            pRefs.current.push(el);
        }
    };

    return (
        <main
            ref={mainRef}
            className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-black text-slate-200"
        >
            <Nav ref={navRef} />
            <section className="w-full flex flex-row justify-center items-center p-8">
                <div className="bio p-8 flex flex-col gap-8 max-w-3xl text-xl">
                    <h2
                        ref={h2Ref}
                        className="text-slate-100 font-angel text-9xl mt-5 drop-shadow-[0_0_15px_rgba(0,255,255,0.25)]"
                    >
                        Welcome <span className="text-cyan-500 text-6xl">👋</span>
                    </h2>

                    <p
                        ref={addToRefs}
                        className="text-slate-200 font-bitter text-lg tracking-wide leading-relaxed"
                    >
                        Hey there! I’m <strong>Richy</strong> — a{" "}
                        <strong>Lead AI / Cybersecurity Engineer</strong> based in Liverpool,
                        UK. I build systems that think, defend, and evolve beyond human limits.
                    </p>

                    <p
                        ref={addToRefs}
                        className="text-slate-300 font-bitter text-lg tracking-wide leading-relaxed"
                    >
                        With a First-Class Honours degree in Computer Science and over a decade
                        in software engineering, I’ve developed AI models that detect leukaemia
                        years before symptoms appear, created honeypots that trap attackers
                        inside virtual environments, and built secure, scalable platforms for
                        major retail brands.
                    </p>

                    <p
                        ref={addToRefs}
                        className="text-slate-300 font-bitter text-lg tracking-wide leading-relaxed"
                    >
                        I love blending creativity with computation — practical, ethical, and
                        sometimes a little unpredictable. Feel free to reach out… unless it’s
                        about Java ☕ — that’s still terrifying. 💀
                    </p>

                    <div
                        ref={copyContainerRef}
                        className="copy-container flex flex-row gap-6 items-center mt-6"
                    >
                        <p className="text-slate-200 font-bitter tracking-wide text-xl">
                            <strong>Email:</strong> re4p3r2024@gmail.com
                        </p>
                        <CopyToClipboard
                            text="re4p3r2024@gmail.com"
                            onCopy={() => setCopied(true)}
                        >
                            <Button
                                ref={buttonRef}
                                className="copybtn text-white text-2xl px-6 py-4 font-angel bg-cyan-700 hover:bg-cyan-600 transition-all duration-200 shadow-lg shadow-cyan-900"
                            >
                                {copied ? "Copied! ✅" : "Copy Email"}
                            </Button>
                        </CopyToClipboard>
                    </div>
                </div>

                {/* Mask character */}
                <div
                    ref={maskRef}
                    className="font-monsterParty monster text-3xl text-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)] ml-8 select-none"
                >
                    Q
                </div>
            </section>
        </main>
    );
};

export default Page;
