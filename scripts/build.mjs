import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

cpSync(join(root, 'credentials'), join(dist, 'credentials'), { recursive: true });
cpSync(join(root, 'nodes'), join(dist, 'nodes'), { recursive: true });

console.log('n8n-nodes-catcaster: copied sources to dist/');
