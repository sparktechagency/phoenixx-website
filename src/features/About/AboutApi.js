import { baseApi } from "../../../utils/apiBaseQuery";



export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        about: builder.query({
            query: () => ({
                url: `/about-us`,
                method: "GET",
            }),
            providesTags: ["about"],
        })
    }),
});

// Export hooks
export const {
    useAboutQuery
} = authApi;
