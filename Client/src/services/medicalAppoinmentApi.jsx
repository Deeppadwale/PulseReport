import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const memberMasterApi = createApi({
  reducerPath: "memberMasterApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {

      return headers;
    }
  }),
  tagTypes: ["MemberMaster"],
  endpoints: (builder) => ({

    getMemberMasters: builder.query({
      query: (family_id) => ({
        url: family_id ? `/members?family_id=${family_id}` : "/members",
        method: "GET",
      }),
      providesTags: ["MemberMaster"],
    }),

 
    getMemberMasterById: builder.query({
      query: (id) => `/members/${id}`,
      providesTags: ["MemberMaster"],
    }),

    getMemberMastercount: builder.query({
      query: (family_id) => {
        let url = `/members/count`;
        if (family_id) {
          url += `?family_id=${family_id}`;
        }
        return url;
      },
      providesTags: ["MemberMaster"],
    }),

    getMaxMemberDocNo: builder.query({
      query: () => "/members/max-doc-no",
      providesTags: ["MemberMaster"],
    }),

    getMemberUserImage: builder.query({
      query: ({ member_id, family_id }) => {
        const params = new URLSearchParams();
        if (member_id) params.append("member_id", member_id);
        if (family_id) params.append("family_id", family_id);
        
        return {
          url: `/members/userimage?${params.toString()}`,
          method: "GET",
          responseHandler: async (response) => {
            if (!response.ok) {
              throw new Error('Failed to fetch image');
            }
            return response.blob();
          },
        };
      },
      providesTags: ["MemberMaster"],
    }),

    addMemberMaster: builder.mutation({
      query: (memberData) => {
        const formData = new FormData();
        Object.keys(memberData).forEach((key) => {
          if (memberData[key] !== undefined && memberData[key] !== null && memberData[key] !== '') {
            formData.append(key, memberData[key]);
          }
        });

        return {
          url: "/members",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["MemberMaster"],
    }),

    updateMemberMaster: builder.mutation({
      query: ({ id, ...memberData }) => {
        const formData = new FormData();
        Object.keys(memberData).forEach((key) => {
          if (memberData[key] !== undefined && memberData[key] !== null && memberData[key] !== '') {
            formData.append(key, memberData[key]);
          }
        });

        return {
          url: `/members/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["MemberMaster"],
    }),

updateMemberMastersssss: builder.mutation({
  query: ({ id, data }) => {
    return {
      url: `/members/${id}`,
      method: 'PUT',
      body: data, 
    };
  },
  invalidatesTags: (result, error, { id }) => [
    { type: 'Member', id },
    'Member',
  ],
}),

    deleteMemberMaster: builder.mutation({
      query: (id) => ({
        url: `/members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["MemberMaster"],
    }),
  }),
});

export const {
  useGetMemberMastersQuery,
  useGetMemberMasterByIdQuery,
  useGetMemberMastercountQuery,
  useGetMaxMemberDocNoQuery,
  useGetMemberUserImageQuery,
  useAddMemberMasterMutation,
  useUpdateMemberMasterMutation,
  useUpdateMemberMastersssssMutation,
  useDeleteMemberMasterMutation,
} = memberMasterApi;