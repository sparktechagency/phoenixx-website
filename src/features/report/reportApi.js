import { baseApi } from "../../../utils/apiBaseQuery";

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    report: builder.mutation({
      query: (data) => ({
        url: "/reports/create-report",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["report"],
    }),
    silder: builder.query({
      query: () => ({
          url: `/announcement-slider`,
          method: "GET",
      }),
      providesTags: ["faq"],
  })
  }),
});

// Export hooks
export const {
  useReportMutation,
  useSilderQuery
} = postApi;
