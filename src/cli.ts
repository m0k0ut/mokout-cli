import { Builtins, Cli } from "clipanion";
import { AddAgentsCommand } from "./commands/add-agents";
import { InitCommand } from "./commands/init";

const cli = new Cli({
  binaryLabel: "mokout",
  binaryName: "mokout",
  binaryVersion: "0.1.0",
});

cli.register(InitCommand);
cli.register(AddAgentsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(process.argv.slice(2));
