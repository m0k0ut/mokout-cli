import { DOCTRINE } from "./claude";
import * as js from "./javascript";
import * as py from "./python";
import { EDITORCONFIG, ENV_EXAMPLE, TASKS_LESSONS, TASKS_TODO } from "./shared";

export type Stack = "python" | "javascript";

export interface TemplateFile {
  path: string;
  content: string;
  /**
   * - "skip"    = write only if absent; never touch an existing file.
   * - "managed" = own a marked region of the file (see `marker`); replace that
   *   region on re-run, or append it if the file has no such region yet. The
   *   user's content outside the region is preserved.
   */
  mode: "skip" | "managed";
  /** Region id for "managed" mode, e.g. "doctrine" → <!-- mokout:doctrine:start -->. */
  marker?: string;
}

export interface SymlinkSpec {
  /** Link to create, e.g. "AGENTS.md". */
  path: string;
  /** Symlink target, relative to the link's own location, e.g. "CLAUDE.md". */
  target: string;
}

// Mirror the doctrine to the conventions other agents read. AGENTS.md is the
// cross-tool standard; .cursorrules (Cursor) and copilot-instructions.md
// (GitHub Copilot) get the same single source of truth via symlink. Targets
// are relative to each link's directory — the Copilot one sits in .github/.
export const SYMLINKS: SymlinkSpec[] = [
  { path: "AGENTS.md", target: "CLAUDE.md" },
  { path: ".cursorrules", target: "CLAUDE.md" },
  { path: ".github/copilot-instructions.md", target: "../CLAUDE.md" },
];

// CLAUDE.md doctrine region — shared by `init` and `add agents`.
const DOCTRINE_FILE: TemplateFile = {
  path: "CLAUDE.md",
  content: DOCTRINE,
  mode: "managed",
  marker: "doctrine",
};

// The agent layer: task tracking + the doctrine. Doctrine is last so the file
// exists before the symlinks that point at it. This is what `add agents` drops
// into an existing project.
const AGENT_FILES: TemplateFile[] = [
  { path: "tasks/todo.md", content: TASKS_TODO, mode: "skip" },
  { path: "tasks/lessons.md", content: TASKS_LESSONS, mode: "skip" },
  DOCTRINE_FILE,
];

// General project hygiene, written by `init` only.
const PROJECT_FILES: TemplateFile[] = [
  { path: ".editorconfig", content: EDITORCONFIG, mode: "skip" },
  { path: ".env.example", content: ENV_EXAMPLE, mode: "skip" },
];

// Stack-specific extras `init` adds on top of the agent layer: a second managed
// region in CLAUDE.md with concrete project commands, plus a Claude Code
// permission allowlist. `add agents` does not write these (it doesn't know the
// stack), and the separate "project" marker means re-running `add agents` never
// disturbs this region.
const STACK_AGENT_EXTRAS: Record<Stack, TemplateFile[]> = {
  python: [
    { path: "CLAUDE.md", content: py.SETUP, mode: "managed", marker: "project" },
    { path: ".claude/settings.json", content: py.SETTINGS_JSON, mode: "skip" },
  ],
  javascript: [
    { path: "CLAUDE.md", content: js.SETUP, mode: "managed", marker: "project" },
    { path: ".claude/settings.json", content: js.SETTINGS_JSON, mode: "skip" },
  ],
};

const STACK: Record<Stack, TemplateFile[]> = {
  python: [
    { path: ".gitignore", content: py.GITIGNORE, mode: "skip" },
    { path: "ruff.toml", content: py.RUFF_TOML, mode: "skip" },
    { path: "lefthook.yml", content: py.LEFTHOOK_YML, mode: "skip" },
    { path: "justfile", content: py.JUSTFILE, mode: "skip" },
    { path: ".github/workflows/ci.yml", content: py.CI_YML, mode: "skip" },
  ],
  javascript: [
    { path: ".gitignore", content: js.GITIGNORE, mode: "skip" },
    { path: "biome.json", content: js.BIOME_JSON, mode: "skip" },
    { path: "lefthook.yml", content: js.LEFTHOOK_YML, mode: "skip" },
    { path: "justfile", content: js.JUSTFILE, mode: "skip" },
    { path: ".github/workflows/ci.yml", content: js.CI_YML, mode: "skip" },
  ],
};

/** Just the agent layer — used by `mokout add agents`. */
export function agentFiles(): TemplateFile[] {
  return [...AGENT_FILES];
}

/** Everything for a full project — used by `mokout init`. */
export function filesFor(stack: Stack): TemplateFile[] {
  return [...PROJECT_FILES, ...STACK[stack], ...AGENT_FILES, ...STACK_AGENT_EXTRAS[stack]];
}
