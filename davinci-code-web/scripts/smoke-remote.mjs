import { io } from 'socket.io-client';

const SOCKET_URL = process.env.VITE_SOCKET_URL ?? 'https://davincicode-coda.onrender.com';
const TIMEOUT_MS = 120_000;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: TIMEOUT_MS,
});

const timer = setTimeout(() => fail(`timeout after ${TIMEOUT_MS}ms`), TIMEOUT_MS);

socket.on('connect_error', (err) => {
  clearTimeout(timer);
  fail(`connect_error: ${err.message}`);
});

socket.on('error', (payload) => {
  clearTimeout(timer);
  fail(`server error: ${JSON.stringify(payload)}`);
});

socket.on('connect', () => {
  console.log(`OK: connected (${socket.id})`);
  socket.emit('lobby:join', { nickname: 'smoke-test' });
});

socket.on('session:assigned', ({ sessionId, nickname }) => {
  console.log(`OK: session:assigned sessionId=${sessionId} nickname=${nickname}`);
});

socket.on('lobby:state', (lobby) => {
  clearTimeout(timer);
  console.log(`OK: lobby:state rooms=${lobby.rooms?.length ?? 0} users=${lobby.onlineUsers?.length ?? 0}`);
  socket.disconnect();
  console.log('SMOKE TEST PASSED');
  process.exit(0);
});
