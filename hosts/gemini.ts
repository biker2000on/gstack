import type { HostConfig } from '../scripts/host-config';

// Gemini CLI supports both ~/.gemini/skills and the shared ~/.agents/skills
// convention. Keep a dedicated root so users can install Codex and Gemini
// side-by-side without symlink ownership conflicts.
const gemini: HostConfig = {
  name: 'gemini',
  displayName: 'Google Gemini CLI (agy)',
  cliCommand: 'agy',
  cliAliases: ['gemini'],

  globalRoot: '.gemini/skills/gstack',
  localSkillRoot: '.gemini/skills/gstack',
  hostSubdir: '.gemini',
  usesEnvVars: true,

  frontmatter: {
    mode: 'allowlist',
    keepFields: ['name', 'description'],
    descriptionLimit: 1024,
    descriptionLimitBehavior: 'error',
  },

  generation: {
    generateMetadata: false,
    skipSkills: ['claude'],
  },

  pathRewrites: [
    { from: '~/.claude/skills/gstack', to: '$GSTACK_ROOT' },
    { from: '.claude/skills/gstack', to: '.gemini/skills/gstack' },
    { from: '.claude/skills/review', to: '.gemini/skills/gstack/review' },
    { from: '.claude/skills', to: '.gemini/skills' },
    { from: 'CLAUDE.md', to: 'AGENTS.md' },
  ],

  runtimeRoot: {
    globalSymlinks: ['bin', 'browse/dist', 'browse/bin', 'gstack-upgrade', 'ETHOS.md'],
    globalFiles: {
      review: ['checklist.md', 'TODOS-format.md'],
    },
  },

  install: {
    prefixable: false,
    linkingStrategy: 'symlink-generated',
  },

  coAuthorTrailer: 'Co-Authored-By: Google Gemini <noreply@google.com>',
  learningsMode: 'basic',
};

export default gemini;
