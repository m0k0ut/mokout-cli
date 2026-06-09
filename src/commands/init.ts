import * as p from "@clack/prompts";
import { Command, Option } from "clipanion";
import nodePlop from "node-plop";
import { registerGenerator } from "../generators/engine";
import { exists, hasCommand, run } from "../lib/exec";
import { SYMLINKS, type Stack, filesFor } from "../templates";

export class InitCommand extends Command {
  static override paths = [["init"], Command.Default];

  static override usage = Command.Usage({
    description: "Scaffold an agentic AI project: uv/npm, CLAUDE.md, and modern tooling.",
    examples: [
      ["Interactive (asks for stack)", "mokout init"],
      ["Python project", "mokout init --python"],
      ["JavaScript project", "mokout init --js"],
      ["Preview without writing", "mokout init --dry-run"],
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
    p.intro("mokout init");

    const stack = await this.resolveStack();
    if (stack === null) {
      p.cancel("Cancelled.");
      return 1;
    }

    const files = filesFor(stack);
    // A managed file (CLAUDE.md) can appear under multiple markers — show once.
    const paths = [...new Set(files.map((f) => f.path))];
    const links = SYMLINKS.map((l) => `${l.path} -> ${l.target}`);
    const initCmd = stack === "javascript" ? "npm init -y" : "uv init";

    if (this.dryRun) {
      p.note(["git init", initCmd, ...paths, ...links].join("\n"), "Would create");
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
      }
    } else if (!exists(cwd, "pyproject.toml")) {
      if (!hasCommand("uv")) {
        p.cancel("uv not found on PATH — install from https://docs.astral.sh/uv/");
        return 1;
      }
      run("uv", ["init"], cwd);
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

    p.note(
      [...paths.map((f) => `• ${f}`), ...links.map((l) => `• ${l}`)].join("\n"),
      `Scaffolded (${stack})`,
    );
    p.outro("Done. Review CLAUDE.md, then run `just` to see project commands.");
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
