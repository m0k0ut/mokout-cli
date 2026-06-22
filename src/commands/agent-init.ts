import { spawnSync } from "node:child_process";
import * as p from "@clack/prompts";
import { Command } from "clipanion";

export class AgentInitCommand extends Command {
  static override paths = [["agent", "init"]];

  static override usage = Command.Usage({
    description: "Initialize and install google-agents-cli skills locally in the project folder.",
    examples: [["Install skills to workspace", "mokout agent init"]],
  });

  async execute(): Promise<number> {
    p.intro("mokout agent init");

    const s = p.spinner();
    s.start("Installing google-agents-cli and workspace skills...");

    const cwd = process.cwd();

    // Ensure it's installed
    const installResult = spawnSync("uv", ["tool", "install", "google-agents-cli"], {
      cwd,
      stdio: "inherit",
    });

    if (installResult.error || (installResult.status !== null && installResult.status !== 0)) {
      p.cancel("Failed to install google-agents-cli via uv tool.");
      return installResult.status ?? 1;
    }

    // Run setup --workspace
    const setupResult = spawnSync(
      "uv",
      ["tool", "run", "google-agents-cli", "setup", "--workspace"],
      {
        cwd,
        stdio: "inherit",
      },
    );

    if (setupResult.error || (setupResult.status !== null && setupResult.status !== 0)) {
      p.cancel("Failed to setup google-agents-cli skills.");
      return setupResult.status ?? 1;
    }

    s.stop("Skills installed locally in the workspace!");
    p.outro("Done.");
    return 0;
  }
}
