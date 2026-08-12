---
name: gstack-upgrade
version: 2.0.0
description: Upgrade the customized gstack installation from biker2000on/gstack.
triggers:
  - upgrade gstack
  - update gstack version
  - get latest gstack
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->


## When to invoke this skill

Detects
Claude, Codex, Gemini, shared-repo, and vendored installs, preserves local
changes, rebuilds all host formats, and summarizes user-facing changes.

# gstack: upgrade

Upgrade this customized fork from `https://github.com/biker2000on/gstack`.
Never replace it with `garrytan/gstack`; upstream is review-only and contains
features intentionally removed from this fork.

## 1. Locate the installation

```bash
INSTALL_DIR=""
for candidate in \
  "${GSTACK_ROOT:-}" \
  "$HOME/.gstack/repos/gstack" \
  "$HOME/.claude/skills/gstack" \
  "$HOME/.codex/skills/gstack" \
  "$HOME/.gemini/skills/gstack"; do
  [ -n "$candidate" ] && [ -d "$candidate/.git" ] && INSTALL_DIR="$candidate" && break
done

if [ -z "$INSTALL_DIR" ]; then
  _ROOT=$(git rev-parse --show-toplevel 2>/dev/null || true)
  [ -n "$_ROOT" ] && [ -f "$_ROOT/VERSION" ] && [ -f "$_ROOT/setup" ] && INSTALL_DIR="$_ROOT"
fi

if [ -z "$INSTALL_DIR" ]; then
  echo "ERROR: no git-based gstack installation found"
  exit 1
fi

echo "INSTALL_DIR=$INSTALL_DIR"
```

## 2. Verify the remote and working tree

```bash
cd "$INSTALL_DIR"
ORIGIN=$(git remote get-url origin 2>/dev/null || true)
# Claude's symlink-based install intentionally prefixes name fields in generated
# SKILL.md files. Restore their canonical generated form before deciding whether
# the checkout contains user edits; template and code changes remain visible.
if [ -x "$INSTALL_DIR/bin/gstack-patch-names" ]; then
  "$INSTALL_DIR/bin/gstack-patch-names" "$INSTALL_DIR" false >/dev/null
fi
STATUS=$(git status --short)
echo "ORIGIN=$ORIGIN"
echo "$STATUS"
```

- If origin is not `biker2000on/gstack`, stop and ask before changing it.
- If the working tree is dirty, stop and tell the user which files are modified.
  Do not stash, reset, discard, or overwrite their work automatically.

## 3. Fast-forward and rebuild

```bash
cd "$INSTALL_DIR"
OLD_VERSION=$(cat VERSION 2>/dev/null || echo unknown)
git fetch origin main
git merge --ff-only origin/main
./setup --host auto --prefix
NEW_VERSION=$(cat VERSION 2>/dev/null || echo unknown)
echo "OLD_VERSION=$OLD_VERSION NEW_VERSION=$NEW_VERSION"
```

If the fast-forward fails, report the divergence and stop. Never use
`git reset --hard` in this fork's upgrade flow.

## 4. Report changes

Read `CHANGELOG.md` entries between the old and new versions and summarize at
most seven user-facing changes. Mention that Claude, Codex, and Gemini formats
were regenerated and that all skills remain namespaced as `gstack-*`.

If the versions match, report that the installation is already current.

## Vendored fallback

If the detected installation is not a git checkout, do not overwrite it in
place. Clone the customized fork to a new temporary directory, run its setup,
and ask the user before replacing the vendored copy:

```bash
TMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/biker2000on/gstack.git "$TMP_DIR/gstack"
(cd "$TMP_DIR/gstack" && ./setup --host auto --prefix)
```

Keep the old copy recoverable until the replacement is verified.
