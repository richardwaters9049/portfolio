import { getDockerDemoSession } from "@/lib/docker-demo-store";

type RouteParams = {
  sessionId: string;
  path?: string[];
};

async function proxyRequest(request: Request, params: RouteParams) {
  const session = getDockerDemoSession(params.sessionId);
  if (!session) {
    return new Response("Preview session not found", { status: 404 });
  }

  const incomingUrl = new URL(request.url);
  const subpath = params.path?.join("/") ?? "";
  const targetUrl = new URL(`http://127.0.0.1:${session.hostPort}/${subpath}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.set("host", `127.0.0.1:${session.hostPort}`);
  headers.delete("content-length");
  headers.delete("connection");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, { params }: { params: RouteParams }) {
  return proxyRequest(request, params);
}

export async function POST(request: Request, { params }: { params: RouteParams }) {
  return proxyRequest(request, params);
}

export async function PUT(request: Request, { params }: { params: RouteParams }) {
  return proxyRequest(request, params);
}

export async function PATCH(request: Request, { params }: { params: RouteParams }) {
  return proxyRequest(request, params);
}

export async function DELETE(request: Request, { params }: { params: RouteParams }) {
  return proxyRequest(request, params);
}

export async function OPTIONS(request: Request, { params }: { params: RouteParams }) {
  return proxyRequest(request, params);
}
