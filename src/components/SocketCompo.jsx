'use client';

import { useEffect } from 'react';
import { connectSocket } from '../../utils/socket';
import { useDispatch } from 'react-redux';
import { addMessage } from '@/redux/features/messageSlice';
import { addNotification } from '@/redux/features/notificationSlice';

const SocketComponent = () => {
    const dispatch = useDispatch();
    const loggedInUserId = localStorage.getItem("login_user_id");

    useEffect(() => {
        if (!loggedInUserId) return;

        console.log(`newMessage::${loggedInUserId}`);

        const socket = connectSocket(loggedInUserId);

        // Add the event listener for new messages
        socket.on(`newMessage::${loggedInUserId}`, async (message) => {
            console.log(message);
            dispatch(addMessage(message)); // Dispatch action for new message
        });

        // Add the event listener for new chat updates
        socket.on(`newChat::${loggedInUserId}`, (chat) => {
            console.log(chat);
        });

        // Add the event listener for notifications
        socket.on(`notification::${loggedInUserId}`, async (notification) => {
            console.log('New notification:', notification);
            dispatch(addNotification(notification)); // Dispatch action for notification
        });

        // Cleanup function to remove event listeners
        return () => {
            socket.off(`newMessage::${loggedInUserId}`);
            socket.off(`newChat::${loggedInUserId}`);
            socket.off(`notification::${loggedInUserId}`);
        };
    }, [loggedInUserId]); // The effect will run whenever `loggedInUserId` changes

    return <div />;
};

export default SocketComponent;
