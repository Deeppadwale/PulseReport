import { useState, useEffect, useCallback } from "react";
import TableUtility from "../../common/TableUtility/TableUtility";
import Modal from "../../common/Modal/Modal";
import CreateNewButton from "../../common/Buttons/AddButton";
import { 
  PencilSquareIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  HomeIcon,
  PhoneIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  HeartIcon,
  UserIcon,
  CameraIcon
} from "@heroicons/react/24/outline";
import { Trash2, Eye, Download } from "lucide-react";
import {
  useGetMemberMastersQuery,
  useGetMaxMemberDocNoQuery,
  useAddMemberMasterMutation,
  useUpdateMemberMasterMutation,
  useDeleteMemberMasterMutation,
  useGetMemberUserImageQuery
} from "../../services/medicalAppoinmentApi";
import ViewMemberModal from "../Master/MemberMasterVIew";
import DEFAULT_USER_ICON from "../../assets/user.png";



function MemberMaster() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editId, setEditId] = useState(null);

  
 
  const [userData, setUserData] = useState({
    Family_id: "",
    User_Name: ""
  });

  const [formData, setFormData] = useState({
    doc_No: "",
    Member_name: "",
    Member_address: "",
    Mobile_no: "",
    other_details: "",
    Family_id: "",
    User_Type:"",
    User_Image: "",
    pan_no: "",
    adhar_card: "",
    insurance: "",
    blood_group: "",
    date_of_birth: "",
    Created_by: "",
    Modified_by: "",
    Created_at: new Date().toISOString().split("T")[0]
  });

  const [files, setFiles] = useState({
    user_image: null,
    pan_file: null,
    adhar_file: null,
    insurance_file: null,
  });

  const [filePreviews, setFilePreviews] = useState({
    user_image: null,
    pan: null,
    adhar: null,
    insurance: null,
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

  // Get family_id from sessionStorage
  const familyId = sessionStorage.getItem("family_id");

  // RTK Query hooks
  const {
    data: tableData = [],
    isLoading,
    isError,
    refetch,
  } = useGetMemberMastersQuery(familyId ? Number(familyId) : undefined);

  const { 
    data: maxDocNoData, 
    isLoading: isMaxDocLoading, 
    refetch: refetchDoc 
  } = useGetMaxMemberDocNoQuery();
  
  const [addMember, { isLoading: isAdding }] = useAddMemberMasterMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMasterMutation();
  const [deleteMember, { isLoading: isDeleting }] = useDeleteMemberMasterMutation();

  // Get user image when editing
const {
  data: userImageBlob,
  isError: isImageError
} = useGetMemberUserImageQuery(
  editId ? { member_id: editId } : null,
  { skip: !editId || !isModalOpen }
);


  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Initialize user data from sessionStorage
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const familyId = sessionStorage.getItem("family_id");
        const userName = sessionStorage.getItem("User_Name");
        
        const userData = {
          Family_id: familyId || "",
          User_Name: userName || "System"
        };

        setUserData(userData);
        
        if (familyId && !editId) {
          setFormData(prev => ({
            ...prev,
            Family_id: familyId,
            Created_by: userName || "System"
          }));
        }

        return userData;
      } catch (error) {
        console.error("Error getting user data from sessionStorage:", error);
        return {
          Family_id: "",
          User_Name: "System"
        };
      }
    };

    fetchUserData();
  }, [editId]);

  // Handle user image blob
useEffect(() => {
  // If image API failed → use frontend default image
  if (isImageError) {
    setFilePreviews(prev => ({
      ...prev,
      user_image: "/userlogo.png"
    }));
    return;
  }

  // If image exists → show blob
  if (userImageBlob && editId) {
    const url = URL.createObjectURL(userImageBlob);
    setFilePreviews(prev => ({ ...prev, user_image: url }));

    return () => URL.revokeObjectURL(url);
  }
}, [userImageBlob, isImageError, editId]);


  // Fetch max doc number when modal opens
  useEffect(() => {
    if (!editId && isModalOpen) {
      const fetchMaxDoc = async () => {
        try {
          await refetchDoc();
        } catch (error) {
          console.error("Error fetching max doc no:", error);
        }
      };
      fetchMaxDoc();
    }
  }, [isModalOpen, editId, refetchDoc]);

  // Set doc number when max doc is available
  useEffect(() => {
    if (!editId && !isMaxDocLoading && isModalOpen && maxDocNoData) {
      const nextDocNo = (Number(maxDocNoData?.maxDocNo) || 0) + 1;
      setFormData(prev => ({ 
        ...prev, 
        doc_No: nextDocNo.toString(),
        Family_id: userData.Family_id || "",
        Created_by: userData.User_Name || "System"
      }));
    }
  }, [maxDocNoData, isMaxDocLoading, editId, isModalOpen, userData]);

  // Notification handler
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // Handle Add New Member
  const handleAddNew = async () => {
    resetForm();
    setEditId(null);

    const familyId = sessionStorage.getItem("family_id");
    const userName = sessionStorage.getItem("User_Name");
    
    setFormData(prev => ({
      ...prev,
      Family_id: familyId || "",
      Created_by: userName || "System",
      Created_at: new Date().toISOString().split("T")[0],
    }));

    setIsModalOpen(true);
  };

  // Handle View Member

  // Download Document
  const downloadDocument = (filePath, documentType) => {
    if (!filePath) {
      showNotification(`No ${documentType} file available`, "error");
      return;
    }

    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop() || `${documentType}_document`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table columns
  const columns = [
    {
      header: "Sr.No",
      accessor: "doc_No",

      headerTextAlign: "left",  
      cellTextAlign: "left", 
      cellRenderer: (row) => (
        <div className="">
          {row.doc_No ?? "N/A"}
        </div>
      ),
    },
  {
    header: "Member Name",
    accessor: "Member_name",
    headerTextAlign: "center",
    cellTextAlign: "center",
    sortAlphabetical: true,
    // Uppercase display
    cellRenderer: (row) => (
      <div className="">
        {row.Member_name ? row.Member_name : "N/A"}
      </div>
    ),
  },
    {
      header: "Mobile No",
      accessor: "Mobile_no",
      headerTextAlign: "center",  
    cellTextAlign: "center", 
      cellRenderer: (row) => (
        <div className="text-gray-700">
          {row.Mobile_no ?? "N/A"}
        </div>
      ),
    },
    {
      header: "Blood Group",
      accessor: "blood_group",
      textAlign: "center", 
      cellRenderer: (row) => (
        <div className="text-gray-700">
          {row.blood_group ?? "N/A"}
        </div>
      ),
    },
    {
      header: "Date of Birth",
      accessor: "date_of_birth",
      cellRenderer: (row) => (
        <div className="text-gray-700">
          {row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString('en-IN') : "N/A"}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      isAction: true,
      className: "text-center",
      actionRenderer: (row) => (
        <div className="flex justify-center space-x-2">
    <button
    onClick={() => {
    setSelectedMember(row);
    setIsViewModalOpen(true);
  }}
  className="p-2.5 hover:bg-green-50 rounded-lg"
  title="View"
>
  <Eye className="h-5 w-5 text-green-600" />
</button>


          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            title="Edit"
            className="p-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <PencilSquareIcon className="h-5 w-5 text-blue-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.Member_id || row.id);
            }}
            title="Delete"
            className="p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <Trash2 className="h-5 w-5 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  // Handle file change
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("File size should be less than 5MB", "error");
      return;
    }

    // File type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      showNotification("Only JPEG, PNG, and PDF files are allowed", "error");
      return;
    }

    // Update files state
    setFiles(prev => ({ ...prev, [fileType]: file }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewKey = fileType === 'user_image' ? 'user_image' : fileType.replace('_file', '');
        setFilePreviews(prev => ({ 
          ...prev, 
          [previewKey]: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // For PDF files, show a PDF icon preview
      const previewKey = fileType === 'user_image' ? 'user_image' : fileType.replace('_file', '');
      setFilePreviews(prev => ({
        ...prev,
        [previewKey]: 'pdf'
      }));
    }

    // Clear the input value to allow re-uploading same file
    e.target.value = '';
  };

  // Remove file
  const removeFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
    
    const previewKey = fileType === 'user_image' ? 'user_image' : fileType.replace('_file', '');
    setFilePreviews(prev => ({ 
      ...prev, 
      [previewKey]: null 
    }));

    // If removing user image in edit mode, also clear the User_Image field
    if (fileType === 'user_image' && editId) {
      setFormData(prev => ({
        ...prev,
        User_Image: ''
      }));
    }
  };

const isMobileDuplicate = (mobile, currentEditId = null) => {
  return tableData.some(member =>
    String(member.Mobile_no) === String(mobile) &&
    (
      currentEditId
        ? String(member.Member_id) !== String(currentEditId)
        : true
    )
  );
};


const handleSubmit = async (e) => {
  e.preventDefault();

  // Required validations
  if (!formData.Member_name.trim()) {
    showNotification("Member Name is required!", "error");
    return;
  }

  if (!formData.Mobile_no.trim()) {
    showNotification("Mobile No is required!", "error");
    return;
  }

  // 🚨 DUPLICATE CHECK
if (isMobileDuplicate(formData.Mobile_no, editId)) {
  showNotification(
    "Mobile number already exists in the system",
    "error"
  );
  return;
}

  if (!formData.Member_address.trim()) {
    showNotification("Address is required!", "error");
    return;
  }

  try {
    const submitData = new FormData();

    Object.keys(formData).forEach(key => {
      if (formData[key]) submitData.append(key, formData[key]);
    });

    Object.keys(files).forEach(key => {
      if (files[key]) submitData.append(key, files[key]);
    });

    if (editId) {
      await updateMember({ id: editId, ...Object.fromEntries(submitData) }).unwrap();
      showNotification("Member updated successfully!");
    } else {
      await addMember(Object.fromEntries(submitData)).unwrap();
      showNotification("Member added successfully!");
    }

    resetForm();
    setIsModalOpen(false);
    refetch();

  } catch (error) {
    const msg =
      error?.data?.message ||
      "Mobile number already exists!";
    showNotification(msg, "error");
  }
};

  // Handle Edit
  const handleEdit = async (row) => {
    if (!row) return;

    const currentUserName = sessionStorage.getItem("User_Name") || "System";
    const memberId = row.Member_id || row.id;

    // Set edit ID first
    setEditId(memberId);

    // Set form data
    setFormData({
      doc_No: row.doc_No || "",
      Member_name: row.Member_name || "",
      Member_address: row.Member_address || "",
      Mobile_no: row.Mobile_no || "",
      other_details: row.other_details || "",
      Family_id: row.Family_id || "",
      User_Type:row.User_Type||"",
      User_Image: row.User_Image || "",
      pan_no: row.pan_no || "",
      adhar_card: row.adhar_card || "",
      insurance: row.insurance || "",
      blood_group: row.blood_group || "",
      date_of_birth: row.date_of_birth
        ? new Date(row.date_of_birth).toISOString().split("T")[0]
        : "",
      Created_by: row.Created_by || "",
      Modified_by: currentUserName,
      Created_at: row.Created_at
        ? new Date(row.Created_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });

    // Set file previews from existing data
    const newFilePreviews = {
      user_image: null,
      pan: null,
      adhar: null,
      insurance: null,
    };

    // If there's a User_Image URL from API, use it
    if (row.User_Image) {
      newFilePreviews.user_image = row.User_Image;
    }

    // Set other document previews if they exist
    if (row.pan_no) newFilePreviews.pan = row.pan_no;
    if (row.adhar_card) newFilePreviews.adhar = row.adhar_card;
    if (row.insurance) newFilePreviews.insurance = row.insurance;

    setFilePreviews(newFilePreviews);

    // Clear any existing files
    setFiles({
      user_image: null,
      pan_file: null,
      adhar_file: null,
      insurance_file: null,
    });

    // Open modal
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (!id) {
      showNotification("Invalid member ID", "error");
      return;
    }
    setDeleteIdToConfirm(id);
    setShowDeleteConfirmModal(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteIdToConfirm) return;

    try {
      await deleteMember(deleteIdToConfirm).unwrap();
      showNotification("Member deleted successfully!");
      await refetch();
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMessage = error?.data?.detail ||
        error?.data?.message ||
        "Failed to delete member. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setShowDeleteConfirmModal(false);
      setDeleteIdToConfirm(null);
    }
  };

  // Reset form
  const resetForm = () => {
    const familyId = sessionStorage.getItem("family_id");
    const userName = sessionStorage.getItem("User_Name");
    
    setFormData({
      doc_No: "",
      Member_name: "",
      Member_address: "",
      Mobile_no: "",
      other_details: "",
      Family_id: familyId || "",
      User_Type:"",
      User_Image: "",
      pan_no: "",
      adhar_card: "",
      insurance: "",
      blood_group: "",
      date_of_birth: "",
      Created_by: userName || "System",
      Modified_by: "",
      Created_at: new Date().toISOString().split("T")[0]
    });
    
    setFiles({
      user_image: null,
      pan_file: null,
      adhar_file: null,
      insurance_file: null,
    });
    
    setFilePreviews({
      user_image: null,
      pan: null,
      adhar: null,
      insurance: null,
    });
    
    setEditId(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    resetForm();
    setIsModalOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md text-center">
          <XCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Error loading members</h3>
          <p className="mb-4">Please try again later.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

      {/* Main Table */}
      <div className="max-w-full">
        <TableUtility
          title="Member Master"
          headerContent={
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-4">
                <CreateNewButton 
                  onClick={handleAddNew}
                  disabled={isMaxDocLoading}
                  label={isMaxDocLoading ? "Loading..." : "Add New Family Member"}
                />
              </div>
            </div>
          }
          columns={columns}
          data={Array.isArray(tableData) ? tableData : []}
          pageSize={10}
          loading={isLoading}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editId ? "" : ""}
        width={"1000px"}
        maxHeight="90vh"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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
         <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p- sm:p-5 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6">
  <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-200 rounded-full opacity-20"></div>
  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"></div>

  <div className="relative z-10">
    {/* HEADER */}
    <div className="flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {editId ? (
            <PencilSquareIcon className="w-6 h-6 text-blue-600" />
          ) : (
            <UserIcon className="w-6 h-6 text-green-600" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {editId ? "Update Member Details" : "Add New Family Member"}
          </h2>
          <p className="text-sm text-gray-600">
            {editId
              ? "Update the member information below"
              : "Fill in the member information below"}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — USER IMAGE */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          <img
            src={filePreviews.user_image || DEFAULT_USER_ICON}
            alt="Profile Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_USER_ICON;
            }}
          />
        </div>

        {/* Upload Button */}
        <label
          htmlFor="user_image"
          className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
        >
          <CameraIcon className="w-5 h-5" />
          <input
            type="file"
            id="user_image"
            onChange={(e) => handleFileChange(e, "user_image")}
            className="hidden"
            accept=".jpg,.jpeg,.png"
          />
        </label>

        {/* Remove Button */}
        {filePreviews.user_image && (
          <button
            type="button"
            onClick={() => removeFile("user_image")}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
          >
            <XCircleIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </div>
</div>
     {/* <div className="w-20">
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center justify-end">
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded mr-2">
                      Auto
                    </span>
                    Document No
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="doc_No"
                      value={formData.doc_No}
                      readOnly
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 pl-9 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div> */}


          {/* Profile Image Upload */}
          <div className="flex justify-center mb-6">
          </div>
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Member Name */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <UserCircleIcon className="w-4 h-4 mr-1 text-gray-400" />
                Family Member Names <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="Member_name"
                  value={formData.Member_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                  maxLength={100}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <UserCircleIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Full name of the member</p>
                <span className="text-xs text-gray-400">{formData.Member_name.length}/100</span>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                Mobile Number <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <PhoneIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-400">+91</span>
                </div>
                <input
                  type="tel"
                  name="Mobile_no"
                  value={formData.Mobile_no}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="9876543210"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">10-digit Indian mobile number</p>
                {formData.Mobile_no.length === 10 && (
                  <span className="text-xs text-green-600 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Valid format
                  </span>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-1 text-gray-400" />
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Member's date of birth</p>
            </div>

            {/* Blood Group */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <HeartIcon className="w-4 h-4 mr-1 text-gray-400" />
                Blood Group
              </label>
              <div className="relative">
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <HeartIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Select blood group type</p>
            </div>

            {/* Address */}
            <div className="md:col-span-2 lg:col-span-2 relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <HomeIcon className="w-4 h-4 mr-1 text-gray-400" />
                Address <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  name="Member_address"
                  value={formData.Member_address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter complete address"
                  rows={2}
                  maxLength={255}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-none"
                />
                <div className="absolute left-3 top-3">
                  <HomeIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Complete residential address</p>
                <span className="text-xs text-gray-400">{formData.Member_address.length}/255</span>
              </div>
            </div>
            <div className="md:col-span-1 lg:col-span-1 relative group">
  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
    <UserIcon className="w-4 h-4 mr-1 text-gray-400" />
    User Type <span className="text-red-500 ml-1">*</span>
  </label>

  <div className="relative">
    <select
      name="User_Type"
      value={formData.User_Type}
      onChange={handleInputChange}
      required
      className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
    >
      <option value="">Select User Type</option>
      <option value="A">Admin</option>
      <option value="U">User</option>
    </select>

    <div className="absolute left-3 top-3">
      <UserIcon className="w-5 h-5 text-gray-400" />
    </div>
  </div>

  <p className="text-xs text-gray-500 mt-2">
    Choose the role for this member
  </p>
</div>


            {/* Document Uploads */}
            <div className="md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Document Uploads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PAN Card */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <IdentificationIcon className="w-5 h-5 mr-2 text-blue-500" />
                      PAN Card
                    </label>
                    {filePreviews.pan && (
                      <button
                        type="button"
                        onClick={() => removeFile('pan_file')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="pan_file"
                    onChange={(e) => handleFileChange(e, 'pan_file')}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="pan_file" className="cursor-pointer block">
                    {filePreviews.pan ? (
                      <div className="flex items-center space-x-3">
                        {typeof filePreviews.pan === 'string' && filePreviews.pan.startsWith('http') ? (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                          </div>
                        ) : filePreviews.pan === 'pdf' ? (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                          </div>
                        ) : (
                          <img 
                            src={filePreviews.pan} 
                            alt="PAN Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <span className="text-sm text-gray-600 truncate">
                          {files.pan_file?.name || 'Uploaded file'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="block text-sm text-gray-500">Click to upload PAN</span>
                        <span className="block text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Aadhar Card */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <IdentificationIcon className="w-5 h-5 mr-2 text-green-500" />
                      Aadhar Card
                    </label>
                    {filePreviews.adhar && (
                      <button
                        type="button"
                        onClick={() => removeFile('adhar_file')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="adhar_file"
                    onChange={(e) => handleFileChange(e, 'adhar_file')}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="adhar_file" className="cursor-pointer block">
                    {filePreviews.adhar ? (
                      <div className="flex items-center space-x-3">
                        {typeof filePreviews.adhar === 'string' && filePreviews.adhar.startsWith('http') ? (
                          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-green-500" />
                          </div>
                        ) : filePreviews.adhar === 'pdf' ? (
                          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-green-500" />
                          </div>
                        ) : (
                          <img 
                            src={filePreviews.adhar} 
                            alt="Aadhar Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <span className="text-sm text-gray-600 truncate">
                          {files.adhar_file?.name || 'Uploaded file'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-300 transition-colors">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <IdentificationIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="block text-sm text-gray-500">Click to upload Aadhar</span>
                        <span className="block text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Insurance */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <ShieldCheckIcon className="w-5 h-5 mr-2 text-purple-500" />
                      Insurance
                    </label>
                    {filePreviews.insurance && (
                      <button
                        type="button"
                        onClick={() => removeFile('insurance_file')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="insurance_file"
                    onChange={(e) => handleFileChange(e, 'insurance_file')}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="insurance_file" className="cursor-pointer block">
                    {filePreviews.insurance ? (
                      <div className="flex items-center space-x-3">
                        {typeof filePreviews.insurance === 'string' && filePreviews.insurance.startsWith('http') ? (
                          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-purple-500" />
                          </div>
                        ) : filePreviews.insurance === 'pdf' ? (
                          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-8 h-8 text-purple-500" />
                          </div>
                        ) : (
                          <img 
                            src={filePreviews.insurance} 
                            alt="Insurance Preview" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <span className="text-sm text-gray-600 truncate">
                          {files.insurance_file?.name || 'Uploaded file'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-300 transition-colors">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <ShieldCheckIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="block text-sm text-gray-500">Click to upload Insurance</span>
                        <span className="block text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2 lg:col-span-3 relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <div className="relative">
                <textarea
                  name="other_details"
                  value={formData.other_details}
                  onChange={handleInputChange}
                  placeholder="Any additional notes, medical history, or special requirements..."
                  rows={3}
                  maxLength={500}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-none"
                />
                <div className="absolute left-3 top-3">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Optional information for reference</p>
                <span className="text-xs text-gray-400">{formData.other_details.length}/500</span>
              </div>
            </div>
          </div>





          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                {/* Optional: Add any informational text here */}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAdding || isUpdating}
                >
                  {isAdding || isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {editId ? "Updating Member..." : "Creating Member..."}
                    </>
                  ) : (
                    <>
                      {editId ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          Update Member
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-5 h-5 mr-2" />
                          Save Member
                        </>
                      )}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-400 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAdding || isUpdating}
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>


          {isViewModalOpen && selectedMember && (
            <ViewMemberModal
              isOpen={isViewModalOpen}
              onClose={() => setIsViewModalOpen(false)}
              member={selectedMember}
            />
          )}



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
            Delete Member
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this member? This action cannot be undone.
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

export default MemberMaster;