import { describe, test, expect } from 'bun:test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SERVER_NODE = path.join(DIST_DIR, 'server-node.mjs');
const BUILD_SCRIPT = path.resolve(__dirname, '..', '..', 'scripts', 'build.sh');
const CLI_SOURCE = path.resolve(__dirname, '..', 'src', 'cli.ts');
const NODE_RUNTIME_PACKAGES = ['playwright', 'playwright-core', 'diff'];

describe('build: server-node.mjs', () => {
  test('passes node --check if present', () => {
    if (!fs.existsSync(SERVER_NODE)) {
      // browse/dist is gitignored; no build has run in this checkout.
      // Skip rather than fail so plain `bun test` without a prior build passes.
      return;
    }
    expect(() => execSync(`node --check ${SERVER_NODE}`, { stdio: 'pipe' })).not.toThrow();
  });

  test('does not inline @ngrok/ngrok (must be external)', () => {
    if (!fs.existsSync(SERVER_NODE)) return;
    const bundle = fs.readFileSync(SERVER_NODE, 'utf-8');
    // Dynamic imports of externalized packages show up as string literals in the bundle,
    // not as inlined module code. The heuristic: ngrok's native binding loader would
    // reference its own internals. If any ngrok internal identifier appears, the module
    // got inlined despite the --external flag.
    expect(bundle).not.toMatch(/ngrok_napi|ngrokNapi|@ngrok\/ngrok-darwin|@ngrok\/ngrok-linux|@ngrok\/ngrok-win32/);
  });

  test('ships external Node dependencies with the minimal runtime', () => {
    if (!fs.existsSync(SERVER_NODE)) return;
    for (const packageName of NODE_RUNTIME_PACKAGES) {
      expect(
        fs.existsSync(path.join(DIST_DIR, 'node_modules', packageName, 'package.json')),
      ).toBe(true);
    }
  });

  test('Windows browse build requests hidden-console startup', () => {
    const script = fs.readFileSync(BUILD_SCRIPT, 'utf-8');
    expect(script).toContain('BROWSE_COMPILE_FLAGS+=(--windows-hide-console)');
    expect(script).toContain('build --compile "${BROWSE_COMPILE_FLAGS[@]}" browse/src/cli.ts');
  });

  test('packaged Windows CLI does not require the TypeScript source tree', () => {
    const source = fs.readFileSync(CLI_SOURCE, 'utf-8');
    expect(source).toContain('const SERVER_SCRIPT = IS_WINDOWS ? null : resolveServerScript()');
    expect(source).toContain('if (IS_WINDOWS) {');
    expect(source).toContain('JSON.stringify(NODE_SERVER_SCRIPT!)');
  });
});
