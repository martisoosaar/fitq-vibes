import { NextRequest, NextResponse } from 'next/server';
import { rotateRefresh } from '@/lib/repo/auth';
import { signJwt } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('fitq_refresh');
  if (!cookie) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  const rotated = rotateRefresh(cookie.value);
  if (!rotated) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  const { rec, plain } = rotated;
  const access = await signJwt({ sub: rec.userId }, 900);
  const res = NextResponse.json({ access_token: access, token_type: 'Bearer', expires_in: 900 });
  res.cookies.set('fitq_refresh', plain, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
