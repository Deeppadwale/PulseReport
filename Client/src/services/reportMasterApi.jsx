// src/services/medicalAppoinmentApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const reportMasterApi = createApi({
    reducerPath: "reportMasterApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ReportMaster"],

    endpoints: (builder) => ({
        // ------------------------------
        // GET ALL REPORTS
        // ------------------------------
        getReportMasters: builder.query({
            query: () => `/reportmaster/`,
            providesTags: ["ReportMaster"],
        }),
         getReportMasterscount: builder.query({
            query: () => `/reportmaster/count`,
            providesTags: ["ReportMaster"],
        }),

        // ------------------------------
        // GET MAX DOC NO
        // ------------------------------
        getMaxReportDocNo: builder.query({
            query: () => `/reportmaster/max-doc-no`,
            transformResponse: (response) => response.max_doc_no,
        }),

        // ------------------------------
        // ADD NEW REPORT
        // ------------------------------
        addReportMaster: builder.mutation({
            query: (data) => ({
                url: `/reportmaster/`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ReportMaster"],
        }),

        // ------------------------------
        // UPDATE REPORT
        // ------------------------------
        updateReportMaster: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/reportmaster/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["ReportMaster"],
        }),

        // ------------------------------
        // DELETE REPORT
        // ------------------------------
        deleteReportMaster: builder.mutation({
            query: (id) => ({
                url: `/reportmaster/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ReportMaster"],
        }),
    }),
});

// Export Hooks
export const {
    useGetReportMastersQuery,
    useGetReportMasterscountQuery,
    useGetMaxReportDocNoQuery,
    useAddReportMasterMutation,
    useUpdateReportMasterMutation,
    useDeleteReportMasterMutation,
} = reportMasterApi;
