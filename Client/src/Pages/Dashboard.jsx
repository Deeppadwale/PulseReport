
import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGetMemberUserImageQuery } from "../services/medicalAppoinmentApi";
import { useGetMemberMastercountQuery } from "../services/medicalAppoinmentApi";
import { useGetReportMasterscountQuery } from "../services/reportMasterApi";
import {useGetFamilyMasterscountQuery} from "../services/familyMasterApi"
import MemberReportTable from "../components/userReportlist";

const SimpleMedicalDashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const member_id = sessionStorage.getItem("member_id");
  const family_name = sessionStorage.getItem("Family_Name");
  const family_id = sessionStorage.getItem("family_id");

  /* ================= COUNTS ================= */

const { data: familyCount, isLoading: familyCountLoading } = useGetMemberMastercountQuery(family_id);

  const {
    data: reportCount,
    isLoading: reportCountLoading,
  } = useGetReportMasterscountQuery();

  const totalFamilyMembers = familyCount ?? 0;
  const totalReports = reportCount ?? 0;

  /* ================= USER IMAGE ================= */
  const { data: imageBlob } = useGetMemberUserImageQuery(
    member_id ? { member_id } : null,
    { skip: !member_id }
  );

  useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageBlob]);

  /* ================= SLIDER ================= */
  const sliderImages = [
    {
      id: 1,
      title: "Protect Your Community",
      description:
        "Stay ahead of the season. Get your latest flu and booster shots today.",
      image:
        "https://images.unsplash.com/photo-1618961734760-466979ce35b0?w=800",
    },
    {
      id: 2,
      title: "Maternal & Child Care",
      description:
        "Expert care for mothers and little ones, from prenatal to pediatrics.",
      image:
        "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800",
    },
    {
      id: 3,
      title: "Emergency Care 24/7",
      description:
        "Compassionate emergency response when every second counts.",
      image:
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  /* ================= STATS ================= */
  const stats = [
    {
      icon: Users,
      value: familyCountLoading ? "..." : totalFamilyMembers,
      label: "Total Family Member",
      bg: "bg-blue-50",
      text: "text-blue-600",
      path: "/app/member-list",
    },
    
    {
      icon: FileText,
      value: reportCountLoading ? "..." : totalReports,
      label: "ALL Medical Reports",
      bg: "bg-amber-50",
      text: "text-amber-600",
      path: "/app/reportMaster",
    },
    
  ];

  return (
    <div>
      {/* HEADER */}
      <header className="mb-6">
        <div className="max-w-8xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800">
            Welcome <span className="text-blue-600">{family_name}</span>
          </h2>
        </div>
      </header>

      <main className="max-w-10xl mx-auto px-4 sm:px-6 py-6">
        {/* SLIDER */}
        <section className="relative mb-10">
          <div className="relative h-[350px] rounded-3xl overflow-hidden shadow-xl">
            {sliderImages.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center p-10">
                  <div className="text-white max-w-xl">
                    <h2 className="text-4xl font-bold mb-4">
                      {slide.title}
                    </h2>
                    <p className="text-lg">{slide.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentSlide(
                (currentSlide - 1 + sliderImages.length) %
                  sliderImages.length
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() =>
              setCurrentSlide((currentSlide + 1) % sliderImages.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow"
          >
            <ChevronRight />
          </button>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              onClick={() => navigate(stat.path)}
              className="bg-white p-6 rounded-2xl shadow border hover:shadow-lg cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-2">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`${stat.bg} ${stat.text} p-4 rounded-xl`}
                >
                  <stat.icon className="h-7 w-7" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* MEMBER REPORT TABLE */}
        {member_id && <MemberReportTable />}
      </main>
    </div>
  );
};

export default SimpleMedicalDashboard;



// import React, { useState, useEffect } from "react";
// import {
//   Heart,
//   Brain,

//   Activity,
//   Eye,
//   Bone,
//   Users,
//   FileText,
//   ChevronRight,
//   Zap,
//   Shield,
//   TrendingUp,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// import { useGetMemberUserImageQuery } from "../services/medicalAppoinmentApi";
// import { useGetMemberMastercountQuery } from "../services/medicalAppoinmentApi";
// import { useGetReportMasterscountQuery } from "../services/reportMasterApi";
// import MemberReportTable from "../components/userReportlist";

// const SimpleMedicalDashboard = () => {
//   const [selectedOrgan, setSelectedOrgan] = useState("heart");
//   const [scanActive, setScanActive] = useState(false);
//   const [healthData, setHealthData] = useState({
//     heart: { rate: 72, status: "normal", lastCheck: "2 hours ago" },
//     brain: { activity: 85, status: "optimal", lastCheck: "1 day ago" },
//     lungs: { capacity: 92, status: "good", lastCheck: "3 days ago" },
//     eyes: { vision: "20/20", status: "excellent", lastCheck: "6 months ago" },
//     bones: { density: 94, status: "strong", lastCheck: "1 year ago" },
//   });
//   const [imageUrl, setImageUrl] = useState(null);
//   const navigate = useNavigate();

//   const member_id = sessionStorage.getItem("member_id");
//   const family_name = sessionStorage.getItem("Family_Name");
//   const family_id = sessionStorage.getItem("family_id");

//   /* ================= COUNTS ================= */
//   const { data: familyCount, isLoading: familyCountLoading } =
//     useGetMemberMastercountQuery(family_id);

//   const {
//     data: reportCount,
//     isLoading: reportCountLoading,
//   } = useGetReportMasterscountQuery();

//   const totalFamilyMembers = familyCount ?? 0;
//   const totalReports = reportCount ?? 0;

//   /* ================= USER IMAGE ================= */
//   const { data: imageBlob } = useGetMemberUserImageQuery(
//     member_id ? { member_id } : null,
//     { skip: !member_id }
//   );

//   useEffect(() => {
//     if (imageBlob) {
//       const url = URL.createObjectURL(imageBlob);
//       setImageUrl(url);
//       return () => URL.revokeObjectURL(url);
//     }
//   }, [imageBlob]);

//   /* ================= 3D BODY ORGANS ================= */
//   const organs = [
//     {
//       id: "heart",
//       name: "Heart",
//       icon: Heart,
//       color: "text-red-500",
//       bg: "bg-red-50",
//       border: "border-red-200",
//       position: "top-[35%] left-1/2 transform -translate-x-1/2",
//       description: "Cardiovascular System",
//     },
//     {
//       id: "brain",
//       name: "Brain",
//       icon: Brain,
//       color: "text-purple-500",
//       bg: "bg-purple-50",
//       border: "border-purple-200",
//       position: "top-[15%] left-1/2 transform -translate-x-1/2",
//       description: "Cognitive Function",
//     },
//     {
//       id: "lungs",
//       name: "Lungs",
//       icon: Eye,
//       color: "text-blue-500",
//       bg: "bg-blue-50",
//       border: "border-blue-200",
//       position: "top-[45%] left-[35%]",
//       description: "Respiratory System",
//     },
//     {
//       id: "eyes",
//       name: "Eyes",
//       icon: Eye,
//       color: "text-amber-500",
//       bg: "bg-amber-50",
//       border: "border-amber-200",
//       position: "top-[20%] left-[40%]",
//       description: "Visual Health",
//     },
//     {
//       id: "bones",
//       name: "Bones",
//       icon: Bone,
//       color: "text-gray-600",
//       bg: "bg-gray-50",
//       border: "border-gray-200",
//       position: "top-[60%] left-1/2 transform -translate-x-1/2",
//       description: "Skeletal System",
//     },
//   ];

//   /* ================= STATS ================= */
//   const stats = [
//     {
//       icon: Users,
//       value: familyCountLoading ? "..." : totalFamilyMembers,
//       label: "Family Members",
//       color: "text-blue-600",
//       bg: "bg-blue-50",
//       path: "/app/member-list",
//       trend: "↑ 2 this year",
//     },
//     {
//       icon: FileText,
//       value: reportCountLoading ? "..." : totalReports,
//       label: "Medical Reports",
//       color: "text-emerald-600",
//       bg: "bg-emerald-50",
//       path: "/app/reportMaster",
//       trend: "12 pending",
//     },
//     {
//       icon: Activity,
//       value: "98.6°F",
//       label: "Body Temp",
//       color: "text-orange-600",
//       bg: "bg-orange-50",
//       path: "/app/vitals",
//       trend: "Normal",
//     },
//     {
//       icon: Shield,
//       value: "100%",
//       label: "Vaccination",
//       color: "text-green-600",
//       bg: "bg-green-50",
//       path: "/app/vaccines",
//       trend: "Up to date",
//     },
//   ];

//   const handleOrganClick = (organId) => {
//     setSelectedOrgan(organId);
//     setScanActive(true);
    
//     // Simulate scanning animation
//     setTimeout(() => {
//       setScanActive(false);
//     }, 2000);
//   };

//   const getOrganData = () => {
//     return healthData[selectedOrgan] || {};
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       {/* HEADER */}
//       <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-blue-100">
//         <div className="px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">
//                 Medi<span className="text-blue-600">3D</span>View
//               </h1>
//               <p className="text-sm text-gray-600">
//                 Interactive Health Visualization for{" "}
//                 <span className="font-semibold text-blue-700">{family_name}</span>
//               </p>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => setScanActive(!scanActive)}
//                 className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
//                   scanActive
//                     ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
//                     : "bg-blue-100 text-blue-700 hover:bg-blue-200"
//                 }`}
//               >
//                 <Zap className="h-4 w-4 mr-2" />
//                 {scanActive ? "Scanning..." : "Full Body Scan"}
//               </button>
              
//               {imageUrl && (
//                 <img
//                   src={imageUrl}
//                   alt="Profile"
//                   className="h-10 w-10 rounded-full border-2 border-blue-300 shadow-sm"
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="px-4 sm:px-6 py-6">
//         {/* MAIN CONTENT GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* LEFT COLUMN - INTERACTIVE BODY */}
//           <div className="lg:col-span-2">
//             <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 shadow-xl p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800">3D Health Anatomy</h2>
//                   <p className="text-gray-600">Click on organs to view detailed health data</p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
//                   <span className="text-sm text-gray-600">Real-time</span>
//                 </div>
//               </div>

//               {/* INTERACTIVE BODY VISUALIZATION */}
//               <div className="relative h-[500px] bg-gradient-to-b from-blue-50/50 to-white rounded-xl border border-blue-100 overflow-hidden">
//                 {/* Scanning animation */}
//                 {scanActive && (
//                   <div className="absolute inset-0 z-20 pointer-events-none">
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-scan"></div>
//                   </div>
//                 )}

//                 {/* Body outline */}
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="relative">
//                     {/* Body silhouette */}
//                     <div className="w-64 h-96 rounded-t-full bg-gradient-to-b from-blue-100/30 to-blue-50/30 border-2 border-blue-200/30"></div>
                    
//                     {/* Organs */}
//                     {organs.map((organ) => (
//                       <button
//                         key={organ.id}
//                         onClick={() => handleOrganClick(organ.id)}
//                         className={`absolute ${organ.position} group transition-all duration-300 ${
//                           selectedOrgan === organ.id
//                             ? "scale-125 z-10"
//                             : "hover:scale-110"
//                         }`}
//                       >
//                         <div
//                           className={`p-4 rounded-2xl ${organ.bg} ${organ.border} border-2 ${
//                             selectedOrgan === organ.id
//                               ? "shadow-xl ring-2 ring-offset-2 ring-blue-400"
//                               : "shadow-lg group-hover:shadow-xl"
//                           }`}
//                         >
//                           <organ.icon className={`h-8 w-8 ${organ.color}`} />
//                           <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border border-blue-200 flex items-center justify-center">
//                             <div
//                               className={`w-2 h-2 rounded-full ${
//                                 healthData[organ.id]?.status === "normal" ||
//                                 healthData[organ.id]?.status === "optimal"
//                                   ? "bg-green-500"
//                                   : "bg-yellow-500 animate-pulse"
//                               }`}
//                             ></div>
//                           </div>
//                         </div>
                        
//                         {/* Organ label */}
//                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
//                           <div className="text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
//                             {organ.name}
//                           </div>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Health indicators */}
//                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
//                   <div className="flex items-center space-x-6">
//                     {[
//                       { color: "bg-green-500", label: "Normal" },
//                       { color: "bg-yellow-500", label: "Needs Check" },
//                       { color: "bg-red-500", label: "Attention Needed" },
//                     ].map((indicator, index) => (
//                       <div key={index} className="flex items-center space-x-2">
//                         <div className={`w-3 h-3 rounded-full ${indicator.color}`}></div>
//                         <span className="text-xs text-gray-600">{indicator.label}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* SELECTED ORGAN DETAILS */}
//               <div className="mt-6 bg-white rounded-xl border border-blue-100 p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center space-x-3">
//                     {organs.find((o) => o.id === selectedOrgan) && (
//                       <>
//                         <div
//                           className={`p-3 rounded-xl ${
//                             organs.find((o) => o.id === selectedOrgan).bg
//                           }`}
//                         >
//                           {React.createElement(
//                             organs.find((o) => o.id === selectedOrgan).icon,
//                             {
//                               className: `h-6 w-6 ${
//                                 organs.find((o) => o.id === selectedOrgan).color
//                               }`,
//                             }
//                           )}
//                         </div>
//                         <div>
//                           <h3 className="font-bold text-gray-800">
//                             {organs.find((o) => o.id === selectedOrgan).name}
//                           </h3>
//                           <p className="text-sm text-gray-600">
//                             {organs.find((o) => o.id === selectedOrgan).description}
//                           </p>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                   <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
//                     View Details <ChevronRight className="h-4 w-4 ml-1" />
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   {Object.entries(getOrganData()).map(([key, value]) => (
//                     <div key={key} className="bg-gray-50 rounded-lg p-4">
//                       <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
//                         {key.replace(/([A-Z])/g, " $1")}
//                       </div>
//                       <div className="text-lg font-bold text-gray-800">{value}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT COLUMN - HEALTH STATS & ACTIONS */}
//           <div className="space-y-6">
//             {/* HEALTH OVERVIEW */}
//             <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6">
//               <h3 className="font-bold text-gray-800 mb-4">Health Overview</h3>
//               <div className="space-y-4">
//                 {stats.map((stat, index) => (
//                   <div
//                     key={index}
//                     onClick={() => navigate(stat.path)}
//                     className="group cursor-pointer"
//                   >
//                     <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
//                       <div className="flex items-center space-x-3">
//                         <div className={`p-2 rounded-lg ${stat.bg}`}>
//                           <stat.icon className={`h-5 w-5 ${stat.color}`} />
//                         </div>
//                         <div>
//                           <div className="text-lg font-bold text-gray-800">{stat.value}</div>
//                           <div className="text-sm text-gray-600">{stat.label}</div>
//                         </div>
//                       </div>
//                       <div className="text-xs text-gray-500">{stat.trend}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* QUICK ACTIONS */}
//             <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
//               <h3 className="font-bold mb-4">Quick Actions</h3>
//               <div className="space-y-3">
//                 <button className="w-full flex items-center justify-between p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
//                   <span>Schedule Check-up</span>
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//                 <button className="w-full flex items-center justify-between p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
//                   <span>View Recent Reports</span>
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//                 <button className="w-full flex items-center justify-between p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
//                   <span>Family Health Insights</span>
//                   <TrendingUp className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>

//             {/* HEALTH INSIGHTS */}
//             <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6">
//               <h3 className="font-bold text-gray-800 mb-4">Health Insights</h3>
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-800">
//                       Heart rate is optimal
//                     </p>
//                     <p className="text-xs text-gray-600">Resting at 72 BPM</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-800">
//                       Annual check-up due
//                     </p>
//                     <p className="text-xs text-gray-600">Schedule within 30 days</p>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-800">
//                       All vaccinations current
//                     </p>
//                     <p className="text-xs text-gray-600">Next due in 6 months</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* REPORTS SECTION */}
//         {member_id && (
//           <div className="mt-8 bg-white rounded-2xl border border-blue-100 shadow-lg overflow-hidden">
//             <div className="p-6 border-b border-blue-100">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-bold text-gray-800">
//                     Recent Medical Reports
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     Interactive analysis of your health documents
//                   </p>
//                 </div>
//                 <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium shadow-md">
//                   Analyze All Reports
//                 </button>
//               </div>
//             </div>
//             <div className="p-1">
//               <MemberReportTable />
//             </div>
//           </div>
//         )}
//       </main>

//       {/* CSS Animations */}
//       <style jsx>{`
//         @keyframes scan {
//           0% {
//             transform: translateX(-100%);
//           }
//           100% {
//             transform: translateX(100%);
//           }
//         }
//         .animate-scan {
//           animation: scan 2s linear infinite;
//         }
        
//         /* 3D hover effects */
//         .group:hover .group-hover\:shadow-3d {
//           box-shadow: 
//             0 20px 40px rgba(59, 130, 246, 0.1),
//             inset 0 1px 0 rgba(255, 255, 255, 0.6);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SimpleMedicalDashboard;