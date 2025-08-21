// In-memory storage for skeleton purposes. Replace with DB (Prisma).
import crypto from 'crypto';

export type LoginCode = {
  email: string;
  challengeId: string;
  codeHash: string;
  expiresAt: number; // epoch seconds
  attempts: number;
  maxAttempts: number;
  consumedAt?: number;
};

export type DeviceSession = {
  id: number;
  userId: number;
  deviceName?: string;
  ip?: string;
  ua?: string;
  lastUsedAt?: number;
};

export type RefreshToken = {
  id: number;
  userId: number;
  deviceSessionId: number;
  tokenHash: string;
  revokedAt?: number;
  expiresAt: number;
};

export type User = { id: number; email: string; name?: string };

export const db = {
  codes: new Map<string, LoginCode>(),
  users: new Map<number, User>(),
  usersByEmail: new Map<string, User>(),
  sessions: new Map<number, DeviceSession>(),
  refresh: new Map<number, RefreshToken>(),
};

let seq = 1;
function nextId() {
  return seq++;
}

export function createLoginCode(email: string, code: string, ttlSec = 600) {
  const challengeId = crypto.randomUUID();
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const rec: LoginCode = {
    email: email.toLowerCase(),
    challengeId,
    codeHash,
    expiresAt: Math.floor(Date.now() / 1000) + ttlSec,
    attempts: 0,
    maxAttempts: 5,
  };
  db.codes.set(challengeId, rec);
  return rec;
}

export function consumeLoginCode(challengeId: string, code: string): LoginCode | null {
  const rec = db.codes.get(challengeId);
  if (!rec) return null;
  const now = Math.floor(Date.now() / 1000);
  if (rec.consumedAt || rec.expiresAt < now || rec.attempts >= rec.maxAttempts) return null;
  rec.attempts++;
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  if (hash !== rec.codeHash) return null;
  rec.consumedAt = now;
  db.codes.set(challengeId, rec);
  return rec;
}

export function findOrCreateUserByEmail(email: string): User {
  const e = email.toLowerCase();
  const existing = db.usersByEmail.get(e);
  if (existing) return existing;
  const u: User = { id: nextId(), email: e };
  db.users.set(u.id, u);
  db.usersByEmail.set(e, u);
  return u;
}

export function createSession(userId: number, deviceName: string | undefined, ip?: string, ua?: string) {
  const s: DeviceSession = { id: nextId(), userId, deviceName, ip, ua, lastUsedAt: Math.floor(Date.now() / 1000) };
  db.sessions.set(s.id, s);
  return s;
}

export function listSessions(userId: number) {
  return Array.from(db.sessions.values()).filter((s) => s.userId === userId);
}

export function revokeAllSessions(userId: number) {
  Array.from(db.refresh.values()).forEach((r) => {
    if (r.userId === userId) r.revokedAt = Math.floor(Date.now() / 1000);
  });
}

export function revokeBySession(userId: number, sessionId: number) {
  Array.from(db.refresh.values()).forEach((r) => {
    if (r.userId === userId && r.deviceSessionId === sessionId) r.revokedAt = Math.floor(Date.now() / 1000);
  });
}

export function createRefresh(userId: number, deviceSessionId: number, ttlSec = 31536000) {
  const plain = crypto.randomBytes(32).toString('hex');
  const rec: RefreshToken = {
    id: nextId(),
    userId,
    deviceSessionId,
    tokenHash: crypto.createHash('sha256').update(plain).digest('hex'),
    expiresAt: Math.floor(Date.now() / 1000) + ttlSec,
  };
  db.refresh.set(rec.id, rec);
  return { rec, plain };
}

export function rotateRefresh(plain: string) {
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  const now = Math.floor(Date.now() / 1000);
  const current = Array.from(db.refresh.values()).find((r) => !r.revokedAt && r.expiresAt > now && r.tokenHash === hash);
  if (!current) return null;
  current.revokedAt = now;
  db.refresh.set(current.id, current);
  const next = createRefresh(current.userId, current.deviceSessionId);
  return next;
}

export function revokeByPlain(plain: string) {
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  const now = Math.floor(Date.now() / 1000);
  const current = Array.from(db.refresh.values()).find((r) => !r.revokedAt && r.expiresAt > now && r.tokenHash === hash);
  if (current) {
    current.revokedAt = now;
    db.refresh.set(current.id, current);
  }
}

