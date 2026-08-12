# Adding a host

Host definitions live in `hosts/` and implement the shared `HostConfig` contract.
Use `hosts/codex.ts` or `hosts/gemini.ts` as the external-agent pattern and
`hosts/claude.ts` for the canonical template format.

1. Add `hosts/<name>.ts` with output paths, tool mappings, path rewrites, and
   frontmatter behavior.
2. Export the host from `hosts/index.ts`.
3. Add the host to the generator CLI and `setup` only if it has a global install
   location.
4. Add structural and freshness coverage in `test/host-config.test.ts`.
5. Generate all hosts and run `bun run skill:check`.

Every external host must keep the `gstack-<skill>` identifier. If it supports a
separate display label, use `gstack: <skill>`.
