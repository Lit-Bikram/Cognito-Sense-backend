"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendRowToDriveCSV = void 0;
const googleapis_1 = require("googleapis");
const KEY_PATH = "./drive-key.json";
// 👉 PASTE YOUR DRIVE FILE ID HERE (from the CSV link)
const DRIVE_FILE_ID = "1DFE622vTKIdQEOhJ981-eO8hQoxiNmPS";
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = googleapis_1.google.drive({ version: "v3", auth });
async function appendRowToDriveCSV(row) {
    try {
        // Download current file content
        const response = await drive.files.get({
            fileId: DRIVE_FILE_ID,
            alt: "media",
        });
        const existingCSV = response.data;
        const updatedCSV = existingCSV + "\n" + row;
        // Upload updated file
        await drive.files.update({
            fileId: DRIVE_FILE_ID,
            media: {
                mimeType: "text/csv",
                body: updatedCSV,
            },
        });
        console.log("✅ Row appended to Google Drive");
    }
    catch (err) {
        console.error("❌ Drive upload failed:", err);
    }
}
exports.appendRowToDriveCSV = appendRowToDriveCSV;
