import { NextRequest, NextResponse } from 'next/server';
import { listSessions, revokeAllSessions } from '@/lib/repo/auth';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  if (!token) return NextResponse.json({ sessions: [] });
  try {
    const claims = await verifyJwt<{ sub: number }>(token);
    const sessions = listSessions(Number(claims.sub)).map((s) => ({
      id: s.id,
      device_name: s.deviceName || null,
      ip_address: s.ip || null,
      last_used_at: s.lastUsedAt ? new Date(s.lastUsedAt * 1000).toISOString() : null,
    }));
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ sessions: [] });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  if (!token) return NextResponse.json(null, { status: 204 });
  try {
    const claims = await verifyJwt<{ sub: number }>(token);
    revokeAllSessions(Number(claims.sub));
  } catch {}
  return NextResponse.json(null, { status: 204 });
}
