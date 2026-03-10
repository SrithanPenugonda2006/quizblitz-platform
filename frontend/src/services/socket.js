import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';
let socket = null;

export function getSocket(token) {
    if (!socket) {
        socket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: false,
        });
    }
    return socket;
}

export function connectSocket(token) {
    const s = getSocket(token);
    if (token) s.auth = { token };
    if (!s.connected) s.connect();
    return s;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
