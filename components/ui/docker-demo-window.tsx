"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const runCompletedRef = useRef(false);

  const appendLine = useCallback((line: string) => {
    setRenderedLines((prev) => [...prev, line]);
  }, []);

  const stopExistingRun = useCallback(async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    runCompletedRef.current = true;

    try {
      await fetch("/api/docker-demo/stop", { method: "POST" });
    } catch {
      // Ignore cleanup failures in UI.
    }
  }, []);

  const startRealRun = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setRenderedLines([]);
    setPreviewUrl(null);
    setIsRunning(true);
    runCompletedRef.current = false;

    const source = new EventSource("/api/docker-demo/stream");
    eventSourceRef.current = source;

    const parsePayload = (event: MessageEvent) => {
      try {
        return JSON.parse(event.data) as { line?: string; url?: string };
      } catch {
        return {};
      }
    };

    source.addEventListener("command", (event) => {
      const payload = parsePayload(event as MessageEvent);
      if (payload.line) appendLine(payload.line);
    });

    source.addEventListener("log", (event) => {
      const payload = parsePayload(event as MessageEvent);
      if (payload.line) appendLine(payload.line);
    });

    source.addEventListener("ready", (event) => {
      const payload = parsePayload(event as MessageEvent);
      if (payload.url) {
        setPreviewUrl(payload.url);
      }
      appendLine(
        payload.url
          ? `> Demo is live at ${payload.url}`
          : "> Demo container is ready"
      );
    });

    source.addEventListener("fatal", (event) => {
      const payload = parsePayload(event as MessageEvent);
      appendLine(payload.line ? `! ${payload.line}` : "! Stream error");
      setIsRunning(false);
      runCompletedRef.current = true;
      source.close();
      eventSourceRef.current = null;
    });

    source.addEventListener("done", () => {
      setIsRunning(false);
      runCompletedRef.current = true;
      source.close();
      eventSourceRef.current = null;
    });

    source.onerror = () => {
      if (runCompletedRef.current) {
        return;
      }
      appendLine("! Lost connection to demo stream");
      setIsRunning(false);
      runCompletedRef.current = true;
      source.close();
      eventSourceRef.current = null;
    };
  }, [appendLine]);

  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [renderedLines]);

  useEffect(() => {
    if (!isOpen) return;

    startRealRun();

    return () => {
      void stopExistingRun();
      setIsRunning(false);
    };
  }, [isOpen, startRealRun, stopExistingRun]);

  if (!isOpen) return null;

  const handleClose = async () => {
    await stopExistingRun();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => void handleClose()}
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
            onClick={() => void handleClose()}
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
            {(renderedLines.length ? renderedLines : scriptPreview).map((line, index) => (
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
              This terminal runs real setup commands and streams live output.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startRealRun}
                className="rounded border border-emerald-500/40 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-emerald-200 transition hover:bg-emerald-500/15 hover:text-white"
              >
                Run Script
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

          {previewUrl ? (
            <div className="overflow-hidden rounded-md border border-emerald-500/25 bg-black">
              <div className="border-b border-emerald-500/25 bg-[#0d130d] px-3 py-2 font-mono text-xs text-emerald-200/90">
                Live Preview ({previewUrl})
              </div>
              <iframe
                src={previewUrl}
                title="Docker Script Live Demo"
                className="h-[420px] w-full bg-white"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
