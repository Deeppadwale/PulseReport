// import React, { useState, useEffect } from 'react';
// import { 
//   Users, 
//   FileText, 
//   Calendar,
//   Activity,
//   Heart,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Shield,
//   User,
//   Bell
// } from "lucide-react";

// import { useNavigate } from "react-router-dom";
// import { useGetMemberUserImageQuery } from "../services/medicalAppoinmentApi";
// import {useGetFamilyMasterscountQuery} from "../services/familyMasterApi"
// import{useGetReportMasterscountQuery} from "../services/reportMasterApi"
// import MemberReportTable from '../components/userReportlist'; 

// const SimpleMedicalDashboard = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [imageUrl, setImageUrl] = useState(null);
//   const navigate = useNavigate();

//   const member_id = sessionStorage.getItem("member_id");
//   const user_name = sessionStorage.getItem("User_Name");
//   const family_name = sessionStorage.getItem("Family_Name");

//   const { data: imageBlob, isLoading: imageLoading } = useGetMemberUserImageQuery(
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

//   const sliderImages = [
//     {
//       id: 1,
//       title: "Protect Your Community",
//       description: "Stay ahead of the season. Get your latest flu and booster shots today with walk-in convenience.",
//       image: "https://images.unsplash.com/photo-1618961734760-466979ce35b0?w=800&auto=format&fit=crop",
//       buttonText: "View Clinic Map"
//     },
//     {
//       id: 2,
//       title: "Maternal & Child Care",
//       description: "Expert care for mothers and little ones, from prenatal to pediatrics.",
//       image: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&auto=format&fit=crop",
//       buttonText: "Learn More"
//     },
//     {
//       id: 3,
//       title: "Emergency Care 24/7",
//       description: "Compassionate, high-speed emergency response when every second counts.",
//       image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop",
//       buttonText: "Emergency Contacts"
//     }
//   ];

//   const stats = [
//     { icon: Users, value: "245", label: "Total Family Member", bg: "bg-blue-50", text: "text-blue-600", path: "/app/member-list" },
//     { icon: Calendar, value: "18", label: "Today's Appointments", bg: "bg-green-50", text: "text-green-600", path: "/appointments" },
//     { icon: FileText, value: "32", label: "ALL Medical Reports", bg: "bg-amber-50", text: "text-amber-600", path: "/app/reportMaster" },
//     { icon: Activity, value: "96%", label: "Create Family Member", bg: "bg-purple-50", text: "text-purple-600", path: "/app/member-master" },
//   ];

//   const appointments = [
//     { id: 1, patient: "John Smith", time: "10:30 AM", doctor: "Dr. Miller", status: "Confirmed" },
//     { id: 2, patient: "Mary Johnson", time: "11:45 AM", doctor: "Dr. Wilson", status: "In-Progress" },
//     { id: 3, patient: "Robert Chen", time: "02:15 PM", doctor: "Dr. Brown", status: "Pending" },
//     { id: 4, patient: "Alice Wong", time: "04:00 PM", doctor: "Dr. Miller", status: "Confirmed" },
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       nextSlide();
//     }, 5000);
//     return () => clearInterval(timer);
//   }, [currentSlide]);

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
//   };

//   const filteredAppointments = appointments.filter(app => 
//     app.patient.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const displayName = user_name || "";
//   const displayFamily = family_name || "";


//   return (
//     <div>
//       {/* Header */}
//       <header className="mb-">
//         <div className="max-w-8xl mx-auto flex items-center justify-between">
//           <div className="mb-1">
//             <h2 className="text-3xl font-bold text-slate-800">
//               Welcome  <span className="text-blue-600">{displayFamily}</span>
//             </h2>
//           </div>

//         </div>
//       </header>

//       <main className="max-w-10xl mx-auto px-4 sm:px-6 py-8">
//         {/* Slider */}
//         <section className="relative group mb-10">
//           <div className="relative h-[350px] rounded-3xl overflow-hidden shadow-2xl shadow-blue-100/50">
//             {sliderImages.map((slide, index) => (
//               <div
//                 key={slide.id}
//                 className={`absolute inset-0 transition-all duration-700 ease-in-out ${
//                   index === currentSlide 
//                     ? 'opacity-100 translate-x-0' 
//                     : index < currentSlide 
//                       ? 'opacity-0 -translate-x-full' 
//                       : 'opacity-0 translate-x-full'
//                 }`}
//               >
//                 <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
//                 <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent flex items-center p-8 sm:p-12">
//                   <div className="max-w-xl text-white">
//                     <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-xs font-bold mb-4 uppercase tracking-widest shadow-lg">
//                       Featured Service
//                     </span>
//                     <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{slide.title}</h2>
//                     <p className="text-slate-200 text-lg mb-6 leading-relaxed">{slide.description}</p>
//                     <button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
//                       {slide.buttonText} →
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 hover:text-blue-600 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200">
//             <ChevronLeft className="h-6 w-6" />
//           </button>
//           <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 hover:text-blue-600 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200">
//             <ChevronRight className="h-6 w-6" />
//           </button>
//         </section>

//         {/* Stats */}
//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//           {stats.map((stat, index) => (
//             <div
//               key={index}
//               className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
//               onClick={() => navigate(stat.path)}
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-slate-500 text-sm font-medium mb-2">{stat.label}</p>
//                   <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
//                 </div>
//                 <div className={`${stat.bg} ${stat.text} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
//                   <stat.icon className="h-7 w-7" />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </section>

//         {/* Member Reports */}
//         {member_id && <MemberReportTable />}

//         {/* Bottom Grid: Appointments */}
//         <div className="grid lg:grid-cols-3 gap-8 mt-10">
          
        
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SimpleMedicalDashboard;




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

