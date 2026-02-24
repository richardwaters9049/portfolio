import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { deleteDockerDemoSession, getDockerDemoSession } from "@/lib/docker-demo-store";

export const runtime = "nodejs";

function escapeShellArg(value: string) {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function containerNameFromRepoUrl(repoUrl: string) {
  const safeRepo = safeRepoNameFromRepoUrl(repoUrl);
  const imageName = safeRepo.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  return `${imageName}-demo`;
}

function safeRepoNameFromRepoUrl(repoUrl: string) {
  const withGit = repoUrl.endsWith(".git") ? repoUrl : `${repoUrl}.git`;
  const repoName = withGit.split("/").pop()?.replace(/\.git$/i, "") || "DockerScripts";
  return repoName.replace(/[^a-zA-Z0-9._-]/g, "") || "DockerScripts";
}

function repoDirFromRepoUrl(repoUrl: string) {
  const safeRepo = safeRepoNameFromRepoUrl(repoUrl);
  return path.join("/tmp/docker-demo-workspace", safeRepo);
}

const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);
const COMPOSE_FILE_NAMES = [
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yml",
  "compose.yaml",
];

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

function runStop(command: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("sh", ["-lc", command], {
      env: process.env,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed (${code})`));
    });
  });
}

export async function POST(request: Request) {
  try {
    let repoUrl = "https://github.com/richardwaters9049/DockerScripts.git";
    let containerName = "dockerscripts-demo";
    let sessionId: string | null = null;
    let sessionComposeFilePath: string | null = null;
    let sessionRepoDir: string | null = null;

    try {
      const payload = (await request.json()) as { repoUrl?: string; sessionId?: string };
      if (payload.sessionId) {
        sessionId = payload.sessionId;
        const session = getDockerDemoSession(payload.sessionId);
        if (session) {
          containerName = session.containerName;
          sessionComposeFilePath = session.composeFilePath;
          sessionRepoDir = session.repoDir;
        }
      }

      if (
        payload.repoUrl &&
        /^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?\/?$/.test(payload.repoUrl)
      ) {
        repoUrl = payload.repoUrl.replace(/\/$/, "");
        containerName = containerNameFromRepoUrl(repoUrl);
      }
    } catch {
      // Ignore invalid JSON payload.
    }

    await runStop(`docker rm -f ${escapeShellArg(containerName)} || true`);
    const repoDir = sessionRepoDir ?? repoDirFromRepoUrl(repoUrl);
    const composeFilePath =
      sessionComposeFilePath ?? (await findComposeFile(repoDir).catch(() => null));
    if (composeFilePath) {
      await runStop(
        `docker compose -f ${escapeShellArg(composeFilePath)} down --remove-orphans || true`
      );
    }
    await runStop(`rm -rf ${escapeShellArg(repoDir)} || true`);

    if (!sessionId) {
      const safeRepo = safeRepoNameFromRepoUrl(repoUrl);
      const imageName = safeRepo.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
      await runStop(
        `for cid in $(docker ps -aq --filter name='^/${imageName}-demo-'); do docker rm -f "$cid" || true; done`
      );
      await runStop(`rm -rf /tmp/docker-demo-workspace/${safeRepo}-* || true`);
    }

    if (sessionId) {
      deleteDockerDemoSession(sessionId);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to stop docker demo container",
      },
      { status: 500 }
    );
  }
}
