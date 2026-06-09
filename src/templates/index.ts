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

const SHARED: TemplateFile[] = [
  { path: ".editorconfig", content: EDITORCONFIG, mode: "skip" },
  { path: ".env.example", content: ENV_EXAMPLE, mode: "skip" },
  { path: "tasks/todo.md", content: TASKS_TODO, mode: "skip" },
  { path: "tasks/lessons.md", content: TASKS_LESSONS, mode: "skip" },
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

// CLAUDE.md is appended last so re-running mokout adds the doctrine without
// clobbering an existing file.
const CLAUDE_FILE: TemplateFile = { path: "CLAUDE.md", content: CLAUDE_MD, mode: "append" };

export function filesFor(stack: Stack): TemplateFile[] {
  return [...SHARED, ...STACK[stack], CLAUDE_FILE];
}
