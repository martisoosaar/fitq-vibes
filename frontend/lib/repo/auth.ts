import crypto from 'crypto';
import { prisma } from '@/lib/db';

export async function createLoginCode(email: string, code: string, ttlSec = 600) {
  const challengeId = crypto.randomUUID();
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const rec = await prisma.loginCode.create({
    data: {
      email: email.toLowerCase(),
      challengeId,
      codeHash,
      expiresAt: new Date(Date.now() + ttlSec * 1000),
    },
  });
  return rec;
}

export async function consumeLoginCode(challengeId: string, code: string) {
  const rec = await prisma.loginCode.findUnique({ where: { challengeId } });
  if (!rec) return null;
  if (rec.consumedAt || rec.expiresAt < new Date() || rec.attempts >= rec.maxAttempts) return null;
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  const attempts = rec.attempts + 1;
  if (hash !== rec.codeHash) {
    await prisma.loginCode.update({ where: { id: rec.id }, data: { attempts } });
    return null;
  }
  const updated = await prisma.loginCode.update({ where: { id: rec.id }, data: { attempts, consumedAt: new Date() } });
  return updated;
}

export async function findOrCreateUserByEmail(email: string) {
  const e = email.toLowerCase();
  const found = await prisma.user.findUnique({ where: { email: e } });
  if (found) {
    // Block login for deleted users
    if (found.deletedAt) {
      throw new Error('Kasutaja on kustutatud ja ei saa sisse logida');
    }
    return found;
  }
  return prisma.user.create({ data: { email: e } });
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
    orderBy: { id: 'desc' },
    include: {
      user: true
    }
  });
  
  if (!token) return null;
  
  // Block access for deleted users
  if (token.user.deletedAt) {
    return null;
  }
  
  // Update session last used
  await prisma.deviceSession.update({
    where: { id: token.deviceSessionId },
    data: { lastUsedAt: new Date() }
  });
  
  return token;
}

