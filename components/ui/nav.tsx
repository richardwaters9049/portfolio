// components/Navbar.tsx

"use client";

import React, { useState, forwardRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Bat from "@/public/images/nav-bat.svg";
import ThemeToggle from "@/components/ui/theme-toggle";

const Nav = forwardRef<HTMLElement>((props, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav ref={ref} className="navbar p-6 w-full">
            <div className="flex justify-between items-center">
                <Link
                    className="text-foreground font-angel text-6xl tracking-widest"
                    href="/dashboard"
                >
                    R
                </Link>
                <div className="block lg:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-foreground focus:outline-none bg-none"
                    >
                        <Image
                            src={Bat}
                            alt="bat"
                            width={100}
                            height={100}
                            className="navbat dark:invert-0 invert"
                        />
                    </button>
                </div>
                <div
                    className={` lg:flex lg:items-center justify-between lg:w-auto ${isOpen ? "block" : "hidden"
                        }`}
                >
                    <ul className="lg:flex lg:justify-between lg:items-center text-foreground lg:space-x-6">
                        <li className="mt-3 lg:mt-0">
                            <Link
                                href="/projects"
                                className="hover:underline font-angel text-4xl tracking-widest underline-offset-8 animate-slide-in"
                            >
                                Projects
                            </Link>
                        </li>
                        <li className="mt-3 lg:mt-0">
                            <Link
                                href="/hacking"
                                className="hover:underline font-angel text-4xl tracking-widest underline-offset-8"
                            >
                                Hacking
                            </Link>
                        </li>
                        <li className="mt-3 lg:mt-0">
                            <ThemeToggle />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
});

Nav.displayName = "Nav";

export default Nav;
