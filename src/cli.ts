import { Builtins, Cli } from "clipanion";
import { InitCommand } from "./commands/init";

const cli = new Cli({
  binaryLabel: "mokout",
  binaryName: "mokout",
  binaryVersion: "0.1.0",
});

cli.register(InitCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(process.argv.slice(2));
