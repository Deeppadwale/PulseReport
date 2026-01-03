// src/components/routesConfig.js

import OtpLoginPage from "../Pages/Login/otpLogin";
import FamilyMasterLogin from "../Pages/Login/FamilyMasterLogin.jsx"
import MemberMasterList from "../components/MemberMasterList";
import MemberMaster from "../components/Master/MemberMaster";
import Dashboard from "../Pages/Dashboard.jsx"
import ReportMaster from "../components/Master/ReportMaster";
import MemberReport from "../components/MemberReport";
import FamilyMasterMain from "./familyMaster.jsx"
import FamilyMasterList from "./FamilyMasterList.jsx";
import MemberReportTable from "./userReportlist.jsx";
import Home from "../Pages/Home/Home";
import UpcomingAppointment from "./upcomingAppointment.jsx"

const routes = [
  // ===== PUBLIC =====
  {
    path: "/login",
    element: OtpLoginPage,
    hideNavbar: true,
  },
    {
    path: "/",
    element: Home,
    hideNavbar: true,
  },
  
    {
    path: "/MasterAdmin",
    element: FamilyMasterLogin,
    hideNavbar: true,
    },

   {
    path: "/app/family-master-list",
    element: FamilyMasterList ,
    hideNavbar: true,
  },
  // ===== APP =====
  {
    path: "/app/member-list",
    element: MemberMasterList,
    hideNavbar: true,
  },

    {
    path: "/app/userReportlist",
    element: MemberReportTable,
    hideNavbar: true,
  },
  {
    path: "/app/member-master",
    element: MemberMaster,

  },

  

{
  path: "/app/dashboard",
  element: Dashboard,
  hideNavbar: false,
},

{
  path: "/app/reportMaster",
  element: ReportMaster,
  hideNavbar: false,
},


{
  path: "/app/MemberReport",
  element: MemberReport,
  hideNavbar: false,
},

{
  path: "/app/familyMaster",
  element: FamilyMasterMain,
  hideNavbar: false,
},

{
  path: "/app/UpcomingAppointment",
  element: UpcomingAppointment,
  hideNavbar: false,
},


];

export default routes;
