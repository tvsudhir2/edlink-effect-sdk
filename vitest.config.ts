import { defineConfig } from "vitest/config";

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@tests": resolve(__dirname, "tests"),
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/schemas/index.ts", "src/layers.ts", "src/client.ts"],
    },
  },
});
