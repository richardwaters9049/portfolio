"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useState } from "react";


const page: React.FC = () => {
    const [copied, setCopied] = useState(false);

    React.useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);
    return (
        <section className="w-full h-screen grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bio p-6 flex flex-col gap-6">
                <h2 className="text-black font-angel text-6xl">Bio</h2>
                <p className="text-black">
                    Howdy! My name is Richy, a software engineer and ethical hacker based
                    in Liverpool, UK, with a passion for all things tech. With a Bachelors
                    Degree in Computer Science and First Class Honours, I've been
                    immersing myself in the world of coding and hacking for the past 8
                    years. My journey has equipped me with extensive experience,
                    especially in working with major retail companies, where I've honed my
                    skills to tackle complex challenges and safeguard digital landscapes.
                </p>
                <p className="text-black">
                    When I'm not dissecting code or exploring new vulnerabilities, you’ll
                    find me deep in the realms of horror fiction and metal and punk music.
                    My love for these genres fuels my creativity and drive, both in and out
                    of the tech world. Every day, I’m excited to blend my technical
                    expertise with my personal passions, pushing boundaries and finding
                    innovative solutions.
                </p>
                <p className="text-black"><strong>Contact:</strong> Unless it’s about Java, that’s the real horror!</p>
                <div className="copy-container flex flex-row gap-4 xsm:flex-wrap">
                    <p className="text-black"><strong>Email:</strong> re4p3r2024@gmail.com</p>
                    <CopyToClipboard text="re4p3r2024@gmail.com" onCopy={() => setCopied(true)}>
                        <Button className="copybtn text-white w-1/2 p-6">{copied ? "Copied!" : "Copy email"}</Button>
                    </CopyToClipboard>
                </div>

            </div>
            <div className="software p-6 flex flex-col gap-6">
                <h2 className="text-black font-angel text-6xl">Software</h2>
                <p className="text-black">
                    <strong>Coding Languages:</strong> GO, Python, C++, C#, React, React
                    Native, PHP and more
                </p>
                <p className="text-black">
                    <strong>Version Control:</strong> Github, Docker
                </p>
                <p className="text-black">
                    <strong>Databases:</strong> MySQL, SQLite, Prisma, MongoDB, Oracle,
                    Firebase and more
                </p>
                <p className="text-black">
                    <strong>E-commerce:</strong> Bespoke Shopify themes
                </p>
            </div>
            <div className="hacking p-6 flex flex-col gap-6">
                <h2 className="text-black font-angel text-6xl">Hacking</h2>
                <p className="text-black">
                    <strong>Technologies:</strong> Nmap, Burp Suite, Wireshark, Kali Linux
                    and more
                </p>
            </div>
        </section >

    );
};

export default page;
