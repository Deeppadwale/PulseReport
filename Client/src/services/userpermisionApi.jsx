// // src/services/authApi.js
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// export const authApi = createApi({
//   reducerPath: "authApi",
//   baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
//   tagTypes: ["authApi"],
//   endpoints: (builder) => ({
//     // 🔹 Login endpoint
//     loginUser: builder.mutation({
//       query: ({ User_Name, User_Password }) => ({
//         url: "/users/login",
//         method: "POST",
//         body: { User_Name, User_Password },
//       }),
//     }),

//     // 🔹 Get all program names
//     getUserdetailsProgram_Name: builder.query({
//       query: () => "/users/getProgramNames",
//       providesTags: ["authApi"],
//     }),

//     // 🔹 Get all users
//     getUserdetails: builder.query({
//       query: () => "/users/",
//       providesTags: ["authApi"],
//     }),

//     // 🔹 Get single user by ID
//     getUserdetailsById: builder.query({
//       query: (uid) => `/users/users/${uid}/`,
//       providesTags: ["authApi"],
//     }),

//     // 🔹 Add new user
//     addUserdetails: builder.mutation({
//       query: (body) => ({
//         url: "/users/users/",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["authApi"],
//     }),

//     // 🔹 Update user
//     updateUserdetails: builder.mutation({
//   query: (payload) => ({
//     url: `/users/users/${payload.uid}`, // URL for PUT
//     method: "PUT",
//     body: payload, // include uid inside the body
//   }),
//   invalidatesTags: ["authApi"],
// }),


//     // 🔹 Delete user
//     deleteUserdetails: builder.mutation({
//       query: (uid) => ({
//         url: `/users/users/${uid}/`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["authApi"],
//     }),
//   }),
// });

// // ✅ Export hooks
// export const {
//   useLoginUserMutation,
//   useGetUserdetailsProgram_NameQuery,
//   useLazyGetUserdetailsProgram_NameQuery,
//   useGetUserdetailsQuery,
//   useLazyGetUserdetailsByIdQuery,
//   useAddUserdetailsMutation,
//   useUpdateUserdetailsMutation,
//   useDeleteUserdetailsMutation,
// } = authApi;
