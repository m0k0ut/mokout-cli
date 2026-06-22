import * as p from "@clack/prompts";
import { Command, Option } from "clipanion";
import nodePlop from "node-plop";
import { registerGenerator } from "../generators/engine";
import { appendText, exists, hasCommand, readText, remove, run } from "../lib/exec";
import { SYMLINKS, type Stack, filesFor } from "../templates";
import { RUFF_PYPROJECT } from "../templates/python";

// Sample files `uv init` drops in that we strip — keep pyproject.toml and
// .python-version, lose the boilerplate.
const UV_BOILERPLATE = ["hello.py", "main.py", "README.md"];

// Dev tooling the scaffold's commands need (`uv run pytest`, `uv run ruff`, `uv run pyrefly`).
const PY_DEV_DEPS = ["pytest", "ruff", "pyrefly"];
const JS_DEV_DEPS = ["@biomejs/biome"];

export class InitCommand extends Command {
  static override paths = [["project", "init"]];

  static override usage = Command.Usage({
    description: "Scaffold an agentic AI project: uv/npm, CLAUDE.md, and modern tooling.",
    examples: [
      ["Interactive (asks for stack)", "mokout project init"],
      ["Python project", "mokout project init --python"],
      ["JavaScript project", "mokout project init --js"],
      ["Preview without writing", "mokout project init --dry-run"],
    ],
  });

  js = Option.Boolean("--js", false, { description: "Scaffold a Node/JS project" });
  python = Option.Boolean("--python", false, {
    description: "Scaffold a Python project (default)",
  });
  dryRun = Option.Boolean("--dry-run", false, {
    description: "Print what would be created without writing anything",
  });

  async execute(): Promise<number> {
    const cwd = process.cwd();
    p.intro("mokout project init");

    const stack = await this.resolveStack();
    if (stack === null) {
      p.cancel("Cancelled.");
      return 1;
    }

    const files = filesFor(stack);
    // A managed file (CLAUDE.md) can appear under multiple markers — show once.
    const paths = [...new Set(files.map((f) => f.path))];
    const links = SYMLINKS.map((l) => `${l.path} -> ${l.target}`);
    const steps =
      stack === "javascript"
        ? ["npm init -y", `npm install --save-dev ${JS_DEV_DEPS.join(" ")}`]
        : ["uv init", `uv add --dev ${PY_DEV_DEPS.join(" ")}`];

    if (this.dryRun) {
      p.note(["git init", ...steps, ...paths, ...links].join("\n"), "Would create");
      p.outro("Dry run — nothing written.");
      return 0;
    }

    // 1. Version control first.
    if (!exists(cwd, ".git")) run("git", ["init", "-q"], cwd);

    // 2. Package manager scaffold (skip if already initialized).
    if (stack === "javascript") {
      if (!exists(cwd, "package.json")) {
        if (!hasCommand("npm")) {
          p.cancel("npm not found on PATH.");
          return 1;
        }
        run("npm", ["init", "-y"], cwd);

        const dep = p.spinner();
        dep.start(`Adding dev dependencies (${JS_DEV_DEPS.join(", ")})`);
        try {
          run("npm", ["install", "--save-dev", ...JS_DEV_DEPS], cwd);
          dep.stop(`Dev dependencies added (${JS_DEV_DEPS.join(", ")})`);
        } catch {
          dep.stop(
            `Skipped dev deps — run \`npm install --save-dev ${JS_DEV_DEPS.join(" ")}\` (offline?)`,
          );
        }
      }
    } else if (!exists(cwd, "pyproject.toml")) {
      if (!hasCommand("uv")) {
        p.cancel("uv not found on PATH — install from https://docs.astral.sh/uv/");
        return 1;
      }
      // Only strip boilerplate uv creates this run — never a file the user already had.
      const preexisting = UV_BOILERPLATE.filter((f) => exists(cwd, f));
      run("uv", ["init"], cwd);
      for (const f of UV_BOILERPLATE) {
        if (!preexisting.includes(f)) remove(cwd, f);
      }

      // Dev tooling so `uv run pytest` / `uv run ruff` work out of the box.
      // Non-fatal: an offline `uv add` shouldn't abort an otherwise-complete scaffold.
      const dep = p.spinner();
      dep.start(`Adding dev dependencies (${PY_DEV_DEPS.join(", ")})`);
      try {
        run("uv", ["add", "--dev", ...PY_DEV_DEPS], cwd);
        dep.stop(`Dev dependencies added (${PY_DEV_DEPS.join(", ")})`);
      } catch {
        dep.stop(`Skipped dev deps — run \`uv add --dev ${PY_DEV_DEPS.join(" ")}\` (offline?)`);
      }

      // Fold ruff config into the pyproject.toml uv just created (no ruff.toml).
      const pyproject = readText(cwd, "pyproject.toml");
      if (pyproject && !pyproject.includes("[tool.ruff]")) {
        appendText(cwd, "pyproject.toml", `\n${RUFF_PYPROJECT}`);
      }
    }

    // 3. Project files + CLAUDE.md, via the shared generator engine.
    const s = p.spinner();
    s.start("Writing project files");
    const plop = await nodePlop(undefined, { destBasePath: cwd, force: false });
    registerGenerator(plop, {
      name: "init",
      description: `Scaffold a ${stack} project`,
      files: filesFor(stack),
      symlinks: SYMLINKS,
    });
    await plop.getGenerator("init").runActions({});
    s.stop("Files written");

    const cloneSpinner = p.spinner();
    cloneSpinner.start("Adding agent-skills to .agents/skills");
    try {
      if (!exists(cwd, ".agents/skills")) {
        run(
          "git",
          ["clone", "--depth", "1", "https://github.com/addyosmani/agent-skills", ".agents/skills"],
          cwd,
        );
        remove(cwd, ".agents/skills/.git");
      }
      cloneSpinner.stop("Added agent-skills to .agents/skills");
    } catch {
      cloneSpinner.stop("Skipped agent-skills (offline?)");
    }

    p.note(
      [...paths.map((f) => `• ${f}`), ...links.map((l) => `• ${l}`), "• .agents/skills/"].join(
        "\n",
      ),
      `Scaffolded (${stack})`,
    );
    p.outro("Done. CLAUDE.md lists the project commands; AGENTS.md mirrors it.");
    return 0;
  }

  /** Resolve the stack from flags, else prompt. Returns null if the user cancels. */
  private async resolveStack(): Promise<Stack | null> {
    if (this.js) return "javascript";
    if (this.python) return "python";

    // No flag and no interactive terminal (piped, CI, npx in a script): fall back
    // to the default stack instead of crashing on an impossible prompt.
    if (!process.stdin.isTTY) return "python";

    const choice = await p.select({
      message: "Project stack?",
      initialValue: "python" as Stack,
      options: [
        { value: "python" as Stack, label: "Python", hint: "uv + ruff" },
        { value: "javascript" as Stack, label: "JavaScript", hint: "npm + biome" },
      ],
    });
    return p.isCancel(choice) ? null : choice;
  }
}
