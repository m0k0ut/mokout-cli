# mokout-cli

Quick scaffolding for agentic AI projects. One command sets up version control,
a package manager, and a Coding Agent-ready `AGENTS.md` — a lean, essentials-only
starter so you can build instead of configure.

```bash
npx mokout project init
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

### Advanced Agent Workflows (via google/agents-cli)

`mokout-cli` installs and seamlessly wraps the [`google/agents-cli`](https://github.com/google/agents-cli) toolkit, providing deep capabilities for evaluating, testing, and deploying coding agents. All `agents-cli` commands are proxied through `mokout agents`.

**CLI Commands**
| Command | What it does |
|---------|--------------|
| `mokout agents setup` | Install CLI + skills to coding agents (runs automatically on install) |
| `mokout agents scaffold <name>` | Create a new agent project |
| `mokout agents eval generate` | Run agent on eval dataset, produce traces |
| `mokout agents eval grade` | Run agent evaluations on the traces |
| `mokout agents deploy` | Deploy to Google Cloud |
| `mokout agents publish gemini-enterprise` | Register with Gemini Enterprise |

**See all commands**
| Command | Description |
|---------|-------------|
| `mokout agents login` | Authenticate with Google Cloud or AI Studio |
| `mokout agents login --status` | Show authentication status |

**Scaffold**
| Command | Description |
|---------|-------------|
| `mokout agents scaffold <name>` | Create a new agent project |
| `mokout agents scaffold enhance` | Add deployment, CI/CD, or RAG to an existing project |
| `mokout agents scaffold upgrade` | Upgrade project to a newer agents-cli version |

**Develop**
| Command | Description |
|---------|-------------|
| `mokout agents run "prompt"` | Run agent with a single prompt |
| `mokout agents install` | Install project dependencies |
| `mokout agents lint` | Run code quality checks (Ruff) |

**Evaluate**
| Command | Description |
|---------|-------------|
| `mokout agents eval generate` | Run agent inference over eval cases |
| `mokout agents eval grade` | Grade generated traces against metrics |
| `mokout agents eval dataset synthesize` | Synthesize multi-turn eval scenarios for your local agent |
| `mokout agents eval compare` | Compare two eval result files |
| `mokout agents eval analyze` | Cluster failure modes from grade results |
| `mokout agents eval metric list` | List available metrics |
| `mokout agents eval optimize` | Auto-tune agent prompts using eval data |

**Deploy & Publish**
| Command | Description |
|---------|-------------|
| `mokout agents deploy` | Deploy to Google Cloud |
| `mokout agents publish gemini-enterprise` | Register with Gemini Enterprise |
| `mokout agents infra single-project` | Provision single-project infrastructure |
| `mokout agents infra cicd` | Set up CI/CD pipeline + staging/prod infrastructure |

**Data**
| Command | Description |
|---------|-------------|
| `mokout agents infra datastore` | Provision datastore infrastructure for RAG |
| `mokout agents data-ingestion` | Run data ingestion pipeline |

**Other**
| Command | Description |
|---------|-------------|
| `mokout agents info` | Show project config and CLI version |
| `mokout agents update` | Force reinstall skills to all IDEs |

## Install

No install needed — `npx mokout project init` runs the latest version. To install globally:

```bash
npm install -g mokout
```

## Requirements

- Node ≥ 18 (for `npx`)
- [`uv`](https://docs.astral.sh/uv/) on PATH for Python projects; `npm` for JavaScript

## License

MIT
