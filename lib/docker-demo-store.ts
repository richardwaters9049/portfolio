type DockerDemoSession = {
  sessionId: string;
  hostPort: number;
  containerPort: number;
  containerName: string;
  repoDir: string;
  composeFilePath: string | null;
  createdAt: number;
};

type DockerDemoStore = Map<string, DockerDemoSession>;

declare global {
  // eslint-disable-next-line no-var
  var __dockerDemoStore: DockerDemoStore | undefined;
}

const store: DockerDemoStore = global.__dockerDemoStore ?? new Map();

if (!global.__dockerDemoStore) {
  global.__dockerDemoStore = store;
}

export function setDockerDemoSession(session: DockerDemoSession) {
  store.set(session.sessionId, session);
}

export function getDockerDemoSession(sessionId: string) {
  return store.get(sessionId) ?? null;
}

export function deleteDockerDemoSession(sessionId: string) {
  store.delete(sessionId);
}
