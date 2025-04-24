import { baseApi } from "../../../utils/apiBaseQuery";

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: (data) => ({
        url: "/chats/create-chat",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["chat"],
    }),

    messageSend: builder.mutation({
      query: ({ id, body }) => ({
        url: `/messages/send-message/${id}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["chat"],
    }),

    getAllChat: builder.query({
      query: (value) => ({
        url: `/chats?searchTerm=${value}`,
        method: "GET",
      }),
      providesTags: ["comment"],
    }),

    getAllMassage: builder.query({
        query: (value) => ({
          url: `/messages/${value}`,
          method: "GET",
        }),
        providesTags: ["comment"],
      }),
  }),
});

export const {
 useCreateChatMutation,
 useMessageSendMutation,
 useGetAllChatQuery,
 useGetAllMassageQuery
} = commentApi;