import { createSlice } from '@reduxjs/toolkit';
import { chatApi } from '../../features/chat/chatList/chatApi';

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    chats: [],
    unreadCount: 0,
    loading: false,
    error: null
  },
  reducers: {
    addChats: (state, action) => {
      const existingIndex = state.chats.findIndex(c => c._id === action.payload._id);
      if (existingIndex === -1) {
        state.chats.unshift(action.payload);
      } else {
        state.chats[existingIndex] = action.payload;
      }

      if (action.payload.lastMessage && !action.payload.lastMessage.read) {
        state.unreadCount += 1;
      }
    },

    markChatAsRead: (state, action) => {
      const chatId = action.payload;
      const chatIndex = state.chats.findIndex(c => c._id === chatId);

      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];
        let unreadReduction = 0;

        if (chat.lastMessage && !chat.lastMessage.read) {
          state.chats[chatIndex] = {
            ...chat,
            lastMessage: {
              ...chat.lastMessage,
              read: true
            }
          };
          unreadReduction += 1;
        }

        if (chat.unreadCount > 0) {
          unreadReduction += chat.unreadCount;
          state.chats[chatIndex].unreadCount = 0;
        }

        state.unreadCount = Math.max(0, state.unreadCount - unreadReduction);
      }
    },

    deleteChatLocally: (state, action) => {
      const chatToDelete = state.chats.find(c => c._id === action.payload);
      if (chatToDelete) {
        state.unreadCount = Math.max(0, state.unreadCount - (chatToDelete.unreadCount || 0));
      }
      state.chats = state.chats.filter(chat => chat._id !== action.payload);
    },

    updateLastMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chatIndex = state.chats.findIndex(c => c._id === chatId);

      if (chatIndex === -1) {
        const newChat = {
          _id: chatId,
          participants: message?.participants || [],
          lastMessage: message,
          unreadCount: message.read ? 0 : 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        state.chats.unshift(newChat);
        if (!message.read) state.unreadCount += 1;
      } else {
        const updatedChat = {
          ...state.chats[chatIndex],
          lastMessage: message,
          updatedAt: new Date().toISOString()
        };

        if (!message.read) {
          updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
          state.unreadCount += 1;
        } else if (state.chats[chatIndex].lastMessage && !state.chats[chatIndex].lastMessage.read && message.read) {
          updatedChat.unreadCount = Math.max(0, (updatedChat.unreadCount || 0) - 1);
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.chats.splice(chatIndex, 1);
        state.chats.unshift(updatedChat);
      }
    },

    toggleMuteChat: (state, action) => {
      const { chatId, isMuted } = action.payload;
      const chatIndex = state.chats.findIndex(c => c._id === chatId);

      if (chatIndex !== -1) {
        const currentUserId = localStorage.getItem("login_user_id");
        const mutedBy = state.chats[chatIndex].mutedBy || [];

        if (isMuted) {
          if (!mutedBy.includes(currentUserId)) {
            state.chats[chatIndex].mutedBy = [...mutedBy, currentUserId];
          }
        } else {
          state.chats[chatIndex].mutedBy = mutedBy.filter(id => id !== currentUserId);
        }
      }
    },

    toggleBlockChat: (state, action) => {
      const { chatId, isBlocked } = action.payload;
      const chatIndex = state.chats.findIndex(c => c._id === chatId);

      if (chatIndex !== -1) {
        const currentUserId = localStorage.getItem("login_user_id");
        const blockedUsers = state.chats[chatIndex].blockedUsers || [];

        if (isBlocked) {
          const blockExists = blockedUsers.some(block => block.blocker === currentUserId);
          if (!blockExists) {
            state.chats[chatIndex].blockedUsers = [...blockedUsers, { blocker: currentUserId }];
          }
        } else {
          state.chats[chatIndex].blockedUsers = blockedUsers.filter(block => block.blocker !== currentUserId);
        }
      }
    }
  },

  extraReducers: (builder) => {
    builder
      .addMatcher(
        chatApi.endpoints.getAllChat.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        chatApi.endpoints.getAllChat.matchFulfilled,
        (state, { payload }) => {
          state.chats = payload?.data?.chats || [];
          state.unreadCount = payload?.data?.totalUnreadMessages || 0;
          state.loading = false;
        }
      )
      .addMatcher(
        chatApi.endpoints.getAllChat.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message;
        }
      );
  }
});

export const {
  addChats,
  markChatAsRead,
  deleteChatLocally,
  updateLastMessage,
  toggleMuteChat,
  toggleBlockChat
} = chatsSlice.actions;

export default chatsSlice.reducer;