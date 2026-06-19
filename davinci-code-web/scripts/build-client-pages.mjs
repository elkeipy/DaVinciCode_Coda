import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = join(webRoot, 'client');
const distDir = join(clientDir, 'dist');
const env = { ...process.env, GITHUB_PAGES: 'true' };

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env, shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npx', ['tsc', '-b'], clientDir);
run('npx', ['vite', 'build'], clientDir);
const indexPath = join(distDir, 'index.html');
if (!existsSync(indexPath)) {
  console.error('build:pages failed — dist/index.html not found');
  process.exit(1);
}
copyFileSync(indexPath, join(distDir, '404.html'));
console.log('build:pages complete — 404.html created for GitHub Pages SPA routing');
