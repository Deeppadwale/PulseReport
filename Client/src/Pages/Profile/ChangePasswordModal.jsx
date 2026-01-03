// import { useState, useEffect } from 'react';
// import { X, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
// import { useUpdateUserPasswordMutation } from '../../services/userMasterApi';
// import { decryptData } from "../../common/Functions/DecryptData"

// const Toast = ({ message, type, onClose }) => {
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             onClose();
//         }, 3000);

//         return () => clearTimeout(timer);
//     }, [onClose]);

//     return (
//         <div className="fixed top-4 right-4 z-50 animate-fade-in">
//             <div className={`flex items-center p-4 rounded-lg shadow-lg ${type === 'success'
//                 ? 'bg-green-100 border border-green-200 text-green-800'
//                 : 'bg-red-100 border border-red-200 text-red-800'
//                 }`}>
//                 {type === 'success' ? (
//                     <CheckCircle className="w-5 h-5 mr-2" />
//                 ) : (
//                     <XCircle className="w-5 h-5 mr-2" />
//                 )}
//                 <span className="font-medium">{message}</span>
//                 <button
//                     onClick={onClose}
//                     className="ml-4 text-gray-500 hover:text-gray-700"
//                 >
//                     <X className="w-4 h-4" />
//                 </button>
//             </div>
//         </div>
//     );
// };


// const ChangePasswordModal = ({ isOpen, onClose }) => {
//     const [formData, setFormData] = useState({
//         current_password: '',
//         new_password: '',
//         confirm_password: ''
//     });
//     const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [toast, setToast] = useState({ show: false, message: '', type: '' });
//     const [updateUserPassword] = useUpdateUserPasswordMutation();

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const showToast = (message, type) => {
//         setToast({ show: true, message, type });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (formData.new_password !== formData.confirm_password) {
//             showToast('New password and confirmation do not match', 'error');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const encryptedUserData = sessionStorage.getItem('user_data');
//             if (encryptedUserData) {
//                 const userData = decryptData(encryptedUserData);

//                 if (userData && userData.uid) {
//                     await updateUserPassword({
//                         uid: userData.uid,
//                         current_password: formData.current_password,
//                         new_password: formData.new_password,
//                         confirm_password: formData.confirm_password
//                     }).unwrap();

//                     setFormData({
//                         current_password: '',
//                         new_password: '',
//                         confirm_password: ''
//                     });

//                     showToast('Password changed successfully!', 'success');

//                     setTimeout(() => {
//                         onClose();
//                     },500);
//                 }
//             }
//         } catch (error) {
//             console.error('Error changing password:', error);
//             if (error.data?.detail) {
//                 showToast(`Error: ${error.data.detail}`, 'error');
//             } else {
//                 showToast('Failed to change password. Please try again.', 'error');
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <>
//             {toast.show && (
//                 <Toast
//                     message={toast.message}
//                     type={toast.type}
//                     onClose={() => setToast({ show: false, message: '', type: '' })}
//                 />
//             )}

//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
//                 <div className="bg-white rounded-lg w-full max-w-md">
//                     <div className="flex items-center justify-between p-4 border-b">
//                         <h2 className="text-lg font-semibold text-[#D92300]">Change Password</h2>
//                         <button
//                             onClick={onClose}
//                             className="text-gray-400 hover:text-gray-600"
//                         >
//                             <X size={20} />
//                         </button>
//                     </div>

//                     <form onSubmit={handleSubmit} className="p-4 space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Current Password
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type={showCurrentPassword ? "text" : "password"}
//                                     name="current_password"
//                                     value={formData.current_password}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92300] pr-10"
//                                     required
//                                     autoComplete='off'
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                                 >
//                                     {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                                 </button>
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 New Password
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type={showNewPassword ? "text" : "password"}
//                                     name="new_password"
//                                     value={formData.new_password}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92300] pr-10"
//                                     required
//                                     minLength={6}
//                                     autoComplete='off'
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowNewPassword(!showNewPassword)}
//                                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                                 >
//                                     {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                                 </button>
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Confirm New Password
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type={showConfirmPassword ? "text" : "password"}
//                                     name="confirm_password"
//                                     value={formData.confirm_password}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D92300] pr-10"
//                                     required
//                                     minLength={6}
//                                     autoComplete='off'
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                                 >
//                                     {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="flex justify-end space-x-3 pt-4">
//                             <button
//                                 type="button"
//                                 onClick={onClose}
//                                 className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isLoading}
//                                 className="px-4 py-2 bg-[#D92300] text-white rounded-md text-sm font-medium hover:bg-[#C11B00] disabled:opacity-50"
//                             >
//                                 {isLoading ? 'Updating...' : 'Change Password'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>

//             <style>
//                 {`
//                     @keyframes fade-in {
//                         from { opacity: 0; transform: translateY(-10px); }
//                         to { opacity: 1; transform: translateY(0); }
//                     }
//                     .animate-fade-in {
//                         animation: fade-in 0.3s ease-out;
//                     }
//                 `}
//             </style>
//         </>
//     );
// };

// export default ChangePasswordModal;


import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, CheckCircle, XCircle, Lock, Shield, KeyRound } from 'lucide-react';
import { useUpdateUserPasswordMutation } from '../../services/userMasterApi';
import { decryptData } from "../../common/Functions/DecryptData"

const Toast = ({ message, type, onClose }) => {
    const toastRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div 
            ref={toastRef}
            className={`fixed top-4 right-4 z-[60] animate-slide-in-right flex items-center p-4 rounded-xl shadow-xl ${
                type === 'success'
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800'
                    : 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800'
            }`}
        >
            <div className="flex items-center">
                {type === 'success' ? (
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                ) : (
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                )}
                <div>
                    <span className="font-semibold">{type === 'success' ? 'Success!' : 'Error!'}</span>
                    <p className="text-sm mt-0.5">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="ml-4 text-gray-500 hover:text-gray-700 p-1 hover:bg-white/50 rounded-lg"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [passwordStrength, setPasswordStrength] = useState('');
    const [strengthScore, setStrengthScore] = useState(0);
    const modalRef = useRef(null);
    const [updateUserPassword] = useUpdateUserPasswordMutation();

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Calculate password strength
    useEffect(() => {
        if (!formData.new_password) {
            setPasswordStrength('');
            setStrengthScore(0);
            return;
        }

        let score = 0;
        const password = formData.new_password;

        // Length check
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Complexity checks
        if (/[A-Z]/.test(password)) score += 1; // Uppercase
        if (/[a-z]/.test(password)) score += 1; // Lowercase
        if (/[0-9]/.test(password)) score += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) score += 1; // Special characters

        setStrengthScore(score);

        if (score <= 2) setPasswordStrength('Weak');
        else if (score <= 4) setPasswordStrength('Fair');
        else if (score <= 5) setPasswordStrength('Good');
        else setPasswordStrength('Strong');
    }, [formData.new_password]);

    const getStrengthColor = () => {
        if (strengthScore <= 2) return 'bg-red-500';
        if (strengthScore <= 4) return 'bg-yellow-500';
        if (strengthScore <= 5) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    const validatePassword = () => {
        const errors = [];

        if (formData.new_password.length < 6) {
            errors.push('New password must be at least 6 characters');
        }

        if (!/[A-Z]/.test(formData.new_password)) {
            errors.push('Include at least one uppercase letter');
        }

        if (!/[0-9]/.test(formData.new_password)) {
            errors.push('Include at least one number');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.current_password === formData.new_password) {
            showToast('New password must be different from current password', 'error');
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            showToast('New password and confirmation do not match', 'error');
            return;
        }

        const passwordErrors = validatePassword();
        if (passwordErrors.length > 0) {
            showToast(passwordErrors[0], 'error');
            return;
        }

        setIsLoading(true);

        try {
            const encryptedUserData = sessionStorage.getItem('user_data');
            if (encryptedUserData) {
                const userData = decryptData(encryptedUserData);

                if (userData && userData.uid) {
                    await updateUserPassword({
                        uid: userData.uid,
                        current_password: formData.current_password,
                        new_password: formData.new_password,
                        confirm_password: formData.confirm_password
                    }).unwrap();

                    setFormData({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                    });

                    showToast('Password changed successfully!', 'success');

                    setTimeout(() => {
                        onClose();
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.data?.detail) {
                showToast(error.data.detail, 'error');
            } else if (error.status === 401) {
                showToast('Current password is incorrect', 'error');
            } else {
                showToast('Failed to change password. Please try again.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: '' })}
                />
            )}

          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[60] p-9">

                <div 
                    ref={modalRef}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-br from-[#F5EBEB] to-[#FFE8E8] rounded-xl">
                                <KeyRound className="text-[#D92300]" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                                <p className="text-sm text-gray-500 mt-1">Update your account password</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D92300] focus:border-transparent pr-12 text-gray-900 placeholder-gray-400"
                                    placeholder="Enter current password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <KeyRound className="w-4 h-4 mr-2 text-gray-500" />
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D92300] focus:border-transparent pr-12 text-gray-900 placeholder-gray-400"
                                    placeholder="Create new password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            
                            {/* Password Strength Indicator */}
                            {formData.new_password && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Password strength:</span>
                                        <span className={`font-semibold ${
                                            passwordStrength === 'Weak' ? 'text-red-600' :
                                            passwordStrength === 'Fair' ? 'text-yellow-600' :
                                            passwordStrength === 'Good' ? 'text-blue-600' :
                                            'text-green-600'
                                        }`}>
                                            {passwordStrength}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getStrengthColor()} transition-all duration-300`}
                                            style={{ width: `${(strengthScore / 6) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 space-y-1 mt-2">
                                        <p>Password must contain:</p>
                                        <ul className="grid grid-cols-2 gap-1">
                                            <li className={`flex items-center ${formData.new_password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                                                <span className="mr-1">•</span> At least 6 characters
                                            </li>
                                            <li className={`flex items-center ${/[A-Z]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                <span className="mr-1">•</span> Uppercase letter
                                            </li>
                                            <li className={`flex items-center ${/[a-z]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                <span className="mr-1">•</span> Lowercase letter
                                            </li>
                                            <li className={`flex items-center ${/[0-9]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                <span className="mr-1">•</span> Number
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <Shield className="w-4 h-4 mr-2 text-gray-500" />
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent pr-12 text-gray-900 placeholder-gray-400 ${
                                        formData.new_password && formData.confirm_password
                                            ? formData.new_password === formData.confirm_password
                                                ? 'border-green-300 focus:ring-green-500'
                                                : 'border-red-300 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-[#D92300]'
                                    }`}
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formData.new_password && formData.confirm_password && (
                                <p className={`text-xs mt-2 flex items-center ${
                                    formData.new_password === formData.confirm_password
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {formData.new_password === formData.confirm_password ? (
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                        <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {formData.new_password === formData.confirm_password
                                        ? 'Passwords match'
                                        : 'Passwords do not match'}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-5 py-2.5 bg-gradient-to-r from-[#D92300] to-[#C11B00] text-white rounded-xl font-medium hover:from-[#C11B00] hover:to-[#A91600] shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Security Note */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200 rounded-b-2xl">
                        <div className="flex items-start">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">Security Tips</p>
                                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                                    <li>• Use a unique password not used for other accounts</li>
                                    <li>• Avoid using personal information in your password</li>
                                    <li>• Consider using a password manager for better security</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    @keyframes scale-in {
                        from {
                            opacity: 0;
                            transform: scale(0.95) translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }

                    @keyframes slide-in-right {
                        from {
                            opacity: 0;
                            transform: translateX(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    .animate-scale-in {
                        animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .animate-slide-in-right {
                        animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                `}
            </style>
        </>
    );
};

export default ChangePasswordModal;