import React from "react";
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const projects = () => {
    return (
        <section className="p-8 bg-gradient-to-bl from-orange-500 to-white">
            <div className="p-6">
                <h1

                    className="font-angel text-8xl  drop-shadow-[0_0_15px_rgba(0,255,255,0.25)] tracking-wider first-letter:text-9xl first-letter:uppercase bg-clip-text text-transparent bg-gradient-to-b from-gray-500 to-gray-800"
                >
                    Projects
                </h1>
            </div>
        </section>

    );
};

export default projects;
