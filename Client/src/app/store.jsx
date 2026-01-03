import { configureStore } from '@reduxjs/toolkit';

import { userMasterApi } from '../services/userMasterApi';
import { memberMasterApi } from '../services/medicalAppoinmentApi';
import {reportMasterApi} from '../services/reportMasterApi';
import { memberReportApi } from '../services/memberReportApi';
import { otpVerificationApi } from '../services/otpVerification.jsx';
import { familyMasterMainApi } from '../services/familyMasterApi.jsx';
import {upcomingAppointmentApi}from '../services/upcomingAppointmentApi.jsx'

export const store = configureStore({
  reducer: {
    [userMasterApi.reducerPath]: userMasterApi.reducer,
    [memberMasterApi.reducerPath]: memberMasterApi.reducer,
    [reportMasterApi.reducerPath]: reportMasterApi.reducer,
    [memberReportApi.reducerPath]: memberReportApi.reducer,
    [otpVerificationApi.reducerPath]: otpVerificationApi.reducer,
    [familyMasterMainApi.reducerPath]: familyMasterMainApi.reducer,
    [upcomingAppointmentApi.reducerPath]:upcomingAppointmentApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      // .prepend(listenerMiddleware.middleware)
      .concat(userMasterApi.middleware)
      .concat(memberMasterApi.middleware)
      .concat(reportMasterApi.middleware)
      .concat(memberReportApi.middleware)
      .concat(otpVerificationApi.middleware)
      .concat(familyMasterMainApi.middleware)
      .concat(upcomingAppointmentApi.middleware),

});