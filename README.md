# mokout-cli

Quick scaffolding for agentic AI projects. One command sets up version control,
a package manager, and a Coding Agent-ready `AGENTS.md` — a lean, essentials-only
starter so you can build instead of configure.

```bash
npx mokout-cli project init
```

## What it does

`mokout project init` scaffolds the current directory with **only the essentials**:

- **`git init`** — version-controlled from the first commit
- **Package manager** — [`uv`](https://docs.astral.sh/uv/) (Python, with `pytest`, `ruff`, `pyrefly` dev deps) or `npm` (JavaScript, with `@biomejs/biome` dev dep)
- **`CLAUDE.md`** — a workflow doctrine for coding agents, auto-tailored with a **Project Setup** section (your actual lint/test commands) and a **Definition of Done**
- **`AGENTS.md`** → symlinked to `CLAUDE.md`, so any agent reads one source of truth
- **`.claude/settings.json`** — a permission allowlist for the project's safe commands, so Claude Code runs them without prompting
- **`tasks/`** — structured `todo.md` + `lessons.md`, referenced by the doctrine
- **Lint + format config** — [ruff](https://docs.astral.sh/ruff/) (folded into `pyproject.toml`) or [Biome](https://biomejs.dev/) (`biome.json`)
- **`.gitignore`** + **`.env.example`**

That's it — no `justfile`, hooks, or CI cruft. It is **idempotent and safe**:
existing files are never overwritten. The `CLAUDE.md` doctrine lives in a managed
block that mokout updates in place on re-run — any content you add around it is
preserved. Run it in a fresh directory or an existing project.

## Output

**Python** (`mokout project init --python`) — 10 files:

```
pyproject.toml          # uv project + [tool.ruff] + pytest/ruff dev deps
.python-version
uv.lock
.gitignore
.env.example
CLAUDE.md
AGENTS.md → CLAUDE.md
.claude/settings.json
tasks/todo.md
tasks/lessons.md
.agents/skills/
```

**JavaScript** (`mokout project init --js`) — 9 files:

```
package.json
biome.json
.gitignore
.env.example
CLAUDE.md
AGENTS.md → CLAUDE.md
.claude/settings.json
tasks/todo.md
tasks/lessons.md
.agents/skills/
```

## Usage

```bash
mokout project init              # interactive — asks Python or JavaScript
mokout project init --python     # Python project
mokout project init --js         # JavaScript project
mokout project init --dry-run    # print what would be created, write nothing
```

### Add just the agent files to an existing project

Already have a project and only want it agent-ready? `code-fast init` drops in
`CLAUDE.md`, the `AGENTS.md` symlink, and `tasks/` — no package manager, git, or
tooling changes:

```bash
mokout code-fast init            # add CLAUDE.md + AGENTS.md + tasks/ here
mokout code-fast init --dry-run  # preview
```

Idempotent: re-running refreshes the doctrine's managed block in `CLAUDE.md`
and leaves everything else (including your own notes) untouched.

## Install

No install needed — `npx mokout-cli project init` runs the latest version. To install globally:

```bash
npm install -g mokout-cli
```

## Requirements

- Node ≥ 18 (for `npx`)
- [`uv`](https://docs.astral.sh/uv/) on PATH for Python projects; `npm` for JavaScript

## License

MIT
