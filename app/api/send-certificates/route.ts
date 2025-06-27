import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/googleOAuthClient';
import nodemailer from 'nodemailer';


export async function POST(req: NextRequest) {

  const body = await req.json();

  const token = body.token;
  const SHEET_NAME = body.sheet_name;
  const EVENT_NAME = body.event_name;
  const SPREADSHEET_ID = body.sheet_ID;

  if (!SHEET_NAME || !EVENT_NAME || !SPREADSHEET_ID) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
  }

  // Setup OAuth2 for Google API (Drive + Sheets)
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  // Setup Nodemailer with App Password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER!,
      pass: process.env.APP_PASSWORD!,
    },
  });

  // Fetch sheet data
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:Z`,
  });

  const rows = data.data.values;
  if (!rows || rows.length < 2) {
    return NextResponse.json({ error: 'No data found in the spreadsheet' }, { status: 404 });
  }

  const headers = rows[0];
  const nameIndex = headers.indexOf('Name');
  const emailIndex = headers.indexOf('Email');
  const dateIndex = headers.indexOf('Date');
  const slideIndex = headers.indexOf('Slide ID');
  const statusIndex = headers.indexOf('Status');

  if (
    nameIndex === -1 ||
    emailIndex === -1 ||
    dateIndex === -1 ||
    slideIndex === -1 ||
    statusIndex === -1
  ) {
    return NextResponse.json({ error: 'Required columns missing' }, { status: 400 });
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[statusIndex] === 'SENT') continue;

    const name = row[nameIndex];
    const email = row[emailIndex];
    const date = row[dateIndex];
    const fileId = row[slideIndex];

    if (!fileId || !email) continue;

    // Export slide as PDF
    const pdf = await drive.files.export(
      { fileId, mimeType: 'application/pdf' },
      { responseType: 'arraybuffer' }
    );

    const subject = `Certificate of Participation – ${EVENT_NAME}`;
    const body = `
Dear ${name},

Thank you for attending ${EVENT_NAME} on ${date}.
Please find your certificate attached.

Regards,  
CSI PCE
`;

    // Send email
    await transporter.sendMail({
      from: `"CSI PCE" <${process.env.EMAIL_SENDER!}>`,
      to: email,
      subject,
      text: body,
      attachments: [
        {
          filename: 'certificate.pdf',
          content: Buffer.from(pdf.data as ArrayBuffer),
        },
      ],
    });

    // Mark as SENT
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${String.fromCharCode(65 + statusIndex)}${i + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['SENT']] },
    });
  }

  return NextResponse.json({ message: 'Certificates sent (App Password)' });
}
