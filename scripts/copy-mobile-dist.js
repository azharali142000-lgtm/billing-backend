const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sourceDist = path.join(projectRoot, "mobile-app", "dist");
const targetDist = path.join(projectRoot, "dist");

if (!fs.existsSync(sourceDist)) {
  throw new Error(`Missing mobile build output at ${sourceDist}`);
}

if (fs.existsSync(targetDist)) {
  fs.rmSync(targetDist, { recursive: true, force: true });
}

fs.cpSync(sourceDist, targetDist, { recursive: true });
console.log(`Copied ${sourceDist} to ${targetDist}`);
