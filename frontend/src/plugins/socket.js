import { io } from 'socket.io-client';

const socket = io('/', { path: '/socket.io' }); // adjust if you use custom namespace
export default socket;