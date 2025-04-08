// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { baseURL } from "./BaseURL";
// import { getToken } from "@/features/auth/authService";

// export const baseApi = createApi({
//   reducerPath: "baseApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${baseURL}/api/v1`,
//     prepareHeaders: (headers) => {
//       const token = getToken();
//       if (token) {
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   endpoints: () => ({}),
//   tagTypes: [],
// });
