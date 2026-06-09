import * as p from "@clack/prompts";
import { Command, Option } from "clipanion";
import nodePlop from "node-plop";
import { registerGenerator } from "../generators/engine";
import { SYMLINKS, agentFiles } from "../templates";

/**
 * `mokout add agents` — drop the agent layer (CLAUDE.md, AGENTS.md, tasks/)
 * into an existing project. No git/package-manager/tooling side effects;
 * just the files agents read. Idempotent: re-running appends the doctrine to
 * CLAUDE.md and leaves everything else untouched.
 */
export class AddAgentsCommand extends Command {
  static override paths = [["add", "agents"]];

  static override usage = Command.Usage({
    category: "add",
    description: "Add agent files (CLAUDE.md, AGENTS.md, tasks/) to the current project.",
    examples: [
      ["Add agent files here", "mokout add agents"],
      ["Preview without writing", "mokout add agents --dry-run"],
    ],
  });

  dryRun = Option.Boolean("--dry-run", false, {
    description: "Print what would be created without writing anything",
  });

  async execute(): Promise<number> {
    const cwd = process.cwd();
    p.intro("mokout add agents");

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
      name: "add-agents",
      description: "Add agent files to an existing project",
      files,
      symlinks: SYMLINKS,
    });
    await plop.getGenerator("add-agents").runActions({});
    s.stop("Agent files added");

    p.note([...paths.map((f) => `• ${f}`), ...links.map((l) => `• ${l}`)].join("\n"), "Added");
    p.outro("Done. CLAUDE.md holds the doctrine; AGENTS.md mirrors it for other agents.");
    return 0;
  }
}
