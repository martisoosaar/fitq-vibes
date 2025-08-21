import { NextRequest, NextResponse } from 'next/server';
import { revokeBySession } from '@/lib/repo/auth';
import { verifyJwt } from '@/lib/jwt';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  if (id && token) {
    try {
      const claims = await verifyJwt<{ sub: number }>(token);
      revokeBySession(Number(claims.sub), id);
    } catch {}
  }
  return NextResponse.json(null, { status: 204 });
}
