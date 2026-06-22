import { spawnSync } from "node:child_process";
import { Command, Option } from "clipanion";

/**
 * Proxy command for google/agents-cli.
 * Wraps up the entire functionality of google/agents-cli into `mokout agents`.
 */
export class AgentsCommand extends Command {
  static override paths = [["agents"]];

  static override usage = Command.Usage({
    category: "agents",
    description: "Proxy command for google/agents-cli (scaffold, eval, deploy, etc.)",
    examples: [
      ["Scaffold an agent project", "mokout agents scaffold my-agent"],
      ["Evaluate the agent", "mokout agents eval generate"],
      ["Deploy the agent", "mokout agents deploy"],
    ],
  });

  args = Option.Proxy();

  async execute(): Promise<number> {
    const cwd = process.cwd();

    // We use spawnSync with stdio: "inherit" so interactive prompts and colored output work naturally
    const result = spawnSync("uv", ["tool", "run", "google-agents-cli", ...this.args], {
      cwd,
      stdio: "inherit",
    });

    return result.status ?? (result.error ? 1 : 0);
  }
}
