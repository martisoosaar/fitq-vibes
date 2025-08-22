import crypto from 'crypto';

export type Provider = 'google' | 'facebook' | 'stebby';

function base64url(input: Buffer) {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createPkcePair() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

export function providerConfig(provider: Provider) {
  switch (provider) {
    case 'google':
      return {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectUri: process.env.GOOGLE_REDIRECT_URL!,
        scope: 'openid email profile',
        pkce: true,
      };
    case 'facebook':
      return {
        authUrl: 'https://www.facebook.com/v17.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v17.0/oauth/access_token',
        userUrl: 'https://graph.facebook.com/me?fields=id,name,email',
        clientId: process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_APP_SECRET!,
        redirectUri: process.env.FACEBOOK_REDIRECT_URL!,
        scope: 'email,public_profile',
        pkce: false,
      };
    case 'stebby':
      return {
        authUrl: process.env.STEBBY_AUTH_URL!,
        tokenUrl: process.env.STEBBY_TOKEN_URL!,
        userUrl: process.env.STEBBY_USERINFO_URL!,
        clientId: process.env.STEBBY_CLIENT_ID!,
        clientSecret: process.env.STEBBY_CLIENT_SECRET!,
        redirectUri: process.env.STEBBY_REDIRECT_URL!,
        scope: process.env.STEBBY_SCOPE || 'openid email profile',
        pkce: false,
      };
  }
}

export function buildAuthUrl(provider: Provider, state: string, pkceChallenge?: string) {
  const cfg = providerConfig(provider);
  const url = new URL(cfg.authUrl);
  url.searchParams.set('client_id', cfg.clientId);
  url.searchParams.set('redirect_uri', cfg.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', cfg.scope);
  url.searchParams.set('state', state);
  if (cfg.pkce && pkceChallenge) {
    url.searchParams.set('code_challenge', pkceChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
  }
  return url.toString();
}

export async function exchangeCode(provider: Provider, code: string, codeVerifier?: string) {
  const cfg = providerConfig(provider);
  const params: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: cfg.redirectUri,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  };
  if (cfg.pkce && codeVerifier) params['code_verifier'] = codeVerifier;
  const res = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json() as Promise<{ access_token: string; id_token?: string }>;
}

export async function fetchUser(provider: Provider, tokens: { access_token: string; id_token?: string }) {
  const cfg = providerConfig(provider);
  if (provider === 'google') {
    const res = await fetch(cfg.userUrl, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    if (!res.ok) throw new Error('Userinfo failed');
    const data = await res.json();
    return { email: data.email as string, name: (data.name as string) || undefined };
  }
  if (provider === 'facebook') {
    const res = await fetch(cfg.userUrl + `&access_token=${encodeURIComponent(tokens.access_token)}`);
    if (!res.ok) throw new Error('Userinfo failed');
    const data = await res.json();
    return { email: (data.email as string) || '', name: (data.name as string) || undefined };
  }
  // stebby generic
  const res = await fetch(cfg.userUrl, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!res.ok) throw new Error('Userinfo failed');
  const data = await res.json();
  return { email: (data.email as string) || '', name: (data.name as string) || undefined };
}

