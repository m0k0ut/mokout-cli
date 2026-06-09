// JavaScript/Node stack: npm + biome + lefthook + just.

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

export const LEFTHOOK_YML = `# lefthook — git hooks. Run \`lefthook install\` once to activate.
pre-commit:
  parallel: true
  commands:
    check:
      glob: "*.{js,jsx,ts,tsx,json,jsonc}"
      run: npx --yes @biomejs/biome check --write {staged_files}
      stage_fixed: true
`;

export const JUSTFILE = `# Run \`just\` with no args to list recipes.
default:
    @just --list

# Install dependencies
install:
    npm install

# Lint + check formatting
lint:
    npx --yes @biomejs/biome check .

# Auto-fix lint issues and format
fmt:
    npx --yes @biomejs/biome check --write .

# Run the test suite
test:
    npm test

# Install git hooks
hooks:
    lefthook install
`;

export const CI_YML = `name: CI
on:
  push:
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx --yes @biomejs/biome ci .
`;
