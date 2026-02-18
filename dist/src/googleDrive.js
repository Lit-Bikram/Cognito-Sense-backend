"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendRowToDriveCSV = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DRIVE_FILE_ID = "1GdKuCjzbOklCecrkmMKQ1TiG3IytPuA0";
// Build auth from env var. Accept either a JSON string or a path to a JSON file.
const keyEnv = process.env.GOOGLE_DRIVE_KEY;
if (!keyEnv) {
    throw new Error("Missing GOOGLE_DRIVE_KEY env var. Set it to the credentials JSON or path to a JSON file.");
}
let credentials;
try {
    const trimmed = keyEnv.trim();
    // If it looks like a file path and the file exists, read it
    const resolved = path_1.default.resolve(trimmed);
    if ((trimmed.startsWith(".") || trimmed.includes("/") || trimmed.includes("\\")) && fs_1.default.existsSync(resolved)) {
        const fileContent = fs_1.default.readFileSync(resolved, "utf8");
        credentials = JSON.parse(fileContent);
    }
    else if (trimmed.endsWith(".json") && fs_1.default.existsSync(resolved)) {
        const fileContent = fs_1.default.readFileSync(resolved, "utf8");
        credentials = JSON.parse(fileContent);
    }
    else {
        credentials = JSON.parse(trimmed);
    }
}
catch (err) {
    console.error("Failed to parse or load GOOGLE_DRIVE_KEY:", err);
    throw err;
}
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = googleapis_1.google.drive({ version: "v3", auth });
async function appendRowToDriveCSV(row) {
    try {
        // 1️⃣ Download current file
        const response = await drive.files.get({
            fileId: DRIVE_FILE_ID,
            alt: "media",
        });
        let existingCSV = response.data.trimEnd();
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
        console.log("✅ Row safely appended to Google Drive CSV ~ from googleDrive.ts");
    }
    catch (err) {
        console.error("❌ Drive upload failed:", err.message || err);
    }
}
exports.appendRowToDriveCSV = appendRowToDriveCSV;
