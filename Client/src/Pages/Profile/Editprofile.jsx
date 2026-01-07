import React, { useState, useEffect } from "react";
import { X, Camera, CheckCircle, Loader2, User, MapPin, Phone, Droplets, Calendar, Edit2, Home } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const EditProfile = ({ open, onClose }) => {
  const member_id = sessionStorage.getItem("member_id");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const [memberData, setMemberData] = useState(null);

  const [form, setForm] = useState({
    Member_name: "",
    Member_address: "",
    Mobile_no: "",
    other_details: "",
    blood_group: "",
    date_of_birth: "",
    Modified_by: "",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const getUserNameFromStorage = () =>
    sessionStorage.getItem("User_Name") || "System";

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    if (!member_id || !open) return;

    const fetchMemberData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}members/${member_id}`);
        const data = await res.json();

        setMemberData(data);
        setForm({
          Member_name: data.Member_name || "",
          Member_address: data.Member_address || "",
          Mobile_no: data.Mobile_no || "",
          other_details: data.other_details || "",
          blood_group: data.blood_group || "",
          date_of_birth: data.date_of_birth?.split("T")[0] || "",
          Modified_by: getUserNameFromStorage(),
        });

        const imgRes = await fetch(`${API_BASE_URL}members/userimage?member_id=${member_id}`);
        if (imgRes.ok && imgRes.headers.get("content-type")?.includes("image")) {
          const blob = await imgRes.blob();
          setImagePreview(URL.createObjectURL(blob));
        }
      } catch {
        showNotification("Failed to load profile", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [member_id, open]);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value, Modified_by: getUserNameFromStorage() }));

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setImageError("Only JPG or PNG images are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must be less than 2MB");
      return;
    }

    setImageFile(file);
    setImageError(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (imageFile) fd.append("user_image", imageFile);

      const res = await fetch(`${API_BASE_URL}members/${member_id}`, {
        method: "PUT",
        body: fd,
      });

      if (!res.ok) throw new Error();
      showNotification("Profile updated successfully");
      setTimeout(onClose, 1200);
    } catch {
      showNotification("Update failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Notification Toast */}


      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[95vh] overflow-y-auto animate-scale-in">
          
          {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-white border-b rounded-t-2xl">
                <div className="flex items-center justify-between px-5 py-4">

                    {/* Left: Title */}
                    <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Edit2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                        Edit Profile
                        </h2>
                        <p className="text-xs text-gray-500">
                        Update your personal information
                        </p>
                    </div>
                    </div>

                    {/* Center: Profile Image */}
                    <div className="flex flex-col items-center gap-2">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100">
                        {imagePreview ? (
                            <img
                            src={imagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={e => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                            />
                        ) : null}

                        {/* Fallback Icon */}
                        <div className={`w-full h-full flex items-center justify-center ${imagePreview ? "hidden" : "flex"}`}>
                            <User className="w-10 h-10 text-gray-400" />
                        </div>
                        </div>

                        {/* Camera Overlay */}
                        <label className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition cursor-pointer">
                        <Camera className="w-4 h-4" />
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        </label>
                    </div>

                    {imageError && (
                        <p className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-md border border-red-200">
                        {imageError}
                        </p>
                    )}
                    </div>

                    {/* Right: Close Button */}
                    <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    aria-label="Close"
                    >
                    <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>

                </div>
                </div>


          {/* Content */}
          <div className="p-6 md:p-8">
            {isLoading && !memberData ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading profile data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
             {notification.show && (
                <div
                    className={`fixed bottom-6 left-1/2 
                    flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
                    animate-slide-in
                    ${
                        notification.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                    {notification.type === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                    ) : (
                    <X className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
                )}



                {/* Form Fields Grid */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information Column */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                          <User className="w-5 h-5 text-blue-600" />
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <Input 
                            label="Full Name" 
                            name="Member_name" 
                            value={form.Member_name} 
                            onChange={handleChange} 
                            required 
                            icon={<User className="w-4 h-4" />}
                            placeholder="Enter your full name"
                          />

                          <Input 
                            label="Mobile Number" 
                            value={form.Mobile_no} 
                            readOnly
                            icon={<Phone className="w-4 h-4" />}
                          />
                          
                          <Select 
                            label="Blood Group" 
                            name="blood_group" 
                            value={form.blood_group} 
                            onChange={handleChange} 
                            options={bloodGroups}
                            icon={<Droplets className="w-4 h-4" />}
                          />
                          
                          <Input 
                            type="date" 
                            label="Date of Birth" 
                            name="date_of_birth" 
                            value={form.date_of_birth} 
                            onChange={handleChange}
                            icon={<Calendar className="w-4 h-4" />}
                          />
                          
                          
                        </div>
                      </div>
                    </div>

                    {/* Address & Details Column */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                          <Home className="w-5 h-5 text-blue-600" />
                          Address & Details
                        </h3>
                        <div className="space-y-4">
                          <Textarea 
                            label="Address" 
                            name="Member_address" 
                            value={form.Member_address} 
                            onChange={handleChange}
                            icon={<MapPin className="w-4 h-4" />}
                            placeholder="Enter your complete address"
                          />
                          
                          <Textarea 
                            label="Other Details" 
                            name="other_details" 
                            value={form.other_details} 
                            onChange={handleChange}
                            placeholder="Any additional information"
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-8 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default EditProfile;

/* Reusable Components with Enhanced Styling */
const Input = ({ label, icon, ...props }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {props.required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          icon ? 'pl-10' : ''
        } ${props.readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
      />
    </div>
  </div>
);

const Textarea = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-3 text-gray-400">
          {icon}
        </div>
      )}
      <textarea
        {...props}
        className={`w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
          icon ? 'pl-10' : ''
        } hover:border-gray-400`}
      />
    </div>
  </div>
);

const Select = ({ label, options, icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        {...props}
        className={`w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white hover:border-gray-400 ${
          icon ? 'pl-10' : ''
        }`}
      >
        <option value="" className="text-gray-400">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option} className="text-gray-700">
            {option}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);