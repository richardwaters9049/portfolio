"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type DockerDemoWindowProps = {
  isOpen: boolean;
  onClose: () => void;
};

const scriptPreview = [
  "# docker-pynext-scriptatest",
  "",
  "$ git clone https://github.com/richywaters/docker-pynext-scriptatest.git",
  "$ cd docker-pynext-scriptatest",
  "$ docker build -t pynext-scriptatest .",
  "$ docker run --rm -it -p 3000:3000 pynext-scriptatest",
  "",
  "> Booting containers...",
  "> Installing dependencies...",
  "> Starting Next.js app on http://localhost:3000",
];

export default function DockerDemoWindow({
  isOpen,
  onClose,
}: DockerDemoWindowProps) {
  const [renderedLines, setRenderedLines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [renderedLines]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms);
        timeoutIds.push(id);
      });

    const runScriptPreview = async () => {
      setRenderedLines([]);
      setIsRunning(true);

      for (const line of scriptPreview) {
        if (cancelled) return;

        setRenderedLines((prev) => [...prev, ""]);
        let typedLine = "";

        for (const character of line) {
          if (cancelled) return;
          typedLine += character;

          setRenderedLines((prev) => {
            const next = [...prev];
            next[next.length - 1] = typedLine;
            return next;
          });

          await sleep(line.startsWith(">") ? 14 : 9);
        }

        await sleep(line === "" ? 80 : line.startsWith("$") ? 240 : 420);
      }

      setIsRunning(false);
    };

    runScriptPreview();

    return () => {
      cancelled = true;
      setIsRunning(false);
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [isOpen, runKey]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-xl border border-emerald-500/40 bg-[#101510] shadow-[0_0_30px_rgba(16,185,129,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-emerald-500/30 bg-[#151f15] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-200/90">
            docker-pynext-scriptatest
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs uppercase tracking-[0.12em] text-emerald-200 transition hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div
            ref={terminalRef}
            className="max-h-[60vh] overflow-auto rounded-md border border-emerald-500/25 bg-[#0a0d0a] p-4 font-mono text-sm leading-7 text-emerald-300"
          >
            {renderedLines.map((line, index) => (
              <p key={index} className="whitespace-pre-wrap break-words">
                {line || "\u00A0"}
              </p>
            ))}
            {isRunning ? (
              <p className="animate-pulse text-emerald-200/80">█</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-emerald-200/80">
              Demo displays terminal-style startup commands for your Docker project.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRunKey((prev) => prev + 1)}
                className="rounded border border-emerald-500/40 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-emerald-200 transition hover:bg-emerald-500/15 hover:text-white"
              >
                Replay
              </button>
              <Link
                href="https://github.com/richywaters/docker-pynext-scriptatest"
                target="_blank"
                className="rounded border border-emerald-500/40 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-emerald-200 transition hover:bg-emerald-500/15 hover:text-white"
              >
                Open Repo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
