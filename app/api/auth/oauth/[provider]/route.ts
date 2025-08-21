import { NextRequest, NextResponse } from 'next/server';
import { Provider, buildAuthUrl, createPkcePair } from '@/lib/oauth';
import { signJwt } from '@/lib/jwt';

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider as Provider;
  const next = req.nextUrl.searchParams.get('next') || '/';
  const { verifier, challenge } = createPkcePair();
  const state = await signJwt({ p: provider, n: next }, 600);
  const redirectUrl = buildAuthUrl(provider, state, challenge);
  const res = NextResponse.redirect(redirectUrl);
  // Store verifier in httpOnly cookie (even if provider ignores it)
  res.cookies.set('fitq_oauth_cv', verifier, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
  return res;
}

