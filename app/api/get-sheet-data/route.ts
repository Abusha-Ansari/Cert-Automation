import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getOAuth2Client } from "@/lib/googleOAuthClient";

export async function POST(req: NextRequest) {

  const body = await req.json();

  const token = body.token;
  const SHEET_NAME = body.sheet_name;
  const SPREADSHEET_ID = body.sheet_ID;

  if (!token || !SHEET_NAME || !SPREADSHEET_ID) {
    return NextResponse.json({ error: "Missing Credentials" }, { status: 400 });
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
  });

  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const sheetData = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:Z`,
  });

  return NextResponse.json({data: sheetData.data.values, message: "Sheet data fetched successfully"});

}