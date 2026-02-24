import { spawn } from "node:child_process";

export const runtime = "nodejs";

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

export async function POST() {
  try {
    await runStop("docker rm -f pynext-scriptatest-demo || true");
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
