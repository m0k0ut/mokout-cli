import { Builtins, Cli } from "clipanion";
import { CodeFastInitCommand } from "./commands/code-fast-init";
import { InitCommand } from "./commands/init";

const cli = new Cli({
  binaryLabel: "mokout",
  binaryName: "mokout",
  binaryVersion: "0.1.0",
});

cli.register(InitCommand);
cli.register(CodeFastInitCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);

cli.runExit(process.argv.slice(2));
