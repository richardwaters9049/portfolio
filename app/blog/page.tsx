"use client";

import React from "react";

const Page = () => {
    return (
        <main className="blog-container flex flex-col gap-6 m-5 p-5 bg-background text-foreground transition-colors duration-300">
            <div className="page-nav-container flex flex-row gap-2 justify-start">
                <span className="text-6xl text-foreground">Blog /</span>
                <span className="text-2xl flex justify-center items-end text-muted-foreground">dashboard</span>
            </div>

            <div className="inner-container p-20 rounded-lg flex flex-col gap-6 opacity-85 bg-gradient-to-r from-backgroundColor-LiveRed to-gray-800"></div>
        </main>
    );
};

export default Page;
