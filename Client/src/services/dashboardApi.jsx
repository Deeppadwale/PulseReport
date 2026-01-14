import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

// services/dashboardApi.ts
export const dashboardApi = createApi({
  reducerPath: "dashboardApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  tagTypes: ["Dashboard"],

  endpoints: (builder) => ({

    // getRecentActivity: builder.query({
    //   query: ({ member_id, limit = 10 }) => ({
    //     url: "/dashboard/recent-activity",
    //     params: {
    //       member_id,
    //       limit,
    //     },
    //   }),
    //   providesTags: ["Dashboard"],
    // }),

    getDetailedRecentActivity: builder.query({
      query: ({ 
        member_id, 
        limit = 10, 
        start_date, 
        end_date 
      }) => ({
        url: "/dashboard/recent-activity/detailed",
        params: {
          member_id,
          limit,
          start_date: start_date?.toISOString().split('T')[0],
          end_date: end_date?.toISOString().split('T')[0],
        },
      }),
      providesTags: ["Dashboard"],
    }),

  }),
});

export const {
//   useGetRecentActivityQuery,
  useGetDetailedRecentActivityQuery,
} = dashboardApi;
