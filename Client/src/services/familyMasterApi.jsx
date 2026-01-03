// src/services/familyMasterApi.jsx
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const familyMasterMainApi = createApi({
  reducerPath: "familyMasterApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  tagTypes: ["FamilyMaster"],

  endpoints: (builder) => ({
    

  loginUser: builder.mutation({
    query: (credentials) => ({
      url: "/familiesMain/login", 
      method: "POST",
      body: credentials, 
    }),
  }),


    getFamilyMasters: builder.query({
      query: () => "/familiesMain",
      providesTags: ["FamilyMaster"],
    }),
     getFamilyMasterscount: builder.query({
      query: () => "/familiesMain/count",
      providesTags: ["FamilyMaster"],
    }),
    /* =========================
       GET BY ID
    ========================= */
    getFamilyMasterById: builder.query({
      query: (id) => `/familiesMain/${id}`,
      providesTags: (r, e, id) => [{ type: "FamilyMaster", id }],
    }),

    /* =========================
       CREATE
    ========================= */
    addFamilyMaster: builder.mutation({
      query: (family) => {
        const mobile =
          Array.isArray(family.MobileNumbers)
            ? family.MobileNumbers.filter(Boolean).join(",")
            : family.Mobile || "";

        return {
          url: "/familiesMain",
          method: "POST",
          body: {
            ...family,
            Mobile: mobile, // ✅ SAFE
          },
        };
      },
      invalidatesTags: ["FamilyMaster"],
    }),

    /* =========================
       UPDATE
    ========================= */
    updateFamilyMaster: builder.mutation({
      query: ({ id, ...family }) => {
        const mobile =
          Array.isArray(family.MobileNumbers)
            ? family.MobileNumbers.filter(Boolean).join(",")
            : family.Mobile || "";

        return {
          url: `/familiesMain/${id}`,
          method: "PUT",
          body: {
            ...family,
            Mobile: mobile, // ✅ SAFE
          },
        };
      },
      invalidatesTags: (r, e, { id }) => [
        { type: "FamilyMaster", id },
        "FamilyMaster",
      ],
    }),

    /* =========================
       DELETE
    ========================= */
    deleteFamilyMaster: builder.mutation({
      query: (id) => ({
        url: `/familiesMain/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FamilyMaster"],
    }),
  }),
});

/* =========================
   EXPORT HOOKS
========================= */
export const {
  useLoginUserMutation,
  useGetFamilyMastersQuery,
  useGetFamilyMasterscountQuery,
  useGetFamilyMasterByIdQuery,
  useAddFamilyMasterMutation,
  useUpdateFamilyMasterMutation,
  useDeleteFamilyMasterMutation,

} = familyMasterMainApi;
