import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

/** True if `rel` exists under `cwd`. */
export function exists(cwd: string, rel: string): boolean {
  return existsSync(join(cwd, rel));
}

/** Read `rel` under `cwd`, or null if it doesn't exist. */
export function readText(cwd: string, rel: string): string | null {
  try {
    return readFileSync(join(cwd, rel), "utf8");
  } catch {
    return null;
  }
}

/** Append `text` to `rel` under `cwd`. */
export function appendText(cwd: string, rel: string, text: string): void {
  appendFileSync(join(cwd, rel), text);
}

/** Delete `rel` under `cwd` if present (no error if missing). */
export function remove(cwd: string, rel: string): void {
  rmSync(join(cwd, rel), { force: true, recursive: true });
}

/** True if `cmd` is resolvable on PATH. */
export function hasCommand(cmd: string): boolean {
  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [cmd], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

/** Run a command in `cwd`, throwing on non-zero exit. Output is captured (quiet). */
export function run(cmd: string, args: string[], cwd: string): void {
  execFileSync(cmd, args, { cwd, stdio: "pipe" });
}
