# CLAUDE.md — working on mokout

> This file is for agents/developers working **on the mokout CLI itself**.
> It is **not** the CLAUDE.md that mokout writes into scaffolded projects —
> that template lives in `src/templates/claude.ts`. Do not confuse the two,
> and never run `mokout project init` or `mokout code-fast init` inside this repo (either
> would append the template doctrine to _this_ file).
>
> `AGENTS.md` at the repo root is a symlink to this file, so non-Claude agents
> read the same doctrine. mokout creates the same `AGENTS.md -> CLAUDE.md`
> symlink in every scaffolded project (see `SYMLINKS` in `src/templates/index.ts`).

## What mokout is

A scaffolding CLI for agentic AI projects. `mokout project init` sets up a lean,
essentials-only project in one command: version control, a package manager
(uv for Python, npm for JS), a Claude-ready `CLAUDE.md` (+ `AGENTS.md` symlink),
`tasks/`, `.claude/settings.json`, and lint config (ruff in pyproject / biome).
No justfile/hooks/CI cruft — kept deliberately minimal.

Run via `npx mokout-cli project init` — no install required.

## Stack

- **Language:** TypeScript (ESM), Node ≥ 18
- **CLI framework:** [Clipanion](https://mael.dev/clipanion/) — class-based commands
- **Prompts:** [@clack/prompts](https://github.com/bombshell-dev/clack) — all interactive UX
- **Generation engine:** [node-plop](https://plopjs.com/) — file actions; templates are inline strings
- **Build:** tsup → `dist/cli.js` (single ESM bundle + shebang)
- **Package manager:** pnpm
- **Lint/format:** Biome · **Hooks:** lefthook

## Layout

```
src/
├── cli.ts                  # Clipanion entry: registers commands + builtins
├── commands/
│   ├── init.ts             # InitCommand — full project scaffold
│   └── code-fast-init.ts   # CodeFastInitCommand — `mokout code-fast init`
├── generators/engine.ts    # registerGenerator(spec): templates → node-plop actions
├── lib/exec.ts             # exists() / hasCommand() / run() helpers
└── templates/
    ├── index.ts            # the manifest: agentFiles(), filesFor(stack), SYMLINKS
    ├── claude.ts           # DOCTRINE emitted into scaffolded projects
    ├── shared.ts           # env / tasks content
    ├── python.ts           # uv + ruff (ruff config folded into pyproject.toml)
    └── javascript.ts       # npm + biome
```

Templates are **inline string constants**, bundled into `dist/cli.js` by tsup.
This is deliberate: no runtime file resolution, so the published binary can
never fail to find its templates. Keep it that way.

## How to extend

**Add/change a scaffolded file:** edit the relevant `src/templates/*.ts`
constant and add an entry to `src/templates/index.ts`. A `TemplateFile` has a
`mode`: `"skip"` (write only if absent — never clobber) or `"managed"` (own a
marked region by `marker`, replaced in place on re-run; CLAUDE.md uses two:
`doctrine` and `project`). Nothing else to wire up.

**Add a new stack:** add a `Stack` member plus `STACK[...]` and
`STACK_AGENT_EXTRAS[...]` entries in `src/templates/index.ts`, and a
`src/templates/<stack>.ts` module (exporting tooling configs, `SETUP`, and
`SETTINGS_JSON`).

**Add a sub-generator** (`mokout code-fast ...`): copy `src/commands/code-fast-init.ts`
as the template. Add a Clipanion command (path like `["code-fast", "<thing>"]`), build
a `TemplateFile[]` + optional `SymlinkSpec[]`, and hand them to
`registerGenerator(plop, spec)` from `src/generators/engine.ts` — the one shared
engine both `project init` and `code-fast init` use. Register the command in `src/cli.ts`.
`mokout code-fast init` is the worked example.

## Dev commands

```bash
pnpm install        # deps
pnpm run build      # tsup → dist/cli.js
pnpm run typecheck  # tsc --noEmit
pnpm run lint       # biome check .
pnpm run format     # biome check --write .
```

## Verification (do this before calling anything done)

Templates for tools we don't run can silently rot. Prove the real path:

```bash
pnpm run build
TMP=$(mktemp -d); cd "$TMP"
node "$OLDPWD/dist/cli.js" project init --python        # then --js, then re-run for idempotency
uvx ruff check . && uvx ruff format --check .    # Python lint path must pass
```

The discriminating test is the **built** CLI run from a **clean dir** — not
file generation in the source tree. Re-run all three scenarios (python / js /
idempotent re-run) after any change to templates or the generator.
