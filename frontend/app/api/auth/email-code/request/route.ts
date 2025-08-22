import { NextRequest, NextResponse } from 'next/server';
import { createLoginCode } from '@/lib/repo/auth';
import { sendLoginCode } from '@/lib/mail';

const rate: Map<string, { count: number; ts: number }> = new Map();

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
  }

  const key = `${email.toLowerCase()}|${req.ip || 'ip'}`;
  const prev = rate.get(key);
  const now = Date.now();
  if (prev && now - prev.ts < 60_000 && prev.count >= 5) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  rate.set(key, { count: prev ? prev.count + 1 : 1, ts: now });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const rec = await createLoginCode(email, code, 600);
  try {
    await sendLoginCode(email, code, rec.challengeId);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Still return success to prevent email enumeration
  }
  return NextResponse.json({ challenge_id: rec.challengeId });
}
