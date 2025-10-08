import React from "react";
import Nav from "@/components/ui/nav";
interface Project {
    id: number;
    title: string;
    description: string;
    demoLink: string;
    repoLink: string;
}

const projects: Project[] = [
    {
        id: 1,
        title: "SQL Injection Exploit",
        description: "Learn how SQL Injection works and how to prevent it.",
        demoLink: "https://example.com/sql-injection",
        repoLink: "https://github.com/yourusername/sql-injection",
    },
    {
        id: 2,
        title: "Wi-Fi Sniffing",
        description: "Analyze network traffic and capture packets ethically.",
        demoLink: "https://example.com/wifi-sniffing",
        repoLink: "https://github.com/yourusername/wifi-sniffing",
    },
    {
        id: 3,
        title: "XSS Attack Simulation",
        description: "Understand Cross-Site Scripting vulnerabilities.",
        demoLink: "https://example.com/xss-attack",
        repoLink: "https://github.com/yourusername/xss-attack",
    },
];

const HackingPage: React.FC = () => {
    return (
        <main>
            <Nav />
            <div className="min-h-screen text-black p-6">
                <h1 className="text-8xl text-center mb-8 font-angel tracking-wider">Hacking Projects</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: Project) => (
                        <div
                            key={project.id}
                            className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 font-bitter"
                        >
                            <h2 className="text-xl font-bold mb-2 text-white">{project.title}</h2>
                            <p className="text-gray-400 mb-4">{project.description}</p>

                            <div className="flex justify-between">
                                <a
                                    href={project.demoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                                >
                                    Demo
                                </a>
                                <a
                                    href={project.repoLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                                >
                                    GitHub
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default HackingPage;
