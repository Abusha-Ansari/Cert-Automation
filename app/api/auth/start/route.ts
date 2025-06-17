import { NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/googleOAuthClient';

export function GET() {
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    prompt: 'consent',
  });

  return NextResponse.redirect(url);
}