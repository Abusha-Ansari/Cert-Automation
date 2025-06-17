import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getOAuth2Client } from "@/lib/googleOAuthClient";
// import { getOAuth2Client } from '@/lib/googleOAuthClient';

const SLIDE_TEMPLATE_ID = "11p17qjEJe82i0biVCiw3-xld7cZGBqy2wegqjFmXRe8";
const SPREADSHEET_ID = "1s4LDoS2t9JxJGGp4rYe54XA7QEcR2REA5geIpMYPXzY";
const TEMP_FOLDER_ID = "1_aJB64-w7yCBESQveb4sc8wjSNK8ISGf";
const SHEET_NAME = "Sheet1";

const leadName = "Head";
const title = "Student Body Chapter";
const teamName = "CSI";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body.token;
  console.log("Tokens received:", token);

  if (!token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const slides = google.slides({ version: "v1", auth: oauth2Client });

  // Fetch sheet data
  const sheetData = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:Z`,
  });

  console.log("SHEET DATA:", sheetData.data);

  const rows = sheetData.data.values;
  if (!rows) {
    return NextResponse.json(
      { error: "No data found in sheet" },
      { status: 400 }
    );
  }
  const headers = rows[0] || [];

  const nameIndex = headers.indexOf("Name");
  const dateIndex = headers.indexOf("Date");
  const descIndex = headers.indexOf("Description");
  const slideIndex = headers.indexOf("Slide ID");
  const statusIndex = headers.indexOf("Status");

  if (
    nameIndex === -1 ||
    dateIndex === -1 ||
    descIndex === -1 ||
    slideIndex === -1 ||
    statusIndex === -1
  ) {
    return NextResponse.json(
      { error: "Required columns missing" },
      { status: 400 }
    );
  }

  const updates: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[statusIndex] === "CREATED") continue;

    const name = row[nameIndex];
    const date = row[dateIndex];
    const description = row[descIndex];

    console.log(`Processing row ${i + 1}:`, { name, date, description });

    // Copy slide
    const copy = await drive.files.copy({
      fileId: SLIDE_TEMPLATE_ID,
      requestBody: {
        name,
        parents: [TEMP_FOLDER_ID],
      },
    });

    console.log("Created file details:", copy);

    const slideId = copy.data.id!;
    // const presentation = await slides.presentations.get({ presentationId: slideId });

    // Replace text
    await slides.presentations.batchUpdate({
      presentationId: slideId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: { text: "Receiver Name", matchCase: true },
              replaceText: name,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "Description", matchCase: true },
              replaceText: description,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "Date Issued", matchCase: true },
              replaceText: date,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "Your Name", matchCase: true },
              replaceText: leadName,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "Title", matchCase: true },
              replaceText: title,
            },
          },
          {
            replaceAllText: {
              containsText: { text: "Team Name", matchCase: true },
              replaceText: teamName,
            },
          },
        ],
      },
    });

    updates.push({ row: i + 1, slideId });
  }

  if (updates.length === 0) {
    return NextResponse.json({ message: "No certificates to create" });
  }

  // Prepare bulk update ranges
  const slideIds = updates.map((u) => [u.slideId]);
  const statuses = updates.map(() => ["CREATED"]);
  const slideRange = `${SHEET_NAME}!${String.fromCharCode(
    65 + slideIndex
  )}2:${String.fromCharCode(65 + slideIndex)}${
    updates[updates.length - 1].row
  }`;
  const statusRange = `${SHEET_NAME}!${String.fromCharCode(
    65 + statusIndex
  )}2:${String.fromCharCode(65 + statusIndex)}${
    updates[updates.length - 1].row
  }`;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        { range: slideRange, values: slideIds },
        { range: statusRange, values: statuses },
      ],
    },
  });

  return NextResponse.json({ message: "Certificates created (OAuth)" });
}
