import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'change-me');
const alg = 'HS256';

export async function signJwt(claims: JWTPayload, ttlSeconds = 900) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ ...claims })
    .setProtectedHeader({ alg })
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(secret);
}

export async function verifyJwt<T = JWTPayload>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, secret);
  return payload as T;
}

