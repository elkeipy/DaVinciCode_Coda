import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = dirname(fileURLToPath(import.meta.url));
const composeFile = join(webRoot, '..', 'docker-compose.yml');

function run(args) {
  const result = spawnSync('docker', ['compose', '-f', composeFile, ...args], {
    cwd: join(webRoot, '..'),
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const command = process.argv[2] ?? 'up';
if (command === 'up') {
  run(['up', '-d']);
  console.log('PostgreSQL: postgresql://davinci:davinci@localhost:5432/davinci_dev');
} else if (command === 'down') {
  run(['down']);
} else if (command === 'logs') {
  run(['logs', '-f', 'postgres']);
} else if (command === 'ps') {
  run(['ps']);
} else {
  console.error('Usage: node scripts/db.mjs [up|down|logs|ps]');
  process.exit(1);
}
