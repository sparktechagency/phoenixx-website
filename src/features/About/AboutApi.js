import { baseApi } from "../../../utils/apiBaseQuery";



export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        about: builder.query({
            query: () => ({
                url: `/about-us`,
                method: "GET",
            }),
            providesTags: ["about"],
        }),
      
      termsAndCondition: builder.query({
            query: () => ({
                url: `/terms-and-conditions`,
                method: "GET",
            }),
            providesTags: ["about"],
      }),
      
      
      privacyPolicy : builder.query({
            query: () => ({
                url: `/terms-and-conditions`,
                method: "GET",
            }),
            providesTags: ["about"],
        })
    }),
});

// Export hooks
export const {
  useAboutQuery,
  usePrivacyPolicyQuery,
  useTermsAndConditionQuery
} = authApi;
