import { baseApi } from "../../../utils/apiBaseQuery";



export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createPost : builder.mutation({
      query: (data) => ({
        url: "/posts/create-post",
        method: "POST",
        body: data,
      }),
    }),

   
    getPost : builder.query({
      query: () => ({
          url: `/posts`,
          method: "GET",
      }),
  })
  }),
});

// Export hooks
export const {
  useCreatePostMutation,
  useGetPostQuery
} = postApi;
