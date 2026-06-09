// Python stack: uv + ruff + lefthook + just.

export const GITIGNORE = `.venv/
__pycache__/
*.pyc
.env
dist/
*.egg-info/
.ruff_cache/
.pytest_cache/
`;

export const RUFF_TOML = `# Ruff — linter + formatter. https://docs.astral.sh/ruff/
line-length = 100
target-version = "py312"

[lint]
select = ["E", "F", "I", "UP", "B", "SIM"]

[format]
quote-style = "double"
`;

export const LEFTHOOK_YML = `# lefthook — git hooks. Run \`lefthook install\` once to activate.
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.py"
      run: uvx ruff check --fix {staged_files}
      stage_fixed: true
    format:
      glob: "*.py"
      run: uvx ruff format {staged_files}
      stage_fixed: true
`;

export const JUSTFILE = `# Run \`just\` with no args to list recipes.
default:
    @just --list

# Sync dependencies into the project venv
install:
    uv sync

# Lint + check formatting
lint:
    uvx ruff check .
    uvx ruff format --check .

# Auto-fix lint issues and format
fmt:
    uvx ruff check --fix .
    uvx ruff format .

# Run the test suite
test:
    uv run pytest

# Install git hooks
hooks:
    lefthook install
`;

// Goes into CLAUDE.md's "project" managed block — concrete, actionable facts
// agents need (auto-populated because mokout set this tooling up).
export const SETUP = `## Project Setup

- **Stack:** Python (uv + ruff)
- **Run:** \`uv run <script>\` · **Add deps:** \`uv add <pkg>\`
- **Lint + format:** \`just lint\` / \`just fmt\` (ruff)
- **Test:** \`just test\` (pytest)
- **Git hooks:** \`just hooks\` (lefthook)

## Definition of Done

- \`just lint\` and \`just test\` pass
- No secrets committed — use \`.env\` (see \`.env.example\`)
- Change is minimal and verified (see "Verification Before Done")`;

// .claude/settings.json — pre-approve this project's safe commands so agents
// run them without a permission prompt. Bash matchers use the \`:*\` prefix form.
export const SETTINGS_JSON = `{
  "permissions": {
    "allow": [
      "Bash(just:*)",
      "Bash(uv:*)",
      "Bash(uvx:*)",
      "Bash(ruff:*)",
      "Bash(pytest:*)",
      "Bash(lefthook:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  }
}
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
      - uses: astral-sh/setup-uv@v5
      - run: uvx ruff check .
      - run: uvx ruff format --check .
`;
