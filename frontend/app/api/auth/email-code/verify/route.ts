import { NextRequest, NextResponse } from 'next/server';
import { validateLoginCode, markLoginCodeConsumed, createRefresh, createSession, findOrCreateUserByEmail } from '@/lib/repo/auth';
import { signJwt } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { challenge_id, code } = body;
  console.log('Verify request:', body);
  if (!challenge_id || !code) return NextResponse.json({ message: 'Invalid' }, { status: 400 });
  const rec = await validateLoginCode(challenge_id, code);
  if (!rec) return NextResponse.json({ message: 'Invalid or expired code' }, { status: 400 });

  let user;
  try {
    user = await findOrCreateUserByEmail(rec.email);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Juurdepääs keelatud' }, { status: 403 });
  }
  
  // Set a default device name based on user agent
  const userAgent = req.headers.get('user-agent') || '';
  let deviceName = 'Web Browser';
  if (userAgent.includes('Mobile')) deviceName = 'Mobile Browser';
  else if (userAgent.includes('Tablet')) deviceName = 'Tablet Browser';
  
  const session = await createSession(Number((user as any).id), deviceName, req.ip || undefined, req.headers.get('user-agent') || undefined);
  const { rec: refresh, plain } = await createRefresh(Number((user as any).id), session.id, 60 * 60 * 24 * 365);

  const access = await signJwt({ sub: Number((user as any).id), email: (user as any).email }, 900);
  const res = NextResponse.json({ access_token: access, token_type: 'Bearer', expires_in: 900 });
  res.cookies.set('fitq_refresh', plain, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  await markLoginCodeConsumed(challenge_id);
  return res;
}
