import { NextRequest, NextResponse } from 'next/server';
import { getTrainerBySlug } from '@/lib/repo/content';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const trainer = await getTrainerBySlug(params.slug);
  if (!trainer) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ trainer });
}

