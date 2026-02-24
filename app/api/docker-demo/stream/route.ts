import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setDockerDemoSession } from "@/lib/docker-demo-store";

export const runtime = "nodejs";

const encoder = new TextEncoder();
const DEFAULT_APP_PORT = 8080;
const LEGACY_APP_PORT = 3000;

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

async function findDockerfile(
  repoDir: string,
  depth = 0,
): Promise<string | null> {
  if (depth > 5) return null;

  const entries = await readdir(repoDir, { withFileTypes: true });
  const rootDockerfiles = entries
    .filter((entry) => {
      const name = entry.name.toLowerCase();
      return (
        entry.isFile() &&
        (name.startsWith("dockerfile") || name === "dockerfile.dockerhub")
      );
    })
    .sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      if (aLower === "dockerfile") return -1;
      if (bLower === "dockerfile") return 1;
      return a.name.length - b.name.length;
    });
  if (rootDockerfiles.length > 0) {
    return path.join(repoDir, rootDockerfiles[0].name);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) continue;

    const nestedPath = path.join(repoDir, entry.name);
    const nestedDockerfile = await findDockerfile(nestedPath, depth + 1);
    if (nestedDockerfile) return nestedDockerfile;
  }

  // Check for dockerhub variant in current directory if no standard dockerfile found
  const dockerhubFile = entries.find(
    (entry) => entry.isFile() && entry.name === "Dockerfile.dockerhub",
  );
  if (dockerhubFile) {
    return path.join(repoDir, dockerhubFile.name);
  }

  return null;
}

async function findComposeFile(
  repoDir: string,
  depth = 0,
): Promise<string | null> {
  if (depth > 5) return null;

  const entries = await readdir(repoDir, { withFileTypes: true });
  for (const filename of COMPOSE_FILE_NAMES) {
    const composeFile = entries.find(
      (entry) => entry.isFile() && entry.name === filename,
    );
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
  depth = 0,
): Promise<string | null> {
  if (depth > 5) return null;

  const entries = await readdir(repoDir, { withFileTypes: true });
  const file = entries.find(
    (entry) => entry.isFile() && entry.name === filename,
  );
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
  if (!scriptValue) return DEFAULT_APP_PORT;

  const withDoubleDash = scriptValue.match(/(?:--port|-p)(?:=|\s+)(\d{2,5})/);
  if (withDoubleDash) return Number(withDoubleDash[1]);

  const envStyle = scriptValue.match(/\bPORT=(\d{2,5})\b/);
  if (envStyle) return Number(envStyle[1]);

  return DEFAULT_APP_PORT;
}

function jsonCommand(command: string) {
  return JSON.stringify(["sh", "-c", command]);
}

async function createDockerfileIfMissing(repoDir: string): Promise<{
  dockerfilePath: string;
  previewPort: number;
  source:
    | "generated-node"
    | "generated-python"
    | "generated-generic"
    | "generated-docker-cli";
}> {
  // Check for Docker CLI tools (like docker_pyNext_v3)
  const scriptsDir = await findFileByName(repoDir, "docker_pyNext_v3");
  if (scriptsDir) {
    const previewPort = DEFAULT_APP_PORT;
    const dockerfilePath = path.join(repoDir, "Dockerfile");
    const dockerfileContent = `FROM docker:27-cli

RUN apk add --no-cache bash curl unzip libstdc++ libgcc
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$\{PATH}"

COPY scripts/docker_pyNext_v3 /usr/local/bin/docker_pyNext_v3
RUN chmod +x /usr/local/bin/docker_pyNext_v3

WORKDIR /workspace
EXPOSE ${previewPort}
CMD ["sh", "-c", "echo 'Docker CLI tools ready. Use docker_pyNext_v3 <project-name> to start.' && tail -f /dev/null"]
`;

    await writeFile(dockerfilePath, dockerfileContent, "utf8");
    return { dockerfilePath, previewPort, source: "generated-docker-cli" };
  }
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
        : `python -m http.server ${DEFAULT_APP_PORT}`;
    const previewPort = DEFAULT_APP_PORT;
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

  const previewPort = DEFAULT_APP_PORT;
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
  const explicitDefaultPortMatch = fileContents.match(
    new RegExp(`["']?(\\d{2,5}):${DEFAULT_APP_PORT}["']?`),
  );
  if (explicitDefaultPortMatch) {
    return Number(explicitDefaultPortMatch[1]);
  }

  const firstPortMatch = fileContents.match(/["']?(\d{2,5}):(\d{2,5})["']?/);
  if (firstPortMatch) {
    return Number(firstPortMatch[1]);
  }

  return DEFAULT_APP_PORT;
}

function runCommand(
  command: string,
  cwd: string | undefined,
  onLine: (line: string) => void,
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
            : `Command failed (${code}): ${command}`,
        ),
      );
    });
  });
}

function extractContainerId(lines: string[]) {
  const idPattern = /\b[a-f0-9]{12,64}\b/i;
  for (const line of lines) {
    const match = line.match(idPattern);
    if (match) return match[0];
  }
  return null;
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

async function waitForHttpReadyOrExit(
  port: number,
  containerTarget: string,
  timeoutMs = 60000,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (!(await isContainerRunning(containerTarget))) {
      return { ready: false, exitedEarly: true };
    }

    try {
      const response = await fetch(`http://127.0.0.1:${port}`, {
        redirect: "manual",
        cache: "no-store",
      });

      if (response.status >= 200 && response.status < 500) {
        return { ready: true, exitedEarly: false };
      }
    } catch {
      // Keep polling until timeout.
    }

    await sleep(500);
  }

  return { ready: false, exitedEarly: false };
}

async function isContainerRunning(containerTarget: string) {
  const lines = await runCommand(
    `docker inspect -f '{{.State.Running}}' ${escapeShellArg(containerTarget)} 2>/dev/null || true`,
    undefined,
    () => {
      // suppress inspect output in terminal stream
    },
  );

  return lines.some((line) => line.trim() === "true");
}

async function resolveContainerHostPort(
  containerName: string,
  containerPort: number,
  onLine: (line: string) => void,
) {
  const portLines = await runCommand(
    `docker port ${escapeShellArg(containerName)} ${containerPort}/tcp`,
    undefined,
    onLine,
  );
  const joined = portLines.join(" ");
  const match = joined.match(/:(\d{2,5})\b/);
  if (!match) {
    throw new Error(
      `Could not resolve mapped host port for ${containerName} (${containerPort}/tcp)`,
    );
  }

  return Number(match[1]);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const repoUrlParam = requestUrl.searchParams.get("repoUrl");
  const repoUrlRaw =
    repoUrlParam &&
    /^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?\/?$/.test(repoUrlParam)
      ? repoUrlParam.replace(/\/$/, "")
      : "https://github.com/richardwaters9049/DockerScripts.git";

  const repoUrl = repoUrlRaw.endsWith(".git")
    ? repoUrlRaw
    : `${repoUrlRaw}.git`;
  const repoNameFromUrl =
    repoUrl
      .split("/")
      .pop()
      ?.replace(/\.git$/i, "") || "DockerScripts";
  const safeRepoName =
    repoNameFromUrl.replace(/[^a-zA-Z0-9._-]/g, "") || "DockerScripts";
  const sessionId = randomUUID();
  const sessionKey = sessionId.replace(/-/g, "").slice(0, 12);

  const demoRoot = "/tmp/docker-demo-workspace";
  const repoDir = path.join(demoRoot, `${safeRepoName}-${sessionKey}`);
  const imageNameBase = safeRepoName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-");
  const imageName = `${imageNameBase}:${sessionKey}`;
  const containerName = `${imageNameBase}-demo-${sessionKey}`;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          eventChunk("command", {
            line: `# ${safeRepoName}`,
          }),
        );
        controller.enqueue(
          eventChunk("command", {
            line: "$ mkdir -p /tmp/docker-demo-workspace",
          }),
        );

        await runCommand(
          "mkdir -p /tmp/docker-demo-workspace",
          undefined,
          (line) => {
            controller.enqueue(eventChunk("log", { line }));
          },
        );

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
        const composeFilePath = dockerfilePath
          ? null
          : await findComposeFile(repoDir);
        let generatedDockerPort: number | null = null;

        if (!dockerfilePath && !composeFilePath) {
          const generated = await createDockerfileIfMissing(repoDir);
          dockerfilePath = generated.dockerfilePath;
          generatedDockerPort = generated.previewPort;
          controller.enqueue(
            eventChunk("log", {
              line: `> Auto-generated Dockerfile at ${generated.dockerfilePath} (${generated.source})`,
            }),
          );
        }

        let previewHostPort = DEFAULT_APP_PORT;
        let previewContainerPort = DEFAULT_APP_PORT;
        let launchedContainerId: string | null = null;
        let activeComposePath: string | null = null;
        const workspaceMountArg = `-v ${escapeShellArg(repoDir)}:/workspace`;
        const runCommands: Array<{ line: string; command: string }> = [];

        if (dockerfilePath) {
          const buildContext = path.dirname(dockerfilePath);
          previewContainerPort = generatedDockerPort ?? DEFAULT_APP_PORT;
          previewHostPort = DEFAULT_APP_PORT;
          const buildLine =
            buildContext === repoDir
              ? `$ docker build -t ${imageName} .`
              : `$ docker build -t ${imageName} -f ${dockerfilePath} ${buildContext}`;

          runCommands.push({
            line: buildLine,
            command: `docker build -t ${escapeShellArg(imageName)} -f ${escapeShellArg(
              dockerfilePath,
            )} ${escapeShellArg(buildContext)}`,
          });
          runCommands.push({
            line: `$ docker rm -f ${containerName} || true`,
            command: `docker rm -f ${escapeShellArg(containerName)} >/dev/null 2>&1 || true`,
          });
        } else if (composeFilePath) {
          const composeContents = await readFile(composeFilePath, "utf8");
          previewHostPort = inferPortFromCompose(composeContents);
          previewContainerPort = DEFAULT_APP_PORT;
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
          const legacyPortArg =
            previewContainerPort === LEGACY_APP_PORT
              ? ""
              : ` -p 127.0.0.1::${LEGACY_APP_PORT}`;
          const preferredRunLine = `$ docker run -it -p ${previewHostPort}:${previewContainerPort} ${imageName}`;
          const preferredRunCommand = `docker run -d --name ${escapeShellArg(containerName)} ${workspaceMountArg} -p ${previewHostPort}:${previewContainerPort}${legacyPortArg} ${escapeShellArg(imageName)}`;

          controller.enqueue(eventChunk("command", { line: preferredRunLine }));
          try {
            const runLines = await runCommand(
              preferredRunCommand,
              undefined,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              },
            );
            launchedContainerId = extractContainerId(runLines);
            controller.enqueue(
              eventChunk("log", {
                line: `> Host port ${DEFAULT_APP_PORT} is available and was used.`,
              }),
            );
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            const isPortConflict =
              message.includes("address already in use") ||
              message.includes("port is already allocated");

            if (!isPortConflict) {
              throw error;
            }

            controller.enqueue(
              eventChunk("log", {
                line: `> Host port ${DEFAULT_APP_PORT} is busy; retrying with an auto-assigned port.`,
              }),
            );

            await runCommand(
              `docker rm -f ${escapeShellArg(containerName)} >/dev/null 2>&1 || true`,
              undefined,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              },
            );

            const autoRunLine = `$ docker run -it -p <auto>:${previewContainerPort} ${imageName}`;
            const autoRunCommand = `docker run -d --name ${escapeShellArg(containerName)} ${workspaceMountArg} -p 127.0.0.1::${previewContainerPort}${legacyPortArg} ${escapeShellArg(imageName)}`;
            controller.enqueue(eventChunk("command", { line: autoRunLine }));
            const autoRunLines = await runCommand(
              autoRunCommand,
              undefined,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              },
            );
            launchedContainerId = extractContainerId(autoRunLines);

            previewHostPort = await resolveContainerHostPort(
              containerName,
              previewContainerPort,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              },
            );
            controller.enqueue(
              eventChunk("log", {
                line: `> Using auto-assigned host port ${previewHostPort}`,
              }),
            );
          }
        }

        const initialContainerTarget = launchedContainerId ?? containerName;
        let { ready, exitedEarly } = dockerfilePath
          ? await waitForHttpReadyOrExit(
              previewHostPort,
              initialContainerTarget,
              12000,
            )
          : {
              ready: await waitForHttpReady(previewHostPort, 45000),
              exitedEarly: false,
            };
        if (!ready) {
          controller.enqueue(
            eventChunk("log", {
              line: exitedEarly
                ? `! Container exited before app became ready on localhost:${previewHostPort}`
                : `! HTTP did not become ready on localhost:${previewHostPort} within timeout`,
            }),
          );
          const logsTarget = launchedContainerId ?? containerName;
          if (launchedContainerId) {
            controller.enqueue(
              eventChunk("log", {
                line: `> Inspecting container logs for ${launchedContainerId}`,
              }),
            );
          }
          const logLines = await runCommand(
            `docker logs --tail 80 ${escapeShellArg(logsTarget)} || true`,
            undefined,
            (line) => {
              controller.enqueue(eventChunk("log", { line }));
            },
          );

          const usageNeedsProjectArg = logLines.some((line) =>
            /docker-nextpy\s+<project-name>/i.test(line),
          );

          if (usageNeedsProjectArg && dockerfilePath) {
            const defaultProjectName = "demo-project";
            controller.enqueue(
              eventChunk("log", {
                line: "> Detected docker-nextpy CLI entrypoint; retrying with a default project name.",
              }),
            );

            await runCommand(
              `docker rm -f ${escapeShellArg(containerName)} >/dev/null 2>&1 || true`,
              undefined,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              },
            );

            const retryLegacyPortArg =
              previewContainerPort === LEGACY_APP_PORT
                ? ""
                : ` -p 127.0.0.1::${LEGACY_APP_PORT}`;
            const retryRunLine = `$ docker run -it -p <auto>:${previewContainerPort} ${imageName} ${defaultProjectName} (scaffold+serve)`;
            const bootstrapCommand = [
              "set -u",
              `export PATH="$PATH:/root/.bun/bin:/home/root/.bun/bin"`,
              `if ! command -v bun >/dev/null 2>&1; then if [ -x /root/.bun/bin/bun ]; then ln -sf /root/.bun/bin/bun /usr/local/bin/bun || true; fi; fi`,
              `if ! command -v bun >/dev/null 2>&1; then curl -fsSL https://bun.sh/install | bash || true; export PATH="$PATH:/root/.bun/bin:/home/root/.bun/bin"; fi`,
              `PROJECT_NAME=${defaultProjectName}`,
              `# Run docker_pyNext_v3 to create project structure, but skip docker-compose part`,
              `if command -v docker_pyNext_v3 >/dev/null 2>&1; then 
                docker_pyNext_v3 "$PROJECT_NAME" || true;
                # Remove docker-compose.yml since we can't run docker inside docker
                if [ -f "/workspace/$PROJECT_NAME/docker-compose.yml" ]; then 
                  rm -f "/workspace/$PROJECT_NAME/docker-compose.yml";
                  echo "Removed docker-compose.yml (not supported in container)";
                fi;
              else /usr/local/bin/docker_pyNext_v3 "$PROJECT_NAME" || true; fi`,
              `TARGET_DIR=""`,
              `if [ -d "/workspace/$PROJECT_NAME" ]; then TARGET_DIR="/workspace/$PROJECT_NAME"; fi`,
              `if [ -z "$TARGET_DIR" ]; then TARGET_DIR="$(find /workspace -maxdepth 5 -type d -name "$PROJECT_NAME" | head -n 1)"; fi`,
              `if [ -z "$TARGET_DIR" ]; then PKG_FILE="$(find /workspace -maxdepth 5 -type f -name package.json | head -n 1)"; if [ -n "$PKG_FILE" ]; then TARGET_DIR="$(dirname "$PKG_FILE")"; fi; fi`,
              `if [ -z "$TARGET_DIR" ]; then TARGET_DIR="/workspace"; fi`,
              `cd "$TARGET_DIR"`,
              `echo "Starting app from: $TARGET_DIR"`,
              `# Check for frontend directory first (docker_pyNext_v3 creates this structure)`,
              `if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then cd frontend && echo "Found frontend directory, switching to frontend"; fi`,
              `if command -v bun >/dev/null 2>&1 && [ -f package.json ]; then bun install || true; bun run dev --host 0.0.0.0 --port ${previewContainerPort} || bun run start -- --host 0.0.0.0 --port ${previewContainerPort} || bunx --yes serve . --listen ${previewContainerPort}; elif [ -f package.json ]; then npm install || true; npm run dev -- --hostname 0.0.0.0 --port ${previewContainerPort} || npm run start -- --hostname 0.0.0.0 --port ${previewContainerPort} || npx --yes serve . -l ${previewContainerPort}; elif command -v python3 >/dev/null 2>&1; then python3 -m http.server ${previewContainerPort} --bind 0.0.0.0; elif command -v python >/dev/null 2>&1; then python -m http.server ${previewContainerPort} --bind 0.0.0.0; else sh -c 'echo \"No runtime found to serve files\"; tail -f /dev/null'; fi`,
            ].join("; ");
            const retryRunCommand = `docker run -d --name ${escapeShellArg(containerName)} -e CI=1 -e NEXT_TELEMETRY_DISABLED=1 ${workspaceMountArg} -p 127.0.0.1::${previewContainerPort}${retryLegacyPortArg} --entrypoint sh ${escapeShellArg(imageName)} -lc ${escapeShellArg(bootstrapCommand)}`;
            controller.enqueue(eventChunk("command", { line: retryRunLine }));

            const retryRunLines = await runCommand(
              retryRunCommand,
              undefined,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              },
            );

            launchedContainerId = extractContainerId(retryRunLines);
            previewHostPort = await resolveContainerHostPort(
              containerName,
              previewContainerPort,
              (line) => {
                controller.enqueue(eventChunk("log", { line }));
              },
            );
            controller.enqueue(
              eventChunk("log", {
                line: `> Using auto-assigned host port ${previewHostPort}`,
              }),
            );

            controller.enqueue(
              eventChunk("log", {
                line: `> Waiting for app readiness on localhost:${previewHostPort} (up to 75s)...`,
              }),
            );

            ({ ready, exitedEarly } = await waitForHttpReadyOrExit(
              previewHostPort,
              launchedContainerId ?? containerName,
              75000,
            ));
            if (!ready && exitedEarly) {
              controller.enqueue(
                eventChunk("log", {
                  line: `! Container ${containerName} exited before becoming ready`,
                }),
              );
            }
            if (!ready) {
              controller.enqueue(
                eventChunk("log", {
                  line: `! Retry still did not become ready on localhost:${previewHostPort} within timeout`,
                }),
              );
              const retryLogsTarget = launchedContainerId ?? containerName;
              await runCommand(
                `docker logs --tail 80 ${escapeShellArg(retryLogsTarget)} || true`,
                undefined,
                (line) => {
                  controller.enqueue(eventChunk("log", { line }));
                },
              );
            }
          }

          if (!ready && previewContainerPort !== LEGACY_APP_PORT) {
            try {
              const legacyHostPort = await resolveContainerHostPort(
                containerName,
                LEGACY_APP_PORT,
                (line) => {
                  controller.enqueue(eventChunk("log", { line }));
                },
              );
              controller.enqueue(
                eventChunk("log", {
                  line: `> Trying legacy internal port ${LEGACY_APP_PORT} on host ${legacyHostPort}`,
                }),
              );

              const legacyReady = await waitForHttpReady(legacyHostPort, 45000);
              if (legacyReady) {
                previewHostPort = legacyHostPort;
                previewContainerPort = LEGACY_APP_PORT;
                ready = true;
                controller.enqueue(
                  eventChunk("log", {
                    line: `> App responded on legacy port mapping localhost:${legacyHostPort}`,
                  }),
                );
              }
            } catch {
              // No legacy mapping found; continue with normal failure path.
            }
          }

          if (!ready) {
            throw new Error(
              `Container started but did not serve HTTP on localhost:${previewHostPort} within 45 seconds`,
            );
          }
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
          eventChunk("log", { line: "> Booting containers..." }),
        );
        controller.enqueue(
          eventChunk("log", { line: "> Installing dependencies..." }),
        );
        controller.enqueue(
          eventChunk("log", {
            line: `> Mapped container port ${previewContainerPort} to host port ${previewHostPort} for in-window preview`,
          }),
        );
        controller.enqueue(
          eventChunk("log", {
            line: `> Starting app preview at ${proxyUrl}`,
          }),
        );
        controller.enqueue(
          eventChunk("ready", {
            sessionId,
            url: proxyUrl,
            containerName,
          }),
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
            }),
          );
          controller.enqueue(
            eventChunk("log", {
              line: "! Check repo URL spelling, or make the repo public for this demo endpoint.",
            }),
          );
        }

        controller.enqueue(
          eventChunk("fatal", {
            line: message,
          }),
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
