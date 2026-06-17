import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const isMainModule = (moduleUrl: string) => {
  if (!process.argv[1]) return false;

  return fileURLToPath(moduleUrl) === resolve(process.argv[1]);
};
