import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "../../../logs");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function writeInstallationLog(message) {
    fs.appendFileSync(path.join(logDir, "installation.log"), message + "\n", "utf8");
}

export { writeInstallationLog };