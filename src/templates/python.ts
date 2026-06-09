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
