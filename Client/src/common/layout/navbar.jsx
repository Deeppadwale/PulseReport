// import { useState, useRef, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Menu,
//   X,
//   Users,
//   FileText,
//   Activity,
//   ChevronDown,
//   Home,
//   UserPlus,
//   User,
//   CalendarClock,
// } from "lucide-react";

// import logo from "../../assets/pulse.png";
// import { useGetMemberUserImageQuery } from "../../services/medicalAppoinmentApi";
// import EditProfile from "../../Pages/Profile/Editprofile";

// export default function Navbar() {
//   const [open, setOpen] = useState(false);
//   const [desktopMasterOpen, setDesktopMasterOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [editOpen, setEditOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [userType, setUserType] = useState("");
//   const [imageUrl, setImageUrl] = useState(null);

//   const masterDropdownRef = useRef(null);
//   const profileRef = useRef(null);

//   const location = useLocation();
//   const navigate = useNavigate();

//   const member_id = sessionStorage.getItem("member_id");
//   const displayName = sessionStorage.getItem("User_Name") || "User";

//   const { data: imageBlob, isLoading: imageLoading } =
//     useGetMemberUserImageQuery(
//       member_id ? { member_id } : undefined,
//       { skip: !member_id }
//     );

//   /* PROFILE IMAGE */
//   useEffect(() => {
//     if (imageBlob) {
//       const url = URL.createObjectURL(imageBlob);
//       setImageUrl(url);
//       return () => URL.revokeObjectURL(url);
//     }
//   }, [imageBlob]);

//   /* SCREEN SIZE + USER TYPE */
//   useEffect(() => {
//     const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);
//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);
//     setUserType(sessionStorage.getItem("User_Type") || "");
//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, []);

//   /* CLOSE DROPDOWNS ON OUTSIDE CLICK */
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         masterDropdownRef.current &&
//         !masterDropdownRef.current.contains(e.target)
//       ) {
//         setDesktopMasterOpen(false);
//       }
//       if (
//         profileRef.current &&
//         !profileRef.current.contains(e.target)
//       ) {
//         setProfileOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const baseNavItems = [
//     { label: "Dashboard", path: "/app/dashboard", icon: Home },
//     { label: "Family Member", path: "/app/member-list", icon: Users },
//     {
//       label: "Master",
//       icon: FileText,
//       children: [
//         { label: "Member Master", path: "/app/member-master", icon: Users },
//         { label: "Report Master", path: "/app/reportMaster", icon: FileText },
//       ],
//     },
//     { label: "Medical Reports", path: "/app/MemberReport", icon: Activity },
//     {
//       label: "Upcoming Appointment",
//       path: "/app/UpcomingAppointment",
//       icon: CalendarClock,
//     },
//   ];

//   const navItems =
//     userType === "M"
//       ? [
//           { label: "Create Family", path: "/app/familyMaster", icon: UserPlus },
//           { label: "Family Master List", path: "/app/family-master-list", icon: Users },
//           ...baseNavItems,
//         ]
//       : baseNavItems;

//   const isActive = (path) => location.pathname === path;

//   const isMasterActive = () =>
//     navItems
//       .find((i) => i.label === "Master")
//       ?.children?.some((c) => location.pathname === c.path);

//   const handleLogout = () => {
//     sessionStorage.clear();
//     navigate("/");
//   };

//   return (
//     <>
//       <header className="sticky top-0 z-[100]">
//         <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

//         <div className="bg-white shadow border-b">
//           <div className="max-w-8xl mx-auto px-3">
//             <div className="relative flex items-center h-16">

//               {/* LOGO */}
//               <Link to="/app/dashboard">
//                 <img src={logo} alt="Logo" className="h-10" />
//               </Link>

//               {/* NAVIGATION */}
//               <nav className="hidden lg:flex items-center ml-12 gap-6">
//                 {navItems.map((item) => {
//                   if (item.label === "Master") {
//                     return (
//                       <div key="master" ref={masterDropdownRef} className="relative">
//                         <button
//                           onClick={() => setDesktopMasterOpen(!desktopMasterOpen)}
//                           className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
//                             isMasterActive() ? "bg-gray-100" : "hover:bg-gray-50"
//                           }`}
//                         >
//                           Master
//                           <ChevronDown
//                             size={16}
//                             className={`transition ${
//                               desktopMasterOpen ? "rotate-180" : ""
//                             }`}
//                           />
//                         </button>

//                         {desktopMasterOpen && (
//                           <div className="absolute mt-2 w-56 bg-white border rounded-xl shadow-lg">
//                             {item.children.map((sub) => (
//                               <Link
//                                 key={sub.path}
//                                 to={sub.path}
//                                 onClick={() => setDesktopMasterOpen(false)}
//                                 className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50"
//                               >
//                                 <sub.icon size={16} />
//                                 {sub.label}
//                               </Link>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   }

//                   return (
//                     <Link
//                       key={item.path}
//                       to={item.path}
//                       className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
//                         isActive(item.path) ? "bg-gray-100" : "hover:bg-gray-50"
//                       }`}
//                     >
//                       <item.icon size={18} />
//                       {item.label}
//                     </Link>
//                   );
//                 })}
//               </nav>

//               {/* RIGHT SIDE */}
//               <div className="ml-auto flex items-center gap-4">

//                 {/* PROFILE */}
//                 <div ref={profileRef} className="relative">
//                   <button
//                     onClick={() => setProfileOpen(!profileOpen)}
//                     className="flex items-center gap-3"
//                   >
//                     <div className="w-10 h-10 rounded-full overflow-hidden">
//                       {imageLoading ? (
//                         <div className="w-full h-full bg-slate-200 flex items-center justify-center">
//                           <User />
//                         </div>
//                       ) : imageUrl ? (
//                         <img src={imageUrl} className="w-full h-full object-cover" />
//                       ) : (
//                         <div className="w-full h-full bg-blue-600 flex items-center justify-center">
//                           <User className="text-white" />
//                         </div>
//                       )}
//                     </div>
//                     <span className="hidden md:block font-semibold">
//                       {displayName}
//                     </span>
//                   </button>

//                   {profileOpen && (
//                     <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg">
//                       <button
//                         onClick={() => {
//                           setEditOpen(true);
//                           setProfileOpen(false);
//                         }}
//                         className="w-full text-left px-4 py-3 hover:bg-gray-50"
//                       >
//                         ✏️ Edit Profile
//                       </button>
//                       <button
//                         onClick={handleLogout}
//                         className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
//                       >
//                         🚪 Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* MOBILE MENU */}
//                 <button onClick={() => setOpen(!open)} className="lg:hidden">
//                   {open ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* EDIT PROFILE MODAL */}
//       <EditProfile open={editOpen} onClose={() => setEditOpen(false)} />
//     </>
//   );
// }


import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Users,
  FileText,
  Activity,
  ChevronDown,
  Home,
  UserPlus,
  User,
  CalendarClock,
} from "lucide-react";

import logo from "../../assets/Dp 3.png";
import { useGetMemberUserImageQuery } from "../../services/medicalAppoinmentApi";
import EditProfile from "../../Pages/Profile/Editprofile";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [desktopMasterOpen, setDesktopMasterOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [userType, setUserType] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const masterDropdownRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const member_id = sessionStorage.getItem("member_id");
  const displayName = sessionStorage.getItem("User_Name") || "User";

  /* 🚫 HIDE NAV ITEMS ON FAMILY MASTER PAGE */
  const hideNavTabs = location.pathname === "/app/familyMaster";

  const { data: imageBlob, isLoading: imageLoading } =
    useGetMemberUserImageQuery(
      member_id ? { member_id } : undefined,
      { skip: !member_id }
    );

  /* PROFILE IMAGE */
  useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageBlob]);

  /* USER TYPE */
  useEffect(() => {
    setUserType(sessionStorage.getItem("User_Type") || "");
  }, []);

  /* CLOSE DROPDOWNS ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        masterDropdownRef.current &&
        !masterDropdownRef.current.contains(e.target)
      ) {
        setDesktopMasterOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseNavItems = [
    { label: "Dashboard", path: "/app/dashboard", icon: Home },
    // { label: "Family Member", path: "/app/member-list", icon: Users },
    {
      label: "Master",
      icon: FileText,
      children: [
        { label: "Member Master", path: "/app/member-master", icon: Users },
        { label: "Report Master", path: "/app/reportMaster", icon: FileText },
      ],
    },
    { label: "Medical Reports", path: "/app/MemberReport", icon: Activity },
    {
      label: "Upcoming Appointment",
      path: "/app/UpcomingAppointment",
      icon: CalendarClock,
    },
  ];

  const navItems =
    userType === "M"
      ? [
          { label: "Create Family", path: "/app/familyMaster", icon: UserPlus },
          {
            label: "Family Master List",
            path: "/app/family-master-list",
            icon: Users,
          },
          ...baseNavItems,
        ]
      : baseNavItems;

  const isActive = (path) => location.pathname === path;

  const isMasterActive = () =>
    navItems
      .find((i) => i.label === "Master")
      ?.children?.some((c) => location.pathname === c.path);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-[100]">
        <div className="h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />

        <div className="bg-white shadow border-b">
          <div className="max-w-8xl mx-auto px-3">
            <div className="relative flex items-center h-16">

              {/* LOGO */}
                  <Link to="/app/dashboard" className="flex items-center">
                    <img
                      src={logo}
                      alt="Pulse Report Logo"
                      className="h-11 w-17  ml-2 object-contain"
                    />
                  </Link>


              {/* NAVIGATION (HIDDEN ON /app/familyMaster) */}
              {!hideNavTabs && (
                <nav className="hidden lg:flex items-center ml-12 gap-6">
                  {navItems.map((item) => {
                    if (item.label === "Master") {
                      return (
                        <div
                          key="master"
                          ref={masterDropdownRef}
                          className="relative"
                        >
                          <button
                            onClick={() =>
                              setDesktopMasterOpen(!desktopMasterOpen)
                            }
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                              isMasterActive()
                                ? "bg-gray-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            Master
                            <ChevronDown
                              size={16}
                              className={`transition ${
                                desktopMasterOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {desktopMasterOpen && (
                            <div className="absolute mt-2 w-56 bg-white border rounded-xl shadow-lg">
                              {item.children.map((sub) => (
                                <Link
                                  key={sub.path}
                                  to={sub.path}
                                  onClick={() =>
                                    setDesktopMasterOpen(false)
                                  }
                                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50"
                                >
                                  <sub.icon size={16} />
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                          isActive(item.path)
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              )}

              {/* RIGHT SIDE */}
              <div className="ml-auto flex items-center gap-4">
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {imageLoading ? (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <User />
                        </div>
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                          <User className="text-white" />
                        </div>
                      )}
                    </div>
                    <span className="hidden md:block font-semibold">
                      {displayName}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg">
                      <button
                        onClick={() => {
                          setEditOpen(true);
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50"
                      >
                        ✏️ Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={() => setOpen(!open)} className="lg:hidden">
                  {open ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <EditProfile open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
