# CLAUDE.md — working on mokout

> This file is for agents/developers working **on the mokout CLI itself**.
> It is **not** the CLAUDE.md that mokout writes into scaffolded projects —
> that template lives in `src/templates/claude.ts`. Do not confuse the two,
> and never run `mokout init` inside this repo (it would append the template
> doctrine to *this* file).

## What mokout is

A scaffolding CLI for agentic AI projects. `mokout init` sets up a project in
one command: version control, a package manager (uv for Python, npm for JS),
a Claude-ready `CLAUDE.md`, and modern tooling (ruff/biome, lefthook, just, CI).

Run via `npx mokout init` — no install required.

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
├── cli.ts              # Clipanion entry: registers commands + builtins
├── commands/init.ts    # InitCommand — flags, clack prompts, orchestration
├── generators/init.ts  # registerInit(): maps templates → node-plop actions
├── lib/exec.ts         # exists() / hasCommand() / run() helpers
└── templates/
    ├── index.ts        # filesFor(stack) → TemplateFile[]  (the manifest)
    ├── claude.ts       # CLAUDE_MD emitted into scaffolded projects
    ├── shared.ts       # files common to every stack
    ├── python.ts       # uv + ruff + lefthook + just
    └── javascript.ts   # npm + biome + lefthook + just
```

Templates are **inline string constants**, bundled into `dist/cli.js` by tsup.
This is deliberate: no runtime file resolution, so the published binary can
never fail to find its templates. Keep it that way.

## How to extend

**Add/change a scaffolded file:** edit the relevant `src/templates/*.ts`
constant and add an entry to `src/templates/index.ts`. A `TemplateFile` has a
`mode`: `"skip"` (never overwrite) or `"append"` (create-or-append, like
CLAUDE.md). Nothing else to wire up.

**Add a new stack:** add a `Stack` member and a `STACK[...]` entry in
`src/templates/index.ts`, plus a `src/templates/<stack>.ts` module.

**Add a sub-generator** (the planned `mokout add agent/tool/...`): add a
Clipanion command under `src/commands/`, build its `TemplateFile[]`, and map it
through the same `toAction` shape used by `registerInit` in
`src/generators/init.ts`. The generator engine is already shared.

## Dev commands

```bash
pnpm install        # deps
pnpm build          # tsup → dist/cli.js
pnpm typecheck      # tsc --noEmit
pnpm lint           # biome check .
pnpm format         # biome check --write .
```

## Verification (do this before calling anything done)

Templates for tools we don't run can silently rot. Prove the real path:

```bash
pnpm build
TMP=$(mktemp -d); cd "$TMP"
node "$OLDPWD/dist/cli.js" init --python        # then --js, then re-run for idempotency
uvx ruff check . && uvx ruff format --check .    # Python lint path must pass
```

The discriminating test is the **built** CLI run from a **clean dir** — not
file generation in the source tree. Re-run all three scenarios (python / js /
idempotent re-run) after any change to templates or the generator.
