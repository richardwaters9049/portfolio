import React from "react";

const Page = () => {
    return (
        <main className="blog-container flex flex-col gap-6 m-5 p-5">
            <div className="page-nav-container flex flex-row gap-2 justify-start">
                <span className="text-6xl">Blog /</span>
                <span className="text-2xl flex justify-center items-end">dashboard</span>
            </div>

            <div className="inner-container p-20 rounded-lg flex flex-col gap-6 opacity-85 bg-gradient-to-r from-backgroundColor-LiveRed to-gray-800"></div>
        </main>
    );
};

export default Page;
