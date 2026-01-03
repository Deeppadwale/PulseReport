import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

export const upcomingAppointmentApi = createApi({
  reducerPath: 'upcomingAppointmentApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Appointment'],
  endpoints: (builder) => ({
    getAppointmentById: builder.query({
      query: (appointmentId) => `/upcoming-appointment/${appointmentId}`,
      providesTags: (result, error, arg) => [{ type: 'Appointment', id: arg }],
    }),

    getAppointmentsByFamily: builder.query({
      query: (familyId) => `/upcoming-appointment/family/${familyId}`,
      providesTags: ['Appointment'],
    }),

    createAppointment: builder.mutation({
      query: ({ payload, prescriptionFile }) => {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));
        if (prescriptionFile) {
          formData.append('prescription_file', prescriptionFile);
        }
        return {
          url: '/upcoming-appointment/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Appointment'],
    }),

    updateAppointment: builder.mutation({
      query: ({ appointmentId, payload, prescriptionFile }) => {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));
        if (prescriptionFile) {
          formData.append('prescription_file', prescriptionFile);
        }
        return {
          url: `/upcoming-appointment/${appointmentId}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { appointmentId }) => [
        { type: 'Appointment', id: appointmentId },
      ],
    }),

    deleteAppointment: builder.mutation({
      query: (appointmentId) => ({
        url: `/upcoming-appointment/${appointmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // ================= File Preview =================
    previewPrescription: builder.query({
      query: (fileName) => `/upcoming-appointment/preview/${fileName}`,
      // we are returning the URL only; browser will open it directly
    }),

    // ================= File Download =================
    downloadPrescription: builder.query({
      query: (fileName) => `/upcoming-appointment/download/${fileName}`,
    }),
  }),
});

// Export hooks
export const {
  useGetAllAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useGetAppointmentsByFamilyQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  usePreviewPrescriptionQuery,
  useDownloadPrescriptionQuery,
} = upcomingAppointmentApi;
