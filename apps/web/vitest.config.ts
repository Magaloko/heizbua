import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@heizbua/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@heizbua/db": path.resolve(__dirname, "../../packages/db/src/index.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
});
