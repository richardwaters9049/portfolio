import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setDockerDemoSession } from "@/lib/docker-demo-store";

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

async function findFileByName(
  repoDir: string,
  filename: string,
  depth = 0
): Promise<string | null> {
  if (depth > 5) return null;

  const entries = await readdir(repoDir, { withFileTypes: true });
  const file = entries.find((entry) => entry.isFile() && entry.name === filename);
  if (file) {
    return path.join(repoDir, file.name);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const nestedPath = path.join(repoDir, entry.name);
    const nestedFile = await findFileByName(nestedPath, filename, depth + 1);
    if (nestedFile) return nestedFile;
  }

  return null;
}

function inferPortFromScript(scriptValue?: string) {
  if (!scriptValue) return 3000;

  const withDoubleDash = scriptValue.match(/(?:--port|-p)(?:=|\s+)(\d{2,5})/);
  if (withDoubleDash) return Number(withDoubleDash[1]);

  const envStyle = scriptValue.match(/\bPORT=(\d{2,5})\b/);
  if (envStyle) return Number(envStyle[1]);

  return 3000;
}

function jsonCommand(command: string) {
  return JSON.stringify(["sh", "-c", command]);
}

async function createDockerfileIfMissing(repoDir: string): Promise<{
  dockerfilePath: string;
  previewPort: number;
  source: "generated-node" | "generated-python" | "generated-generic";
}> {
  const packageJsonPath = await findFileByName(repoDir, "package.json");
  if (packageJsonPath) {
    const appDir = path.dirname(packageJsonPath);
    const packageJsonRaw = await readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonRaw) as {
      scripts?: Record<string, string>;
    };

    const startScript = packageJson.scripts?.start;
    const devScript = packageJson.scripts?.dev;
    const buildScript = packageJson.scripts?.build;
    const previewPort = inferPortFromScript(startScript ?? devScript);
    const runCommand = startScript
      ? `npm run start -- --hostname 0.0.0.0 --port ${previewPort}`
      : devScript
        ? `npm run dev -- --hostname 0.0.0.0 --port ${previewPort}`
        : `node server.js`;

    const dockerfilePath = path.join(appDir, "Dockerfile");
    const dockerfileContent = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
${buildScript ? "RUN npm run build\n" : ""}EXPOSE ${previewPort}
CMD ${jsonCommand(runCommand)}
`;

    await writeFile(dockerfilePath, dockerfileContent, "utf8");
    return { dockerfilePath, previewPort, source: "generated-node" };
  }

  const requirementsPath = await findFileByName(repoDir, "requirements.txt");
  if (requirementsPath) {
    const appDir = path.dirname(requirementsPath);
    const appPyPath = await findFileByName(appDir, "app.py");
    const mainPyPath = await findFileByName(appDir, "main.py");

    const runner = appPyPath
      ? "python app.py"
      : mainPyPath
        ? "python main.py"
        : "python -m http.server 3000";
    const previewPort = 3000;
    const dockerfilePath = path.join(appDir, "Dockerfile");
    const dockerfileContent = `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE ${previewPort}
CMD ${jsonCommand(runner)}
`;

    await writeFile(dockerfilePath, dockerfileContent, "utf8");
    return { dockerfilePath, previewPort, source: "generated-python" };
  }

  const previewPort = 3000;
  const dockerfilePath = path.join(repoDir, "Dockerfile");
  const dockerfileContent = `FROM python:3.11-slim
WORKDIR /app
COPY . .
EXPOSE ${previewPort}
CMD ${jsonCommand(`python -m http.server ${previewPort} --bind 0.0.0.0`)}
`;

  await writeFile(dockerfilePath, dockerfileContent, "utf8");
  return { dockerfilePath, previewPort, source: "generated-generic" };
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
  return new Promise<string[]>((resolve, reject) => {
    const child = spawn("sh", ["-lc", command], {
      cwd,
      env: process.env,
    });
    const capturedLines: string[] = [];

    child.stdout.on("data", (chunk) => {
      for (const line of splitOutput(String(chunk))) {
        capturedLines.push(line);
        onLine(line);
      }
    });

    child.stderr.on("data", (chunk) => {
      for (const line of splitOutput(String(chunk))) {
        capturedLines.push(line);
        onLine(line);
      }
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(capturedLines);
        return;
      }

      const summary = capturedLines.slice(-12).join("\n");
      reject(
        new Error(
          summary
            ? `Command failed (${code}): ${command}\n${summary}`
            : `Command failed (${code}): ${command}`
        )
      );
    });
  });
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function waitForHttpReady(port: number, timeoutMs = 60000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}`, {
        redirect: "manual",
        cache: "no-store",
      });

      if (response.status >= 200 && response.status < 500) {
        return true;
      }
    } catch {
      // Keep polling until timeout.
    }

    await sleep(500);
  }

  return false;
}

async function resolveContainerHostPort(
  containerName: string,
  containerPort: number,
  onLine: (line: string) => void
) {
  const portLines = await runCommand(
    `docker port ${escapeShellArg(containerName)} ${containerPort}/tcp`,
    undefined,
    onLine
  );
  const joined = portLines.join(" ");
  const match = joined.match(/:(\d{2,5})\b/);
  if (!match) {
    throw new Error(
      `Could not resolve mapped host port for ${containerName} (${containerPort}/tcp)`
    );
  }

  return Number(match[1]);
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
  const sessionId = randomUUID();
  const sessionKey = sessionId.replace(/-/g, "").slice(0, 12);

  const demoRoot = "/tmp/docker-demo-workspace";
  const repoDir = path.join(demoRoot, `${safeRepoName}-${sessionKey}`);
  const imageNameBase = safeRepoName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const imageName = `${imageNameBase}:${sessionKey}`;
  const containerName = `${imageNameBase}-demo-${sessionKey}`;

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

        let dockerfilePath = await findDockerfile(repoDir);
        const composeFilePath = dockerfilePath ? null : await findComposeFile(repoDir);
        let generatedDockerPort: number | null = null;

        if (!dockerfilePath && !composeFilePath) {
          const generated = await createDockerfileIfMissing(repoDir);
          dockerfilePath = generated.dockerfilePath;
          generatedDockerPort = generated.previewPort;
          controller.enqueue(
            eventChunk("log", {
              line: `> Auto-generated Dockerfile at ${generated.dockerfilePath} (${generated.source})`,
            })
          );
        }

        let previewHostPort = 3000;
        let previewContainerPort = 3000;
        let activeComposePath: string | null = null;
        const runCommands: Array<{ line: string; command: string }> = [];

        if (dockerfilePath) {
          const buildContext = path.dirname(dockerfilePath);
          previewContainerPort = generatedDockerPort ?? 3000;
          previewHostPort = 3000;
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
        } else if (composeFilePath) {
          const composeContents = await readFile(composeFilePath, "utf8");
          previewHostPort = inferPortFromCompose(composeContents);
          previewContainerPort = 3000;
          activeComposePath = composeFilePath;

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

        if (dockerfilePath) {
          const preferredRunLine = `$ docker run --rm -it -p ${previewHostPort}:${previewContainerPort} ${imageName}`;
          const preferredRunCommand = `docker run --rm -d --name ${escapeShellArg(containerName)} -p ${previewHostPort}:${previewContainerPort} ${escapeShellArg(imageName)}`;

          controller.enqueue(eventChunk("command", { line: preferredRunLine }));
          try {
            await runCommand(preferredRunCommand, undefined, (line) => {
              controller.enqueue(eventChunk("log", { line }));
            });
            controller.enqueue(
              eventChunk("log", {
                line: "> Host port 3000 is available and was used.",
              })
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const isPortConflict =
              message.includes("address already in use") ||
              message.includes("port is already allocated");

            if (!isPortConflict) {
              throw error;
            }

            controller.enqueue(
              eventChunk("log", {
                line:
                  "> Host port 3000 is busy; retrying with an auto-assigned port.",
              })
            );

            await runCommand(
              `docker rm -f ${escapeShellArg(containerName)} || true`,
              undefined,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              }
            );

            const autoRunLine = `$ docker run --rm -it -p <auto>:${previewContainerPort} ${imageName}`;
            const autoRunCommand = `docker run --rm -d --name ${escapeShellArg(containerName)} -p 127.0.0.1::${previewContainerPort} ${escapeShellArg(imageName)}`;
            controller.enqueue(eventChunk("command", { line: autoRunLine }));
            await runCommand(autoRunCommand, undefined, (line) => {
              controller.enqueue(eventChunk("log", { line }));
            });

            previewHostPort = await resolveContainerHostPort(
              containerName,
              previewContainerPort,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              }
            );
          }
        }

        const ready = await waitForHttpReady(previewHostPort, 45000);
        if (!ready) {
          throw new Error(
            `Container started but did not serve HTTP on localhost:${previewHostPort} within 45 seconds`
          );
        }

        const proxyUrl = `${requestUrl.origin}/api/docker-demo/preview/${sessionId}`;
        setDockerDemoSession({
          sessionId,
          hostPort: previewHostPort,
          containerPort: previewContainerPort,
          containerName,
          repoDir,
          composeFilePath: activeComposePath,
          createdAt: Date.now(),
        });

        controller.enqueue(
          eventChunk("log", { line: "> Booting containers..." })
        );
        controller.enqueue(
          eventChunk("log", { line: "> Installing dependencies..." })
        );
        controller.enqueue(
          eventChunk("log", {
            line: `> Mapped container port ${previewContainerPort} to host port ${previewHostPort} for in-window preview`,
          })
        );
        controller.enqueue(
          eventChunk("log", {
            line: `> Starting app preview at ${proxyUrl}`,
          })
        );
        controller.enqueue(
          eventChunk("ready", {
            sessionId,
            url: proxyUrl,
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
