// lib/googleOAuthClient.ts
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

console.log(`Using Google OAuth Client with ID: ${CLIENT_ID}`);
console.log(`Redirect URI: ${REDIRECT_URI}`);
console.log(`Client Secret: ${CLIENT_SECRET ? '***' : 'Not Set'}`);

export function getOAuth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/gmail.send',
];
