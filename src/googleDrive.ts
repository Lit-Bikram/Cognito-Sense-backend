import { google } from "googleapis";

const DRIVE_FILE_ID = "1ayBbSefkGq2MUmdPdDpQ-8Z1DVZhguHj";

// Use credentials from Render env variable
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_DRIVE_KEY as string),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// ✅ IMPORTANT: export the function
export async function appendRowToDriveCSV(row: string) {
  try {
    const response = await drive.files.get({
      fileId: DRIVE_FILE_ID,
      alt: "media",
    });

    const existingCSV = response.data as unknown as string;
    const updatedCSV = existingCSV + "\n" + row;

    await drive.files.update({
      fileId: DRIVE_FILE_ID,
      media: {
        mimeType: "text/csv",
        body: updatedCSV,
      },
    });

    console.log("✅ Row appended to Google Drive");
  } catch (err) {
    console.error("❌ Drive upload failed:", err);
  }
}