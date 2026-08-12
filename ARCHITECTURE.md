# Architecture

gstack is a source-and-generation repository for portable agent skills.

## Layers

1. `*/SKILL.md.tmpl` contains the editable skill instructions.
2. `scripts/resolvers/` expands shared placeholders and host-specific behavior.
3. `scripts/gen-skill-docs.ts` generates canonical and external-host skill trees.
4. `hosts/` defines tool and path mappings for each supported agent.
5. `setup` installs namespaced `gstack-*` skills and their runtime sidecars.

Claude Code, OpenAI Codex, and Gemini CLI are equal primary targets. Additional
compatible host configurations may reuse the same resolver pipeline.

Portable identifiers use `gstack-<skill>`. Hosts with display-name metadata show
`gstack: <skill>` without changing the on-disk identifier.

Runtime helpers live under `bin/`, browser automation under `browse/`, and
document/rendering helpers beside their owning skills. Generated skill documents
must never be edited directly.

Upgrades follow `biker2000on/gstack` `main`. The original upstream remote is kept
only for selectively reviewing future changes.
