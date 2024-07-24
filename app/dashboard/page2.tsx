"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Dashboard: React.FC = () => {
    const [copied, setCopied] = useState(false);

    React.useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    return (
        <main className="min-h-screen p-8 bg-gradient-to-br from-gray-700 via-gray-900 to-black text-white">
            <header className="text-center mb-12">
                <h1 className="text-6xl font-bold mb-4 text-blue-500">Richy Rose</h1>
                <p className="text-2xl text-black">Software Developer + Ethical Hacker</p>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <section className="flex justify-center">
                    <Card className="hover:shadow-2xl transform transition-transform duration-300 hover:scale-105">
                        <CardHeader>
                            <CardTitle className="text-blue-400">Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-black"><strong>Location:</strong> Liverpool, UK</p>
                            <p className="text-black"><strong>Education:</strong> Bachelor's Degree in Computer Science with First Honours</p>
                            <p className="text-black"><strong>Coding Languages:</strong> GO, Python, C++, C#, React, React Native, PHP and more</p>
                            <p className="text-black"><strong>Version Control:</strong> Github, Docker</p>
                            <p className="text-black"><strong>Databases:</strong> MySQL, SQLite, Prisma, MongoDB, Oracle, Firebase and more</p>
                            <p className="text-black"><strong>Experience with E-commerce:</strong> Creating bespoke Shopify themes</p>
                            <p className="text-black"><strong>Ethical Hacking Technologies:</strong> Nmap, Burp Suite, Wireshark, Kali Linux and more</p>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex justify-center">
                    <Card className="hover:shadow-2xl transform transition-transform duration-300 hover:scale-105">
                        <CardHeader>
                            <CardTitle className="text-blue-400">Software Development Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-black">
                                <li>Laravel CRM System</li>
                                <li>React Native Mobile App</li>
                                <li>Bespoke Shopify Themes</li>
                                <li>GO Microservices Architecture</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex justify-center">
                    <Card className="hover:shadow-2xl transform transition-transform duration-300 hover:scale-105">
                        <CardHeader>
                            <CardTitle className="text-blue-400">Ethical Hacking Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-black">
                                <li>Password Cracker</li>
                                <li>Firewall Project</li>
                                <li>Network Vulnerability Scanner</li>
                                <li>Social Engineering Toolkit</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex justify-center">
                    <Card className="hover:shadow-2xl transform transition-transform duration-300 hover:scale-105">
                        <CardHeader>
                            <CardTitle className="text-blue-400">Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center space-x-4">
                            <p className="text-black">Email: re4p3r2024@gmail.com</p>
                            <CopyToClipboard text="re4p3r2024@gmail.com" onCopy={() => setCopied(true)}>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white">{copied ? "Copied!" : "Copy Email"}</Button>
                            </CopyToClipboard>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
};

export default Dashboard;
