// components/Navbar.tsx

"use client";

import React, { useState, forwardRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Bat from "@/public/images/nav-bat.svg";

const Nav = forwardRef<HTMLElement>((props, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav ref={ref} className="navbar p-6">
            <div className="flex justify-between items-center">
                <Link
                    className="text-white font-angel text-6xl tracking-widest"
                    href="/"
                >
                    R
                </Link>
                <div className="block lg:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none bg-none"
                    >
                        {/* <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        </svg> */}

                        <Image
                            src={Bat}
                            alt="bat"
                            width={100}
                            height={100}
                            className="navbat"
                        />
                    </button>
                </div>
                <div
                    className={` lg:flex lg:items-center justify-between lg:w-auto ${isOpen ? "block" : "hidden"
                        }`}
                >
                    <ul className="lg:flex lg:justify-between text-white lg:space-x-6">
                        <li className="mt-3 lg:mt-0">
                            <Link
                                href="/software"
                                className="hover:underline font-angel text-4xl tracking-widest underline-offset-8 animate-slide-in"
                            >
                                Software
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
                            <Link
                                href="/blog"
                                className="hover:underline font-angel text-4xl tracking-widest underline-offset-8"
                            >
                                Blog
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
});

Nav.displayName = "Nav";

export default Nav;
