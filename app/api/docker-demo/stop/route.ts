import { spawn } from "node:child_process";

export const runtime = "nodejs";

function escapeShellArg(value: string) {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function containerNameFromRepoUrl(repoUrl: string) {
  const withGit = repoUrl.endsWith(".git") ? repoUrl : `${repoUrl}.git`;
  const repoName = withGit.split("/").pop()?.replace(/\.git$/i, "") || "DockerScripts";
  const safeRepo = repoName.replace(/[^a-zA-Z0-9._-]/g, "") || "DockerScripts";
  const imageName = safeRepo.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  return `${imageName}-demo`;
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
    let containerName = "dockerscripts-demo";

    try {
      const payload = (await request.json()) as { repoUrl?: string };
      if (
        payload.repoUrl &&
        /^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?\/?$/.test(payload.repoUrl)
      ) {
        containerName = containerNameFromRepoUrl(payload.repoUrl.replace(/\/$/, ""));
      }
    } catch {
      // Ignore invalid JSON payload.
    }

    await runStop(`docker rm -f ${escapeShellArg(containerName)} || true`);
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
