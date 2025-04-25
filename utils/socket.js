import { io } from 'socket.io-client';
import { baseURL } from './BaseURL';

let socket = null;

export const connectSocket = (userId) => {
    if (socket) {
        return socket;
    }

    socket = io(baseURL, {
        auth: { userId }
    });

    socket.on('connect', () => {
        console.log('Connected to the socket server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from the socket server');
    });

    return socket;
};

export const getSocket = () => socket;


