import { createSlice } from '@reduxjs/toolkit';
import { commentApi } from "@/features/notification/noticationApi"


const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notification: [],
    },
    reducers: {
        addNotification: (state, action) => {
            state.notification.push(action.payload);
        },


    },

    extraReducers: (builder) => {
        builder.addMatcher(commentApi.endpoints.getAllNotification.matchFulfilled, (state, { payload }) => {
            state.notification = payload?.data;
        });
    },

});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
