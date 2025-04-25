import { createSlice } from '@reduxjs/toolkit';
import { commentApi } from "@/features/chat/massage"


const messageSlice = createSlice({
    name: 'message',
    initialState: {
        messages: [],


    },
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },


    },

    extraReducers: (builder) => {
        builder.addMatcher(commentApi.endpoints.getAllMassage.matchFulfilled, (state, { payload }) => {

            state.messages = payload;
        });
    },

});

export const { addMessage } = messageSlice.actions;
export default messageSlice.reducer;
