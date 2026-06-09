// Files written for every stack.

export const EDITORCONFIG = `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.{js,jsx,ts,tsx,json,jsonc,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
`;

export const ENV_EXAMPLE = `# Copy to .env and fill in. Never commit .env.
ANTHROPIC_API_KEY=
`;

export const TASKS_TODO = `# TODO

- [ ]
`;

export const TASKS_LESSONS = `# Lessons

Patterns learned from corrections. Review at session start.
`;
