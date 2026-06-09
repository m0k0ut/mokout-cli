import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  // Ship a runnable CLI: add the node shebang to the entry output.
  banner: { js: "#!/usr/bin/env node" },
});
