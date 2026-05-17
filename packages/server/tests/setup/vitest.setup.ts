import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const setupDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(setupDir, "../..");
const repoRoot = path.resolve(serverRoot, "../..");

dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(serverRoot, ".env") });
