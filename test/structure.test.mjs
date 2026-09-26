import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('build produces dist artifacts', () => {
  execSync('node scripts/build.mjs', { cwd: root, stdio: 'pipe' });
  assert.ok(existsSync(path.join(root, 'dist/nodes/CatCaster/CatCaster.node.js')));
});

test('package metadata points at this repository', () => {
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.match(pkg.repository.url, /catcaster-n8n/);
});
