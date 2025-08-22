import crypto from 'crypto';
import { prisma } from '@/lib/db';

export async function createLoginCode(email: string, code: string, ttlSec = 600) {
  const challengeId = crypto.randomUUID();
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  await prisma.loginCode.create({
    data: {
      email: email.toLowerCase(),
      challengeId,
      codeHash,
      expiresAt: new Date(Date.now() + ttlSec * 1000),
    },
  });
  return { challengeId };
}

export async function validateLoginCode(challengeId: string, code: string) {
  const rec = await prisma.loginCode.findUnique({ where: { challengeId } });
  if (!rec) return null;
  if (rec.consumedAt || rec.expiresAt < new Date() || rec.attempts >= rec.maxAttempts) return null;
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  if (hash !== rec.codeHash) {
    await prisma.loginCode.update({ where: { id: rec.id }, data: { attempts: rec.attempts + 1 } });
    return null;
  }
  // Do not consume yet; caller will mark consumed after successful session creation
  return rec;
}

export async function markLoginCodeConsumed(challengeId: string) {
  await prisma.loginCode.update({ where: { challengeId }, data: { consumedAt: new Date(), attempts: { increment: 1 } } });
}

export async function findOrCreateUserByEmail(email: string) {
  const e = email.toLowerCase();
  const found = await prisma.users.findFirst({ where: { email: e } });
  if (found) {
    return found as any;
  }
  // Create minimal legacy user
  return prisma.users.create({ data: { email: e } }) as any;
}

export async function createSession(userId: number, deviceName?: string, ip?: string, ua?: string) {
  return prisma.deviceSession.create({ data: { userId, deviceName, ip, ua, lastUsedAt: new Date() } });
}

export async function listSessions(userId: number) {
  return prisma.deviceSession.findMany({ where: { userId }, orderBy: { lastUsedAt: 'desc' }, take: 50 });
}

export async function revokeAllSessions(userId: number) {
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function revokeBySession(userId: number, sessionId: number) {
  await prisma.refreshToken.updateMany({ where: { userId, deviceSessionId: sessionId }, data: { revokedAt: new Date() } });
}

export async function createRefresh(userId: number, deviceSessionId: number, ttlSec = 31536000) {
  const plain = crypto.randomBytes(32).toString('hex');
  const rec = await prisma.refreshToken.create({
    data: {
      userId,
      deviceSessionId,
      tokenHash: crypto.createHash('sha256').update(plain).digest('hex'),
      expiresAt: new Date(Date.now() + ttlSec * 1000),
    },
  });
  return { rec, plain };
}

export async function rotateRefresh(plain: string) {
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  const current = await prisma.refreshToken.findFirst({ where: { revokedAt: null, expiresAt: { gt: new Date() }, tokenHash: hash }, orderBy: { id: 'desc' } });
  if (!current) return null;
  await prisma.refreshToken.update({ where: { id: current.id }, data: { revokedAt: new Date() } });
  const next = await createRefresh(current.userId, current.deviceSessionId);
  return next;
}

export async function revokeByPlain(plain: string) {
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  const current = await prisma.refreshToken.findFirst({ where: { revokedAt: null, expiresAt: { gt: new Date() }, tokenHash: hash }, orderBy: { id: 'desc' } });
  if (current) await prisma.refreshToken.update({ where: { id: current.id }, data: { revokedAt: new Date() } });
}

export async function validateRefreshToken(plain: string) {
  const hash = crypto.createHash('sha256').update(plain).digest('hex');
  const token = await prisma.refreshToken.findFirst({ 
    where: { 
      revokedAt: null, 
      expiresAt: { gt: new Date() }, 
      tokenHash: hash 
    }, 
    orderBy: { id: 'desc' }
  });
  
  if (!token) return null;
  
  // Update session last used
  await prisma.deviceSession.update({
    where: { id: token.deviceSessionId },
    data: { lastUsedAt: new Date() }
  });
  
  return {
    userId: token.userId,
    sessionId: token.deviceSessionId
  };
}

