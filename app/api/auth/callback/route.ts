import { getOAuth2Client } from '@/lib/googleOAuthClient';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const oauth2Client = getOAuth2Client();

  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code in URL' }, { status: 400 });
  }

  const { tokens } = await oauth2Client.getToken(code);

  // Store access token in cookie (⚠️ ideally encrypt / sign this)
  const cookieStore = await cookies();
  cookieStore.set('access_token', tokens.access_token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  if (tokens.refresh_token) {
    cookieStore.set('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return NextResponse.redirect(new URL('/', req.url));
}
