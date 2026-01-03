import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const userMasterApi = createApi({
  reducerPath: "userMasterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include", // ✅ Important: send/receive HttpOnly cookies
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["UserMaster"],
  endpoints: (builder) => ({
    // --------------------------------------------------------
    // 🔐 LOGIN - Backend sets HttpOnly cookies + encrypted user_data
    // --------------------------------------------------------
    login: builder.mutation({
      query: (credentials) => ({
        url: "/users-master/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["UserMaster"],
    }),

    // --------------------------------------------------------
    // 🔄 REFRESH TOKEN (optional future route)
    // --------------------------------------------------------
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: "/users-master/refresh",
        method: "POST",
        body: { refresh_token: refreshToken },
      }),
    }),

    // --------------------------------------------------------
    // 👥 FETCH ALL USERS
    // --------------------------------------------------------
    getUserMasters: builder.query({
      query: ({ skip = 0, limit = 100 } = {}) =>
        `/users-master?skip=${skip}&limit=${limit}`,
      providesTags: ["UserMaster"],
    }),

    // --------------------------------------------------------
    // 👤 FETCH USER BY ID
    // --------------------------------------------------------
    getUserById: builder.query({
      query: (uid) => `/users-master/${uid}`,
      providesTags: (result, error, uid) => [{ type: "UserMaster", id: uid }],
    }),

    // --------------------------------------------------------
    // 🙍 CURRENT USER (reads cookie, decrypts on backend)
    // --------------------------------------------------------
    getCurrentUser: builder.query({
      query: () => "/users-master/me",
      providesTags: ["UserMaster"],
    }),

    // --------------------------------------------------------
    // 📝 UPDATE USER PROFILE
    // --------------------------------------------------------
    updateUserProfile: builder.mutation({
      query: ({ uid, ...profileData }) => ({
        url: `/users-master/profile/${uid}`,
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: (result, error, { uid }) => [
        { type: "UserMaster", id: uid },
        "UserMaster",
      ],
    }),

    // --------------------------------------------------------
    // 🔑 CHANGE PASSWORD
    // --------------------------------------------------------
    updateUserPassword: builder.mutation({
      query: ({ uid, ...passwordData }) => ({
        url: `/users-master/password/${uid}`,
        method: "PUT",
        body: passwordData,
      }),
    }),

    // --------------------------------------------------------
    // 🚪 LOGOUT (clears JWT + encrypted cookies)
    // --------------------------------------------------------
    logout: builder.mutation({
      query: () => ({
        url: "/users-master/logout",
        method: "POST",
      }),
      invalidatesTags: ["UserMaster"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useGetUserMastersQuery,
  useGetUserByIdQuery,
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useUpdateUserPasswordMutation,
  useLogoutMutation,
} = userMasterApi;
