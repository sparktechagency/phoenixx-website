'use client';
import {
  addChats,
  deleteChatLocally,
  markChatAsRead,
  toggleBlockChat,
  toggleMuteChat,
  updateLastMessage
} from '@/redux/features/chatSlice';
import {
  addMessage,
  updateMessageDelete,
  updateMessagePin,
  updateMessageReaction
} from '@/redux/features/messageSlice';
import { addNotification } from '@/redux/features/notificationSlice';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { connectSocket } from '../../utils/socket';

const SocketComponent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loggedInUserId = localStorage.getItem("login_user_id");
    if (!loggedInUserId) return;

    const socket = connectSocket(loggedInUserId);

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      toast.error('Connection error. Trying to reconnect...');
    });

    // Message events
    socket.on(`newMessage::${loggedInUserId}`, (message) => {
      if (!message) return;

      const enhancedMessage = {
        ...message,
        sender: message.sender || {
          _id: message.senderId || 'unknown',
          userName: 'Unknown',
          profile: null
        },
        createdAt: message.createdAt || new Date().toISOString()
      };

      dispatch(addMessage(enhancedMessage));
      dispatch(updateLastMessage({
        chatId: message.chatId,
        message: enhancedMessage
      }));
    });

    // Message reaction events
    socket.on(`messageReacted::${loggedInUserId}`, (data) => {
      if (!data?.messageId) return;
      dispatch(updateMessageReaction({
        messageId: data.messageId,
        reaction: data.reactionType,
        userId: data.userId
      }));
    });

    // Message pin/unpin events
    socket.on(`messagePinned::${loggedInUserId}`, (data) => {
      if (!data?.messageId) return;
      dispatch(updateMessagePin({
        messageId: data.messageId,
        isPinned: data.action === 'pin',
        pinnedBy: data.pinnedBy
      }));
    });

    // Message deletion events
    socket.on(`messageDeleted::${loggedInUserId}`, (data) => {
      if (!data?.messageId || !data?.chatId) return;
      dispatch(updateMessageDelete({
        messageId: data.messageId
      }));
      dispatch(updateLastMessage({
        chatId: data.chatId,
        message: {
          _id: data.messageId,
          text: "This message has been deleted.",
          isDeleted: true,
          createdAt: new Date().toISOString()
        }
      }));
    });

    // Chat events
    socket.on(`newChat::${loggedInUserId}`, (chat) => {
      if (!chat?._id) return;
      dispatch(addChats(chat));
    });

    socket.on(`chatDeleted::${loggedInUserId}`, (chatId) => {
      if (!chatId) return;
      dispatch(deleteChatLocally(chatId));
    });

    socket.on(`chatMuted::${loggedInUserId}`, ({ chatId, isMuted }) => {
      if (!chatId) return;
      dispatch(toggleMuteChat(chatId));
    });

    socket.on(`chatBlocked::${loggedInUserId}`, ({ chatId, isBlocked }) => {
      if (!chatId) return;
      dispatch(toggleBlockChat(chatId));
    });

    socket.on(`chatMarkedAsRead::${loggedInUserId}`, (chatId) => {
      if (!chatId) return;
      dispatch(markChatAsRead(chatId));
    });

    // Notification events
    socket.on(`notification::${loggedInUserId}`, (notification) => {
      if (!notification) return;
      dispatch(addNotification({
        _id: notification._id || Date.now().toString(),
        message: notification.message,
        postId: notification.postId || '',
        commentId: notification.commentId || '',
        type: notification.type || 'info',
        read: false,
        createdAt: notification.createdAt || new Date().toISOString()
      }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off(`newMessage::${loggedInUserId}`);
      socket.off(`messageReacted::${loggedInUserId}`);
      socket.off(`messagePinned::${loggedInUserId}`);
      socket.off(`messageDeleted::${loggedInUserId}`);
      socket.off(`newChat::${loggedInUserId}`);
      socket.off(`chatDeleted::${loggedInUserId}`);
      socket.off(`chatMuted::${loggedInUserId}`);
      socket.off(`chatBlocked::${loggedInUserId}`);
      socket.off(`chatMarkedAsRead::${loggedInUserId}`);
      socket.off(`notification::${loggedInUserId}`);
      socket.disconnect();
    };
  }, [dispatch]);

  return null;
};

export default SocketComponent;