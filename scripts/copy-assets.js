const fs = require("fs");
const path = require("path");

const copies = [
  ["src/db/schema.sql", "dist/src/db/schema.sql"],
  ["src/ml/assets", "dist/src/ml/assets"],
];

for (const [source, destination] of copies) {
  const sourcePath = path.resolve(source);
  const destinationPath = path.resolve(destination);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Required build asset is missing: ${sourcePath}`);
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.cpSync(sourcePath, destinationPath, { recursive: true, force: true });
}

console.log("Copied database and ML assets into dist.");
