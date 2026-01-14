
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import TableUtility from "../common/TableUtility/TableUtility";
import Modal from "../common/Modal/Modal";
import CreateNewButton from "../common/Buttons/AddButton";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import {
  Trash2,
  Plus,
  X,
  User,
  FileText,
  ChevronRight,
  Calendar,
  Download,
  Eye,
} from "lucide-react";
import {
  useGetMemberReportsByFamilyQuery,
  useCreateMemberReportMutation,
  useUpdateMemberReportMutation,
  useDeleteMemberReportMutation,
  useLazyDownloadReportFileQuery,
  useLazyPreviewReportFileQuery,
  useSendPdfEmailMutation,
} from "../services/memberReportApi";
import MemberCardView from "../components/MemberImagecard";
import { useGetReportMastersQuery } from "../services/reportMasterApi";
import { useGetMemberMastersQuery } from "../services/medicalAppoinmentApi";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

function MemberReport() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    Member_id: sessionStorage.getItem("member_id") || "",
    doc_date: "",
    Family_id: sessionStorage.getItem("family_id") || "",
    purpose: "",
    remarks: "",
    Created_by: sessionStorage.getItem("User_Name") || "",
    details: [],
  });
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [selectedReportNames, setSelectedReportNames] = useState({});
  const [deletedDetails, setDeletedDetails] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const MAX_FILE_SIZE_MB = 5; // For display purposes
  const detailRefs = useRef({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("all");
  const [availableReportTypes, setAvailableReportTypes] = useState([]);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    subject: "",
    messagebody: "",
  });
  const [selectedDetailForEmail, setSelectedDetailForEmail] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const familyId = sessionStorage.getItem("family_id");
  const {
    data: tableData = [],
    isLoading: isTableLoading,
    isError,
    refetch,
  } = useGetMemberReportsByFamilyQuery(familyId);
  const { data: memberData = [], isLoading: isMemberLoading } =
    useGetMemberMastersQuery(familyId);
  const { data: reportData = [], isLoading: isReportLoading } =
    useGetReportMastersQuery();

  const [createMemberReport] = useCreateMemberReportMutation();
  const [updateMemberReport] = useUpdateMemberReportMutation();
  const [deleteMemberReport] = useDeleteMemberReportMutation();
  const [sendPdfEmail] = useSendPdfEmailMutation();

  const applyFilters = useCallback((data, member, reportId) => {
    if (!Array.isArray(data) || data.length === 0) {
      setFilteredTableData([]);
      return;
    }

    let filtered = [...data];

    if (member) {
      filtered = filtered.filter((item) => item.Member_id === member.Member_id);
    }

    if (reportId !== "all") {
      filtered = filtered.filter((item) => {
        if (!item.details || !Array.isArray(item.details)) return false;
        return item.details.some(
          (detail) => detail.Report_id === parseInt(reportId),
        );
      });
    }

    setFilteredTableData(filtered);
  }, []);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
  };

  const handleReportFilterChange = (e) => {
    const reportId = e.target.value;
    setSelectedReportId(reportId);
  };

  const clearFilters = () => {
    setSelectedMember(null);
    setSelectedReportId("all");
  };

  useEffect(() => {
    if (Array.isArray(tableData)) {
      applyFilters(tableData, selectedMember, selectedReportId);
    }
  }, [tableData, selectedMember, selectedReportId, applyFilters]);

  useEffect(() => {
    if (Array.isArray(tableData) && tableData.length > 0) {
      const reportTypes = new Set();
      tableData.forEach((item) => {
        if (item.details && Array.isArray(item.details)) {
          item.details.forEach((detail) => {
            if (detail.Report_id) {
              reportTypes.add(detail.Report_id);
            }
          });
        }
      });

      const reportOptions = Array.from(reportTypes).map((id) => {
        const report = reportData.find((r) => r.Report_id === parseInt(id));
        return {
          Report_id: id,
          report_name: report ? report.report_name : `Report ${id}`,
        };
      });

      reportOptions.sort((a, b) => a.report_name.localeCompare(b.report_name));
      setAvailableReportTypes(reportOptions);
    } else {
      setFilteredTableData([]);
      setAvailableReportTypes([]);
    }
  }, [tableData, reportData]);

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

  useEffect(() => {
    if (formData.details.length > 0 && reportData.length > 0) {
      const newSelectedReportNames = {};
      formData.details.forEach((detail, index) => {
        if (detail.Report_id && detail.row_action !== "delete") {
          const report = reportData.find(
            (r) => r.Report_id === parseInt(detail.Report_id),
          );
          newSelectedReportNames[index] = report ? report.report_name : "";
        }
      });
      setSelectedReportNames(newSelectedReportNames);
    }
  }, [formData.details, reportData]);

  useEffect(() => {
    if (!isModalOpen) {
      setExpandedRows({});
    }
  }, [isModalOpen]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, show: false })),
      3000,
    );
  };

  const getFileNameFromPath = (filePath) => {
    if (!filePath) return "";

    if (
      filePath.match(
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.[a-zA-Z0-9]+$/,
      )
    ) {
      return filePath;
    }

    const pathParts = filePath.split(/[\\/]/);
    return pathParts.pop() || "";
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    const parts = dateString.split(/[-\/]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      let year = parts[2];

      if (year.length === 2) {
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        const twoDigitYear = parseInt(year);
        year =
          twoDigitYear < 50
            ? century + twoDigitYear
            : century - 100 + twoDigitYear;
      }

      return `${year}-${month}-${day}`;
    }

    return dateString;
  };

  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop().toUpperCase() : "";
  };

  const getFileIcon = (fileName) => {
    const ext = getFileExtension(fileName).toLowerCase();
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleEmail = (detail) => {
    setEmailFormData({
      email: "",
      subject: "",
      messagebody: "",
    });

    setSelectedDetailForEmail(detail);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailFormData.email) {
      showNotification("Please enter recipient email address", "error");
      return;
    }

    if (!selectedDetailForEmail?.uploaded_file_report) {
      showNotification("No file available to send", "error");
      return;
    }

    try {
      setIsSendingEmail(true);

      const fileName = getFileNameFromPath(
        selectedDetailForEmail.uploaded_file_report,
      );

      if (!fileName) {
        throw new Error("Invalid file path");
      }

      const formData = new FormData();
      formData.append("email", emailFormData.email);
      formData.append("subject", emailFormData.subject || "Medical Report");
      formData.append(
        "messagebody",
        emailFormData.messagebody || "Please find the attached medical report.",
      );

      const response = await fetch(
        `${API_BASE_URL}member-report/download/${encodeURIComponent(fileName)}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file: ${response.status} ${response.statusText}`,
        );
      }

      const blob = await response.blob();
      formData.append("file", blob, fileName);

      const sendResponse = await fetch(
        `${API_BASE_URL}member-report/send-email-with-attachment`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await sendResponse.json();

      if (!sendResponse.ok) {
        throw new Error(result.detail || result.message || "Failed to send email");
      }

      showNotification(result.message || "Email sent successfully!");

      setShowEmailModal(false);
      setSelectedDetailForEmail(null);
      setEmailFormData({
        email: "",
        subject: "",
        messagebody: "",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      
      let errorMessage = "Failed to send email";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(d => d.msg || d.message).join(", ");
          } else {
            errorMessage = errorData.detail;
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleWhatsApp = (detail) => {
    showNotification("WhatsApp functionality coming soon!", "info");
  };

  const handleAddNew = () => {
    const userName = sessionStorage.getItem("User_Name") || "";
    const defaultMemberId = sessionStorage.getItem("member_id") || "";

    setFormData({
      Member_id: defaultMemberId,
      doc_date: new Date().toISOString().split("T")[0],
      Family_id: sessionStorage.getItem("family_id") || "",
      purpose: "",
      remarks: "",
      Created_by: userName,
      details: [],
    });
    setEditId(null);
    setFiles({});
    setDeletedDetails([]);
    setExpandedRows({});
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    const userName = sessionStorage.getItem("User_Name") || "";
    const detailsWithUniqueKeys = (row.details || []).map((d, idx) => ({
      detail_id: d.detail_id,
      report_date: d.report_date || "",
      Report_id: d.Report_id?.toString() || "",
      Naration: d.Naration || "",
      Doctor_and_Hospital_name: d.Doctor_and_Hospital_name || "",
      uploaded_file_report: d.uploaded_file_report || "",
      file_key: d.detail_id
        ? `existing_${d.detail_id}`
        : `temp_${Date.now()}_${idx}`,
      row_action: "update",
    }));

    setFormData({
      Member_id: row.Member_id?.toString() || "",
      doc_date: formatDateForInput(row.doc_date) || "",
      Family_id:
        sessionStorage.getItem("family_id") || row.Family_id?.toString() || "",
      purpose: row.purpose || "",
      remarks: row.remarks || "",
      Created_by: userName,
      details: detailsWithUniqueKeys,
    });
    setEditId(row.MemberReport_id);
    setFiles({});
    setDeletedDetails([]);
    setExpandedRows({});
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteIdToConfirm(id);
    setShowDeleteConfirmModal(true);
  };

  const handlePreview = async (filePath) => {
    if (!filePath) {
      showNotification("No file to preview", "error");
      return;
    }

    const fileName = getFileNameFromPath(filePath);

    if (!fileName) {
      showNotification("Invalid file path", "error");
      return;
    }

    try {
      setIsLoading(true);
      const fileExt = getFileExtension(fileName);
      showNotification(`Opening ${fileExt} preview...`, "info");
      const previewUrl = `${API_BASE_URL}member-report/preview/${encodeURIComponent(fileName)}`;
      window.open(previewUrl, "_blank");

      showNotification("Preview opened successfully!");
    } catch (error) {
      console.error("Failed to preview file:", error);
      showNotification("Failed to preview file. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (filePath, reportName = "") => {
    if (!filePath) {
      showNotification("No file to download", "error");
      return;
    }

    const fileName = getFileNameFromPath(filePath);

    if (!fileName) {
      showNotification("Invalid file path", "error");
      return;
    }

    try {
      setIsLoading(true);
      const fileExt = getFileExtension(fileName);
      showNotification(`Downloading ${fileExt} file...`, "info");
      const downloadUrl = `${API_BASE_URL}member-report/download/${encodeURIComponent(fileName)}`;
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
      try {
        window.open(
          `${API_BASE_URL}member-report/download/${encodeURIComponent(fileName)}`,
          "_blank",
        );
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setIsLoading(false);
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
        setExpandedRows((prev) => ({
          ...prev,
          [nextIndex]: true,
        }));

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
        setExpandedRows((prev) => ({
          ...prev,
          [prevIndex]: true,
        }));
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

  const confirmDelete = async () => {
    try {
      await deleteMemberReport(deleteIdToConfirm).unwrap();
      showNotification("Report deleted successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to delete report:", error);
      showNotification("Failed to delete report!", "error");
    } finally {
      setShowDeleteConfirmModal(false);
      setDeleteIdToConfirm(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...formData.details];
    const detail = newDetails[index];

    if (!detail.row_action && detail.detail_id) {
      detail.row_action = "update";
    }

    detail[field] = value;
    setFormData((prev) => ({ ...prev, details: newDetails }));

    if (field === "Report_id" && reportData.length > 0) {
      const report = reportData.find((r) => r.Report_id === parseInt(value));
      setSelectedReportNames((prev) => ({
        ...prev,
        [index]: report ? report.report_name : "",
      }));
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      showNotification(
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller file.`,
        "error",
      );
      e.target.value = "";
      return;
    }

    const detail = formData.details[index];
    const fileKey = detail.file_key || `file_${Date.now()}_${index}`;

    const newDetails = [...formData.details];
    newDetails[index].file_key = fileKey;
    setFormData((prev) => ({ ...prev, details: newDetails }));

    setFiles((prev) => ({
      ...prev,
      [fileKey]: file,
    }));

    showNotification(
      `File "${file.name}" selected (${formatFileSize(file.size)})`,
      "success",
    );
  };

  const handleAddDetailRow = () => {
    const uniqueFileKey = `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDetail = {
      report_date: new Date().toISOString().split("T")[0],
      Report_id: "",
      Naration: "",
      Doctor_and_Hospital_name: "",
      file_key: uniqueFileKey,
      row_action: "add",
    };

    const newExpandedRows = {};
    const newSelectedReportNames = {};

    Object.keys(expandedRows).forEach((key) => {
      const keyNum = parseInt(key);
      newExpandedRows[keyNum + 1] = expandedRows[key];
    });

    Object.keys(selectedReportNames).forEach((key) => {
      const keyNum = parseInt(key);
      newSelectedReportNames[keyNum + 1] = selectedReportNames[key];
    });

    setFormData((prev) => ({
      ...prev,
      details: [newDetail, ...prev.details],
    }));

    newExpandedRows[0] = true;
    setExpandedRows(newExpandedRows);
    setSelectedReportNames(newSelectedReportNames);
  };

  const handleRemoveDetailRow = (index) => {
    const detailToRemove = formData.details[index];

    if (detailToRemove.row_action === "add") {
      const newDetails = [...formData.details];
      newDetails.splice(index, 1);
      setFormData((prev) => ({ ...prev, details: newDetails }));
      
      if (detailToRemove.file_key) {
        setFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[detailToRemove.file_key];
          return newFiles;
        });
      }

      const newExpandedRows = {};
      const newSelectedReportNames = {};

      Object.keys(expandedRows).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          newExpandedRows[keyNum - 1] = expandedRows[key];
        } else if (keyNum < index) {
          newExpandedRows[keyNum] = expandedRows[key];
        }
      });

      Object.keys(selectedReportNames).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          newSelectedReportNames[keyNum - 1] = selectedReportNames[key];
        } else if (keyNum < index) {
          newSelectedReportNames[keyNum] = selectedReportNames[key];
        }
      });

      setExpandedRows(newExpandedRows);
      setSelectedReportNames(newSelectedReportNames);
    } else {
      const newDetails = [...formData.details];
      newDetails[index].row_action = "delete";
      setFormData((prev) => ({ ...prev, details: newDetails }));

      if (newDetails[index].detail_id) {
        setDeletedDetails((prev) => [...prev, newDetails[index].detail_id]);
      }
    }
  };

  const handleRestoreDetail = (detailId) => {
    const newDetails = [...formData.details];
    const detailIndex = newDetails.findIndex((d) => d.detail_id === detailId);
    if (detailIndex !== -1) {
      newDetails[detailIndex].row_action = "update";
      setFormData((prev) => ({ ...prev, details: newDetails }));
      setDeletedDetails((prev) => prev.filter((id) => id !== detailId));
    }
  };

  const getActiveDetails = () => {
    return formData.details.filter((detail) => detail.row_action !== "delete");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const activeDetails = getActiveDetails();
    
    if (activeDetails.length === 0) {
      showNotification("Please add at least one report detail", "error");
      return;
    }

    const oversizedFiles = Object.values(files).filter(
      (file) => file.size > MAX_FILE_SIZE,
    );
    if (oversizedFiles.length > 0) {
      showNotification(
        `Please remove files larger than ${MAX_FILE_SIZE_MB}MB before submitting.`,
        "error",
      );
      return;
    }

    try {
      setIsLoading(true);
      const formattedDocDate = formatDateForInput(formData.doc_date);
      const payload = {
        Member_id: parseInt(formData.Member_id),
        doc_date: formattedDocDate,
        Family_id: parseInt(formData.Family_id),
        purpose: formData.purpose,
        remarks: formData.remarks || "",
        Created_by: formData.Created_by,
        details: formData.details.map((detail) => {
          const detailObj = {
            report_date: detail.report_date,
            Report_id: parseInt(detail.Report_id),
            Naration: detail.Naration || "",
            Doctor_and_Hospital_name: detail.Doctor_and_Hospital_name || "",
            row_action:
              detail.row_action || (detail.detail_id ? "update" : "add"),
          };

          if (detail.file_key) {
            detailObj.file_key = detail.file_key;
          }

          return detailObj;
        }),
      };

      if (editId) {
        const updatePayload = {
          head: {
            Member_id: parseInt(formData.Member_id),
            doc_date: formattedDocDate,
            Family_id: parseInt(formData.Family_id),
            purpose: formData.purpose,
            remarks: formData.remarks || "",
            Created_by: formData.Created_by,
            Modified_by: sessionStorage.getItem("User_Name") || "",
          },
          details: formData.details.map((detail) => {
            const detailObj = {
              report_date: detail.report_date,
              Report_id: parseInt(detail.Report_id),
              Naration: detail.Naration || "",
              Doctor_and_Hospital_name: detail.Doctor_and_Hospital_name || "",
              row_action:
                detail.row_action || (detail.detail_id ? "update" : "add"),
            };

            if (detail.detail_id) {
              detailObj.detail_id = detail.detail_id;
            }

            if (detail.file_key) {
              detailObj.file_key = detail.file_key;
            }

            return detailObj;
          }),
        };

        await updateMemberReport({
          MemberReport_id: editId,
          payload: updatePayload,
          files,
        }).unwrap();
        showNotification("Report updated successfully!");
      } else {
        await createMemberReport({
          payload: payload,
          files,
        }).unwrap();
        showNotification("Report created successfully!");
      }

      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save report:", error);
      const errorMessage =
        error?.data?.detail || error?.data?.message || "Failed to save report!";
      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      header: "Sr.NO",
      accessor: "doc_No",
      cellTextAlign: "left",
      cellRenderer: (row) => <div className="">{row.doc_No || "N/A"}</div>,
    },
    {
      header: "Report DATE",
      accessor: "doc_date",
      cellTextAlign: "center",
      cellRenderer: (row) => <div className="">{row.doc_date || "N/A"}</div>,
    },
    {
      header: "Family Name",
      accessor: "Family_Name",
      headerTextAlign: "left",
      cellTextAlign: "left",
      sortAlphabetical: true,
      cellRenderer: (row) => (
        <div className="text-gray-800">
          {row.Family_Name ? row.Family_Name : "N/A"}
        </div>
      ),
    },
    {
      header: "Member Name",
      accessor: "Member_name",
      headerTextAlign: "left",
      cellTextAlign: "left",
      sortAlphabetical: true,
      cellRenderer: (row) => (
        <div className="text-gray">
          {row.Member_name ? row.Member_name : "N/A"}
        </div>
      ),
    },

    {
      header: "Remarks",
      accessor: "remarks",
      headerTextAlign: "left",
      cellTextAlign: "left",
      cellRenderer: (row) => (
        <div className="max-w-xs truncate" title={row.remarks}>
          {row.remarks || "N/A"}
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
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            title="Edit"
            className="p-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105 group"
          >
            <PencilSquareIcon className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.MemberReport_id);
            }}
            title="Delete"
            className="p-2.5 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 group"
          >
            <Trash2 className="h-5 w-5 text-red-600 group-hover:text-red-800" />
          </button>
        </div>
      ),
    },
  ];

const expandableRowRenderer = (row) => {
  return (
    <>
      {/* ================= EXPANDABLE TABLE ================= */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-t border-blue-200">
        <div className="px-6 py-3">

          {/* ================= TABLE HEADER ================= */}
          <div className="grid grid-cols-[2.5fr_1.3fr_2fr_3fr_1.5fr] gap-4 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-md">
            <div className="text-left">Report Name</div>
            <div className="text-center">Date</div>
            <div className="text-center">Doctor</div>
            <div className="text-left">Purpose</div>
            <div className="text-center">Actions</div>
          </div>

          {/* ================= TABLE ROWS ================= */}
          {row.details?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {row.details.map((detail, idx) => {
                const reportName =
                  reportData.find(r => r.Report_id === detail.Report_id)
                    ?.report_name || "Unknown Report";

                return (
                  <div
                    key={detail.detail_id || idx}
                    className="grid grid-cols-[2.5fr_1.3fr_2fr_3fr_1.5fr] gap-4 px-4 py-2 text-sm bg-white hover:bg-blue-50 transition"
                  >
                    {/* Report Name */}
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium truncate">{reportName}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>{detail.report_date || "—"}</span>
                    </div>

                    {/* Doctor (RIGHT aligned) */}
                    <div className="flex items-center justify-center gap-2 truncate text-right">
                      <User className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="truncate">
                        {detail.Doctor_and_Hospital_name || "—"}
                      </span>
                      
                    </div>

                    {/* Narration */}
                    <div className="flex items-left justify-left gap-2 truncate text-gray-600">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-500 shrink-0" />
                      <span className="truncate" title={detail.Naration}>
                        {detail.Naration || "—"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-1">
                      {detail.uploaded_file_report ? (
                        <>
                          <button
                            onClick={() => handlePreview(detail.uploaded_file_report)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(detail.uploaded_file_report)}
                            className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEmail(detail)}
                            className="p-1.5 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-gray-600">
              No report details available
            </div>
          )}
        </div>
      </div>

      {/* ================= EMAIL MODAL ================= */}
<Modal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          title={
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Send Report via Email
                </h2>
                <p className="text-sm text-gray-500">
                  Send medical report as email attachment
                </p>
              </div>
            </div>
          }
          width="600px"
        >
          <div className="space-y-6">
            {selectedDetailForEmail && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg border border-blue-100">
                      <PaperClipIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Attached File</p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {getFileNameFromPath(
                          selectedDetailForEmail.uploaded_file_report,
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getFileExtension(
                          getFileNameFromPath(
                            selectedDetailForEmail.uploaded_file_report,
                          ),
                        )}{" "}
                        File
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={emailFormData.email}
                  onChange={handleEmailInputChange}
                  placeholder="recipient@example.com"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:shadow-md"
                disabled={isSendingEmail}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
    </>
  );
};



  if (isTableLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
          <p className="text-sm text-gray-400 mt-1">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-red-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md">
          <XCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error Loading Reports
          </h3>
          <p className="text-gray-600 mb-6">
            There was a problem loading the reports. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );

  return (
    <div className="">
      {notification.show && (
        <div
          className={`
            fixed
            bottom-4
            left-1/2 -translate-x-1/2
            z-50
            p-4
            rounded-xl
            shadow-lg
            transition-all duration-300 animate-slide-in
            max-w-sm w-full
            ${
              notification.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800"
                : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800"
            }
          `}
        >
          <div className="flex items-start gap-3">
            {notification.type === "success" ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="font-medium text-sm sm:text-base leading-snug">
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Member Card View */}
      <div className="">
        <div className="flex items-center justify-between ">
          {(selectedMember || selectedReportId !== "all") && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <MemberCardView
          onMemberSelect={handleMemberSelect}
          selectedMemberId={selectedMember?.Member_id}
        />
      </div>

      <div className="max-w-full">
        <TableUtility
          title={
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Medical Reports
                  {selectedMember && (
                    <span className="text-blue-600 ml-2">
                      ({selectedMember.Member_name})
                    </span>
                  )}
                </h1>
                
              </div>
            </div>
          }
          headerContent={
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CreateNewButton
                onClick={handleAddNew}
                label={
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Add New Report</span>
                  </div>
                }
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Report Type
                  </label>
                  <div className="relative">
                    <select
                      value={selectedReportId}
                      onChange={handleReportFilterChange}
                      className="w-full sm:w-48 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 appearance-none pr-10 text-sm"
                    >
                      <option value="all">All Report Types</option>
                      {availableReportTypes.map((report) => (
                        <option key={report.Report_id} value={report.Report_id}>
                          {report.report_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {(selectedMember || selectedReportId !== "all") && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Active filters:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <User className="h-3 w-3 mr-1" />
                          {selectedMember.Member_name}
                        </span>
                      )}
                      {selectedReportId !== "all" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <FileText className="h-3 w-3 mr-1" />
                          {availableReportTypes.find(
                            (r) => r.Report_id == selectedReportId,
                          )?.report_name || "Report"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
          columns={columns}
          data={filteredTableData}
          pageSize={10}
          searchable={true}
          exportable={true}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          // Add expandable props
          expandable={true}
          expandOnRowClick={true}
          expandableRowRenderer={expandableRowRenderer}
          expandedRowClassName="bg-gray-50"
          initialExpandedRows={[]}
        />
      </div>

      {/* Main Modal for Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${editId ? "bg-yellow-100" : "bg-green-100"}`}
            >
              {editId ? (
                <PencilSquareIcon className="h-6 w-6 text-yellow-600" />
              ) : (
                <Plus className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editId ? "Edit Report" : "Create New Report"}
              </h2>
              <p className="text-sm text-gray-500">
                {editId
                  ? "Update existing report details"
                  : "Add a new medical report"}
              </p>
            </div>
          </div>
        }
        width={"1200px"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {/* Doc Date */}
            <div className="col-span-1 xs:col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                <span className="truncate">Doc Date</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.doc_date || ""}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      doc_date: e.target.value,
                    }));
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Select Member */}
            <div className="col-span-1 xs:col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                <span className="truncate">
                  Select Member <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              <select
                name="Member_id"
                value={formData.Member_id}
                onChange={handleInputChange}
                disabled={!!editId}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
              >
                <option value="">Select member</option>
                {memberData.map((member) => (
                  <option key={member.Member_id} value={member.Member_id}>
                    {member.Member_name} - {member.Mobile_no}
                  </option>
                ))}
              </select>
            </div>

            {/* Remarks */}
            <div className="col-span-1 xs:col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                <span className="truncate">Remarks</span>
              </label>
              <textarea
                name="remarks"
                rows="2"
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 resize-y text-sm sm:text-base"
                placeholder="Enter remarks"
              />
            </div>
          </div>

          {/* Reports Section */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <button
                type="button"
                onClick={handleAddDetailRow}
                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>Add Reports</span>
              </button>
            </div>

            {/* Deleted Items Notice */}
            {deletedDetails.length > 0 && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex items-center">
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700 text-sm sm:text-base">
                        {deletedDetails.length} detail
                        {deletedDetails.length > 1 ? "s" : ""} marked for
                        deletion
                      </p>
                      <p className="text-xs sm:text-sm text-red-600 mt-0.5">
                        These will be removed when you save changes
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newDetails = [...formData.details];
                      newDetails.forEach((detail) => {
                        if (detail.row_action === "delete") {
                          detail.row_action = "update";
                        }
                      });
                      setFormData((prev) => ({ ...prev, details: newDetails }));
                      setDeletedDetails([]);
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors self-start sm:self-center"
                  >
                    Restore All
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {formData.details.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <FileText className="h-10 w-10 sm:h-14 sm:w-14 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium text-sm sm:text-base">
                  No report details added yet
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Click "Add Reports" to start adding reports
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {formData.details.map((detail, index) => {
                  const isDeleted = detail.row_action === "delete";
                  const isExpanded = expandedRows[index] || false;
                  const reportName =
                    selectedReportNames[index] ||
                    `Report ${formData.details.length - index}`;
                  const fileName = detail.uploaded_file_report
                    ? getFileNameFromPath(detail.uploaded_file_report)
                    : "";
                  const fileIcon = getFileIcon(fileName);
                  const fileExt = getFileExtension(fileName);

                  return (
                    <div
                      key={
                        detail.detail_id
                          ? `detail_${detail.detail_id}`
                          : `new_${detail.file_key}`
                      }
                      ref={(el) => (detailRefs.current[index] = el)}
                      className={`bg-white rounded-xl border transition-all duration-300 ${
                        isDeleted
                          ? "border-red-200 bg-red-50 opacity-70"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {/* Report Header */}
                      <div
                        className={`p-3 sm:p-4 rounded-t-xl transition-colors ${
                          isDeleted ? "" : "cursor-pointer hover:bg-gray-50"
                        }`}
                        onClick={() => !isDeleted && toggleRowExpansion(index)}
                        onKeyDown={(e) =>
                          !isDeleted && handleKeyDown(e, index)
                        }
                        tabIndex={isDeleted ? -1 : 0}
                        role={isDeleted ? "none" : "button"}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} report detail ${index + 1}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div
                              className={`p-1.5 sm:p-2 rounded-lg ${
                                isDeleted
                                  ? "bg-red-100"
                                  : detail.detail_id
                                    ? "bg-yellow-100"
                                    : "bg-green-100"
                              } flex-shrink-0`}
                            >
                              {isDeleted ? (
                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                              ) : detail.detail_id ? (
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                              ) : (
                                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-2">
                                <span
                                  className={`font-semibold text-sm sm:text-base truncate ${
                                    isDeleted
                                      ? "text-red-700 line-through"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {reportName}
                                </span>
                                {isDeleted ? (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full mt-1 xs:mt-0">
                                    Deleted
                                  </span>
                                ) : !detail.detail_id ? (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1 xs:mt-0">
                                    New
                                  </span>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-500">
                                <span
                                  className={isDeleted ? "line-through" : ""}
                                >
                                  {detail.report_date || "No date selected"}
                                </span>
                                {fileName && (
                                  <>
                                    <span className="hidden xs:inline">•</span>
                                    <span
                                      className={`flex items-center space-x-1 ${isDeleted ? "line-through" : ""}`}
                                    >
                                      <span>{fileIcon}</span>
                                      <span className="truncate max-w-[80px] sm:max-w-[120px]">
                                        {fileExt} File
                                      </span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                            {isDeleted ? (
                              // Restore button for deleted items
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (detail.detail_id) {
                                    handleRestoreDetail(detail.detail_id);
                                  }
                                }}
                                title="Restore"
                                className="p-1.5 hover:bg-green-50 rounded-lg transition-colors group flex-shrink-0"
                              >
                                <Plus className="h-4 w-4 text-green-600 group-hover:text-green-800" />
                              </button>
                            ) : (
                              <>
                                {/* Desktop Action Buttons */}
                                <div className="hidden sm:flex space-x-1">
                                  {detail.uploaded_file_report &&
                                    !files[detail.file_key] && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePreview(
                                              detail.uploaded_file_report,
                                            );
                                          }}
                                          title="Preview File"
                                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group"
                                        >
                                          <EyeIcon className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(
                                              detail.uploaded_file_report,
                                              reportName,
                                            );
                                          }}
                                          title="Download File"
                                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors group"
                                        >
                                          <DocumentArrowDownIcon className="h-5 w-5 text-green-600 group-hover:text-green-800" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWhatsApp(detail);
                                          }}
                                          title="Send via WhatsApp"
                                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors group"
                                        >
                                          <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-700 group-hover:text-green-900" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmail(detail);
                                          }}
                                          title="Send via Email"
                                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group"
                                        >
                                          <EnvelopeIcon className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
                                        </button>
                                      </>
                                    )}
                                </div>

                                {/* Mobile Action Buttons */}
                                <div className="flex sm:hidden space-x-1">
                                  {detail.uploaded_file_report &&
                                    !files[detail.file_key] && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePreview(
                                              detail.uploaded_file_report,
                                            );
                                          }}
                                          title="Preview"
                                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                          <EyeIcon className="h-4 w-4 text-blue-600" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(
                                              detail.uploaded_file_report,
                                              reportName,
                                            );
                                          }}
                                          title="Download"
                                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                          <DocumentArrowDownIcon className="h-4 w-4 text-green-600" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWhatsApp(detail);
                                          }}
                                          title="WhatsApp"
                                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-700" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmail(detail);
                                          }}
                                          title="Email"
                                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                          <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                                        </button>
                                      </>
                                    )}
                                </div>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDetailRow(index);
                                  }}
                                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group flex-shrink-0"
                                >
                                  <X className="h-4 w-4 text-red-500 group-hover:text-red-700" />
                                </button>
                              </>
                            )}

                            {/* Expand/Collapse Icon (only for non-deleted items) */}
                            {!isDeleted && (
                              <div className="text-gray-400">
                                {isExpanded ? (
                                  <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronDownIcon className="h-4 w-4" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content (only for non-deleted items) */}
                      {!isDeleted && isExpanded && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 pt-3 sm:pt-4">
                          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">

                            {/* Report Date */}
                            <div className="col-span-1 xs:col-span-2 lg:col-span-1">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500 flex-shrink-0" />
                                <span>
                                  Report Date{" "}
                                  <span className="text-red-500 ml-0.5">*</span>
                                </span>
                              </label>
                              <input
                                type="date"
                                value={detail.report_date}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "report_date",
                                    e.target.value,
                                  )
                                }
                                required
                                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                              />
                            </div>

                            {/* Report Type */}
                            <div className="col-span-1 xs:col-span-2 lg:col-span-1">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500 flex-shrink-0" />
                                <span>
                                  Report Type{" "}
                                  <span className="text-red-500 ml-0.5">*</span>
                                </span>
                              </label>
                              <div className="relative">
                                <select
                                  value={detail.Report_id}
                                  onChange={(e) =>
                                    handleDetailChange(
                                      index,
                                      "Report_id",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                                >
                                  <option value="" className="text-gray-400">
                                    Select report type
                                  </option>
                                  {isReportLoading ? (
                                    <option value="" disabled>
                                      Loading report types...
                                    </option>
                                  ) : (
                                    reportData.map((report) => (
                                      <option
                                        key={report.Report_id}
                                        value={report.Report_id}
                                      >
                                        {report.report_name}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                            </div>

                               <div className="col-span-1 xs:col-span-2 lg:col-span-1">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center">
                                <DocumentArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500 flex-shrink-0" />
                                <span>Purpose</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Doctor/Hospital name"
                                value={detail.Naration}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "Naration",
                                    e.target.value,
                                  )
                                }
                                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                              />
                            </div>

                            {/* Doctor/Hospital */}
                            <div className="col-span-1 xs:col-span-2 lg:col-span-1">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center">
                                <DocumentArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500 flex-shrink-0" />
                                <span>Doctor/Hospital</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Doctor/Hospital name"
                                value={detail.Doctor_and_Hospital_name}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "Doctor_and_Hospital_name",
                                    e.target.value,
                                  )
                                }
                                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-sm sm:text-base"
                              />
                            </div>

                         

                            {/* Upload File */}
                            <div className="col-span-1 xs:col-span-2 lg:col-span-1">
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                <span className="flex items-center justify-between">
                                  <span className="flex items-center">
                                    <DocumentArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500 flex-shrink-0" />
                                    <span>Upload File</span>
                                  </span>
                                  <span className="text-xs text-gray-500 font-normal">
                                    Max {MAX_FILE_SIZE_MB}MB
                                  </span>
                                </span>
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  onChange={(e) => handleFileChange(e, index)}
                                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer text-xs sm:text-sm"
                                />
                              </div>

                              {/* File size validation */}
                              {files[detail.file_key] && (
                                <div className="mt-1 text-xs flex justify-between items-center">
                                  <span
                                    className={`font-medium ${files[detail.file_key].size > MAX_FILE_SIZE ? "text-red-600" : "text-green-600"}`}
                                  >
                                    {formatFileSize(files[detail.file_key].size)}
                                  </span>
                                  {files[detail.file_key].size > MAX_FILE_SIZE && (
                                    <span className="text-red-500 font-semibold">
                                      Exceeds {MAX_FILE_SIZE_MB}MB limit!
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Existing file preview */}
                              {detail.uploaded_file_report &&
                                !files[detail.file_key] && (
                                  <div className="mt-1.5 sm:mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                                        <span className="text-base sm:text-lg">
                                          {fileIcon}
                                        </span>
                                        <div>
                                          <p className="text-xs font-medium text-gray-700">
                                            {fileExt} File
                                          </p>
                                          <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[150px]">
                                            {fileName}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* New file preview */}
                              {files[detail.file_key] && (
                                <div
                                  className={`mt-1.5 sm:mt-2 p-2 rounded-lg border ${
                                    files[detail.file_key].size > MAX_FILE_SIZE
                                      ? "bg-red-50 border-red-200"
                                      : "bg-green-50 border-green-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                                      <span className="text-base sm:text-lg">
                                        📄
                                      </span>
                                      <div>
                                        <p
                                          className={`text-xs font-medium ${
                                            files[detail.file_key].size >
                                            MAX_FILE_SIZE
                                              ? "text-red-700"
                                              : "text-green-700"
                                          }`}
                                        >
                                          {files[detail.file_key].name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatFileSize(
                                            files[detail.file_key].size,
                                          )}
                                          {files[detail.file_key].size >
                                            MAX_FILE_SIZE && (
                                            <span className="ml-1 font-semibold text-red-600">
                                              (Too large)
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    {files[detail.file_key].size >
                                      MAX_FILE_SIZE && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFiles((prev) => {
                                            const newFiles = { ...prev };
                                            delete newFiles[detail.file_key];
                                            return newFiles;
                                          });
                                        }}
                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
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

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-4 space-y-reverse sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 sm:px-8 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:shadow-md text-sm sm:text-base w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{editId ? "Update Report" : "Create Report"}</span>
                </>
              )}
            </button>
          </div>
        </form>
        <Modal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          title={
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Send Report via Email
                </h2>
                <p className="text-sm text-gray-500">
                  Send medical report as email attachment
                </p>
              </div>
            </div>
          }
          width="600px"
        >
          <div className="space-y-6">
            {selectedDetailForEmail && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg border border-blue-100">
                      <PaperClipIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Attached File</p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {getFileNameFromPath(
                          selectedDetailForEmail.uploaded_file_report,
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getFileExtension(
                          getFileNameFromPath(
                            selectedDetailForEmail.uploaded_file_report,
                          ),
                        )}{" "}
                        File
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={emailFormData.email}
                  onChange={handleEmailInputChange}
                  placeholder="recipient@example.com"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:shadow-md"
                disabled={isSendingEmail}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title={
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg flex-shrink-0">
              <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                Confirm Deletion
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                This action cannot be undone
              </p>
            </div>
          </div>
        }
        size="100vw sm:max-w-md"
        className="max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-full mb-4">
              <Trash2 className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Report?
            </h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Are you sure you want to delete this report? All associated files
              and details will be permanently removed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              onClick={() => setShowDeleteConfirmModal(false)}
              className="px-6 sm:px-8 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Delete Report</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MemberReport;