import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/app/projects/projects-data";

type ProjectCardProps = {
  project: Project;
  onOpenTerminalDemo: () => void;
  cardRef?: (el: HTMLDivElement | null) => void;
};

export default function ProjectCard({
  project,
  onOpenTerminalDemo,
  cardRef,
}: ProjectCardProps) {
  return (
    <div
      ref={cardRef}
      className="grid md:grid-cols-2 gap-10 items-center p-10 rounded-xl border border-black/10 bg-white/30 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-6 max-[765px]:text-center">
        <h2 className="font-bitter text-3xl tracking-wider underline underline-offset-4">
          {project.title}
        </h2>

        <p className="font-bitter text-lg tracking-wider text-gray-800">
          {project.description}
        </p>

        <div className="flex gap-6 font-bitter max-[765px]:justify-center">
          <Link
            href={project.github}
            target="_blank"
            className="underline underline-offset-4 hover:opacity-70 transition"
          >
            GitHub
          </Link>
          {project.demoMode === "terminal" ? (
            <button
              type="button"
              onClick={onOpenTerminalDemo}
              className="underline underline-offset-4 hover:opacity-70 transition"
            >
              Demo
            </button>
          ) : (
            <Link
              href={project.demo}
              target="_blank"
              className="underline underline-offset-4 hover:opacity-70 transition"
            >
              Demo
            </Link>
          )}
        </div>
      </div>

      <div className="relative h-[220px] overflow-hidden rounded-lg">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
    </div>
  );
}
