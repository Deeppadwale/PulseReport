import { useState, useEffect } from "react";
import TableUtility from "../common/TableUtility/TableUtility";
import Modal from "../common/Modal/Modal";
import CreateNewButton from "../common/Buttons/AddButton";
import {
  PencilSquareIcon,
  PhoneIcon,
  PlusIcon,
  MinusIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UserCircleIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  XCircleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PencilIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { Trash2, Loader2, Save, Eye, Shield, Users, Mail, MapPin, History } from "lucide-react";

import {
  useGetFamilyMastersQuery,
  useAddFamilyMasterMutation,
  useUpdateFamilyMasterMutation,
  useDeleteFamilyMasterMutation,
} from "../services/familyMasterApi";


function FamilyMasterMain() {
 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Family_Name: "",
    Family_Address: "",
    Email_Id: "",
    MobileNumbers: [""],
    User_Name: "",
    User_Password: "JKSAC9101",
    User_Type: "A",
    Created_by: "",
    Modified_by: "",
    Created_at: "",
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

  const { data = [], isLoading, isError } = useGetFamilyMastersQuery();
  const [addFamily, { isLoading: isAdding }] = useAddFamilyMasterMutation();
  const [updateFamily, { isLoading: isUpdating }] = useUpdateFamilyMasterMutation();
  const [deleteFamily, { isLoading: isDeleting }] = useDeleteFamilyMasterMutation();


  useEffect(() => {
    const getUserFromSessionStorage = () => {
      try {
        const userName = sessionStorage.getItem("user_name");
        console.log("Current user from sessionStorage:", userName);
        setCurrentUser(userName || "System");
        return userName || "System";
      } catch (error) {
        console.error("Error getting user from sessionStorage:", error);
        setCurrentUser("System");
        return "System";
      }
    };

    getUserFromSessionStorage();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const resetForm = () => {
    const currentUserName = currentUser || "System";
    
    setFormData({
      Family_Name: "",
      Family_Address: "",
      Email_Id: "",
      MobileNumbers: [""],
      User_Name: "",
      User_Password: "JKSAC9101",
      User_Type: "A",
      Created_by: currentUserName, 
      Modified_by: "", 
      Created_at: new Date().toISOString().split("T")[0], 
    });
    setEditId(null);
    setShowPassword(false);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleViewFamily = (family) => {
    setSelectedFamily(family);
    setIsViewModalOpen(true);
  };

  const handleEdit = (row) => {
    const currentUserName = currentUser || "System";
    
    setEditId(row.Family_id);

    setFormData({
      Family_Name: row.Family_Name || "",
      Family_Address: row.Family_Address || "",
      Email_Id: row.Email_Id || "",
      MobileNumbers: row.Mobile ? row.Mobile.split(",").filter(Boolean) : [""],
      User_Name: row.User_Name || "",
      User_Password: "JKSAC9101", 
      User_Type: row.User_Type || "A",
      Created_by: row.Created_by || currentUserName,
      Modified_by: currentUserName, 
      Created_at: row.Created_at ? 
        new Date(row.Created_at).toISOString().split("T")[0] : 
        new Date().toISOString().split("T")[0],
    });

    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteIdToConfirm(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteIdToConfirm) return;

    try {
      await deleteFamily(deleteIdToConfirm).unwrap();
      showNotification("Family deleted successfully!");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete family", "error");
    } finally {
      setShowDeleteConfirmModal(false);
      setDeleteIdToConfirm(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const handleMobileChange = (index, value) => {
    const updated = [...formData.MobileNumbers];
    updated[index] = value.replace(/\D/g, "").slice(0, 10);
    setFormData((p) => ({ ...p, MobileNumbers: updated }));
  };

  const addMobileField = () => {
    setFormData((p) => ({ ...p, MobileNumbers: [...p.MobileNumbers, ""] }));
  };

  const removeMobileField = (index) => {
    if (formData.MobileNumbers.length > 1) {
      setFormData((p) => ({
        ...p,
        MobileNumbers: p.MobileNumbers.filter((_, i) => i !== index),
      }));
    }
  };

  const isValidMobile = (mobile) => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const hasDuplicateMobiles = (mobiles) => {
    const uniqueMobiles = new Set(mobiles);
    return uniqueMobiles.size !== mobiles.length;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!formData.Family_Name.trim()) {
      showNotification("Family Name is required!", "error");
      return;
    }

    if (!formData.User_Name.trim()) {
      showNotification("Username is required!", "error");
      return;
    }

    if (!editId && !formData.User_Password.trim()) {
      showNotification("Password is required for new families!", "error");
      return;
    }


    const validMobiles = formData.MobileNumbers
      .map(m => m.trim())
      .filter(m => m !== "");

    if (validMobiles.length === 0) {
      showNotification("At least one mobile number is required!", "error");
      return;
    }


    const invalidMobiles = validMobiles.filter(m => !isValidMobile(m));
    if (invalidMobiles.length > 0) {
      showNotification(`Invalid mobile numbers: ${invalidMobiles.join(", ")}. Must be 10 digits starting with 6-9.`, "error");
      return;
    }

   
    if (hasDuplicateMobiles(validMobiles)) {
      showNotification("Duplicate mobile numbers found in the form!", "error");
      return;
    }

  
    const allExistingMobiles = data
      .filter(f => f.Family_id !== editId)
      .flatMap(f => (f.Mobile ? f.Mobile.split(",") : []))
      .map(m => m.trim());

    const duplicateNumbers = validMobiles.filter(m => allExistingMobiles.includes(m));
    if (duplicateNumbers.length > 0) {
      showNotification(`Mobile numbers already exist in other records: ${duplicateNumbers.join(", ")}`, "error");
      return;
    }

    const currentUserName = currentUser || "System";
    const currentDate = new Date().toISOString();

    const payload = {
      Family_Name: formData.Family_Name,
      Family_Address: formData.Family_Address,
      Email_Id: formData.Email_Id,
      Mobile: validMobiles.join(","),
      User_Name: formData.User_Name,
      User_Password: formData.User_Password || undefined,
      User_Type: formData.User_Type,
      Created_by: editId ? formData.Created_by : currentUserName,
      Modified_by: editId ? currentUserName : null,
      Created_at: editId ? formData.Created_at : currentDate,
      Modified_at: editId ? currentDate : null,
    };

    try {
      if (editId) {
        await updateFamily({ id: editId, ...payload }).unwrap();
        showNotification("Family updated successfully!");
      } else {
        await addFamily(payload).unwrap();
        showNotification("Family added successfully!");
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      const errorMessage = err?.data?.message || "Operation failed. Please try again.";
      showNotification(errorMessage, "error");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { 
      header: "SR.NO", 
      accessor: "Family_id",
      headerTextAlign: "left",
      cellTextAlign: "left",
      cell: (row) => (
        <div className="font-mono font-semibold text-blue-700">
          {row.Family_id}
        </div>
      )
    },
    { 
      header: "Family Name", 
      accessor: "Family_Name",
      headerTextAlign: "left",
      cellTextAlign: "left",
      cell: (row) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-gray-400" />
          <span className="font-medium text-gray-800">{row.Family_Name}</span>
        </div>
      )
    },
    { 
      header: "Mobile", 
      accessor: "Mobile",
      headerTextAlign: "center",
      cellTextAlign: "center",
      cell: (row) => (
        <div className="flex items-center">
          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-gray-700">{row.Mobile || "N/A"}</span>
        </div>
      )
    },
    { 
      header: "Email", 
      accessor: "Email_Id",
      headerTextAlign: "left",
      cellTextAlign: "left",
      cell: (row) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-gray-700 truncate max-w-[200px]">{row.Email_Id || "N/A"}</span>
        </div>
      )
    },

    {
      header: "User Type",
      accessor: "User_Type",
      cell: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.User_Type === 'A' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {row.User_Type === 'A' ? 'Admin' : 'User'}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: "action",
      isAction: true,
      actionRenderer: (row) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleViewFamily(row)}
            className="p-2.5 hover:bg-green-50 rounded-lg transition-all duration-200"
            title="View Details"
          >
            <Eye className="h-5 w-5 text-green-600" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Edit Family"
          >
            <PencilSquareIcon className="h-5 w-5 text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete(row.Family_id)}
            className="p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete Family"
          >
            <Trash2 className="h-5 w-5 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  /* ================= RENDER ================= */
  if (isLoading) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading families...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md text-center">
        <XCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Error loading data</h3>
        <p className="mb-4">Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="">
      {/* Notification */}
      {notification.show && (
        <div
  className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center p-4 rounded-md shadow-lg transition-all duration-300 ${
    notification.type === "success"
      ? "bg-green-50 text-green-800 border border-green-200"
      : "bg-red-50 text-red-800 border border-red-200"
  }`}
>
  {notification.type === "success" ? (
    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
  ) : (
    <XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
  )}
  <span className="font-medium">{notification.message}</span>
</div>

      )}

      {/* Current User Badge */}
      {currentUser && (
        <div className="fixed top-4 left-4 z-40">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md">
            <div className="flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Logged in as: {currentUser}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-full">
        <TableUtility
          title="Family Member"
          headerContent={
            <div className="flex justify-between items-center mb-1">

              <CreateNewButton 
                onClick={handleAddNew}
                label="Add New Family"
              />
                    <button
                onClick={() => navigate("/app/family-master-list")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Show All
              </button>
            </div>
          }
          columns={columns}
          data={Array.isArray(data) ? data : []}
          pageSize={10}
          loading={isLoading}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width={"1000px"}
        maxHeight="90vh"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
         {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-6 mb-4">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200 rounded-full opacity-20"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {editId ? (
                      <PencilSquareIcon className="w-6 h-6 text-blue-600" />
                    ) : (
                      <UserGroupIcon className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editId ? "Update Family Details" : "Add New Family"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {editId
                        ? "Update the family information below"
                        : "Fill in the family information below"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Family Name */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-1 text-gray-400" />
                Family Name <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  name="Family_Name"
                  value={formData.Family_Name}
                  onChange={handleInputChange}
                  placeholder="Enter family name"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Full family name</p>
                <span className="text-xs text-gray-400">{formData.Family_Name.length}/100</span>
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
                Email Address
              </label>
              <div className="relative">
                <input
                  name="Email_Id"
                  value={formData.Email_Id}
                  onChange={handleInputChange}
                  placeholder="family@example.com"
                  type="email"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Primary email for communication</p>
            </div>

            {/* Mobile Numbers - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <PhoneIcon className="w-4 h-4 mr-1 text-green-500" />
                Mobile Numbers <span className="text-red-500 ml-1">*</span>
                <span className="ml-auto text-xs text-gray-500">
                  {formData.MobileNumbers.filter(m => isValidMobile(m)).length} valid
                </span>
              </label>
              
              <div className="flex flex-wrap gap-3 mb-2">

                {formData.MobileNumbers.map((mobile, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="relative flex-1">
                      <input
                        value={mobile}
                        onChange={(e) => handleMobileChange(index, e.target.value)}
                        className={`w-50 border rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${

                          mobile && !isValidMobile(mobile)
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : mobile && isValidMobile(mobile)
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-blue-300"
                        }`}
                        placeholder="+91"
                        maxLength="10"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                        <PhoneIcon className={`w-5 h-5 mr-2 ${
                          mobile && !isValidMobile(mobile)
                            ? "text-red-400"
                            : mobile && isValidMobile(mobile)
                            ? "text-green-400"
                            : "text-gray-400"
                        }`} />
                        
                      </div>
                      {mobile && isValidMobile(mobile) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                            <span className="text-xs text-green-600">Valid</span>
                          </div>
                        </div>
                      )}
                      {mobile && !isValidMobile(mobile) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs text-red-600">Invalid</span>
                        </div>
                      )}
                    </div>
                    {formData.MobileNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMobileField(index)}
                        className="p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-105"
                        title="Remove mobile"
                      >
                        <MinusIcon className="h-5 w-5 text-red-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMobileField}
                className="flex items-center gap-2 px-4 py-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Add Another Mobile Number
              </button>
            </div>

            {/* Address - Full Width */}
            <div className="md:col-span-2 relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                Family Address
              </label>
              <div className="relative">
                <textarea
                  name="Family_Address"
                  value={formData.Family_Address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-none"
                />
                <div className="absolute left-3 top-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Complete residential address</p>
                <span className="text-xs text-gray-400">{formData.Family_Address.length}/255</span>
              </div>
            </div>

            {/* Username */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <UserCircleIcon className="w-4 h-4 mr-1 text-gray-400" />
                Member Name <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  name="User_Name"
                  value={formData.User_Name}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <UserCircleIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
             
            </div>

            {/* Password with Show/Hide */}
            {/* <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <LockClosedIcon className="w-4 h-4 mr-1 text-gray-400" />
                
                Password  <span className="text-red-500 ml-1">*</span>
               
              </label>
              <div className="relative">
                <input
                  name="User_Password"
                  value={formData.User_Password}
                  onChange={handleInputChange}
                  placeholder={editId ? "Leave blank to keep unchanged" : "Enter password"}
                  type={showPassword ? "text" : "password"}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                  required={!editId}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <LockClosedIcon className="w-5 h-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {editId ? "" : "Minimum 6 characters"}
                </p>
                {formData.User_Password.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {formData.User_Password.length} characters
                  </span>
                )}
              </div>
            </div> */}


            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-1 text-blue-500" />
                User Type
              </label>
              <div className="relative">
                <select
                  name="User_Type"
                  value={formData.User_Type}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 bg-white appearance-none"
                >
                  <option value="A">Admim</option>
                  <option value="M">MasterAdmin</option>
                  <option value="U"> User</option>
                </select>
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">User access level</p>
            </div>
          </div>

          {/* Form Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs">Valid mobile required</span>
                </div>
                <div className="flex items-center ml-4">
                  <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-xs">Required fields</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-400 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAdding || isUpdating}
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAdding || isUpdating}
                >
                  {isAdding || isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {editId ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editId ? "Update Family" : "Save Family"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Family Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Family Details"
        width={"800px"}
      >
        {selectedFamily && (
          <div className="space-y-6">
            {/* Family Info Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="h-8 w-8 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">{selectedFamily.Family_Name}</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      ID: {selectedFamily.Family_id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedFamily.User_Type === 'A' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedFamily.User_Type === 'A'
  ? 'Administrator'
  : selectedFamily.User_Type === 'M'
  ? 'Master Admin'
  : 'User'}

                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Mobile Numbers</p>
                    <div className="mt-1">
                      {selectedFamily.Mobile ? (
                        selectedFamily.Mobile.split(',').map((mobile, index) => (
                          <div key={index} className="flex items-center py-1">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900"> {mobile}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No mobile numbers</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="font-medium text-gray-900 truncate">{selectedFamily.Email_Id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-2 text-green-500" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <div className="flex items-center mt-1">
                      <UserCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="font-medium text-gray-900">{selectedFamily.User_Name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="mt-1">
                      <p className="text-gray-700">{selectedFamily.Family_Address || 'No address provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Information */}
            {/* <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-gray-500" />
                Audit Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <UserIcon className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-sm font-medium text-gray-700">Created By</p>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedFamily.Created_by || 'System'}</p>
                </div>
                
                {selectedFamily.Modified_by && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <PencilIcon className="h-4 w-4 text-blue-500 mr-2" />
                      <p className="text-sm font-medium text-gray-700">Last Modified By</p>
                    </div>
                    <p className="text-gray-900 font-medium">{selectedFamily.Modified_by}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CalendarDaysIcon className="h-4 w-4 text-purple-500 mr-2" />
                    <p className="text-sm font-medium text-gray-700">Created Date</p>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {selectedFamily.Created_at ? new Date(selectedFamily.Created_at).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div> */}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Confirm Deletion"
      >
        <div className="text-center p-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Family
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this family? This action cannot be undone.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              onClick={() => setShowDeleteConfirmModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </span>
              ) : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FamilyMasterMain;