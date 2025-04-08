// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "@/features/auth/authSlice";
// import { authApi } from "@/features/auth/authApi";

// // import { shopApi } from "./features/shop/shopApi";
// // import { mealApi } from "./features/meal/mealApi";
// // import { offerApi } from "./features/offer/offerApi";

// const apis = [authApi];

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     ...Object.fromEntries(apis.map((api) => [api.reducerPath, api.reducer])),
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
// });
