import { setTimeout as nodeSetTimeout } from "timers";

type Entry = {
  password: string;
  expiresAt: number;
  timeoutId: ReturnType<typeof nodeSetTimeout>;
};

const store = new Map<string, Entry>();

export function setTempPassword(
  token: string,
  password: string,
  ttlMs = 120000,
) {
  const expiresAt = Date.now() + ttlMs;

  if (store.has(token)) {
    const prev = store.get(token)!;
    clearTimeout(prev.timeoutId as any);
  }

  const timeoutId = nodeSetTimeout(() => {
    store.delete(token);
  }, ttlMs);

  store.set(token, { password, expiresAt, timeoutId });
}

export function getAndDeleteTempPassword(token: string) {
  const entry = store.get(token);
  if (!entry) return null;
  store.delete(token);
  clearTimeout(entry.timeoutId as any);
  return { password: entry.password, expiresAt: entry.expiresAt };
}

export function hasToken(token: string) {
  return store.has(token);
}

export default { setTempPassword, getAndDeleteTempPassword, hasToken };
