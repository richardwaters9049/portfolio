"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import CopyToClipboard from "react-copy-to-clipboard";
// Ensure the correct import path
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
    const slideInRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    useEffect(() => {
        const timeline = gsap.timeline({
            defaults: { duration: 1, ease: "power2.out" },
        });

        if (navRef.current && mainRef.current && h2Ref.current && pRefs.current.length > 0 && buttonRef.current && copyContainerRef.current && slideInRef.current) {
            timeline
                .fromTo(navRef.current,
                    { y: -100, opacity: 0 },
                    { y: 0, opacity: 1 })
                .fromTo(mainRef.current,
                    { opacity: 0 },
                    { opacity: 1 }, "-=0.75")
                .fromTo(h2Ref.current,
                    { opacity: 0, y: -50 },
                    { opacity: 1, y: 0 }, "-=0.75")
                .fromTo(pRefs.current,
                    { opacity: 0, x: -50 },
                    { opacity: 1, x: 0, stagger: 0.2 }, "-=0.5")
                .fromTo(copyContainerRef.current,
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, ease: "power1.out" }, "+=0.2")
                .fromTo(slideInRef.current,
                    { x: 100, opacity: 0 },
                    { x: 0, opacity: 1, ease: "power2.out" }, "-=0.1");
        } else {
            console.error("One or more elements are not properly referenced.");
        }
    }, []);

    const addToRefs = (el: HTMLParagraphElement) => {
        if (el && !pRefs.current.includes(el)) {
            pRefs.current.push(el);
        }
    };

    return (
        <main ref={mainRef}>
            <Nav ref={navRef} />
            <section className="w-full flex flex-row justify-center items-center">
                <div className="bio p-8 flex flex-col gap-6 text-xl">
                    <h2 ref={h2Ref} className="text-black font-angel text-8xl">Welcome</h2>
                    <p ref={addToRefs} className="text-black font-bitter text-xl tracking-wide">
                        Howdy! My name is Richy, a software engineer and ethical hacker based
                        in Liverpool, UK, with a passion for all things tech. With a Bachelors
                        Degree in Computer Science and First Class Honours, I've been
                        immersing myself in the world of coding and hacking for the past 8
                        years. My journey has equipped me with extensive experience,
                        especially in working with major retail companies, where I've honed my
                        skills to tackle complex challenges and safeguard digital landscapes.
                    </p>
                    <p ref={addToRefs} className="text-black font-bitter text-xl tracking-wide">
                        When I'm not dissecting code or exploring new vulnerabilities, you’ll
                        find me deep in the realms of horror fiction and metal and punk music.
                        My love for these genres fuels my creativity and drive, both in and out
                        of the tech world. Every day, I’m excited to blend my technical
                        expertise with my personal passions, pushing boundaries and finding
                        innovative solutions.
                    </p>
                    <p ref={addToRefs} className="text-black font-bitter text-xl tracking-wide">
                        Feel free to contact me, unless it’s about Java.. that’s the real horror!
                    </p>

                    <div ref={copyContainerRef} className="copy-container flex flex-row gap-6 items-center">
                        <p className="text-black font-bitter tracking-wide text-xl"><strong>Email:</strong> re4p3r2024@gmail.com</p>
                        <CopyToClipboard text="re4p3r2024@gmail.com" onCopy={() => setCopied(true)}>
                            <Button ref={buttonRef} className="copybtn text-white text-2xl p-6 font-angel">{copied ? "Copied!" : "Copy Email"}</Button>
                        </CopyToClipboard>
                    </div>
                </div>
                <div ref={slideInRef} className="font-monsterParty monster">
                    Q
                </div>
            </section>
        </main>
    );
};

export default Page;
