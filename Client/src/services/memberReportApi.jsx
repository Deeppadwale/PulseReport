

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const API_BASE_URL=import.meta.env.VITE_REACT_APP_API_BASE_URL

export const memberReportApi = createApi({
  reducerPath: 'memberReportAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL 
  }),
  tagTypes: ['MemberReport'],
  endpoints: (builder) => ({

    // ================= CREATE =================
    createMemberReport: builder.mutation({
      query: ({ payload, files }) => {
        const formData = new FormData();

        // payload must be string
        formData.append('payload', JSON.stringify(payload));

        // attach files
        if (files) {
          Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
          });
        }

        return {
          url: '/member-report/create',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MemberReport'],
    }),

    // ================= UPDATE =================
    updateMemberReport: builder.mutation({
      query: ({ MemberReport_id, payload, files }) => {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));

        if (files) {
          Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
          });
        }

        return {
          url: `/member-report/update?MemberReport_id=${MemberReport_id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['MemberReport'],
    }),

    deleteMemberReport: builder.mutation({
      query: (MemberReport_id) => ({
        url: `/member-report/delete?MemberReport_id=${MemberReport_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MemberReport'],
    }),

    getAllMemberReports: builder.query({
      query: () => '/member-report/',
      providesTags: ['MemberReport'],
    }),

    getMemberReportById: builder.query({
      query: (report_id) => `/member-report/byid/${report_id}`,
      providesTags: ['MemberReport'],
    }),


    getMemberReportsByFamily: builder.query({
      query: (family_id) => `/member-report/family/${family_id}`,
      providesTags: ['MemberReport'],
    }),

   getUserListByMemberId: builder.query({
    query: (member_id) => ({
      url: `/member-report/userlist`,
      params: { member_id }
    })
  }),

    previewReportFile: builder.query({
      query: (filename) => ({
        url: `/member-report/preview/${filename}`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    downloadReportFile: builder.query({
      query: (filename) => ({
        url: `/member-report/download/${filename}`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    sendPdfEmail: builder.mutation({
      query: ({ email, subject, messagebody, file }) => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('messagebody', messagebody);
        if (file) formData.append('pdf', file);
        return {
          url: '/member-report/send-email-with-attachment',
          method: 'POST',
          body: formData,
        };
      },
    }),

  }),
});

export const {
  useCreateMemberReportMutation,
  useUpdateMemberReportMutation,
  useDeleteMemberReportMutation,
  useGetAllMemberReportsQuery,
  useGetMemberReportByIdQuery,
  useGetMemberReportsByFamilyQuery,
  useGetUserListByMemberIdQuery,
  useLazyPreviewReportFileQuery,
  useLazyDownloadReportFileQuery,
  useSendPdfEmailMutation,
} = memberReportApi;
