//  import React, { useState, useEffect } from "react";
// import { X, CameraIcon, CheckCircleIcon, Loader2 } from "lucide-react";

// const API_BASE_URL = "http://localhost:8000";

// const EditProfile = ({ open, onClose }) => {
//   const member_id = sessionStorage.getItem("member_id");
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [imageError, setImageError] = useState(null);
//   const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
//   const [isLoading, setIsLoading] = useState(false);
//   const [memberData, setMemberData] = useState(null);

//   const [form, setForm] = useState({
//     Member_name: "",
//     Member_address: "",
//     Mobile_no: "",
//     other_details: "",
//     blood_group: "",
//     date_of_birth: "",
//     Modified_by: "",
//   });

//   const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""];

//   // Helper functions
//   const getUserNameFromStorage = () => {
//     try {
//       return sessionStorage.getItem("User_Name") || "System";
//     } catch {
//       return "System";
//     }
//   };

//   const showNotification = (message, type = "success") => {
//     setNotification({ show: true, message, type });
//     setTimeout(() => {
//       setNotification(prev => ({ ...prev, show: false }));
//     }, 3000);
//   };

//   // Fetch member data when modal opens
//   useEffect(() => {
//     if (!member_id || !open) return;

//     const fetchMemberData = async () => {
//       setIsLoading(true);
//       try {
//         console.log(`Fetching member data for ID: ${member_id}`);
//         const response = await fetch(`${API_BASE_URL}/members/${member_id}`);
        
//         if (!response.ok) {
//           throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//         }
        
//         const data = await response.json();
//         console.log("Member data received:", data);
        
//         setMemberData(data);
//         setForm({
//           Member_name: data.Member_name || "",
//           Member_address: data.Member_address || "",
//           Mobile_no: data.Mobile_no || "",
//           other_details: data.other_details || "",
//           blood_group: data.blood_group || "",
//           date_of_birth: data.date_of_birth ? 
//             data.date_of_birth.split('T')[0] : "",
//           Modified_by: getUserNameFromStorage(),
//         });

//         // Try to load profile image
//         try {
//           const imageResponse = await fetch(`${API_BASE_URL}/members/userimage?member_id=${member_id}`);
//           if (imageResponse.ok && imageResponse.headers.get('content-type')?.includes('image')) {
//             const imageBlob = await imageResponse.blob();
//             const url = URL.createObjectURL(imageBlob);
//             setImagePreview(url);
//           }
//         } catch (imageErr) {
//           console.warn("Could not load profile image:", imageErr);
//         }
//       } catch (err) {
//         console.error("Error fetching member data:", err);
//         showNotification(`Failed to load profile: ${err.message}`, "error");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchMemberData();
//   }, [member_id, open]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ 
//       ...prev, 
//       [name]: value,
//       Modified_by: getUserNameFromStorage()
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type
//     const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//     if (!validTypes.includes(file.type)) {
//       setImageError('Please select a valid image file (JPEG, PNG only)');
//       return;
//     }

//     // Validate file size (max 2MB)
//     if (file.size > 2 * 1024 * 1024) {
//       setImageError('Image size should be less than 2MB');
//       return;
//     }

//     setImageFile(file);
//     setImageError(null);
    
//     // Create preview
//     if (imagePreview && imagePreview.startsWith('blob:')) {
//       URL.revokeObjectURL(imagePreview);
//     }
//     const url = URL.createObjectURL(file);
//     setImagePreview(url);
//   };

//   const handleRemoveImage = () => {
//     if (imagePreview && imagePreview.startsWith('blob:')) {
//       URL.revokeObjectURL(imagePreview);
//     }
//     setImageFile(null);
//     setImagePreview(null);
//     setImageError(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!member_id) {
//       showNotification("Member ID not found!", "error");
//       return;
//     }

//     if (!form.Member_name.trim()) {
//       showNotification("Please enter a valid name", "error");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       console.log("Starting update process...");
      
//       // First, try without image using JSON
//       const updateData = {
//         Member_name: form.Member_name.trim(),
//         Member_address: form.Member_address.trim(),
//         other_details: form.other_details.trim() || null,
//         blood_group: form.blood_group || null,
//         date_of_birth: form.date_of_birth || null,
//         Modified_by: getUserNameFromStorage(),
//       };

//       // Remove null values
//       Object.keys(updateData).forEach(key => {
//         if (updateData[key] === null || updateData[key] === undefined) {
//           delete updateData[key];
//         }
//       });

//       console.log("Sending update data (JSON):", updateData);
//       console.log("URL:", `${API_BASE_URL}/members/${member_id}`);

//       // Try with JSON first
//       const response = await fetch(`${API_BASE_URL}/members/${member_id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(updateData),
//       });

//       const responseText = await response.text();
//       console.log("Response status:", response.status);
//       console.log("Response text:", responseText);

//       if (!response.ok) {
//         let errorMessage = `HTTP ${response.status}`;
//         try {
//           const errorData = JSON.parse(responseText);
//           errorMessage = errorData.detail || errorData.message || errorMessage;
//         } catch (e) {
//           errorMessage = responseText || errorMessage;
//         }
//         throw new Error(errorMessage);
//       }

//       // If we have an image file, upload it separately
//       if (imageFile) {
//         console.log("Uploading image separately...");
//         const imageFormData = new FormData();
//         imageFormData.append('user_image', imageFile);
//         imageFormData.append('Modified_by', getUserNameFromStorage());

//         try {
//           const imageResponse = await fetch(`${API_BASE_URL}/members/${member_id}/upload-image`, {
//             method: 'POST',
//             body: imageFormData,
//           });

//           if (!imageResponse.ok) {
//             console.warn("Image upload failed, but profile was updated");
//           } else {
//             console.log("Image uploaded successfully");
//           }
//         } catch (imageErr) {
//           console.warn("Image upload error:", imageErr);
//         }
//       }

//       showNotification("Profile updated successfully!", "success");
      
//       // Close modal with delay
//       setTimeout(() => {
//         handleClose();
//       }, 1500);

//     } catch (err) {
//       console.error("Update error details:", err);
      
//       let errorMessage = "Failed to update profile. Please try again.";
//       if (err.message) {
//         errorMessage = `Update failed: ${err.message}`;
//       }
      
//       showNotification(errorMessage, "error");
      
//       // Try alternative approach if JSON fails
//       if (err.message.includes("500")) {
//         console.log("Trying FormData approach...");
//         await tryFormDataUpdate();
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const tryFormDataUpdate = async () => {
//     try {
//       const formData = new FormData();
      
//       // Append only required fields
//       formData.append('Member_name', form.Member_name.trim());
//       formData.append('Member_address', form.Member_address.trim());
//       formData.append('Modified_by', getUserNameFromStorage());
      
//       if (form.other_details.trim()) {
//         formData.append('other_details', form.other_details.trim());
//       }
//       if (form.blood_group) {
//         formData.append('blood_group', form.blood_group);
//       }
//       if (form.date_of_birth) {
//         formData.append('date_of_birth', form.date_of_birth);
//       }
      
//       if (imageFile) {
//         formData.append('user_image', imageFile);
//       }

//       console.log("Trying FormData update...");
      
//       const response = await fetch(`${API_BASE_URL}/members/${member_id}`, {
//         method: 'PUT',
//         body: formData,
//       });

//       const responseText = await response.text();
//       console.log("FormData response status:", response.status);
//       console.log("FormData response text:", responseText);

//       if (!response.ok) {
//         throw new Error(`FormData update failed: ${response.status}`);
//       }

//       showNotification("Profile updated successfully!", "success");
      
//       setTimeout(() => {
//         handleClose();
//       }, 1500);

//     } catch (formDataErr) {
//       console.error("FormData update also failed:", formDataErr);
//       showNotification("Update failed. Please check backend server logs.", "error");
//     }
//   };

//   const handleClose = () => {
//     // Clean up preview URL
//     if (imagePreview && imagePreview.startsWith('blob:')) {
//       URL.revokeObjectURL(imagePreview);
//     }
//     setImageFile(null);
//     setImagePreview(null);
//     setImageError(null);
//     setNotification({ show: false, message: "", type: "success" });
//     setMemberData(null);
//     setIsLoading(false);
//     onClose();
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//       {/* Notification */}
//       {notification.show && (
//         <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
//           notification.type === "success" 
//             ? "bg-green-100 text-green-800 border border-green-200" 
//             : "bg-red-100 text-red-800 border border-red-200"
//         }`}>
//           <div className="flex items-center">
//             {notification.type === "success" ? (
//               <CheckCircleIcon className="w-5 h-5 mr-2" />
//             ) : (
//               <X className="w-5 h-5 mr-2" />
//             )}
//             <span>{notification.message}</span>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6 pb-4 border-b">
//           <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
//           <button 
//             onClick={handleClose} 
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//             aria-label="Close"
//             type="button"
//             disabled={isLoading}
//           >
//             <X className="w-6 h-6 text-gray-500" />
//           </button>
//         </div>

//         {isLoading && !memberData ? (
//           <div className="flex justify-center items-center py-12">
//             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//             <span className="ml-2 text-gray-600">Loading profile...</span>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Profile Image Section */}
//             <div className="flex flex-col items-center mb-8">
//               <div className="relative mb-4">
//                 {imagePreview ? (
//                   <div className="relative">
//                     <img 
//                       src={imagePreview} 
//                       alt="Profile" 
//                       className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         e.target.nextElementSibling?.classList.remove('hidden');
//                       }}
//                     />
//                     <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg hidden">
//                       <div className="text-2xl font-bold text-gray-400">
//                         {form.Member_name.charAt(0).toUpperCase()}
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={handleRemoveImage}
//                       className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
//                       aria-label="Remove image"
//                       disabled={isLoading}
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
//                     <div className="text-2xl font-bold text-indigo-300">
//                       {form.Member_name.charAt(0).toUpperCase()}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex flex-col items-center space-y-3">
//                 <label className="cursor-pointer">
//                   <input
//                     type="file"
//                     accept=".jpg,.jpeg,.png"
//                     onChange={handleImageChange}
//                     className="hidden"
//                     id="profile-image-upload"
//                     disabled={isLoading}
//                   />
//                   <span className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${
//                     isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
//                   }`}>
//                     <CameraIcon className="w-4 h-4 mr-2" />
//                     {imagePreview ? "Change Photo" : "Upload Photo"}
//                   </span>
//                 </label>
                
//                 {imageError && (
//                   <p className="text-red-500 text-sm text-center">
//                     {imageError}
//                   </p>
//                 )}
                
//                 <p className="text-xs text-gray-500 text-center">
//                   JPG, PNG only • Max 2MB
//                 </p>
//               </div>
//             </div>

//             {/* Debug Info */}
//             <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
//               <div className="font-semibold mb-1">Debug Info:</div>
//               <div>Member ID: {member_id}</div>
//               <div>Endpoint: PUT {API_BASE_URL}/members/{member_id}</div>
//               <div className="mt-2 font-semibold">Data to send:</div>
//               <div>Member_name: {form.Member_name}</div>
//               <div>Member_address: {form.Member_address}</div>
//               <div>Modified_by: {form.Modified_by || getUserNameFromStorage()}</div>
//               {form.blood_group && <div>blood_group: {form.blood_group}</div>}
//               {form.date_of_birth && <div>date_of_birth: {form.date_of_birth}</div>}
//               {form.other_details && <div>other_details: {form.other_details}</div>}
//             </div>

//             {/* Form Fields */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Member Name */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name *
//                 </label>
//                 <input 
//                   name="Member_name" 
//                   value={form.Member_name} 
//                   onChange={handleChange} 
//                   placeholder="Enter full name" 
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   required 
//                   disabled={isLoading}
//                 />
//               </div>

//               {/* Mobile Number */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Mobile Number
//                 </label>
//                 <input 
//                   name="Mobile_no" 
//                   value={form.Mobile_no} 
//                   onChange={handleChange} 
//                   placeholder="Mobile number" 
//                   className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-600"
//                   readOnly 
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Contact administrator to change
//                 </p>
//               </div>

//               {/* Blood Group */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Blood Group
//                 </label>
//                 <select 
//                   name="blood_group" 
//                   value={form.blood_group} 
//                   onChange={handleChange} 
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                   disabled={isLoading}
//                 >
//                   <option value="">Select Blood Group</option>
//                   {bloodGroups.filter(Boolean).map(group => (
//                     <option key={group} value={group}>{group}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Date of Birth */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Date of Birth
//                 </label>
//                 <input 
//                   type="date" 
//                   name="date_of_birth" 
//                   value={form.date_of_birth} 
//                   onChange={handleChange} 
//                   max={new Date().toISOString().split('T')[0]}
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   disabled={isLoading}
//                 />
//               </div>

//               {/* Address */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Address
//                 </label>
//                 <textarea 
//                   name="Member_address" 
//                   value={form.Member_address} 
//                   onChange={handleChange} 
//                   placeholder="Enter your address" 
//                   rows="2"
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                   disabled={isLoading}
//                 />
//               </div>

//               {/* Other Details */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Other Details
//                 </label>
//                 <textarea 
//                   name="other_details" 
//                   value={form.other_details} 
//                   onChange={handleChange} 
//                   placeholder="Any additional information (allergies, medical conditions, etc.)" 
//                   rows="2"
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex justify-end gap-3 pt-6 border-t">
//               <button 
//                 type="button" 
//                 onClick={handleClose} 
//                 className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isLoading}
//               >
//                 Cancel
//               </button>
//               <button 
//                 type="submit" 
//                 disabled={isLoading || !form.Member_name.trim()} 
//                 className={`px-6 py-3 rounded-lg font-medium flex items-center ${
//                   isLoading || !form.Member_name.trim() 
//                     ? 'bg-gray-400 cursor-not-allowed' 
//                     : 'bg-blue-600 hover:bg-blue-700 text-white'
//                 }`}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="animate-spin w-4 h-4 mr-2" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircleIcon className="w-4 h-4 mr-2" />
//                     Save Changes
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EditProfile;