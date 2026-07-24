import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/testUtils/setup.ts"],
    // Several test files share the same live Postgres database (via the
    // shared `db` singleton in src/lib/db.ts) and each truncates tables in
    // its own beforeEach. Running files in parallel races: one file's
    // truncate can wipe rows another file just inserted, or two files can
    // insert the same fixture email concurrently and collide on the unique
    // constraint. quote-engine's equivalent integration suite solves this
    // the same way (single-threaded), just via a CLI flag instead of config.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
