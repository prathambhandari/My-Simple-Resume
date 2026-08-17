import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export const SETUP_PATH = "/setup";

const USERS = Math.max(
  1,
  Number.parseInt(process.env.FREE_POOL_USERS || "20", 10) || 20,
);
const PER_USER = Math.max(
  1,
  Number.parseInt(process.env.FREE_MESSAGES_PER_USER || "20", 10) || 20,
);
const GLOBAL_LIMIT = USERS * PER_USER;

type PoolState = {
  day: string;
  global: number;
  byIp: Record<string, number>;
};

export type PoolStatus = {
  exhausted: boolean;
  remainingGlobal: number;
  remainingIp: number;
};

let cache: PoolState | null = null;
let lock = Promise.resolve();

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function poolPath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "simple-resume-free-pool.json");
  }
  return path.join(process.cwd(), ".data", "free-pool.json");
}

function emptyState(): PoolState {
  return { day: todayUtc(), global: 0, byIp: {} };
}

function withLock<T>(fn: () => Promise<T>) {
  const run = lock.then(fn, fn);
  lock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function loadState(): Promise<PoolState> {
  if (cache && cache.day === todayUtc()) return cache;
  try {
    const raw = await readFile(poolPath(), "utf8");
    const parsed = JSON.parse(raw) as PoolState;
    if (
      parsed &&
      parsed.day === todayUtc() &&
      typeof parsed.global === "number" &&
      parsed.byIp &&
      typeof parsed.byIp === "object"
    ) {
      cache = parsed;
      return parsed;
    }
  } catch {
    // missing or unreadable file
  }
  cache = emptyState();
  return cache;
}

async function saveState(state: PoolState) {
  cache = state;
  const file = poolPath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(state));
}

function fingerprintIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

function toStatus(state: PoolState, ipKey: string): PoolStatus {
  const remainingGlobal = Math.max(0, GLOBAL_LIMIT - state.global);
  const remainingIp = Math.max(0, PER_USER - (state.byIp[ipKey] || 0));
  return {
    remainingGlobal,
    remainingIp,
    exhausted: remainingGlobal <= 0 || remainingIp <= 0,
  };
}

export async function getPoolStatus(ip: string): Promise<PoolStatus> {
  return withLock(async () => {
    const state = await loadState();
    return toStatus(state, fingerprintIp(ip));
  });
}

export async function consumeFreeChat(
  ip: string,
): Promise<{ ok: true } | { ok: false; status: PoolStatus }> {
  return withLock(async () => {
    const state = await loadState();
    const ipKey = fingerprintIp(ip);
    const status = toStatus(state, ipKey);
    if (status.exhausted) return { ok: false, status };
    state.global += 1;
    state.byIp[ipKey] = (state.byIp[ipKey] || 0) + 1;
    await saveState(state);
    return { ok: true };
  });
}

export function poolExhaustedMessage() {
  return `Today's free chats are used up. They are shared by about ${USERS} people, so they ran out for today.

You can keep going in about two minutes. You don't need to know how to code — just add a free key.

${SETUP_PATH}`;
}
