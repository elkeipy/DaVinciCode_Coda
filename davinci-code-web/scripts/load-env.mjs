import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(webRoot, '.env');

export function loadEnv() {
  if (!existsSync(envPath)) {
    console.error(`Missing ${envPath}`);
    console.error('Run: Copy-Item .env.example .env');
    process.exit(1);
  }
  config({ path: envPath });
  return webRoot;
}
