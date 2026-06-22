import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
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

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Own a marked region of a file. The region is delimited by HTML comments
// (invisible in rendered markdown) so we can update it on re-run without
// clobbering the user's own content. Idempotent: replace the region if it
// exists, append it if the file exists without one, or create the file.
function managedAction(file: TemplateFile): CustomActionFunction {
  const marker = file.marker ?? "mokout";
  const begin = `<!-- mokout:${marker}:start -->`;
  const end = `<!-- mokout:${marker}:end -->`;
  const block = `${begin}\n${file.content}\n${end}\n`;

  return (_answers, _config, plop) => {
    const dest = join(plop.getDestBasePath(), file.path);
    if (!existsSync(dest)) {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, block);
      return `created ${file.path} [${marker}]`;
    }
    const current = readFileSync(dest, "utf8");
    const region = new RegExp(`${escapeRegExp(begin)}[\\s\\S]*?${escapeRegExp(end)}\\n?`);
    if (region.test(current)) {
      writeFileSync(dest, current.replace(region, block));
      return `updated ${file.path} [${marker}]`;
    }
    appendFileSync(dest, `${current.endsWith("\n") ? "\n" : "\n\n"}${block}`);
    return `added ${file.path} [${marker}]`;
  };
}

function toAction(file: TemplateFile): ActionType {
  if (file.mode === "managed") return managedAction(file);
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
      mkdirSync(dirname(dest), { recursive: true });
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
 * Register a generator on a plop instance. Every command (`project init`,
 * `code-fast init`, future `add tool/...`) builds a {@link GeneratorSpec} and
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
