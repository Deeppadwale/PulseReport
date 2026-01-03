import { useEffect, useState } from "react";
import {
  PhoneIcon,
  HomeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Download } from "lucide-react";
import Modal from "../../common/Modal/Modal";
import { useGetMemberUserImageQuery } from "../../services/medicalAppoinmentApi";
import DEFAULT_USER_ICON from "../../assets/user.png";

// const DEFAULT_USER_ICON = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function ViewMemberModal({
  isOpen,
  onClose,
  member,
}) {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /* --------------------------------------------
     BACKEND IMAGE QUERY
  --------------------------------------------- */
  const {
    data: userImageBlob,
    isError: isUserImageError,
    isLoading: isImageLoading,
  } = useGetMemberUserImageQuery(
    member?.Member_id
      ? { member_id: member.Member_id }
      : null,
    {
      skip: !member?.Member_id || !isOpen,
    }
  );

  /* --------------------------------------------
     BLOB → PREVIEW URL
  --------------------------------------------- */
  const [userImagePreview, setUserImagePreview] = useState(DEFAULT_USER_ICON);

  useEffect(() => {
    // Reset to default when modal closes or member changes
    if (!isOpen || !member) {
      setUserImagePreview(DEFAULT_USER_ICON);
      return;
    }

    // If we have a blob, create URL
    if (userImageBlob instanceof Blob) {
      const url = URL.createObjectURL(userImageBlob);
      setUserImagePreview(url);

      // Cleanup function
      return () => URL.revokeObjectURL(url);
    }

    // If API failed or no image, use default
    if (isUserImageError || !userImageBlob) {
      setUserImagePreview(DEFAULT_USER_ICON);
    }
  }, [userImageBlob, isUserImageError, isOpen, member]);

  /* --------------------------------------------
     DOWNLOAD DOCUMENT FUNCTION (YOUR STYLE)
  --------------------------------------------- */
  const downloadDocument = (filePath, documentType) => {
    if (!filePath) {
      alert(`No ${documentType} file available`);
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.split('/').pop() || `${documentType.toLowerCase().replace(' ', '_')}_document`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error downloading ${documentType}:`, error);
      alert(`Failed to download ${documentType}`);
    }
  };

  /* --------------------------------------------
     RENDER
  --------------------------------------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Details"
      width="800px"
    >
      {member && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50  rounded-xl p-">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                  {isImageLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <img
                      src={userImagePreview}
                      alt={member.Member_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_USER_ICON;
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {member.Member_name || "N/A"}
                </h2>

                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Doc No: {member.doc_No || "N/A"}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Family ID: {member.Family_id || "N/A"}
                  </span>
                  {member.blood_group && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {member.blood_group}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">Created On</p>
                <p className="font-medium text-gray-900">
                  {member.Created_at
                    ? new Date(member.Created_at).toLocaleDateString('en-IN')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2 text-blue-500" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Mobile Number</p>
                  <p className="font-medium text-gray-900">{member.Mobile_no || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HomeIcon className="w-5 h-5 mr-2 text-green-500" />
                Address
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{member.Member_address || "No address provided"}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-500" />
              Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {member.pan_no && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">PAN Card</h4>
                    <button
                      onClick={() => downloadDocument(member.pan_no, 'PAN Card')}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{member.pan_no}</p>
                </div>
              )}

              {member.adhar_card && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Aadhar Card</h4>
                    <button
                      onClick={() => downloadDocument(member.adhar_card, 'Aadhar Card')}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{member.adhar_card}</p>
                </div>
              )}

              {member.insurance && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Insurance</h4>
                    <button
                      onClick={() => downloadDocument(member.insurance, 'Insurance')}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{member.insurance}</p>
                </div>
              )}

              {!member.pan_no && !member.adhar_card && !member.insurance && (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No documents uploaded</p>
                </div>
              )}
            </div>
          </div>

          {member.other_details && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-500" />
                Additional Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{member.other_details}</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}