// JavaScript/Node stack: npm + biome.

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

- **Stack:** JavaScript (npm + Biome)
- **Run:** \`node <file>\` · **Add deps:** \`npm install <pkg>\`
- **Lint + format:** \`npx biome check .\` / \`npx biome check --write .\`
- **Test:** \`npm test\`

## Definition of Done

- \`npx biome check .\` and \`npm test\` pass
- No secrets committed — use \`.env\` (see \`.env.example\`)
- Change is minimal and verified (see "Verification Before Done")`;

// .claude/settings.json — pre-approve this project's safe commands so agents
// run them without a permission prompt. Bash matchers use the \`:*\` prefix form.
export const SETTINGS_JSON = `{
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(npm test:*)",
      "Bash(npm install:*)",
      "Bash(npm ci:*)",
      "Bash(npx biome:*)",
      "Bash(node:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  }
}
`;
