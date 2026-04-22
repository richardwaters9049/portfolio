"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "../../app/projects/projects-data";

type ProjectCardProps = {
  project: Project;
  onOpenProjectDemo: (project: Project) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
};

type ImageDimensions = {
  width: number;
  height: number;
};

type RGB = {
  r: number;
  g: number;
  b: number;
};

const IMAGE_FRAME = {
  width: 560,
  height: 340,
};

const DEFAULT_GRADIENT =
  "linear-gradient(135deg, rgb(255 241 228) 0%, rgb(246 195 151) 52%, rgb(195 109 62) 100%)";

function getResizedImageDimensions(
  naturalWidth: number,
  naturalHeight: number,
  frameWidth: number,
  frameHeight: number,
): ImageDimensions {
  if (!naturalWidth || !naturalHeight) {
    return {
      width: frameWidth,
      height: frameHeight,
    };
  }

  const widthRatio = frameWidth / naturalWidth;
  const heightRatio = frameHeight / naturalHeight;
  const scale = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(naturalWidth * scale),
    height: Math.round(naturalHeight * scale),
  };
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function averageColor(data: Uint8ClampedArray, xStart: number, yStart: number, size: number) {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let y = yStart; y < yStart + size; y += 1) {
    for (let x = xStart; x < xStart + size; x += 1) {
      const index = (y * 24 + x) * 4;
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
      count += 1;
    }
  }

  return {
    r: clampChannel(red / count),
    g: clampChannel(green / count),
    b: clampChannel(blue / count),
  };
}

function tintColor(color: RGB, amount: number) {
  return {
    r: clampChannel(color.r + amount),
    g: clampChannel(color.g + amount),
    b: clampChannel(color.b + amount),
  };
}

function rgb(color: RGB) {
  return `rgb(${color.r} ${color.g} ${color.b})`;
}

function createGradientFromImage(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 24;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return DEFAULT_GRADIENT;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

  const topLeft = tintColor(averageColor(imageData, 0, 0, 8), 42);
  const center = tintColor(averageColor(imageData, 8, 8, 8), 10);
  const bottomRight = tintColor(averageColor(imageData, 16, 16, 8), -20);

  return [
    `radial-gradient(circle at top left, ${rgb(topLeft)} 0%, transparent 48%)`,
    `radial-gradient(circle at bottom right, ${rgb(bottomRight)} 0%, transparent 45%)`,
    `linear-gradient(135deg, ${rgb(tintColor(topLeft, 28))} 0%, ${rgb(center)} 52%, ${rgb(
      tintColor(bottomRight, -8),
    )} 100%)`,
  ].join(", ");
}

export default function ProjectCard({
  project,
  onOpenProjectDemo,
  cardRef,
}: ProjectCardProps) {
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>(
    IMAGE_FRAME,
  );
  const [backgroundGradient, setBackgroundGradient] =
    useState<string>(DEFAULT_GRADIENT);

  const imagePanel = (
    <>
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.08] group-hover:rotate-[1.2deg]"
        style={{ backgroundImage: backgroundGradient }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_52%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <Image
          src={project.image}
          alt={project.title}
          width={imageDimensions.width}
          height={imageDimensions.height}
          className="max-h-full max-w-full w-auto rounded-xl border border-white/40 bg-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          onLoad={(event) => {
            const target = event.currentTarget;
            setImageDimensions(
              getResizedImageDimensions(
                target.naturalWidth,
                target.naturalHeight,
                IMAGE_FRAME.width,
                IMAGE_FRAME.height,
              ),
            );
            setBackgroundGradient(createGradientFromImage(target));
          }}
        />
      </div>
    </>
  );

  return (
    <div
      ref={cardRef}
      className="grid items-center gap-10 rounded-[1.75rem] border border-black/10 bg-white/30 p-12 backdrop-blur-sm md:grid-cols-[1.05fr_0.95fr]"
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
              onClick={() => onOpenProjectDemo(project)}
              className="underline underline-offset-4 hover:opacity-70 transition"
            >
              Demo
            </button>
          ) : project.demoMode === "animated" ? (
            <button
              type="button"
              onClick={() => onOpenProjectDemo(project)}
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

      {project.demoMode === "terminal" || project.demoMode === "animated" ? (
        <button
          type="button"
          onClick={() => onOpenProjectDemo(project)}
          className="group relative flex h-[270px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[1.5rem] border border-black/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          {imagePanel}
        </button>
      ) : (
        <Link
          href={project.demo}
          target="_blank"
          className="group relative flex h-[270px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[1.5rem] border border-black/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          {imagePanel}
        </Link>
      )}
    </div>
  );
}
