import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_PORT = 3001;

function spawnPackage(packageDir, env = {}) {
    return spawn('npm', ['run', 'dev'], {
        cwd: join(root, packageDir),
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, ...env },
    });
}

async function waitForHealth(port, timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(`http://localhost:${port}/health`);
            if (response.ok) {
                return;
            }
        } catch {
            /* retry */
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error(`Server not ready on port ${port}`);
}

const children = [];

function shutdown(exitCode = 0) {
    for (const child of children) {
        if (!child.killed) {
            child.kill('SIGTERM');
        }
    }
    process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log(`Starting server on :${SERVER_PORT}...`);
children.push(spawnPackage('server', { PORT: String(SERVER_PORT) }));

await waitForHealth(SERVER_PORT);
console.log(`Server ready. Starting client on :5173...`);

children.push(spawnPackage('client'));

for (const child of children) {
    child.on('exit', (code, signal) => {
        if (signal) {
            return;
        }
        if (code !== 0 && code !== null) {
            shutdown(code);
        }
    });
}
