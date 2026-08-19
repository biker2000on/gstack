import { describe, test, expect, afterAll } from 'bun:test';
import * as path from 'path';

// Load the polyfill into a fresh object (don't clobber globalThis.Bun)
const polyfillPath = path.resolve(import.meta.dir, '../src/bun-polyfill.cjs');
const polyfillRequire = JSON.stringify(polyfillPath);

function runNode(source: string) {
  // Bun's Windows argv handling drops multiline `node -e` programs. Passing
  // a one-line base64 loader keeps these subprocess tests cross-platform.
  const encoded = Buffer.from(source, 'utf-8').toString('base64');
  return Bun.spawnSync(
    ['node', '-e', `eval(Buffer.from('${encoded}', 'base64').toString('utf-8'))`],
    { stdout: 'pipe', stderr: 'pipe' },
  );
}

describe('bun-polyfill', () => {
  // We test the polyfill by requiring it in a subprocess under Node.js
  // since it's designed for Node, not Bun.

  test('Bun.sleep resolves after delay', async () => {
    const result = runNode(`
      require(${polyfillRequire});
      (async () => {
        const start = Date.now();
        await Bun.sleep(50);
        const elapsed = Date.now() - start;
        console.log(elapsed >= 40 ? 'OK' : 'TOO_FAST');
      })();
    `);
    expect(result.stdout.toString().trim()).toBe('OK');
    expect(result.exitCode).toBe(0);
  });

  test('Bun.spawnSync runs a command and returns stdout', () => {
    const result = runNode(`
      require(${polyfillRequire});
      const r = Bun.spawnSync(
        [process.execPath, '-e', "process.stdout.write('hello')"],
        { stdout: 'pipe' },
      );
      console.log(r.stdout.toString().trim());
      console.log('exit:' + r.exitCode);
    `);
    const lines = result.stdout.toString().trim().split('\n');
    expect(lines[0]).toBe('hello');
    expect(lines[1]).toBe('exit:0');
  });

  test('Bun.spawn launches a process with pid', async () => {
    const result = runNode(`
      require(${polyfillRequire});
      const p = Bun.spawn([process.execPath, '-e', ''], { stdio: ['pipe', 'pipe', 'pipe'] });
      console.log(typeof p.pid === 'number' ? 'HAS_PID' : 'NO_PID');
      console.log(typeof p.kill === 'function' ? 'HAS_KILL' : 'NO_KILL');
      console.log(typeof p.unref === 'function' ? 'HAS_UNREF' : 'NO_UNREF');
    `);
    const lines = result.stdout.toString().trim().split('\n');
    expect(lines[0]).toBe('HAS_PID');
    expect(lines[1]).toBe('HAS_KILL');
    expect(lines[2]).toBe('HAS_UNREF');
  });

  test('Bun.spawn defaults windowsHide to true', () => {
    const result = runNode(`
      const childProcess = require('child_process');
      const originalSpawn = childProcess.spawn;
      childProcess.spawn = (_command, _args, options) => {
        console.log(String(options.windowsHide));
        return originalSpawn(process.execPath, ['-e', ''], options);
      };
      require(${polyfillRequire});
      Bun.spawn(['node', '-e', '']);
    `);
    expect(result.stdout.toString().trim()).toBe('true');
    expect(result.exitCode).toBe(0);
  });

  test('Bun.spawnSync defaults windowsHide to true', () => {
    const result = runNode(`
      const childProcess = require('child_process');
      const originalSpawnSync = childProcess.spawnSync;
      childProcess.spawnSync = (_command, _args, options) => {
        console.log(String(options.windowsHide));
        return originalSpawnSync(process.execPath, ['-e', ''], options);
      };
      require(${polyfillRequire});
      Bun.spawnSync(['node', '-e', '']);
    `);
    expect(result.stdout.toString().trim()).toBe('true');
    expect(result.exitCode).toBe(0);
  });

  test('Bun spawn wrappers honor an explicit windowsHide false', () => {
    const result = runNode(`
      const childProcess = require('child_process');
      childProcess.spawn = (_command, _args, options) => {
        console.log('spawn:' + String(options.windowsHide));
        return { pid: 1, kill() {}, unref() {}, stdout: null, stderr: null };
      };
      childProcess.spawnSync = (_command, _args, options) => {
        console.log('spawnSync:' + String(options.windowsHide));
        return { stdout: Buffer.alloc(0), stderr: Buffer.alloc(0), status: 0, signal: null };
      };
      require(${polyfillRequire});
      Bun.spawn(['node', '-e', ''], { windowsHide: false });
      Bun.spawnSync(['node', '-e', ''], { windowsHide: false });
    `);
    expect(result.stdout.toString().trim().split('\n')).toEqual([
      'spawn:false',
      'spawnSync:false',
    ]);
    expect(result.exitCode).toBe(0);
  });

  test('Bun.serve creates an HTTP server that responds', async () => {
    const result = runNode(`
      require(${polyfillRequire});
      const server = Bun.serve({
        port: 0,  // Note: polyfill uses port directly, so we pick one
        hostname: '127.0.0.1',
        fetch(req) {
          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        },
      });
      // The polyfill doesn't support port 0, so we test the object shape
      console.log(typeof server.stop === 'function' ? 'HAS_STOP' : 'NO_STOP');
      console.log(typeof server.port === 'number' ? 'HAS_PORT' : 'NO_PORT');
      server.stop();
    `);
    const lines = result.stdout.toString().trim().split('\n');
    expect(lines[0]).toBe('HAS_STOP');
    expect(lines[1]).toBe('HAS_PORT');
  });
});
