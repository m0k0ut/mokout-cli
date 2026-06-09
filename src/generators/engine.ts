import { appendFileSync, existsSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ActionType, CustomActionFunction, NodePlopAPI } from "node-plop";
import type { SymlinkSpec, TemplateFile } from "../templates";

/** A generator = a set of files to write plus symlinks to create. */
export interface GeneratorSpec {
  name: string;
  description: string;
  files: TemplateFile[];
  symlinks?: SymlinkSpec[];
}

// Turn a "create, or append if present" file into a node-plop custom action.
// node-plop's built-in `append` requires the file to already exist, so we
// roll our own to keep CLAUDE.md idempotent on re-runs.
function appendAction(file: TemplateFile): CustomActionFunction {
  return (_answers, _config, plop) => {
    const dest = join(plop.getDestBasePath(), file.path);
    if (existsSync(dest)) {
      appendFileSync(dest, `\n${file.content}`);
      return `appended ${file.path}`;
    }
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, file.content);
    return `created ${file.path}`;
  };
}

function toAction(file: TemplateFile): ActionType {
  if (file.mode === "append") return appendAction(file);
  // skip mode: write only when absent — never clobber the user's files.
  return { type: "add", path: file.path, template: file.content, skipIfExists: true };
}

// Create a relative symlink (portable across clone/move). Idempotent, and never
// fails the run: a filesystem that disallows symlinks (e.g. Windows without
// Developer Mode) is reported and skipped rather than aborting.
function symlinkAction(link: SymlinkSpec): CustomActionFunction {
  return (_answers, _config, plop) => {
    const dest = join(plop.getDestBasePath(), link.path);
    try {
      symlinkSync(link.target, dest);
      return `linked ${link.path} -> ${link.target}`;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EEXIST") return `skipped ${link.path} (exists)`;
      return `skipped ${link.path} (symlink unsupported: ${code})`;
    }
  };
}

/**
 * Register a generator on a plop instance. Every command (`init`,
 * `add agents`, future `add tool/...`) builds a {@link GeneratorSpec} and
 * registers it here — one shared engine. Files are written first (so a
 * symlink target like CLAUDE.md exists), then symlinks.
 */
export function registerGenerator(plop: NodePlopAPI, spec: GeneratorSpec): void {
  plop.setGenerator(spec.name, {
    description: spec.description,
    prompts: [],
    actions: [...spec.files.map(toAction), ...(spec.symlinks ?? []).map(symlinkAction)],
  });
}
