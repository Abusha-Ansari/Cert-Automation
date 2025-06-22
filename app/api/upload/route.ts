import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/googleOAuthClient';

const SPREADSHEET_ID = '1s4LDoS2t9JxJGGp4rYe54XA7QEcR2REA5geIpMYPXzY';
const SHEET_NAME = 'Sheet1';

interface BodyData {
  accessToken: string;
  refreshToken: string;
  loggedIn: boolean;
  [key: string]: string | boolean | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value;
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    const body = await req.json();
    const data: BodyData[] = body.data;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Extract headers from the first object keys
    const headers = Object.keys(data[0]);
    const values = data.map(row => headers.map(key => row[key] ?? ''));

    // First clear the sheet (optional)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:Z`,
    });

    // Write headers + rows
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...values],
      },
    });

    return NextResponse.json({ message: 'Data uploaded to Google Sheet successfully' });
  } catch {
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
