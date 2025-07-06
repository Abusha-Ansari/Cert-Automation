// app/api/auth/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/googleOAuthClient';

export function GET(req: NextRequest) {
  const oauth2Client = getOAuth2Client();

  const url = new URL(req.url);
  const stateParams = new URLSearchParams();

  // Capture all expected query params
  const keys = ['sheet', 'event', 'tempFolder', 'slideTemplate', 'sheetId'];
  keys.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) stateParams.set(key, value);
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    prompt: 'consent',
    state: stateParams.toString(), // pass encoded query params
  });

  return NextResponse.redirect(authUrl);
}
