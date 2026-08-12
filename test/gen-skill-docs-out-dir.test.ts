import { describe, test, expect } from 'bun:test';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const ROOT = path.resolve(import.meta.dir, '..');

// Render the Claude skill set into a temporary out-dir. Asserts the B2 contract:
//   (a) the worktree SKILL.md is byte-unchanged (source stays canonical),
//   (b) its section refs point at the out-dir, not ~/.claude/skills/gstack,
//   (c) bin/ refs are left pointing at the global install,
//   (d) section files are emitted with their normal content.
describe('gen-skill-docs --out-dir (B2 render isolation)', () => {
  function hashFile(p: string): string {
    return createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  }

  test('renders :user to out-dir, rewrites section paths, leaves worktree canonical', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gstack-out-'));
    const worktreeSkill = path.join(ROOT, 'ship', 'SKILL.md');
    const beforeHash = hashFile(worktreeSkill);
    try {
      const res = spawnSync(
        'bun',
        ['run', 'scripts/gen-skill-docs.ts', '--host', 'claude', '--out-dir', outDir],
        { cwd: ROOT, encoding: 'utf-8', timeout: 120_000 },
      );
      expect(res.status).toBe(0);

      const outSkill = path.join(outDir, 'ship', 'SKILL.md');
      const outSection = path.join(outDir, 'ship', 'sections', 'adversarial.md');
      expect(fs.existsSync(outSkill)).toBe(true);
      const skillContent = fs.readFileSync(outSkill, 'utf-8');

      // (a) worktree byte-unchanged
      expect(hashFile(worktreeSkill)).toBe(beforeHash);

      // (b) section refs repointed to the out-dir; none left pointing at the install
      expect(skillContent).toContain(`${outDir}/ship/sections/`);
      expect(skillContent).not.toContain('~/.claude/skills/gstack/ship/sections/');

      // (c) bin refs are NOT rewritten — they still resolve to the global install
      expect(skillContent).toContain('~/.claude/skills/gstack/bin/');

      // (d) the rendered section retains its normal content
      expect(fs.existsSync(outSection)).toBe(true);
      expect(fs.readFileSync(outSection, 'utf-8')).toContain('Adversarial');
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  test('global extras (proactive-suggestions.json) are NOT written in out-dir mode', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gstack-out-'));
    try {
      const res = spawnSync(
        'bun',
        ['run', 'scripts/gen-skill-docs.ts', '--host', 'claude', '--out-dir', outDir],
        { cwd: ROOT, encoding: 'utf-8', timeout: 120_000 },
      );
      expect(res.status).toBe(0);
      // proactive-suggestions.json lives at a repo path; out-dir mode must skip it.
      expect(fs.existsSync(path.join(outDir, 'scripts', 'proactive-suggestions.json'))).toBe(false);
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });
});
