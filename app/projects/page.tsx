"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import gsap from "gsap";
import AnimatedDemoWindow from "@/components/ui/animated-demo-window";
import DockerDemoWindow from "@/components/ui/docker-demo-window";
import ProjectCard from "../../app/projects/project-card";
import type { Project } from "../../app/projects/projects-data";
import { projects } from "../../app/projects/projects-data";

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const [isDockerDemoOpen, setIsDockerDemoOpen] = useState(false);
  const [animatedDemoProject, setAnimatedDemoProject] = useState<Project | null>(
    null,
  );
  const dockerProject = projects.find(
    (project) => project.demoMode === "terminal",
  );

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* Title animation */
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 30,
          letterSpacing: "0.2em",
          duration: 1.1,
          ease: "power3.out",
        });
      }

      /* Subtitle animation */
      if (subtitleRef.current) {
        gsap.from(subtitleRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.9,
          ease: "power2.out",
          delay: 0.3,
        });
      }

      /* Cards animation (unchanged, just delayed slightly) */
      gsap.set(cardsRef.current, {
        opacity: 1,
        y: 0,
      });

      gsap.from(cardsRef.current, {
        opacity: 0,
        y: 60,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.2,
        delay: 0.5,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const handleOpenProjectDemo = (project: Project) => {
    if (project.demoMode === "terminal") {
      setIsDockerDemoOpen(true);
      return;
    }

    if (project.demoMode === "animated") {
      setAnimatedDemoProject(project);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen p-6 bg-gradient-to-bl from-orange-500 to-white"
    >
      {/* Back */}
      <Link
        href="/dashboard"
        className="text-2xl flex items-center gap-3 font-bitter tracking-wider mb-2"
      >
        <FaArrowLeft />
        <span>Back</span>
      </Link>

      {/* Header */}
      <div className="w-full flex flex-col items-center mb-16">
        <h1
          ref={titleRef}
          className="text-slate-100 font-angel drop-shadow-[0_0_15px_rgba(0,255,255,0.25)] tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-500 project-title"
        >
          Projects
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl text-gray-700 leading-relaxed font-bitter tracking-wider text-center max-w-3xl"
        >
          A curated selection of applied systems exploring artificial
          intelligence, cybersecurity, and real-world problem solving.
          <br />
          Each project is built as a functional proof-of-concept, prioritising
          clarity, performance, and intent.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-12 max-w-6xl mx-auto">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            cardRef={addToRefs}
            onOpenProjectDemo={handleOpenProjectDemo}
          />
        ))}
      </div>

      <AnimatedDemoWindow
        isOpen={Boolean(animatedDemoProject)}
        onClose={() => setAnimatedDemoProject(null)}
        title={animatedDemoProject?.title ?? "Project Demo"}
        demoUrl={animatedDemoProject?.demo ?? "https://password-cracker.onrender.com/"}
      />

      <DockerDemoWindow
        isOpen={isDockerDemoOpen}
        onClose={() => setIsDockerDemoOpen(false)}
        repoUrl={
          dockerProject?.github ??
          "https://github.com/richardwaters9049/DockerScripts.git"
        }
      />
    </section>
  );
}
