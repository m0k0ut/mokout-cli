// Python stack: uv + ruff (ruff config folded into pyproject.toml).

export const GITIGNORE = `.venv/
__pycache__/
*.pyc
.env
dist/
*.egg-info/
.ruff_cache/
.pytest_cache/
`;

// Ruff config folded into pyproject.toml (appended after `uv init`) — one fewer
// top-level file. ruff reads [tool.ruff] there natively.
export const RUFF_PYPROJECT = `[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B", "SIM"]

[tool.ruff.format]
quote-style = "double"
`;

// Goes into CLAUDE.md's "project" managed block — concrete, actionable facts
// agents need (auto-populated because mokout set this tooling up).
export const SETUP = `## Project Setup

- **Stack:** Python (uv + ruff)
- **Run:** \`uv run <script>\` · **Add deps:** \`uv add <pkg>\`
- **Lint + format:** \`uv run ruff check .\` / \`uv run ruff format .\`
- **Type check:** \`uv run pyrefly .\`
- **Test:** \`uv run pytest\`

## Definition of Done

- \`uv run ruff check .\`, \`uv run pyrefly .\` and \`uv run pytest\` pass
- No secrets committed — use \`.env\` (see \`.env.example\`)
- Change is minimal and verified (see "Verification Before Done")`;

// .claude/settings.json — pre-approve this project's safe commands so agents
// run them without a permission prompt. Bash matchers use the \`:*\` prefix form.
export const SETTINGS_JSON = `{
  "permissions": {
    "allow": [
      "Bash(uv:*)",
      "Bash(uvx:*)",
      "Bash(ruff:*)",
      "Bash(pyrefly:*)",
      "Bash(pytest:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  }
}
`;
