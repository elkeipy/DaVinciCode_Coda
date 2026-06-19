import { io } from 'socket.io-client';

const SOCKET_URL = process.env.VITE_SOCKET_URL ?? 'https://davincicode-coda.onrender.com';
const PAGES_ORIGIN = process.env.PAGES_ORIGIN ?? 'https://elkeipy.github.io';
const TIMEOUT_MS = 120_000;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: TIMEOUT_MS,
  extraHeaders: { Origin: PAGES_ORIGIN },
});

const timer = setTimeout(() => fail(`timeout after ${TIMEOUT_MS}ms`), TIMEOUT_MS);

socket.on('connect_error', (err) => {
  clearTimeout(timer);
  fail(`connect_error (Origin=${PAGES_ORIGIN}): ${err.message}`);
});

socket.on('connect', () => {
  console.log(`OK: connected with Origin ${PAGES_ORIGIN}`);
  socket.emit('lobby:join', { nickname: 'pages-smoke' });
});

socket.on('session:assigned', ({ sessionId, nickname }) => {
  console.log(`OK: session:assigned sessionId=${sessionId} nickname=${nickname}`);
});

socket.on('lobby:state', () => {
  clearTimeout(timer);
  socket.disconnect();
  console.log('PAGES SMOKE TEST PASSED');
  process.exit(0);
});
