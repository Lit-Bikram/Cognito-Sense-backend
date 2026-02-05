import { google } from "googleapis";

const DRIVE_FILE_ID = "1ayBbSefkGq2MUmdPdDpQ-8Z1DVZhguHj";

// Build auth from Render env var
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_DRIVE_KEY as string),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

export async function appendRowToDriveCSV(row: string) {
  try {
    // 1️⃣ Download current file
    const response = await drive.files.get({
      fileId: DRIVE_FILE_ID,
      alt: "media",
    });

    let existingCSV = (response.data as unknown as string).trimEnd();

    // 2️⃣ Make sure we don't add double blank lines
    const separator = existingCSV.endsWith("\n") ? "" : "\n";
    const updatedCSV = existingCSV + separator + row;

    // 3️⃣ Upload updated file
    await drive.files.update({
      fileId: DRIVE_FILE_ID,
      media: {
        mimeType: "text/csv",
        body: updatedCSV,
      },
    });

    console.log("✅ Row safely appended to Google Drive");
  } catch (err: any) {
    console.error("❌ Drive upload failed:", err.message || err);
  }
}
