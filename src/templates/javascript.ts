// JavaScript/Bun stack: bun + biome.

export const GITIGNORE = `node_modules/
dist/
.env
.next/
*.log
.DS_Store
`;

// Minimal config valid across Biome 1.x and 2.x (formatter + recommended linter,
// no version-specific keys). Run with \`npx @biomejs/biome check .\`.
export const BIOME_JSON = `{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
`;

// Goes into CLAUDE.md's "project" managed block — concrete, actionable facts
// agents need (auto-populated because mokout set this tooling up).
export const SETUP = `## Project Setup

- **Stack:** JavaScript (Bun + Biome)
- **Run:** \`bun run <file>\` · **Add deps:** \`bun add <pkg>\`
- **Lint + format:** \`bunx biome check .\` / \`bunx biome check --write .\`
- **Test:** \`bun test\`

## Definition of Done

- \`bunx biome check .\` and \`bun test\` pass
- No secrets committed — use \`.env\` (see \`.env.example\`)
- Change is minimal and verified (see "Verification Before Done")`;

// .claude/settings.json — pre-approve this project's safe commands so agents
// run them without a permission prompt. Bash matchers use the \`:*\` prefix form.
export const SETTINGS_JSON = `{
  "permissions": {
    "allow": [
      "Bash(bun run:*)",
      "Bash(bun test:*)",
      "Bash(bun add:*)",
      "Bash(bun install:*)",
      "Bash(bunx biome:*)",
      "Bash(bun:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  }
}
`;
