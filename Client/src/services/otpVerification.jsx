import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const API_BASE_URL=import .meta.env.VITE_REACT_APP_API_BASE_URL
export const otpVerificationApi = createApi({
  reducerPath: 'otpVerificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // =========================
    // Send OTP
    // =========================
    sendOtp: builder.mutation({
      query: (data) => ({
        url: '/otp/send',
        method: 'POST',
        body: {
          mobile: data.mobile,
        },
      }),
    }),

    // =========================
    // Verify OTP
    // =========================
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: '/otp/verify',
        method: 'POST',
        body: {
          mobile: data.mobile,
          otp_code: data.otp_code,
        },
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
} = otpVerificationApi;
