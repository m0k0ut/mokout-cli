import * as p from "@clack/prompts";
import { Command, Option } from "clipanion";
import nodePlop from "node-plop";
import { registerGenerator } from "../generators/engine";
import { exists, remove, run } from "../lib/exec";
import { SYMLINKS, agentFiles } from "../templates";

/**
 * `mokout code-fast init` — drop the agent layer (CLAUDE.md, AGENTS.md, tasks/)
 * into an existing project. No git/package-manager/tooling side effects;
 * just the files agents read. Idempotent: re-running appends the doctrine to
 * CLAUDE.md and leaves everything else untouched.
 */
export class CodeFastInitCommand extends Command {
  static override paths = [["code-fast", "init"]];

  static override usage = Command.Usage({
    category: "code-fast",
    description: "Add agent files (CLAUDE.md, AGENTS.md, tasks/) to the current project.",
    examples: [
      ["Add agent files here", "mokout code-fast init"],
      ["Preview without writing", "mokout code-fast init --dry-run"],
    ],
  });

  dryRun = Option.Boolean("--dry-run", false, {
    description: "Print what would be created without writing anything",
  });

  async execute(): Promise<number> {
    const cwd = process.cwd();
    p.intro("mokout code-fast init");

    const files = agentFiles();
    const paths = [...new Set(files.map((f) => f.path))];
    const links = SYMLINKS.map((l) => `${l.path} -> ${l.target}`);

    if (this.dryRun) {
      p.note([...paths, ...links].join("\n"), "Would create");
      p.outro("Dry run — nothing written.");
      return 0;
    }

    const s = p.spinner();
    s.start("Adding agent files");
    const plop = await nodePlop(undefined, { destBasePath: cwd, force: false });
    registerGenerator(plop, {
      name: "code-fast-init",
      description: "Add agent files to an existing project",
      files,
      symlinks: SYMLINKS,
    });
    await plop.getGenerator("code-fast-init").runActions({});
    s.stop("Agent files added");

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
      "Added",
    );
    p.outro("Done. CLAUDE.md holds the doctrine; AGENTS.md mirrors it for other agents.");
    return 0;
  }
}
