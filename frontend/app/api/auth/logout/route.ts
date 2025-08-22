import { NextRequest, NextResponse } from 'next/server';
import { revokeByPlain } from '@/lib/repo/auth';

export async function POST(req: NextRequest) {
  // Check if this is an impersonation session or regular session
  const impersonateCookie = req.cookies.get('fitq_impersonate');
  const refreshCookie = req.cookies.get('fitq_refresh');
  
  const res = new NextResponse(null, { status: 204 });
  
  if (impersonateCookie) {
    // If impersonating, only clear the impersonate cookie
    try { revokeByPlain(impersonateCookie.value); } catch {}
    res.cookies.set('fitq_impersonate', '', { httpOnly: true, path: '/', maxAge: 0 });
  } else if (refreshCookie) {
    // Otherwise, clear the regular refresh cookie
    try { revokeByPlain(refreshCookie.value); } catch {}
    res.cookies.set('fitq_refresh', '', { httpOnly: true, path: '/', maxAge: 0 });
  }
  
  return res;
}
