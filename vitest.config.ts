import { fileURLToPath } from "url";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
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
