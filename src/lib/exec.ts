import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

/** True if `rel` exists under `cwd`. */
export function exists(cwd: string, rel: string): boolean {
  return existsSync(join(cwd, rel));
}

/** Delete `rel` under `cwd` if present (no error if missing). */
export function remove(cwd: string, rel: string): void {
  rmSync(join(cwd, rel), { force: true });
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
