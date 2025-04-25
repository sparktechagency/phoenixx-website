import { baseApi } from "../../../utils/apiBaseQuery";

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({


    getAllNotification: builder.query({
      query: ({ limit = 10, page = 1 }) => ({
        url: `/notifications?limit=${limit}&page=${page}`, // Added pagination params
        method: "GET",
      }),
      providesTags: ["notification"],
      transformResponse: (res) => {
        return { meta: res.meta, data: res.data }; // Transform response if necessary
      },
    }),



    markSingleRead: builder.mutation({
      query: (id) => {
        return {
          url: `/notifications/mark-single-as-read/${id}`,
          method: "PATCH",
        };
      },
      invalidatesTags: ['notification'],
    }),


    markAllAsRead: builder.mutation({
      query: () => {
        return {
          url: `/notifications/mark-all-as-read`,
          method: "PATCH",
        };
      },
      invalidatesTags: ['notification'],
    }),


    deleteSingle: builder.mutation({
      query: (id) => ({
        url: `/notifications//${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["notification"],
    }),


    deleteAll: builder.mutation({
      query: () => ({
        url: `/notifications/all-notifications/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["notification"],
    }),






  }),
});

export const {
  useDeleteAllMutation,
  useDeleteSingleMutation,
  useGetAllNotificationQuery,
  useMarkAllAsReadMutation,
  useMarkSingleReadMutation
} = commentApi;