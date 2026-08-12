# Contributing

Edit skill templates, regenerate every host, and validate before opening a change.

```bash
bun install
bun run gen:skill-docs --host all
bun run skill:check
bun run test:windows  # Windows
bun test              # macOS/Linux
```

## Rules

- Treat Claude Code, OpenAI Codex, and Gemini CLI as equal supported hosts.
- Keep portable skill identifiers namespaced as `gstack-<skill>`.
- Use `gstack: <skill>` for host metadata display labels when supported.
- Edit `SKILL.md.tmpl`, not generated `SKILL.md` files.
- Keep host paths and tools in `hosts/`, shared expansion in `scripts/resolvers/`,
  and installation behavior in `setup`.
- Do not add a dependency on a single agent's private configuration layout to a
  shared skill unless the host adapter rewrites it for every target.
- Preserve `origin` as the customized fork and use `upstream` only for review.

See `AGENTS.md` for the complete repository policy.
