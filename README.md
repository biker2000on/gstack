# gstack — biker2000on workflow edition

This fork packages gstack as a portable, namespaced skill suite for Claude Code,
OpenAI Codex, and Gemini CLI. It keeps the planning, review, browser, QA, release,
documentation, and safety workflows while removing iOS, gbrain, OpenClaw, Hermes,
and Supabase-specific components.

## Naming

Every installed skill uses the portable identifier `gstack-<skill>`, such as
`gstack-review`, `gstack-qa`, and `gstack-ship`. Host metadata displays these as
`gstack: review`, `gstack: qa`, and `gstack: ship` where display labels are
supported. Namespacing is mandatory in this fork to avoid collisions with other
skill collections.

## Supported agents

| Agent | Install command | Skill location |
|---|---|---|
| Claude Code | `./setup --host claude` | `~/.claude/skills/gstack-*` |
| OpenAI Codex | `./setup --host codex` | `~/.codex/skills/gstack-*` |
| Gemini CLI | `./setup --host gemini` | `~/.gemini/skills/gstack-*` |

Running `./setup` with no host flag auto-detects installed agents and installs to
each detected host. If none is detected, it produces the shared external-agent
format rather than assuming Claude.

## Install

```bash
git clone https://github.com/biker2000on/gstack.git ~/gstack
cd ~/gstack
./setup
```

Requirements: Git, Bun 1.0+, and at least one supported coding-agent CLI.

## Build and verify

```bash
bun install
bun run gen:skill-docs --host all
bun run skill:check
bun test
```

Generated `SKILL.md` files come from `SKILL.md.tmpl` sources. Edit templates and
regenerate; do not hand-edit generated files.

## Upgrade behavior

`gstack-upgrade` follows this fork's `main` branch at
`https://github.com/biker2000on/gstack`. Upstream remains configured as a read-only
Git remote for selectively reviewing future changes.

## Included workflow groups

- Product and architecture planning: `office-hours`, `autoplan`, `spec`, and plan reviews
- Implementation review: `review`, `investigate`, design reviews, QA, and security checks
- Release operations: `ship`, `land-and-deploy`, canary, release documentation
- Browser and artifacts: browse, scrape, diagrams, and PDF generation
- Safety and context: careful, freeze, guard, context save/restore, and learnings

See [AGENTS.md](AGENTS.md) for repository development conventions and the generated
skill catalog for the complete list.
