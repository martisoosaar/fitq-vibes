import { NextRequest, NextResponse } from 'next/server';
import { Provider, exchangeCode, fetchUser } from '@/lib/oauth';
import { signJwt } from '@/lib/jwt';
import { createRefresh, createSession, findOrCreateUserByEmail } from '@/lib/repo/auth';

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider as Provider;
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  if (!code || !state) return NextResponse.redirect('/login?error=oauth');

  const codeVerifier = req.cookies.get('fitq_oauth_cv')?.value;

  try {
    // Verify state JWT and extract next path
    const { verifyJwt } = await import('@/lib/jwt');
    let nextPath = '/dashboard';
    try {
      const stateData = await verifyJwt<{ p: string; n: string }>(state);
      nextPath = stateData.n || '/dashboard';
    } catch (e) {
      // If state verification fails, continue but redirect to default
      console.error('State verification failed:', e);
    }

    const tokens = await exchangeCode(provider, code, codeVerifier);
    const profile = await fetchUser(provider, tokens);
    if (!profile.email) return NextResponse.redirect('/login?error=noemail');
    
    const user = await findOrCreateUserByEmail(profile.email);
    
    // Update user name if provided by OAuth provider
    if (profile.name && !user.name) {
      const { prisma } = await import('@/lib/db');
      await prisma.user.update({
        where: { id: user.id },
        data: { name: profile.name }
      });
    }
    
    const session = await createSession(user.id, `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login`, req.ip || undefined, req.headers.get('user-agent') || undefined);
    const { plain } = await createRefresh(user.id, session.id, 60 * 60 * 24 * 365);
    const access = await signJwt({ sub: user.id, email: user.email }, 900);
    
    const res = NextResponse.redirect(nextPath);
    res.cookies.set('fitq_refresh', plain, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    // Clear OAuth verifier cookie
    res.cookies.set('fitq_oauth_cv', '', { httpOnly: true, path: '/', maxAge: 0 });
    return res;
  } catch (e) {
    console.error('OAuth callback error:', e);
    return NextResponse.redirect('/login?error=oauth');
  }
}

