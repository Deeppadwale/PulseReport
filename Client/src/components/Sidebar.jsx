// import {
//   ChevronFirst,
//   ChevronLast,
//   MoreVertical,
//   Users,
//   Package,
//   Tag,
//   Layers,
//   ShoppingCart,
//   BookOpen,
//   Ticket,
//   Award,
//   Mic,
//   Users2,
//   Gavel,
//   Phone,
//   ChevronDown,
//   ChevronRight,
//   Home,
//   List,
//   Calendar,
//   Grid,
//   Trophy,
//   MapPin,
//   Flag,
//   Store,
//   UsersRound,
//   Network,
//   ArrowLeft,
//   Star
// } from "lucide-react";

// import { Link, useLocation } from "react-router-dom";
// import { createContext, useContext, useState, useRef, useEffect } from "react";
// import logo from "../assets/jkIndia.png";
// import profile from "../assets/jklogo.png";
// import Profile from "../Pages/Profile/Profile";
// import { decryptData } from '../common/Functions/DecryptData';

// const SidebarContext = createContext();

// export default function Sidebar() {
//   const [expanded, setExpanded] = useState(true);
//   const [showSubMenu, setShowSubMenu] = useState(false);

//   const Event_Name = sessionStorage.getItem('Event_Name');


//   const getUserData = () => {
//     try {
//       const encryptedUserData = sessionStorage.getItem('user_data');
//       if (encryptedUserData) {
//         return decryptData(encryptedUserData);
//       }
//     } catch (error) {
//       console.error("Error decrypting user data:", error);
//     }
//     return null;
//   };

//   const userData = getUserData();
//   const userType = userData?.user_type || '';

//   return (
//     <aside className="h-screen">
//       <nav className="h-full flex flex-col bg-white border-r shadow-sm">
//         <div className="p-2 pb-1 mt-2 flex justify-between items-center">
//           <img
//             src={logo}
//             alt="JK India Logo"
//             className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "w-48 transform translate-x-4" : "w-0"
//               }`}
//           />
//           <button
//             onClick={() => setExpanded((curr) => !curr)}
//             className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
//           >
//             {expanded ? <ChevronFirst /> : <ChevronLast />}
//           </button>
//         </div>

//         <SidebarContext.Provider value={{ expanded }}>
//           <ul className="flex-1 px-3 mt-2">
//             <SidebarItem
//               icon={<Store className="h-5 w-5 text-orange-600" size={20} />}
//               text="Dashboard"
//               path={userType === 'A' ? '/dashboard' : '/userdashboard'}
//             />

//             {userType === 'A' && (
//               <li
//                 className="relative"
//                 onMouseLeave={() => !expanded && setShowSubMenu(false)}
//               >
//                 <div
//                   onClick={() => setShowSubMenu(!showSubMenu)}
//                   onMouseEnter={() => !expanded && setShowSubMenu(true)}
//                   className={`
//                   relative flex items-center py-2 px-3 my-1 font-medium rounded-[25px] 
//                   cursor-pointer transition-colors group 
//                   hover:bg-indigo-50 text-gray-600
//                   h-10 
//                   `}
//                 >
//                   <Layers className="h-5 w-5 text-purple-600" size={20} />
//                   <span
//                     className={`
//                     overflow-hidden transition-all 
//                     ${expanded ? "w-52 ml-3 whitespace-nowrap" : "w-0"}
//                   `}
//                   >
//                     Masters
//                   </span>
//                   {expanded && (
//                     <div className="ml-auto">
//                       {showSubMenu ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
//                     </div>
//                   )}
//                 </div>

//                 {!expanded && (
//                   <div
//                     className={`
//                 absolute left-full top-0 ml-6 px-2 py-1 bg-indigo-100 text-indigo-800 text-sm
//                 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100
//                 transition-opacity z-50 pointer-events-none
//               `}
//                   >
//                     Masters
//                   </div>
//                 )}

//                 {expanded && showSubMenu && (
//                   <ul className="ml-8">
//                     <SidebarItem icon={<Flag className="h-5 w-5 text-blue-600" size={16} />} text="Event Super Master" path='/eventsupermaster' />
//                     <SidebarItem icon={<Calendar className="h-5 w-5 text-blue-600" size={16} />} text="Event Master" path='/eventmaster' />
//                     <SidebarItem icon={<List className="h-5 w-5 text-indigo-600" size={16} />} text="Category Wise Deliverable Master" path='/CategoryWiseDeliverableMaster' />
//                     <SidebarItem icon={<Users className="h-5 w-5 text-teal-600" size={16} />} text="Sponsor Master" path='/sponsor-master' />
//                     <SidebarItem icon={<Package className="h-5 w-5 text-pink-600" size={16} />} text="Deliverable Master" path='/deliverable-master' />
//                     <SidebarItem icon={<Grid className="h-5 w-5 text-orange-600" size={16} />} text="Category Master" path='/category-master' />
//                     <SidebarItem icon={<Layers className="h-5 w-5 text-purple-600" size={16} />} text="Category Sub Master" path='/categorysub-master' />
//                     <SidebarItem icon={<Trophy className="h-5 w-5 text-yellow-600" size={16} />} text="Award Master" path='/award-master' />
//                     <SidebarItem icon={<Star className="h-5 w-5 text-voilet-600" size={16} />} text="Award Sub Category Master" path='/award-subcategory' />
//                     <SidebarItem icon={<Star className="h-5 w-5 text-voilet-600" size={16} />} text="otp-verification" path='/otp-verification' />
//                   </ul>
//                 )}

//                 {!expanded && showSubMenu && (
//                   <div
//                     className="absolute left-full top-0 w-100 bg-white shadow-lg rounded-md z-50 py-1"
//                     onMouseLeave={() => setShowSubMenu(false)}
//                   >
//                     <SidebarItem
//                       icon={<Award size={16} />}
//                       text="Event Super Master"
//                       path='/eventsupermaster'
//                       forceExpand={true}
//                     />
//                     <SidebarItem
//                       icon={<Calendar className="h-5 w-5 text-blue-600" size={16} />}
//                       text="Event Master"
//                       path='/eventmaster'
//                       forceExpand={true}
//                     />
//                     <SidebarItem
//                       icon={<List className="h-5 w-5 text-indigo-600" size={16} />}
//                       text="Category Wise Deliverable Master"
//                       path='/CategoryWiseDeliverableMaster'
//                       forceExpand={true}
//                     />
//                     <SidebarItem
//                       icon={<Users className="h-5 w-5 text-teal-600" size={16} />}
//                       text="Sponsor Master"
//                       path='/sponsor-master'
//                       forceExpand={true}
//                     />
//                     <SidebarItem
//                       icon={<Package className="h-5 w-5 text-pink-600" size={16} />}
//                       text="Deliverable Master"
//                       path='/deliverable-master'
//                       forceExpand={true}
//                     />
//                     <SidebarItem
//                       icon={<Grid className="h-5 w-5 text-orange-600" size={16} />}
//                       text="Category Master"
//                       path='/category-master'
//                       forceExpand={true}
//                     />
//                     <SidebarItem
//                       icon={<Layers className="h-5 w-5 text-purple-600" size={16} />}
//                       text="Category Sub Master"
//                       path='/categorysub-master'
//                       forceExpand={true}
//                     />
//                     <SidebarItem
//                       icon={<Trophy className="h-5 w-5 text-yellow-600" size={16} />}
//                       text="Award Master"
//                       path='/award-master'
//                       forceExpand={true}
//                     />
//                     <SidebarItem
//                       icon={<Trophy className="h-5 w-5 text-yellow-600" size={16} />}
//                       text="Award Sub Category Master"
//                       path='/award-subcategory'
//                       forceExpand={true}
//                     />
                    
//                   </div>
//                 )}
//               </li>
//             )}

//             {userType === 'U' && (
//               <SidebarItem
//                 icon={<Users className="h-5 w-5 text-teal-600" size={20} />}
//                 text="Sponsor Master"
//                 path='/sponsor-master'
//               />
//             )}

//             <hr className="my-3 " />
//             <SidebarItem icon={<BookOpen className="h-5 w-5 text-green-600" size={20} />} text="Expo Registory & Tracker - Sponsor" path="/exporegistry-tracker" />
//             <SidebarItem icon={<Ticket className="h-5 w-5 text-green-600" size={20} />} text="Passess Registory & Tracker - Sponsor" path="/passess-registry" />
//             <SidebarItem icon={<Award className="h-5 w-5 text-amber-600" size={20} />} text="Award Registory & Tracker - Sponsor" path="/award-registry" />
//             <SidebarItem icon={<Mic className="h-5 w-5 text-purple-600" size={20} />} text="Speaker Sponsors" path="/speaker-tracker" />
//             <SidebarItem icon={<Users2 className="h-5 w-5 text-indigo-600" size={20} />} text="Curated Session - Sponsors" path="/curated-sessions" />
//             <SidebarItem icon={<Gavel className="h-5 w-5 text-red-600" size={20} />} text="Ministerial RoundTable Session - Sponsors" path="/ministrial-sessions" />
//             <SidebarItem icon={<UsersRound className="h-5 w-5 text-pink-600" size={20} />} text="Secretarial RoundTable Sessions" path="/SecretarialRoundTable" />
//             <SidebarItem icon={<Network className="h-5 w-5 text-red-600" size={20} />} text="Networking Table Slots & Tracker" path="/NetworkingSlotTracker" />
//             <SidebarItem icon={<ArrowLeft className="h-5 w-5 text-red-600" size={20} />} text="Back To Task" path="/taskdashboard/Taskutility" />
//             <hr className="my-3" />
//             <Profile />
//           </ul>
//         </SidebarContext.Provider>

//         <div className="border-t flex p-3">
//           {/* <img src={profile} className="w-10 h-10 rounded-md" alt="Profile" /> */}
//           <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
//             {/* <div className="leading-4">
//               <span className="text-xs text-gray-800">Customer Care</span>
//               <div className="flex items-center">
//                 <Phone size={14} className="mr-1" />
//                 <h2 className="font-semibold">9881999101</h2>
//               </div>
//             </div> */}

//             {Event_Name && (
//               <div className="flex items-center bg-[#FDF8F8] rounded-full px-4 py-2 hover:bg-[#FBEAEA] transition-colors duration-200 cursor-pointer">
//                 <Calendar size={18} className="text-[#8B0000] mr-2" />
//                 <span className="text-[#8B0000] font-medium text-sm md:text-base">
//                   {Event_Name}
//                 </span>
//               </div>
//             )}

//             {/* <MoreVertical size={20} /> */}
//           </div>
//         </div>
//       </nav>
//     </aside>
//   );
// }

// function SidebarItem({ icon, text, path = "/", forceExpand = false }) {
//   const { expanded } = useContext(SidebarContext);
//   const location = useLocation();
//   const isActive = location.pathname === path;

//   return (
//     <Link to={path}>
//       <li
//         className={`
//           relative flex items-center py-2 px-3 my-1 font-medium rounded-[25px] 
//           cursor-pointer transition-colors group 
//           ${isActive
//             ? "bg-[#F5EBEB] text-[#D92300]"
//             : "hover:bg-indigo-50 text-gray-600"
//           }
//         h-10 
//         ${forceExpand ? 'w-full' : ''}
//         `}
//       >
//         {icon}
//         <span
//           className={`
//           overflow-hidden transition-all 
//           ${expanded || forceExpand ? "w-52 ml-3 whitespace-nowrap" : "w-0"}
//         `}
//         >
//           {text}
//         </span>

//         {isActive && (
//           <div
//             className={`
//         absolute right-2 w-2 h-2 rounded-full bg-[#992205] 
//         ${expanded || forceExpand ? "" : "top-2"}
//           `}
//           ></div>
//         )}

//         {!expanded && !forceExpand && (
//           <div
//             className={`
//             absolute left-full top-0 
//             rounded-md px-2 py-1 ml-6 
//             bg-[#F5EBEB] text-[#D92300] text-sm 
//             invisible opacity-20 -translate-x-3 
//             transition-all 
//             group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 
//             whitespace-nowrap
//             z-10 
//              `}
//           >
//             {text}
//           </div>
//         )}
//       </li>
//     </Link>
//   );
// }