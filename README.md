# mokout

Quick scaffolding for agentic AI projects. One command sets up version control,
a package manager, a Claude-ready `CLAUDE.md`, and modern tooling — so you can
start building instead of configuring.

```bash
npx mokout init
```

## What it does

`mokout init` scaffolds the current directory:

- **`git init`** — version-controlled from the first commit
- **Package manager** — [`uv`](https://docs.astral.sh/uv/) (Python) or `npm` (JavaScript)
- **`CLAUDE.md`** — a workflow doctrine for coding agents, auto-tailored with a **Project Setup** section (your actual `just`/lint/test commands) and a **Definition of Done**
- **`AGENTS.md`**, **`.cursorrules`**, **`.github/copilot-instructions.md`** — all symlinked to `CLAUDE.md`, so Claude, Cursor, and Copilot read one source of truth
- **`.claude/settings.json`** — a permission allowlist for the project's safe commands, so Claude Code runs them without prompting
- **`tasks/`** — structured `todo.md` + `lessons.md`, referenced by the doctrine
- **Modern tooling** — see below
- **`.env.example`** + **`.editorconfig`**

It is **idempotent and safe**: existing files are never overwritten. The
`CLAUDE.md` doctrine lives in a managed block (`<!-- mokout:doctrine -->`) that
mokout updates in place on re-run — any content you add around it is preserved.
Run it in a fresh directory or an existing project.

### Tooling per stack

| | Python (`--python`, default) | JavaScript (`--js`) |
|---|---|---|
| Package manager | uv | npm |
| Lint + format | [ruff](https://docs.astral.sh/ruff/) (`ruff.toml`) | [Biome](https://biomejs.dev/) (`biome.json`) |
| Git hooks | [lefthook](https://lefthook.dev/) | lefthook |
| Task runner | [just](https://just.systems/) (`justfile`) | just |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | GitHub Actions |

## Usage

```bash
mokout init              # interactive — asks Python or JavaScript
mokout init --python     # Python project
mokout init --js         # JavaScript project
mokout init --dry-run    # print what would be created, write nothing
```

### Add just the agent files to an existing project

Already have a project and only want it agent-ready? `add agents` drops in
`CLAUDE.md`, the agent-instruction symlinks (`AGENTS.md`, `.cursorrules`,
`.github/copilot-instructions.md`), and `tasks/` — no package manager, git, or
tooling changes:

```bash
mokout add agents            # add CLAUDE.md + agent symlinks + tasks/ here
mokout add agents --dry-run  # preview
```

Idempotent: re-running refreshes the doctrine's managed block in `CLAUDE.md`
and leaves everything else (including your own notes) untouched.

After scaffolding:

```bash
just            # list available commands
just hooks      # install git hooks (lefthook)
just lint       # lint + check formatting
```

## Install

No install needed — `npx mokout init` runs the latest version. To install globally:

```bash
npm install -g mokout
```

## Requirements

- Node ≥ 18 (for `npx`)
- [`uv`](https://docs.astral.sh/uv/) on PATH for Python projects; `npm` for JavaScript
- Optional, used by the scaffolded `justfile`: [`just`](https://just.systems/), [`lefthook`](https://lefthook.dev/)

## License

MIT
