import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      shared: path.resolve(root, "src/shared"),
      modules: path.resolve(root, "src/modules"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["tests/setup/vitest.setup.ts"],
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Integration tests share one DB; parallel files caused truncate/pool races.
    fileParallelism: false,
  },
});
