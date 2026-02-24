import { spawn } from "node:child_process";
import path from "node:path";

export const runtime = "nodejs";

const encoder = new TextEncoder();

type StreamPayload = Record<string, string | number | boolean | null>;

function eventChunk(type: string, payload: StreamPayload) {
  return encoder.encode(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`);
}

function splitOutput(output: string) {
  return output
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");
}

function runCommand(
  command: string,
  cwd: string | undefined,
  onLine: (line: string) => void
) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("sh", ["-lc", command], {
      cwd,
      env: process.env,
    });

    child.stdout.on("data", (chunk) => {
      for (const line of splitOutput(String(chunk))) {
        onLine(line);
      }
    });

    child.stderr.on("data", (chunk) => {
      for (const line of splitOutput(String(chunk))) {
        onLine(line);
      }
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed (${code}): ${command}`));
    });
  });
}

export async function GET() {
  const demoRoot = "/tmp/docker-demo-workspace";
  const repoDir = path.join(demoRoot, "docker-pynext-scriptatest");
  const imageName = "pynext-scriptatest";
  const containerName = "pynext-scriptatest-demo";
  const hostPort = 3010;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          eventChunk("command", {
            line: "# docker-pynext-scriptatest",
          })
        );
        controller.enqueue(
          eventChunk("command", {
            line: "$ mkdir -p /tmp/docker-demo-workspace",
          })
        );

        await runCommand("mkdir -p /tmp/docker-demo-workspace", undefined, (line) => {
          controller.enqueue(eventChunk("log", { line }));
        });

        const commands = [
          {
            line: `$ rm -rf ${repoDir}`,
            command: `rm -rf ${repoDir}`,
          },
          {
            line: "$ git clone https://github.com/richywaters/docker-pynext-scriptatest.git",
            command:
              "git clone https://github.com/richywaters/docker-pynext-scriptatest.git /tmp/docker-demo-workspace/docker-pynext-scriptatest",
          },
          {
            line: "$ cd docker-pynext-scriptatest",
            command: `test -d ${repoDir}`,
          },
          {
            line: `$ docker build -t ${imageName} .`,
            command: `docker build -t ${imageName} ${repoDir}`,
          },
          {
            line: `$ docker rm -f ${containerName} || true`,
            command: `docker rm -f ${containerName} || true`,
          },
          {
            line: `$ docker run --rm -it -p 3000:3000 ${imageName}`,
            command: `docker run --rm -d --name ${containerName} -p ${hostPort}:3000 ${imageName}`,
          },
        ];

        for (const step of commands) {
          controller.enqueue(eventChunk("command", { line: step.line }));

          await runCommand(step.command, undefined, (line) => {
            controller.enqueue(eventChunk("log", { line }));
          });
        }

        controller.enqueue(
          eventChunk("log", { line: "> Booting containers..." })
        );
        controller.enqueue(
          eventChunk("log", { line: "> Installing dependencies..." })
        );
        controller.enqueue(
          eventChunk("log", {
            line: `> Mapped container port 3000 to host port ${hostPort} for in-window preview`,
          })
        );
        controller.enqueue(
          eventChunk("log", {
            line: `> Starting Next.js app on http://localhost:${hostPort}`,
          })
        );
        controller.enqueue(
          eventChunk("ready", {
            url: `http://localhost:${hostPort}`,
            containerName,
          })
        );
        controller.enqueue(eventChunk("done", { ok: true }));
      } catch (error) {
        controller.enqueue(
          eventChunk("fatal", {
            line:
              error instanceof Error
                ? error.message
                : "Unknown error while running Docker demo",
          })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
