import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,FileText,ChevronLeft,ChevronRight,Download, Eye, User,Calendar,Filter, Mail, File, ChevronDown,Search, Bell,X, CheckCircle,AlertCircle,Pill, Clock,Stethoscope,ExternalLink, Plus, FilePlus,CalendarPlus,Upload,Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetMemberUserImageQuery,
  useGetMemberMastersQuery,
} from "../services/medicalAppoinmentApi";
import { useGetDetailedRecentActivityQuery  } from "../services/dashboardApi";

import {
  useGetRemindersQuery,
  useUpdateReminderFlagMutation,
} from "../services/upcomingAppointmentApi";
import { useGetMemberReportsByFamilyQuery } from "../services/memberReportApi";
import { useGetReportMastersQuery } from "../services/reportMasterApi";
import { useGetReportMasterscountQuery } from "../services/reportMasterApi";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

// Activity icon and color mapping
const activityIconMap = {
  REPORT_CREATED: { 
    icon: FilePlus, 
    color: "text-blue-600", 
    bgColor: "bg-blue-100",
    label: "Report Created"
  },
  REPORT_UPLOADED: { 
    icon: Upload, 
    color: "text-purple-600", 
    bgColor: "bg-purple-100",
    label: "Report Uploaded"
  },
  APPOINTMENT_CREATED: { 
    icon: CalendarPlus, 
    color: "text-green-600", 
    bgColor: "bg-green-100",
    label: "Appointment Created"
  },
  MEDICINE_ADDED: { 
    icon: Pill, 
    color: "text-amber-600", 
    bgColor: "bg-amber-100",
    label: "Medicine Added"
  },
};

// Create a cache for image URLs
const imageUrlCache = new Map();

// Create a separate Slider component
const SliderSection = React.memo(({ sliderImages }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  const goToPrevious = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + sliderImages.length) % sliderImages.length,
    );
  }, [sliderImages.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  }, [sliderImages.length]);

  return (
    <section className="relative mb-10">
      <div className="relative h-[250px] rounded-2xl overflow-hidden shadow-lg">
        {sliderImages.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{ transition: "opacity 1s ease-in-out" }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error(`Failed to load slider image: ${slide.image}`);
                e.target.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center p-6">
              <div className="text-white max-w-lg">
                <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                <p className="opacity-90">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

SliderSection.displayName = "SliderSection";

// Create a separate NotificationBell component
const NotificationBell = React.memo(
  ({
    unreadCount,
    remindersData,
    remindersLoading,
    updateReminderFlag,
    refetchReminders,
    navigate,
    showNotifications,
    setShowNotifications,
  }) => {
    const notificationRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          notificationRef.current &&
          !notificationRef.current.contains(event.target)
        ) {
          setShowNotifications(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [setShowNotifications]);

    const getMedicationTime = useCallback((detail) => {
      const times = [];
      if (detail.Morning === "Y") times.push("Morning");
      if (detail.AfterNoon === "Y") times.push("Afternoon");
      if (detail.Evening === "Y") times.push("Evening");
      return times.length > 0 ? times.join(", ") : "Not specified";
    }, []);

    const getDaysDifference = useCallback((endDate) => {
      const today = new Date();
      const end = new Date(endDate);
      const diffTime = end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }, []);

    const handleMarkAsDone = useCallback(
      async (memberId, detailId) => {
        try {
          await updateReminderFlag({
            memberId,
            detailId,
            reminder: "N",
          }).unwrap();
          refetchReminders();
        } catch (error) {
          console.error("Failed to update reminder:", error);
        }
      },
      [updateReminderFlag, refetchReminders],
    );

    const handleMarkAllAsRead = useCallback(async () => {
      try {
        const updatePromises = [];
        remindersData?.forEach((appointment) => {
          appointment.details?.forEach((detail) => {
            if (detail.Reminder === "Y") {
              updatePromises.push(
                updateReminderFlag({
                  memberId: appointment.Member_id,
                  detailId: detail.upcommingAppointmentDetail_id,
                  reminder: "N",
                }).unwrap(),
              );
            }
          });
        });

        await Promise.all(updatePromises);
        refetchReminders();
        setShowNotifications(false);
      } catch (error) {
        console.error("Failed to mark all as read:", error);
      }
    }, [
      remindersData,
      updateReminderFlag,
      refetchReminders,
      setShowNotifications,
    ]);

    const handleViewAppointment = useCallback(
      (appointmentId) => {
        navigate(`/app/UpcomingAppointment?appointmentId=${appointmentId}`);
        setShowNotifications(false);
      },
      [navigate, setShowNotifications],
    );

    return (
      <div className="relative" ref={notificationRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 bg-gradient-to-r from-white to-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-sm border border-gray-200"
        >
          <Bell
            className={`h-6 w-6 ${unreadCount > 0 ? "text-amber-600" : "text-gray-500"}`}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-bold text-white">
                      Medication Reminders
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-white/20 rounded-full transition"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
                <p className="text-amber-100 text-sm mt-1">
                  {unreadCount} active reminder{unreadCount !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {remindersLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">
                      Loading reminders...
                    </p>
                  </div>
                ) : remindersData && remindersData.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {remindersData.map((appointment, idx) => (
                      <div
                        key={idx}
                        className="p-4 hover:bg-gray-50 transition"
                      >
                        {appointment.details &&
                          appointment.details.map(
                            (detail, detailIdx) =>
                              detail.Reminder === "Y" && (
                                <div
                                  key={detailIdx}
                                  className="mb-4 last:mb-0 p-3 bg-amber-50 rounded-lg border border-amber-200"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Pill className="h-4 w-4 text-amber-600" />
                                        <h4 className="font-semibold text-gray-900">
                                          {detail.Medicine_name}
                                        </h4>
                                        <span
                                          className={`px-2 py-1 text-xs rounded-full ${
                                            getDaysDifference(
                                              detail.End_date,
                                            ) === 0
                                              ? "bg-red-100 text-red-800"
                                              : "bg-amber-100 text-amber-800"
                                          }`}
                                        >
                                          {getDaysDifference(
                                            detail.End_date,
                                          ) === 0
                                            ? "Today"
                                            : getDaysDifference(
                                                  detail.End_date,
                                                ) === 1
                                              ? "Tomorrow"
                                              : `${getDaysDifference(detail.End_date)} days left`}
                                        </span>
                                      </div>

                                      <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <Stethoscope className="h-3 w-3 mr-1" />
                                        Dr. {appointment.Doctor_name} •{" "}
                                        {appointment.Hospital_name}
                                      </div>

                                      <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {getMedicationTime(detail)}
                                      </div>

                                      <div className="text-xs text-gray-500 mb-3">
                                        📅 Course:{" "}
                                        {new Date(
                                          detail.Start_date,
                                        ).toLocaleDateString()}{" "}
                                        -{" "}
                                        {new Date(
                                          detail.End_date,
                                        ).toLocaleDateString()}
                                      </div>

                                      {detail.Remark && (
                                        <div className="text-sm text-gray-700 bg-white p-2 rounded border mb-3">
                                          💬 {detail.Remark}
                                        </div>
                                      )}

                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() =>
                                            handleMarkAsDone(
                                              appointment.Member_id,
                                              detail.upcommingAppointmentDetail_id,
                                            )
                                          }
                                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center justify-center space-x-1"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                          <span>Mark as Taken</span>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleViewAppointment(
                                              appointment.upcommingAppointment_id,
                                            )
                                          }
                                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center space-x-1"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                          <span>View</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ),
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-1">
                      No Active Reminders
                    </h4>
                    <p className="text-gray-500 text-sm">
                      You're all caught up! No pending medication reminders.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <button
                  onClick={() => navigate("/app/UpcomingAppointment")}
                  className="w-full py-2 text-center text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition"
                >
                  View All Appointments →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

NotificationBell.displayName = "NotificationBell";

// Create a separate MemberCard component with better image handling
const MemberCard = React.memo(
  ({ member, isSelected, onClick, allReports, member_id }) => {
    const { data: imageBlob } = useGetMemberUserImageQuery(
      { member_id: member.Member_id },
      { skip: !member.Member_id },
    );

    // Use a persistent cache for image URLs
    const [imageUrl, setImageUrl] = useState(() => {
      // Check cache first
      return imageUrlCache.get(member.Member_id) || null;
    });

    // Update cache when new image blob arrives
    useEffect(() => {
      if (imageBlob && !imageUrlCache.has(member.Member_id)) {
        const newUrl = URL.createObjectURL(imageBlob);
        imageUrlCache.set(member.Member_id, newUrl);
        setImageUrl(newUrl);
      }
    }, [imageBlob, member.Member_id]);

    // Count total details for this member
    const detailCount = useMemo(() => {
      if (!Array.isArray(allReports)) return 0;
      let count = 0;
      allReports.forEach((report) => {
        if (
          Number(report.Member_id) === Number(member.Member_id) &&
          report.details &&
          Array.isArray(report.details)
        ) {
          count += report.details.length;
        }
      });
      return count;
    }, [allReports, member.Member_id]);

    // Get initials for fallback
    const getInitials = useCallback((name) => {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }, []);

    const initials = useMemo(
      () => getInitials(member.Member_name),
      [member.Member_name, getInitials],
    );

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center cursor-pointer p-1"
        onClick={() => onClick(member)}
      >
        <div
          className={`
        relative mb-3 p-0.5 rounded-full
        ${
          isSelected
            ? "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 shadow-lg"
            : "bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400"
        }
        transition-all duration-300
      `}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={member.Member_name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  console.error(
                    `Failed to load image for ${member.Member_name}`,
                  );
                  // Remove invalid URL from cache
                  imageUrlCache.delete(member.Member_id);
                  // Show fallback on error
                  e.target.style.display = "none";
                  // The fallback div is already there as backup
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{initials}</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        <div className="text-center max-w-[120px]">
          <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
            {member.Member_name}
          </h4>

          <div
            className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
          ${
            isSelected
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700"
          }
        `}
          >
            <FileText className="h-3 w-3 mr-1" />
            {detailCount}
          </div>
        </div>
      </motion.div>
    );
  },
);

MemberCard.displayName = "MemberCard";

const SimpleMedicalDashboard = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const itemsPerPage = 10;

  const member_id = sessionStorage.getItem("member_id");
  const family_name = sessionStorage.getItem("Family_Name");
  const family_id = sessionStorage.getItem("family_id");
  const navigate = useNavigate();

  const {
    data: remindersData = [],
    isLoading: remindersLoading,
    refetch: refetchReminders,
  } = useGetRemindersQuery(member_id, {
    skip: !member_id,
  });

  const [updateReminderFlag] = useUpdateReminderFlagMutation();

  const { data: familyMembers = [], isLoading: membersLoading } =
    useGetMemberMastersQuery(family_id, { skip: !family_id });

  const { data: allReports = [], isLoading: reportsLoading } =
    useGetMemberReportsByFamilyQuery(family_id, { skip: !family_id });

  const { data: reportCount, isLoading: reportCountLoading } =
    useGetReportMasterscountQuery();

  const { data: reportTypes = [] } = useGetReportMastersQuery();

  // Use the detailed recent activity query
  const {
    data: detailedRecentActivity = [],
    isLoading: detailedActivityLoading,
    isError: detailedActivityError,
  } = useGetDetailedRecentActivityQuery(
    {
      member_id,
      limit: 10,
    },
    { skip: !member_id }
  );

  // Helper function to check if data exists
  const hasData = useCallback((data) => {
    return data && Array.isArray(data) && data.length > 0;
  }, []);

  // Memoize slider images to prevent recreation on every render
  const sliderImages = useMemo(
    () => [
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
    ],
    [],
  );

  // Helper function to get activity description based on type
  const getActivityDescription = useCallback((activity) => {
    if (!activity) return "No description available";
    
    try {
      switch (activity.activity_type) {
        case "MEDICINE_ADDED":
          const medicine = activity.main_data?.medicine_detail;
          return `Medicine: ${medicine?.Medicine_name || "N/A"} , Remark: ${medicine?.Remark || "N/A"} , Days: ${medicine?.cource_days || "N/A"}`;

        case "REPORT_CREATED":
          return `${activity.main_data?.report_header?.remarks || "N/A"} `
        
        case "REPORT_UPLOADED": {
          const detail = activity.main_data?.report_detail;
          return ` ${detail?.Report_name || "N/A"} , ${detail?.Naration || ""}`;
        }

        case "APPOINTMENT_CREATED":
          const appointment = activity.main_data?.appointment_header;
          return `Doctor: ${appointment?.Doctor_name || "N/A"} , Hospital: ${appointment?.Hospital_name || "N/A"}`;

        default:
          return "N/A";
      }
    } catch (error) {
      return "Error loading details";
    }
  }, []);

  // Helper function to get member name from activity
  const getMemberNameFromActivity = useCallback((activity) => {
    if (!activity) return "N/A";
    
    try {
      if (activity.main_data?.member_info?.Member_name) {
        return activity.main_data.member_info.Member_name;
      }
      
      return `Member ID: ${activity.member_id || 'N/A'}`;
    } catch (error) {
      return "N/A";
    }
  }, []);

  useEffect(() => {
    if (remindersData && Array.isArray(remindersData)) {
      let count = 0;
      remindersData.forEach((appointment) => {
        if (appointment.details && Array.isArray(appointment.details)) {
          appointment.details.forEach((detail) => {
            if (detail.Reminder === "Y") {
              count++;
            }
          });
        }
      });
      setUnreadCount(count);
    }
  }, [remindersData]);

  const handleMemberSelect = useCallback((member) => {
    setSelectedMember(member);
    setSelectedReportType("all");
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const getAllMemberDetails = useCallback(() => {
    if (!selectedMember || !Array.isArray(allReports)) return [];

    const allDetails = [];

    allReports.forEach((report) => {
      if (
        Number(report.Member_id) === Number(selectedMember.Member_id) &&
        report.details &&
        Array.isArray(report.details)
      ) {
        report.details.forEach((detail) => {
          allDetails.push({
            ...detail,
            parentReportDate: report.doc_date,
            parentReportPurpose: report.purpose,
            parentReportRemarks: report.remarks,
            parentReportId: report.MemberReport_id,
            parentCreatedBy: report.Created_by,
          });
        });
      }
    });

    return allDetails;
  }, [selectedMember, allReports]);

  const getReportName = useCallback(
    (reportId) => {
      try {
        const report = reportTypes.find((r) => Number(r.Report_id) === Number(reportId));
        return report ? report.report_name : `Report ${reportId}`;
      } catch (error) {
        return `Report ${reportId}`;
      }
    },
    [reportTypes],
  );

  const handlePreview = useCallback((filePath) => {
    if (!filePath) {
      alert("No file available to preview");
      return;
    }
    const fileName = filePath.split(/[\\/]/).pop();
    const previewUrl = `${API_BASE_URL}member-report/preview/${encodeURIComponent(fileName)}`;
    window.open(previewUrl, "_blank");
  }, []);

  const handleDownload = useCallback((filePath) => {
    if (!filePath) {
      alert("No file available to download");
      return;
    }
    const fileName = filePath.split(/[\\/]/).pop();
    const downloadUrl = `${API_BASE_URL}member-report/download/${encodeURIComponent(fileName)}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const allDetails = getAllMemberDetails();

  // Filter by report type
  let filteredDetails =
    selectedReportType === "all"
      ? allDetails
      : allDetails.filter((detail) => Number(detail.Report_id) === Number(selectedReportType));

  // Filter by search term
  if (searchTerm) {
    filteredDetails = filteredDetails.filter((detail) => {
      try {
        const reportName = getReportName(detail.Report_id).toLowerCase();
        const doctor = detail.Doctor_and_Hospital_name?.toLowerCase() || "";
        const narration = detail.Naration?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();

        return (
          reportName.includes(searchLower) ||
          doctor.includes(searchLower) ||
          narration.includes(searchLower)
        );
      } catch (error) {
        return false;
      }
    });
  }

  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDetails = filteredDetails.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const availableReportTypes = useMemo(() => {
    const types = new Set();
    allDetails.forEach((detail) => {
      if (detail.Report_id) {
        types.add(detail.Report_id);
      }
    });

    return Array.from(types)
      .map((id) => ({
        id,
        name: getReportName(id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allDetails, getReportName]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  }, []);

  const formatTime = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-IN", {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "";
    }
  }, []);

  // Add a default member selection on load
  useEffect(() => {
    if (familyMembers.length > 0 && !selectedMember) {
      const loggedInMember = familyMembers.find(m => Number(m.Member_id) === Number(member_id));
      if (loggedInMember) {
        setSelectedMember(loggedInMember);
      } else {
        setSelectedMember(familyMembers[0]);
      }
    }
  }, [familyMembers, member_id, selectedMember]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-6 py-4">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="min-w-fit">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Welcome <span className="text-blue-600">{family_name}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Pulse Report Dashboard
                </p>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-2 py-1">
                {membersLoading ? (
                  <div className="flex items-center px-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  </div>
                ) : hasData(familyMembers) ? (
                  familyMembers.map((member) => (
                    <div
                      key={member.Member_id}
                      className="relative flex-shrink-0"
                    >
                      <MemberCard
                        member={member}
                        isSelected={
                          selectedMember?.Member_id === member.Member_id
                        }
                        onClick={handleMemberSelect}
                        allReports={allReports}
                        member_id={member_id}
                      />
                    </div>
                  ))
                ) : (
                  <div className="px-4 text-sm text-gray-500">
                    No family members found
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <NotificationBell
                  unreadCount={unreadCount}
                  remindersData={remindersData}
                  remindersLoading={remindersLoading}
                  updateReminderFlag={updateReminderFlag}
                  refetchReminders={refetchReminders}
                  navigate={navigate}
                  showNotifications={showNotifications}
                  setShowNotifications={setShowNotifications}
                />
              </div>

              <button
                onClick={() => navigate("/app/UpcomingAppointment")}
                className="flex items-center gap-2 px-5 py-2.5
                         bg-gradient-to-r from-blue-600 to-blue-500
                         text-white rounded-xl font-medium
                         shadow-md hover:shadow-lg
                         hover:scale-[1.03] transition-transform duration-200"
              >
                <Plus className="h-4 w-4" />
                New Appointment
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-10xl mx-auto px-4 sm:px-6 py-6">
        <SliderSection sliderImages={sliderImages} />
        
          {(detailedActivityLoading ||
              detailedActivityError ||
              hasData(detailedRecentActivity)) && (
              <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Recent Activity
                      </h3>
                      <p className="text-sm text-gray-500">
                        Latest medical activities and updates
                      </p>
                    </div>
                  </div>
                </div>

                {detailedActivityLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Loading recent activities...
                    </p>
                  </div>
                ) : detailedActivityError ? (
              
                  <div className="text-center py-12 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">
                      Failed to load activities
                    </p>
                    <p className="text-red-500 text-sm mt-1">
                      Please try again later
                    </p>
                  </div>
                ) : hasData(detailedRecentActivity) ? (
              
                  <div className="rounded-lg border border-gray-200">
                    
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Details
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                            Member
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                    </table>

                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white">
                          {detailedRecentActivity.map((activity, index) => {
                            const activityConfig =
                              activityIconMap[activity.activity_type] || {
                                icon: Activity,
                                color: "text-gray-600",
                                bgColor: "bg-gray-100",
                                label:
                                  activity.activity_type?.replace(/_/g, " ") ||
                                  "Activity",
                              };

                            const IconComponent = activityConfig.icon;

                            return (
                              <tr
                                key={activity.activity_id || index}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`p-2 rounded-lg ${activityConfig.bgColor}`}
                                    >
                                      <IconComponent
                                        className={`h-5 w-5 ${activityConfig.color}`}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {activityConfig.label}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {getActivityDescription(activity)}
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {getMemberNameFromActivity(activity)}
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                  {formatDate(activity.activity_date)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </section>
            )}


        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            onClick={() => navigate("/app/member-master")}
            className="bg-white p-6 rounded-2xl shadow border cursor-pointer
                      hover:shadow-lg hover:ring-2 hover:ring-pink-200
                      transition-all relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-2">
                  Total Family Members
                </p>

                <h3 className="text-3xl font-bold text-slate-800">
                  {familyMembers.length}
                </h3>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/app/MemberReport")}
            className="bg-white p-6 rounded-2xl shadow border cursor-pointer
                      hover:shadow-lg hover:ring-2 hover:ring-perpule-200
                      transition-all relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-2">
                  {selectedMember
                    ? `${selectedMember.Member_name}'s Reports`
                    : "Your Reports"}
                </p>

                <h3 className="text-3xl font-bold text-slate-800">
                  {selectedMember
                    ? allDetails.length
                    : Array.isArray(allReports)
                      ? allReports
                          .filter(
                            (report) =>
                              Number(report.Member_id) === Number(member_id),
                          )
                          .reduce(
                            (total, report) =>
                              total + (report.details?.length || 0),
                            0,
                          )
                      : 0}
                </h3>

                <p className="text-xs text-blue-600 mt-1">
                  {selectedMember ? "Selected member" : "Your personal records"}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <File className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </div>

          <div
            onClick={() => setShowNotifications(true)}
            className="bg-white p-6 rounded-2xl shadow border cursor-pointer
                      hover:shadow-lg hover:ring-2 hover:ring-amber-200
                      transition-all relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-2">Active Reminders</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {unreadCount}
                </h3>
                <p className="text-xs text-amber-600 mt-1">
                  Pending medications
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl relative">
                <Bell className="h-7 w-7 text-amber-600" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">
                      {unreadCount > 9 ? "!" : unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/app/reportMaster")}
            className="bg-white p-6 rounded-2xl shadow border cursor-pointer
                      hover:shadow-lg hover:ring-2 hover:ring-green-200
                      transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-2">
                  Total Report Types
                </p>

                <h3 className="text-3xl font-bold text-slate-800">
                  {reportCountLoading ? "Loading..." : reportCount}
                </h3>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <FileText className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </div>
        </section>

        {selectedMember && (
          <section className="bg-white rounded-2xl shadow-lg p-6 mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center mb-2">
                  <User className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-bold text-slate-800">
                    {selectedMember.Member_name}'s Medical Reports
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <span>📞 {selectedMember.Mobile_no}</span>
                  {selectedMember.blood_group && (
                    <span>🩸 Blood Group: {selectedMember.blood_group}</span>
                  )}
                  <span>📊 Total Records: {allDetails.length}</span>
                </div>
              </div>

              {hasData(allDetails) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-y text-sm sm:text-base"
                    />
                  </div>

                  {hasData(availableReportTypes) && (
                    <div className="relative">
                      <select
                        value={selectedReportType}
                        onChange={(e) => {
                          setSelectedReportType(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                      >
                        <option value="all">All Report Types</option>
                        {availableReportTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {reportsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading reports...</p>
              </div>
            ) : !hasData(allDetails) ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  No report details found for {selectedMember.Member_name}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  No medical reports available for this member
                </p>
              </div>
            ) : !hasData(filteredDetails) ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  No reports match your search criteria
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                          Report Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                          Report Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                          Doctor/Hospital
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                          Porpuse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                          File
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedDetails.map((detail, index) => (
                        <tr
                          key={detail.detail_id || index}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <File className="h-5 w-5 text-blue-500 mr-2" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {getReportName(detail.Report_id)}
                                </span>
                                <div className="text-xs text-gray-500">
                                  Added on:{" "}
                                  {formatDate(detail.parentReportDate)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-sm text-gray-900">
                                {formatDate(detail.report_date)}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">
                              {detail.Doctor_and_Hospital_name || "N/A"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 line-clamp-2">
                              {detail.Naration || "N/A"}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {detail.uploaded_file_report ? (
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-purple-500 mr-2" />
                                <div>
                                  <span className="text-sm font-medium text-gray-900 block">
                                    {detail.uploaded_file_report
                                      .split(/[\\/]/)
                                      .pop()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {detail.uploaded_file_report
                                      .split(".")
                                      .pop()
                                      ?.toUpperCase()}{" "}
                                    File
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No file
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              {detail.uploaded_file_report ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handlePreview(detail.uploaded_file_report)
                                    }
                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Preview"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDownload(
                                        detail.uploaded_file_report,
                                      )
                                    }
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 px-3 py-1">
                                  No file
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          onClick={() => setShowNotifications(true)}
          className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all relative"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[24px] h-6 px-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SimpleMedicalDashboard;