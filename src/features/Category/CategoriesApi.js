import { baseApi } from "../../../utils/apiBaseQuery";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    categories: builder.query({
        query: ({ searchTerm }) => ({
          url: `/categories?searchTerm=${searchTerm || ""}`,
          method: "GET",
        }),
        providesTags: ["category"],
      }),
      subCategory: builder.query({
        query: (id) => ({
          url: `/subcategories/subcategories-by-category/${id}`,
          method: "GET",
        }),
        providesTags: ["category"],
      }),
  }),
});

// Export hooks
export const {
  useCategoriesQuery,
  useSubCategoryQuery
} = authApi;