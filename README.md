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
- **`CLAUDE.md`** — a workflow doctrine for Claude / coding agents (created, or appended if one exists)
- **`AGENTS.md`** — symlinked to `CLAUDE.md`, so any agent following the cross-tool standard reads the same doctrine
- **`tasks/`** — `todo.md` + `lessons.md`, referenced by the workflow doctrine
- **Modern tooling** — see below
- **`.env.example`** + **`.editorconfig`**

It is **idempotent and safe**: existing files are never overwritten (only
`CLAUDE.md` is appended to). Run it in a fresh directory or an existing project.

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
`CLAUDE.md`, the `AGENTS.md` symlink, and `tasks/` — no package manager, git,
or tooling changes:

```bash
mokout add agents            # add CLAUDE.md + AGENTS.md + tasks/ here
mokout add agents --dry-run  # preview
```

Idempotent: re-running appends the doctrine to `CLAUDE.md` and leaves
everything else untouched.

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
