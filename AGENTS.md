# gstack development guide

gstack is a multi-host collection of generated Agent Skills. Claude Code, OpenAI
Codex, and Gemini CLI are equal supported targets; do not introduce behavior that
assumes one of them is the universal orchestrator.

## Source of truth

- Skill instructions live in `*/SKILL.md.tmpl`.
- Generated `SKILL.md` files must be refreshed after template changes.
- Host behavior lives in `hosts/claude.ts`, `hosts/codex.ts`, and `hosts/gemini.ts`.
- The installer must keep `gstack-<skill>` identifiers mandatory on every host.
- Human-facing metadata should use `gstack: <skill>` where the host supports a display label.

## Supported scope

This fork intentionally excludes iOS tooling, gbrain, OpenClaw, Hermes, and
Supabase-specific infrastructure. Do not reintroduce their skills, binaries,
host adapters, migrations, documentation, or tests while syncing upstream.

## Commands

```bash
bun install
bun run gen:skill-docs --host all
bun run skill:check
bun test
```

On Windows, use the repository's Windows-safe test command when the full shell
suite is unavailable:

```bash
bun run test:windows
```

## Upgrade policy

The `origin` remote is the customized `biker2000on/gstack` fork. The `upstream`
remote is `garrytan/gstack` and is for review only. Upgrades must pull from origin
so excluded features are not silently restored.

## Naming policy

Portable skill identifiers cannot safely contain a colon, so the canonical name
is `gstack-<skill>`. A display label such as `gstack: review` is metadata only.
