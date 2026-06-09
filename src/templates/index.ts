import { CLAUDE_MD } from "./claude";
import * as js from "./javascript";
import * as py from "./python";
import { EDITORCONFIG, ENV_EXAMPLE, TASKS_LESSONS, TASKS_TODO } from "./shared";

export type Stack = "python" | "javascript";

export interface TemplateFile {
  path: string;
  content: string;
  /** "skip" = leave existing file untouched. "append" = create, or append if present. */
  mode: "skip" | "append";
}

export interface SymlinkSpec {
  /** Link to create, e.g. "AGENTS.md". */
  path: string;
  /** Relative target the link points at, e.g. "CLAUDE.md". */
  target: string;
}

// AGENTS.md is the cross-agent standard; pointing it at CLAUDE.md keeps a
// single source of truth so every agent reads the same project doctrine.
export const SYMLINKS: SymlinkSpec[] = [{ path: "AGENTS.md", target: "CLAUDE.md" }];

// The agent layer: task tracking + the CLAUDE.md doctrine. CLAUDE.md is last
// and "append" so re-runs add the doctrine without clobbering an existing file
// (and so it exists before the AGENTS.md symlink that points at it). This is
// exactly what `mokout add agents` drops into an existing project.
const AGENT_FILES: TemplateFile[] = [
  { path: "tasks/todo.md", content: TASKS_TODO, mode: "skip" },
  { path: "tasks/lessons.md", content: TASKS_LESSONS, mode: "skip" },
  { path: "CLAUDE.md", content: CLAUDE_MD, mode: "append" },
];

// General project hygiene, written by `init` only.
const PROJECT_FILES: TemplateFile[] = [
  { path: ".editorconfig", content: EDITORCONFIG, mode: "skip" },
  { path: ".env.example", content: ENV_EXAMPLE, mode: "skip" },
];

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
  return [...PROJECT_FILES, ...STACK[stack], ...AGENT_FILES];
}
