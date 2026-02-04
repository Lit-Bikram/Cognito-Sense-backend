import { google } from "googleapis";

const DRIVE_FILE_ID = "1iHK454hK03GaRSgT4kHZ_TWc19m0QRzh";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_DRIVE_KEY as string),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });
