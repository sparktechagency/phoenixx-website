import { commentApi } from "@/features/notification/noticationApi";
import { createSlice } from '@reduxjs/toolkit';


const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
      notification: [],
      unreadCount: 0
    },
    reducers: {
        addNotification: (state, action) => {
        state.notification.push(action.payload);
        state.unreadCount += 1;
      },
     

    },

    extraReducers: (builder) => {
      builder.addMatcher(commentApi?.endpoints?.getAllNotification?.matchFulfilled, (state, { payload }) => {
        state.meta = payload?.meta;
        state.notification = payload?.data;
        state.unreadCount = payload?.unreadNotifications || 0;
        });
    },

});

export const { addNotification, addUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
