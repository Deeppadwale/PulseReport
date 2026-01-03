import { useState, useEffect, useRef, useCallback } from "react";
import TableUtility from "../common/TableUtility/TableUtility";
import Modal from "../common/Modal/Modal";
import CreateNewButton from "../common/Buttons/AddButton";
import {
  PencilSquareIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Trash2, Save, Plus, X, Eye, Download } from "lucide-react";

import {
  useGetAppointmentsByFamilyQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} from "../services/upcomingAppointmentApi";

import { useGetMemberMastersQuery } from "../services/medicalAppoinmentApi";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

function UpcomingAppointment() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const detailRefs = useRef({});

  const [formData, setFormData] = useState({
    Appointment_date: "",
    Member_id: "",
    Family_id: "",
    Doctor_name: "",
    Hospital_name: "",
    Created_by: "",
    Modified_by: "",
    details: [],
    prescription_file: null,
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);
  const [deletedDetails, setDeletedDetails] = useState([]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const MAX_FILE_SIZE_MB = 5; // For display

  const familyId = sessionStorage.getItem("family_id");
  const {
    data: tableData = [],
    isLoading: isTableLoading,
    isError,
    refetch,
  } = useGetAppointmentsByFamilyQuery(familyId);

  const { data: memberData = [], isLoading: isMemberLoading } =
    useGetMemberMastersQuery(familyId);
  const [addAppointment, { isLoading: isAdding }] =
    useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();
  const [deleteAppointment, { isLoading: isDeleting }] =
    useDeleteAppointmentMutation();
  const isEditMode = Boolean(editId);
  const isSaving = isAdding || isUpdating;

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, show: false })),
      3000,
    );
  }, []);

  const getUserNameFromStorage = () => {
    try {
      return sessionStorage.getItem("user_name") || "System";
    } catch {
      return "System";
    }
  };

  const getFileNameFromPath = (filePath) => {
    if (!filePath) return "";
    const pathParts = filePath.split(/[\\/]/);
    return pathParts.pop() || "";
  };

  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop().toUpperCase() : "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Member_id") {
      const member = memberData.find((m) => m.Member_id === parseInt(value));
      if (member) {
        setSelectedFamilyId(member.Family_id || "");
        setSelectedMemberName(`${member.Member_name} - ${member.Mobile_no}`);
        setFormData((prev) => ({
          ...prev,
          Member_id: value,
          Family_id: member.Family_id || "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      showNotification(
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller file.`,
        "error",
      );
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({ ...prev, prescription_file: file }));
    showNotification(
      `File "${file.name}" selected (${formatFileSize(file.size)})`,
      "success",
    );
  };

  const handlePreview = (fileName) => {
    if (!fileName) {
      showNotification("No file to preview", "error");
      return;
    }

    try {
      const previewUrl = `${API_BASE_URL}upcoming-appointment/preview/${encodeURIComponent(fileName)}`;
      window.open(previewUrl, "_blank");
      showNotification("Preview opened successfully!");
    } catch (error) {
      console.error("Failed to preview file:", error);
      showNotification("Failed to preview file. Please try again.", "error");
    }
  };

  const handleDownload = (fileName) => {
    if (!fileName) {
      showNotification("No file to download", "error");
      return;
    }

    try {
      const downloadUrl = `${API_BASE_URL}upcoming-appointment/download/${encodeURIComponent(fileName)}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      showNotification("Failed to download file. Please try again.", "error");
    }
  };

  const addDetailRow = () => {
    const newDetail = {
      Start_date: new Date().toISOString().split("T")[0],
      End_date: new Date().toISOString().split("T")[0],
      Morning: "N",
      AfterNoon: "N",
      Evening: "N",
      Medicine_name: "",
      rowaction: "add",
    };

    const newExpandedRows = {};
    Object.keys(expandedRows).forEach((key) => {
      const keyNum = parseInt(key);
      newExpandedRows[keyNum + 1] = expandedRows[key];
    });

    newExpandedRows[0] = true;
    setExpandedRows(newExpandedRows);

    setFormData((prev) => ({
      ...prev,
      details: [newDetail, ...prev.details],
    }));
  };

  const updateDetailRow = (index, field, value) => {
    const updated = [...formData.details];
    updated[index][field] = value;

    if (editId && updated[index].rowaction !== "add" && updated[index].rowaction !== "delete") {
      updated[index].rowaction = "update";
    }

    setFormData((prev) => ({ ...prev, details: updated }));
  };

  const deleteDetailRow = (index) => {
    const updated = [...formData.details];
    const detailToDelete = updated[index];

    if (editId) {
      if (detailToDelete.upcommingAppointmentDetail_id) {
        // Mark existing record for deletion
        updated[index].rowaction = "delete";
        setDeletedDetails((prev) => [
          ...prev,
          detailToDelete.upcommingAppointmentDetail_id,
        ]);
      } else if (detailToDelete.rowaction === "add") {
        // Remove newly added record that hasn't been saved yet
        updated.splice(index, 1);

        // Update expanded rows indices
        const newExpandedRows = {};
        Object.keys(expandedRows).forEach((key) => {
          const keyNum = parseInt(key);
          if (keyNum > index) {
            newExpandedRows[keyNum - 1] = expandedRows[key];
          } else if (keyNum < index) {
            newExpandedRows[keyNum] = expandedRows[key];
          }
        });
        setExpandedRows(newExpandedRows);
      }
      // Keep the record in the array but marked as "delete"
      setFormData((prev) => ({ ...prev, details: updated }));
    } else {
      // For new appointment, just remove the detail
      updated.splice(index, 1);

      // Update expanded rows indices
      const newExpandedRows = {};
      Object.keys(expandedRows).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          newExpandedRows[keyNum - 1] = expandedRows[key];
        } else if (keyNum < index) {
          newExpandedRows[keyNum] = expandedRows[key];
        }
      });
      setExpandedRows(newExpandedRows);
      setFormData((prev) => ({ ...prev, details: updated }));
    }
  };

  const handleRestoreDetail = (detailId) => {
    const newDetails = [...formData.details];
    const detailIndex = newDetails.findIndex(
      (d) => d.upcommingAppointmentDetail_id === detailId,
    );
    if (detailIndex !== -1) {
      newDetails[detailIndex].rowaction = "update";
      setFormData((prev) => ({ ...prev, details: newDetails }));
      setDeletedDetails((prev) => prev.filter((id) => id !== detailId));
    }
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < formData.details.length) {
        setExpandedRows((prev) => ({ ...prev, [nextIndex]: true }));
        setTimeout(() => {
          if (detailRefs.current[nextIndex]) {
            detailRefs.current[nextIndex].scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 100);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        setExpandedRows((prev) => ({ ...prev, [prevIndex]: true }));
        setTimeout(() => {
          if (detailRefs.current[prevIndex]) {
            detailRefs.current[prevIndex].scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 100);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleRowExpansion(index);
    }
  };

  const getActiveDetails = () => {
    return formData.details.filter((detail) => detail.rowaction !== "delete");
  };

  const handleAddNew = () => {
    const currentFamilyId = sessionStorage.getItem("family_id") || "";
    setFormData({
      Appointment_date: new Date().toISOString().split("T")[0],
      Member_id: "",
      Family_id: currentFamilyId,
      Doctor_name: "",
      Hospital_name: "",
      Created_by: getUserNameFromStorage(),
      Modified_by: "",
      details: [],
      prescription_file: null,
    });
    setSelectedFamilyId(currentFamilyId);
    setSelectedMemberName("");
    setEditId(null);
    setExpandedRows({});
    setDeletedDetails([]);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    const member = memberData.find((m) => m.Member_id === row.Member_id);
    if (member) {
      setSelectedMemberName(`${member.Member_name} - ${member.Mobile_no}`);
    }

    const formattedDetails = (row.details || []).map((d) => ({
      ...d,
      upcommingAppointmentDetail_id: d.upcommingAppointmentDetail_id,
      Start_date: d.Start_date
        ? new Date(d.Start_date).toISOString().split("T")[0]
        : "",
      End_date: d.End_date
        ? new Date(d.End_date).toISOString().split("T")[0]
        : "",
      Morning: d.Morning || "N",
      AfterNoon: d.AfterNoon || "N",
      Evening: d.Evening || "N",
      Medicine_name: d.Medicine_name || "",
      rowaction: "update",
    }));

    setFormData({
      Appointment_date: row.Appointment_date
        ? new Date(row.Appointment_date).toISOString().split("T")[0]
        : "",
      Member_id: row.Member_id,
      Family_id: row.Family_id,
      Doctor_name: row.Doctor_name || "",
      Hospital_name: row.Hospital_name || "",
      Created_by: row.Created_by || "", // Keep original creator
      Modified_by: getUserNameFromStorage(), // Set current user as modifier
      details: formattedDetails,
      prescription_file: null,
    });
    setEditId(row.upcommingAppointment_id);
    setSelectedFamilyId(row.Family_id);
    setExpandedRows({});
    setDeletedDetails([]);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteIdToConfirm(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAppointment(deleteIdToConfirm).unwrap();
      showNotification("Appointment deleted successfully!");
      refetch();
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      showNotification("Failed to delete appointment!", "error");
    } finally {
      setShowDeleteConfirmModal(false);
      setDeleteIdToConfirm(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const activeDetails = getActiveDetails();
    if (activeDetails.length === 0) {
      showNotification("Please add at least one medicine detail", "error");
      return;
    }

    const invalidDetails = activeDetails.filter(detail => {
      return !detail.Medicine_name.trim() || !detail.Start_date || !detail.End_date;
    });
    
    if (invalidDetails.length > 0) {
      showNotification("Please fill all required fields in medicine details", "error");

      const firstInvalidIndex = formData.details.findIndex(detail => 
        !detail.Medicine_name.trim() || !detail.Start_date || !detail.End_date
      );
      if (firstInvalidIndex !== -1) {
        setExpandedRows(prev => ({ ...prev, [firstInvalidIndex]: true }));
      }
      return;
    }

    if (
      formData.prescription_file &&
      formData.prescription_file.size > MAX_FILE_SIZE
    ) {
      showNotification(
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller file.`,
        "error",
      );
      return;
    }

    try {
      const payload = {
        Appointment_date: formData.Appointment_date,
        Member_id: parseInt(formData.Member_id),
        Family_id: parseInt(formData.Family_id),
        Doctor_name: formData.Doctor_name,
        Hospital_name: formData.Hospital_name,
        Created_by: formData.Created_by,
        Modified_by: formData.Modified_by || null,
        details: formData.details.map((detail) => ({
          ...detail,
          Start_date: detail.Start_date,
          End_date: detail.End_date,
          Morning: detail.Morning || "N",
          AfterNoon: detail.AfterNoon || "N",
          Evening: detail.Evening || "N",
          Medicine_name: detail.Medicine_name,
          rowaction: detail.rowaction || (editId ? "update" : "add"),
          ...(detail.upcommingAppointmentDetail_id && {
            upcommingAppointmentDetail_id: detail.upcommingAppointmentDetail_id,
          }),
        })),
      };

      if (editId) {
        await updateAppointment({
          appointmentId: editId,
          payload: payload,
          prescriptionFile: formData.prescription_file,
        }).unwrap();
        showNotification("Appointment updated successfully!");
      } else {
        await addAppointment({
          payload: payload,
          prescriptionFile: formData.prescription_file,
        }).unwrap();
        showNotification("Appointment added successfully!");
      }

      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Submit error:", err);
      showNotification(
        err.data?.detail || "Failed to save appointment",
        "error",
      );
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({
      Appointment_date: "",
      Member_id: "",
      Family_id: "",
      Doctor_name: "",
      Hospital_name: "",
      Created_by: "",
      Modified_by: "",
      details: [],
      prescription_file: null,
    });
    setSelectedFamilyId("");
    setSelectedMemberName("");
    setEditId(null);
    setExpandedRows({});
    setDeletedDetails([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getMemberDisplayName = (memberId) => {
    if (!memberData || memberData.length === 0) return memberId;
    const member = memberData.find((m) => m.Member_id === memberId);
    return member ? `${member.Member_name} - ${member.Mobile_no}` : memberId;
  };

  const getPrescriptionFileName = (appointment) => {
    if (appointment.uploaded_file_prescription) {
      return getFileNameFromPath(appointment.uploaded_file_prescription);
    }
    return null;
  };

  useEffect(() => {
    if (!isModalOpen) {
      setExpandedRows({});
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (formData.Member_id && memberData.length > 0) {
      const member = memberData.find(
        (m) => m.Member_id === parseInt(formData.Member_id),
      );
      setSelectedMemberName(
        member ? `${member.Member_name} - ${member.Mobile_no}` : "",
      );
    } else {
      setSelectedMemberName("");
    }
  }, [formData.Member_id, memberData]);

  const columns = [
    {
      header: "SR.No",
      accessor: "doc_No",
      headerTextAlign: "left",
      cellTextAlign: "left",
    },
    {
      header: "Doctor",
      accessor: "Doctor_name",
      headerTextAlign: "left",
      cellTextAlign: "left",
    },
    {
      header: "Member Name",
      accessor: "Member_name",
      headerTextAlign: "left",
      cellTextAlign: "left",
    },
    {
      header: "Hospital",
      accessor: "Hospital_name",
      headerTextAlign: "left",
      cellTextAlign: "left",
    },
    {
      header: "Date",
      accessor: "Appointment_date",
      headerTextAlign: "center",
      cellTextAlign: "center",
      cell: (row) => formatDate(row.Appointment_date),
    },
    {
      header: "Actions",
      accessor: "actions",
      isAction: true,
      className: "text-center",
      actionRenderer: (row) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <PencilSquareIcon className="h-5 w-5 text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete(row.upcommingAppointment_id)}
            className="p-1 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="h-5 w-5 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  if (isTableLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error Loading Appointments
          </h3>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const activeDetails = getActiveDetails();

  return (
    <div className="">
      {notification.show && (
        <div
          className={`
            fixed 
            bottom-6 
            left-1/2 
            transform -translate-x-1/2 
            z-50 
            p-4 
            rounded 
            shadow-lg 
            border
            transition-all duration-300
            ${
              notification.type === "success"
                ? "bg-green-100 border-green-400 text-green-800"
                : "bg-red-100 border-red-400 text-red-800"
            }
          `}
        >
          {notification.message}
        </div>
      )}

      <TableUtility
        title="Upcoming Appointments"
        headerContent={
          <CreateNewButton onClick={handleAddNew} label="Add New Appointment" />
        }
        columns={columns}
        data={tableData || []}
        pageSize={10}
        loading={isTableLoading || isMemberLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        width="1200px"
        maxHeight="90vh"
      >
        <h2 className="text-xl font-bold mb-4">
          {editId ? "Edit Appointment" : "Add New Appointment"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="grid-cols-2"> 
              <label className="block text-sm font-medium mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                name="Appointment_date"
                value={formData.Appointment_date}
                onChange={handleInputChange}
                required
               className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Member *</label>
              <div className="space-y-2">
                <select
                  name="Member_id"
                  value={formData.Member_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                  disabled={isMemberLoading || !!editId}
                >
                  <option value="">Select Member</option>
                  {memberData.map((member) => (
                    <option key={member.Member_id} value={member.Member_id}>
                      {member.Member_name} - {member.Mobile_no}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Doctor Name *
              </label>
              <input
                type="text"
                name="Doctor_name"
                value={formData.Doctor_name}
                onChange={handleInputChange}
                required
                placeholder="Doctor Name"
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Hospital Name
              </label>
              <input
                type="text"
                name="Hospital_name"
                value={formData.Hospital_name}
                onChange={handleInputChange}
                placeholder="Hospital Name"
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center justify-between">
                  <span>Prescription File</span>
                  <span className="text-xs text-gray-500 font-normal">
                    Max {MAX_FILE_SIZE_MB}MB
                  </span>
                </span>
              </label>

              <div className="relative  ">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              {editId &&
                tableData.length > 0 &&
                (() => {
                  const currentAppointment = tableData.find(
                    (a) => a.upcommingAppointment_id === editId,
                  );
                  const currentFileName =
                    currentAppointment?.uploaded_file_prescription
                      ? getFileNameFromPath(
                          currentAppointment.uploaded_file_prescription,
                        )
                      : null;

                  if (currentFileName) {
                    return (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded border">
                              <DocumentArrowDownIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Current File: {currentFileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getFileExtension(currentFileName)} File
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handlePreview(currentFileName)}
                              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(currentFileName)}
                              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Selected file preview */}
              {formData.prescription_file && (
                <div
                  className={`mt-2 p-3 rounded-lg border ${
                    formData.prescription_file.size > MAX_FILE_SIZE
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <DocumentArrowDownIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            formData.prescription_file.size > MAX_FILE_SIZE
                              ? "text-red-700"
                              : "text-green-700"
                          }`}
                        >
                          {formData.prescription_file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(formData.prescription_file.size)}
                          {formData.prescription_file.size > MAX_FILE_SIZE && (
                            <span className="ml-2 font-semibold text-red-600">
                              Exceeds {MAX_FILE_SIZE_MB}MB limit!
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {formData.prescription_file.size > MAX_FILE_SIZE && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            prescription_file: null,
                          }))
                        }
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border border-gray-300 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={addDetailRow}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Medicine
                </button>
                
                {/* Validation indicator */}
                {activeDetails.length === 0 && (
                  <span className="text-red-500 text-sm font-medium flex items-center">
                    <span className="mr-1">⚠</span> At least one medicine is required
                  </span>
                )}
              </div>
            </div>

            {/* Deleted Items Notice */}
            {deletedDetails.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Trash2 className="h-4 w-4 text-red-500 mr-2" />
                    <div>
                      <p className="font-medium text-red-700 text-sm">
                        {deletedDetails.length} detail
                        {deletedDetails.length > 1 ? "s" : ""} marked for
                        deletion
                      </p>
                      <p className="text-xs text-red-600">
                        These will be removed when you save changes
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newDetails = [...formData.details];
                      newDetails.forEach((detail) => {
                        if (detail.rowaction === "delete") {
                          detail.rowaction = "update";
                        }
                      });
                      setFormData((prev) => ({ ...prev, details: newDetails }));
                      setDeletedDetails([]);
                    }}
                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  >
                    Restore All
                  </button>
                </div>
              </div>
            )}

            {formData.details.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No medications added. Click "Add Medicine" to add.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.details.map((detail, index) => {
                  const isDeleted = detail.rowaction === "delete";
                  const isExpanded = expandedRows[index] || false;

                  return (
                    <div
                      key={
                        detail.upcommingAppointmentDetail_id || `new-${index}`
                      }
                      ref={(el) => (detailRefs.current[index] = el)}
                      className={`bg-white rounded-lg border transition-all duration-300 ${
                        isDeleted 
                          ? 'border-red-200 bg-red-50 opacity-70' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {/* Detail Header */}
                      <div
                        className="p-3 cursor-pointer hover:bg-gray-50 rounded-t-lg transition-colors"
                        onClick={() => !isDeleted && toggleRowExpansion(index)}
                        onKeyDown={(e) => !isDeleted && handleKeyDown(e, index)}
                        tabIndex={isDeleted ? -1 : 0}
                        role="button"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded ${
                              isDeleted 
                                ? 'bg-red-100' 
                                : detail.upcommingAppointmentDetail_id 
                                  ? 'bg-yellow-100' 
                                  : 'bg-green-100'
                            }`}>
                              {isDeleted ? (
                                <Trash2 className="h-4 w-4 text-red-600" />
                              ) : detail.upcommingAppointmentDetail_id ? (
                                <PencilSquareIcon className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <Plus className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`font-semibold ${
                                  isDeleted ? 'text-red-700 line-through' : 'text-gray-800'
                                }`}>
                                  Medicine {index + 1}
                                </span>
                                {isDeleted ? (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                    Deleted
                                  </span>
                                ) : !detail.upcommingAppointmentDetail_id ? (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    New
                                  </span>
                                ) : null}
                              </div>
                              <p className={`text-sm ${
                                isDeleted ? 'text-red-500 line-through' : 'text-gray-500'
                              }`}>
                                {detail.Medicine_name || "No medicine name"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isDeleted ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreDetail(detail.upcommingAppointmentDetail_id);
                                }}
                                className="p-2 hover:bg-green-50 rounded transition-colors text-green-600"
                                title="Restore"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDetailRow(index);
                                  }}
                                  className="p-2 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                                <div className="text-gray-400">
                                  {isExpanded ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                  ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {!isDeleted && isExpanded && (
                        <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                          <div className="grid grid-cols-12 items-end">
                            {/* Medicine Name (WIDE) */}
                            <div className="col-span-12 md:col-span-4 pr-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Medicine Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Medicine Name"
                                value={detail.Medicine_name}
                                onChange={(e) =>
                                  updateDetailRow(index, "Medicine_name", e.target.value)
                                }
                                required
                                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                              />
                            </div>

                            {/* Start Date */}
                            <div className="col-span-6 md:col-span-2 pr-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Start Date *
                              </label>
                              <input
                                type="date"
                                value={detail.Start_date}
                                onChange={(e) =>
                                  updateDetailRow(index, "Start_date", e.target.value)
                                }
                                required
                                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                              />
                            </div>

                            {/* End Date */}
                            <div className="col-span-6 md:col-span-2 pr-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                End Date *
                              </label>
                              <input
                                type="date"
                                value={detail.End_date}
                                onChange={(e) =>
                                  updateDetailRow(index, "End_date", e.target.value)
                                }
                                required
                                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                              />
                            </div>

                            {/* Morning */}
                            <div className="col-span-4 md:col-span-1 flex justify-center mb-4">
                              <label className="flex items-center space-x-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={detail.Morning === "Y"}
                                  onChange={(e) =>
                                    updateDetailRow(index, "Morning", e.target.checked ? "Y" : "N")
                                  }
                                  className="h-4 w-4"
                                />
                                <span>Morning</span>
                              </label>
                            </div>

                            {/* Afternoon */}
                            <div className="col-span-4 md:col-span-1 flex justify-center mb-4">
                              <label className="flex items-center space-x-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={detail.AfterNoon === "Y"}
                                  onChange={(e) =>
                                    updateDetailRow(index, "AfterNoon", e.target.checked ? "Y" : "N")
                                  }
                                  className="h-4 w-4"
                                />
                                <span>Afternoon</span>
                              </label>
                            </div>

                            {/* Evening */}
                            <div className="col-span-4 md:col-span-1 flex justify-center mb-4">
                              <label className="flex items-center space-x-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={detail.Evening === "Y"}
                                  onChange={(e) =>
                                    updateDetailRow(index, "Evening", e.target.checked ? "Y" : "N")
                                  }
                                  className="h-4 w-4 "
                                />
                                <span>Evening</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={
                isSaving ||
                activeDetails.length === 0 ||
                (formData.prescription_file &&
                  formData.prescription_file.size > MAX_FILE_SIZE)
              }
              className={`px-4 py-2 rounded-md flex items-center transition-colors
                ${
                  isSaving || activeDetails.length === 0
                    ? "bg-blue-400 cursor-not-allowed opacity-50"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                ? "Update"
                : "Save"}
            </button>

            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Confirm Delete"
        width="400px"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Appointment?
            </h4>
            <p className="text-gray-600 text-sm">
              Are you sure you want to delete this appointment? All associated
              medication details will be permanently removed.
            </p>
          </div>
          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={() => setShowDeleteConfirmModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UpcomingAppointment;