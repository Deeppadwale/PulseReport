// src/Pages/UserPermissions/UserPermissionsForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import TableUtility from "../common/TableUtility/TableUtility";
import Modal from "../common/Modal/Modal";
import CreateNewButton from "../common/Buttons/AddButton";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import {
  useGetUserdetailsQuery,
  useAddUserdetailsMutation,
  useUpdateUserdetailsMutation,
  useDeleteUserdetailsMutation,
  useLazyGetUserdetailsProgram_NameQuery,
  useLazyGetUserdetailsByIdQuery,
} from "../services/userpermisionApi";

function UserPermissionsForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [detailsData, setDetailsData] = useState([]);

  // API hooks
  const { data: tableData = [], refetch } = useGetUserdetailsQuery();
  const [fetchUserDetails, { data: userDetailsById, isFetching: isFetchingUser }] =
    useLazyGetUserdetailsByIdQuery();
  const [fetchProgramNames, { data: programNamesResponse }] =
    useLazyGetUserdetailsProgram_NameQuery();

  const [addUser] = useAddUserdetailsMutation();
  const [updateUser] = useUpdateUserdetailsMutation();
  const [deleteUser] = useDeleteUserdetailsMutation();

  // Preload programs
  const rawPrograms = useMemo(() => {
    if (!programNamesResponse) return [];
    const { programNames = [], menuNames = [] } = programNamesResponse;
    return programNames.map((program, index) => ({
      Program_Name: program,
      menuNames: menuNames[index] || "",
    }));
  }, [programNamesResponse]);

  // ----------------- Add -----------------
  const handleAddNew = async () => {
    setFormData({
      uid: "",
      User_Name: "",
      User_Type: "U", // default to User
      User_Password: "",
      EmailId: "",
      EmailPassword: "",
      Mobile: "",
      PaymentsPassword: "",
      userfullname: "",
      User_Security: "N", // default No
      details: [],
    });

    const res = await fetchProgramNames().unwrap();
    const preloadedDetails = (res.programNames || []).map((program, index) => ({
      id: index + 1,
      Program_Name: program,
      menuNames: (res.menuNames || [])[index] || "",
      canView: "Y",
      canSave: "Y",
      canEdit: "Y",
      canDelete: "Y",
      DND: "Y",
      udid: null,
    }));

    setDetailsData(preloadedDetails);
    setEditId(null);
    setIsModalOpen(true);
  };

  // ----------------- Edit -----------------
  const handleEdit = (row) => {
    const uid = row.uid || row.User_Id;
    setEditId(uid);
    setIsModalOpen(true);
    fetchUserDetails(uid);
  };

  useEffect(() => {
    if (userDetailsById && editId) {
      setFormData({
        ...userDetailsById,
        uid: userDetailsById.uid || userDetailsById.User_Id,
        PaymentsPassword: userDetailsById.PaymentsPassword || "",
        User_Type: userDetailsById.User_Type || "U",
        User_Security: userDetailsById.User_Security || "N",
      });

      let normalizedDetails = (userDetailsById.details || []).map((d, idx) => ({
        id: d.id || d.Detail_Id || idx + 1,
        udid: d.udid || d.Detail_Id || null,
        Program_Name: d.Program_Name,
        menuNames: d.menuNames,
        canView: d.canView === "Y" ? "Y" : "N",
        canSave: d.canSave === "Y" ? "Y" : "N",
        canEdit: d.canEdit === "Y" ? "Y" : "N",
        canDelete: d.canDelete === "Y" ? "Y" : "N",
        DND:
          d.canView === "Y" &&
          d.canSave === "Y" &&
          d.canEdit === "Y" &&
          d.canDelete === "Y"
            ? "Y"
            : "N",
      }));

      if (rawPrograms.length > 0) {
        const existingProgramNames = new Set(normalizedDetails.map((d) => d.Program_Name));
        const missingPrograms = rawPrograms.filter(
          (p) => !existingProgramNames.has(p.Program_Name)
        );

        normalizedDetails = [
          ...normalizedDetails,
          ...missingPrograms.map((p, index) => ({
            id: normalizedDetails.length + index + 1,
            udid: null,
            Program_Name: p.Program_Name,
            menuNames: p.menuNames,
            canView: "N",
            canSave: "N",
            canEdit: "N",
            canDelete: "N",
            DND: "N",
          })),
        ];
      }

      setDetailsData(normalizedDetails);
    }
  }, [userDetailsById, editId, rawPrograms]);

  // ----------------- Permissions helpers -----------------
  const toggleCheckbox = (idx, field) => {
    setDetailsData((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, [field]: row[field] === "Y" ? "N" : "Y" } : row
      )
    );
  };

  const handleSelectAllRow = (idx, isChecked) => {
    setDetailsData((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              canView: isChecked ? "Y" : "N",
              canSave: isChecked ? "Y" : "N",
              canEdit: isChecked ? "Y" : "N",
              canDelete: isChecked ? "Y" : "N",
              DND: isChecked ? "Y" : "N",
            }
          : row
      )
    );
  };

  // ----------------- Save / Update -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resolvedUid = formData.uid || formData.User_Id || editId;

      const payload = {
        ...formData,
        uid: resolvedUid,
        PaymentsPassword: formData.PaymentsPassword || "",
        details: detailsData.map((d) => ({
          udid: d.udid || null,
          User_Id: resolvedUid,
          Program_Name: d.Program_Name,
          menuNames: d.menuNames,
          canView: d.canView,
          canSave: d.canSave,
          canEdit: d.canEdit,
          canDelete: d.canDelete,
        })),
      };

      if (editId) {
        await updateUser(payload).unwrap();
      } else {
        await addUser(payload).unwrap();
      }

      await refetch();
      setIsModalOpen(false);
      setFormData({});
      setDetailsData([]);
      setEditId(null);
    } catch (error) {
      console.error("Save/Update failed:", error);
    }
  };

  // ----------------- Delete -----------------
  const handleDelete = (uid) => {
    setItemToDelete(uid);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(itemToDelete).unwrap();
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // ----------------- Table Columns -----------------
  const columns = [
    { header: "User Name", accessor: "User_Name" },
    { header: "User Type", accessor: "User_Type" },
    { header: "Email", accessor: "EmailId" },
    {
      header: "Action",
      accessor: "action",
      isAction: true,
      actionRenderer: (row) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 bg-blue-50 rounded-md text-blue-600 hover:bg-blue-100"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(row.uid || row.User_Id)}
            className="p-2 bg-red-50 rounded-md text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

 return (
  <>
    <TableUtility
      headerContent={<CreateNewButton onClick={handleAddNew} />}
      title="User Permissions"
      columns={columns}
      data={tableData}
      pageSize={10}
    />

    {/* Modal for Add/Edit */}
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={editId ? "Edit User" : "Add New User"}
      size="5xl"
      width="65%"
    >
      {isFetchingUser && editId ? (
        <div className="p-6 text-center">Loading user details...</div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[80vh] overflow-y-auto p-4"
        >
          <h4 className="text-lg font-semibold border-b pb-2 mb-4">
            User Info
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["userfullname", "User_Name", "User_Password", "EmailId", "EmailPassword", "Mobile", "PaymentsPassword"].map(
              (field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    {field}
                  </label>
                  <input
                    type={
                      field === "User_Password" || field === "EmailPassword"
                        ? "password"
                        : "text"
                    }
                    value={formData[field] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    disabled={field === "User_Name" && !!editId}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
              )
            )}

            {/* User Type Dropdown */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                value={formData.User_Type || "U"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, User_Type: e.target.value }))
                }
                className="border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="A">Admin</option>
                <option value="U">User</option>
              </select>
            </div>

            {/* User Security Dropdown */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                User Security
              </label>
              <select
                value={formData.User_Security || "N"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, User_Security: e.target.value }))
                }
                className="border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold border-b pb-2 mt-6 mb-2">
              Permissions
            </h4>
          </div>

          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">menuNames</th>
                <th className="border px-2 py-1">Program Name</th>
                <th className="border px-2 py-1">View</th>
                <th className="border px-2 py-1">Save</th>
                <th className="border px-2 py-1">Edit</th>
                <th className="border px-2 py-1">Delete</th>
                <th className="border px-2 py-1">DND</th>
              </tr>
            </thead>
            <tbody>
              {detailsData.map((detail, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1 text-center">{detail.menuNames}</td>
                  <td className="border px-2 py-1">{detail.Program_Name}</td>

                  {["canView", "canSave", "canEdit", "canDelete"].map((field) => (
                    <td key={field} className="border px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={detail[field] === "Y"}
                        onChange={() => toggleCheckbox(idx, field)}
                        className="h-4 w-4"
                      />
                    </td>
                  ))}
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={detail.DND === "Y"}
                      onChange={(e) => handleSelectAllRow(idx, e.target.checked)}
                      className="h-4 w-4"
                    />
                  </td>
                </tr>
              ))}
              {detailsData.length === 0 && (
                <tr>
                  <td colSpan={8} className="border px-2 py-4 text-center text-gray-500">
                    No permission rows to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-md bg-gray-100 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white"
            >
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </form>
      )}
    </Modal>

    {/* Delete confirm modal */}
    <Modal
      isOpen={showDeleteConfirmModal}
      onClose={() => setShowDeleteConfirmModal(false)}
      title="Confirm Delete"
    >
      <div className="p-4 text-center">
        <p className="mb-4">Are you sure you want to delete this user?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowDeleteConfirmModal(false)}
            className="px-4 py-2 border rounded-md bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 border rounded-md bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  </>
);

}

export default UserPermissionsForm;
