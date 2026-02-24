import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const encoder = new TextEncoder();

type StreamPayload = Record<string, string | number | boolean | null>;

function eventChunk(type: string, payload: StreamPayload) {
  return encoder.encode(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`);
}

function escapeShellArg(value: string) {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function splitOutput(output: string) {
  return output
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");
}

const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);
const COMPOSE_FILE_NAMES = [
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yml",
  "compose.yaml",
];

async function findDockerfile(repoDir: string, depth = 0): Promise<string | null> {
  if (depth > 5) return null;

  const entries = await readdir(repoDir, { withFileTypes: true });
  const rootDockerfile = entries.find(
    (entry) => entry.isFile() && entry.name.toLowerCase() === "dockerfile"
  );
  if (rootDockerfile) {
    return path.join(repoDir, rootDockerfile.name);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const nestedPath = path.join(repoDir, entry.name);
    const nestedDockerfile = await findDockerfile(nestedPath, depth + 1);
    if (nestedDockerfile) return nestedDockerfile;
  }

  return null;
}

async function findComposeFile(repoDir: string, depth = 0): Promise<string | null> {
  if (depth > 5) return null;

  const entries = await readdir(repoDir, { withFileTypes: true });
  for (const filename of COMPOSE_FILE_NAMES) {
    const composeFile = entries.find((entry) => entry.isFile() && entry.name === filename);
    if (composeFile) {
      return path.join(repoDir, composeFile.name);
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const nestedPath = path.join(repoDir, entry.name);
    const nestedCompose = await findComposeFile(nestedPath, depth + 1);
    if (nestedCompose) return nestedCompose;
  }

  return null;
}

function inferPortFromCompose(fileContents: string) {
  const explicit3000Match = fileContents.match(/["']?(\d{2,5}):3000["']?/);
  if (explicit3000Match) {
    return Number(explicit3000Match[1]);
  }

  const firstPortMatch = fileContents.match(/["']?(\d{2,5}):(\d{2,5})["']?/);
  if (firstPortMatch) {
    return Number(firstPortMatch[1]);
  }

  return 3000;
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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const repoUrlParam = requestUrl.searchParams.get("repoUrl");
  const repoUrlRaw =
    repoUrlParam && /^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?\/?$/.test(repoUrlParam)
      ? repoUrlParam.replace(/\/$/, "")
      : "https://github.com/richardwaters9049/DockerScripts.git";

  const repoUrl = repoUrlRaw.endsWith(".git") ? repoUrlRaw : `${repoUrlRaw}.git`;
  const repoNameFromUrl = repoUrl.split("/").pop()?.replace(/\.git$/i, "") || "DockerScripts";
  const safeRepoName = repoNameFromUrl.replace(/[^a-zA-Z0-9._-]/g, "") || "DockerScripts";

  const demoRoot = "/tmp/docker-demo-workspace";
  const repoDir = path.join(demoRoot, safeRepoName);
  const imageName = safeRepoName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const containerName = `${imageName}-demo`;
  const hostPort = 3010;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          eventChunk("command", {
            line: `# ${safeRepoName}`,
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

        const setupCommands = [
          {
            line: `$ rm -rf ${repoDir}`,
            command: `rm -rf ${escapeShellArg(repoDir)}`,
          },
          {
            line: `$ git clone ${repoUrl}`,
            command: `git clone ${escapeShellArg(repoUrl)} ${escapeShellArg(repoDir)}`,
          },
          {
            line: `$ cd ${safeRepoName}`,
            command: `test -d ${escapeShellArg(repoDir)}`,
          },
        ];

        for (const step of setupCommands) {
          controller.enqueue(eventChunk("command", { line: step.line }));

          await runCommand(step.command, undefined, (line) => {
            controller.enqueue(eventChunk("log", { line }));
          });
        }

        const dockerfilePath = await findDockerfile(repoDir);
        const composeFilePath = dockerfilePath ? null : await findComposeFile(repoDir);
        if (!dockerfilePath && !composeFilePath) {
          throw new Error(
            `No Dockerfile or docker compose file found in ${repoDir}. Add one to this repository.`
          );
        }

        let previewHostPort = hostPort;
        const runCommands: Array<{ line: string; command: string }> = [];

        if (dockerfilePath) {
          const buildContext = path.dirname(dockerfilePath);
          const buildLine =
            buildContext === repoDir
              ? `$ docker build -t ${imageName} .`
              : `$ docker build -t ${imageName} -f ${dockerfilePath} ${buildContext}`;

          runCommands.push({
            line: buildLine,
            command: `docker build -t ${escapeShellArg(imageName)} -f ${escapeShellArg(
              dockerfilePath
            )} ${escapeShellArg(buildContext)}`,
          });
          runCommands.push({
            line: `$ docker rm -f ${containerName} || true`,
            command: `docker rm -f ${escapeShellArg(containerName)} || true`,
          });
          runCommands.push({
            line: `$ docker run --rm -it -p 3000:3000 ${imageName}`,
            command: `docker run --rm -d --name ${escapeShellArg(containerName)} -p ${previewHostPort}:3000 ${escapeShellArg(imageName)}`,
          });
        } else if (composeFilePath) {
          const composeContents = await readFile(composeFilePath, "utf8");
          previewHostPort = inferPortFromCompose(composeContents);

          runCommands.push({
            line: `$ docker compose -f ${composeFilePath} down --remove-orphans || true`,
            command: `docker compose -f ${escapeShellArg(composeFilePath)} down --remove-orphans || true`,
          });
          runCommands.push({
            line: `$ docker compose -f ${composeFilePath} up --build -d`,
            command: `docker compose -f ${escapeShellArg(composeFilePath)} up --build -d`,
          });
        }

        for (const step of runCommands) {
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
            line: `> Mapped container port 3000 to host port ${previewHostPort} for in-window preview`,
          })
        );
        controller.enqueue(
          eventChunk("log", {
            line: `> Starting Next.js app on http://localhost:${previewHostPort}`,
          })
        );
        controller.enqueue(
          eventChunk("ready", {
            url: `http://localhost:${previewHostPort}`,
            containerName,
          })
        );
        controller.enqueue(eventChunk("done", { ok: true }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown error while running Docker demo";

        if (message.includes("Repository not found")) {
          controller.enqueue(
            eventChunk("log", {
              line: "! GitHub returned 'Repository not found'.",
            })
          );
          controller.enqueue(
            eventChunk("log", {
              line:
                "! Check repo URL spelling, or make the repo public for this demo endpoint.",
            })
          );
        }

        controller.enqueue(
          eventChunk("fatal", {
            line: message,
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
