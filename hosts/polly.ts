import type { HostConfig } from '../scripts/host-config';

// Polly loads skills from its bundled Omnigent agent directory. The setup
// script resolves that versioned package path dynamically, while runtime
// assets live at this stable per-user location.
const polly: HostConfig = {
  name: 'polly',
  displayName: 'Omnigent Polly',
  cliCommand: 'omni',
  cliAliases: ['omnigent'],

  globalRoot: '.omnigent/skills/gstack',
  localSkillRoot: '.polly/skills/gstack',
  hostSubdir: '.polly',
  usesEnvVars: true,

  frontmatter: {
    mode: 'allowlist',
    keepFields: ['name', 'description'],
    descriptionLimit: null,
  },

  generation: {
    generateMetadata: false,
    // Polly can delegate to multiple worker CLIs, so keep both cross-model
    // wrappers (gstack-claude and gstack-codex) available.
    skipSkills: [],
  },

  pathRewrites: [
    { from: '~/.claude/skills/gstack', to: '$GSTACK_ROOT' },
    { from: '.claude/skills/gstack', to: '.polly/skills/gstack' },
    { from: '.claude/skills/review', to: '.polly/skills/gstack/review' },
    { from: '.claude/skills', to: '.polly/skills' },
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

  learningsMode: 'basic',
};

export default polly;
