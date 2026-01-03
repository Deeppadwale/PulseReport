import { Camera, UserCircle, ChevronDown, Upload, FileText } from "lucide-react";
import { useState } from "react";

export default function EditProfile() {
    const [activeTab, setActiveTab] = useState("user");
    const [formData, setFormData] = useState({
        photo: null,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        landlineNo: "",
        panNo: "",
        address: "",
        Country: "",
        State: "",
        City: "",
        ZipCode: "",

        // Company Information
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        gstNo: "",
        fssaiNo: "",

        // Bank Details
        bankName: "",
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        bankAddress: "",
        accountType: "Savings",

        // Documents
        gstDoc: null,
        fssaiCert: null,
        tinDoc: null,
        panImage: null,
        exciseCert: null,
        moaCert: null,
        aoaCert: null,
        incorpCert: null,
        electricityBill: null,
        boardResolution: null
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'file' ? files[0] : value
        }));
    };

    const handleFileUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [fieldName]: file
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        // Handle form submission
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    photo: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const DocumentUploadField = ({ label, name, value, onChange }) => (
        <div className="border rounded-lg p-4 hover:border-[#D92300] transition-colors">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="flex items-center gap-3">
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-gray-300 p-2 hover:bg-gray-50">
                    <Upload className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                        {value ? value.name : "Choose file"}
                    </span>
                    <input
                        type="file"
                        name={name}
                        className="hidden"
                        onChange={onChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                    />
                </label>
                {value && (
                    <FileText className="h-5 w-5 text-green-500" />
                )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
                PDF, JPG, or PNG (Max 5MB)
            </p>
        </div>
    );

    return (
        <div className="max-w-8xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("user")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "user" ? "border-[#D92300] text-[#D92300]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                        User Information
                    </button>
                    <button
                        onClick={() => setActiveTab("company")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "company" ? "border-[#D92300] text-[#D92300]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                        Company Information
                    </button>
                    <button
                        onClick={() => setActiveTab("bank")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "bank" ? "border-[#D92300] text-[#D92300]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                        Bank Details
                    </button>
                    <button
                        onClick={() => setActiveTab("documents")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "documents" ? "border-[#D92300] text-[#D92300]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                        Documents Upload
                    </button>
                </nav>
            </div>

            <form onSubmit={handleSubmit}>
                {activeTab === "user" && (
                    <div className="space-y-8">
                        <div className="border-b border-gray-200 pb-8">
                            <h2 className="text-xl font-semibold text-[#D92300]">Personal Details</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                This information will be used to identify you in the system.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-6">
                                <div className="col-span-full flex flex-col items-center">
                                    <div className="relative">
                                        {formData.photo ? (
                                            <img
                                                src={formData.photo}
                                                alt="Profile"
                                                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow"
                                            />
                                        ) : (
                                            <UserCircle className="h-32 w-32 text-gray-400" />
                                        )}
                                        <label
                                            htmlFor="photo-upload"
                                            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100"
                                        >
                                            <Camera className="h-5 w-5 text-gray-600" />
                                            <input
                                                id="photo-upload"
                                                name="photo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <label
                                        htmlFor="photo-upload"
                                        className="mt-4 text-sm font-medium text-[#D92300] cursor-pointer"
                                    >
                                        Upload Photo
                                    </label>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="landlineNo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Landline Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="landlineNo"
                                        id="landlineNo"
                                        value={formData.landlineNo}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="panNo" className="block text-sm font-medium text-gray-700 mb-1">
                                        PAN Number
                                    </label>
                                    <input
                                        type="text"
                                        name="panNo"
                                        id="panNo"
                                        value={formData.panNo}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 p-4"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "company" && (
                    <div className="space-y-8">
                        <div className="border-b border-gray-200 pb-8">
                            <h2 className="text-xl font-semibold text-[#D92300]">Company Information</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Details about your business or organization.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Email
                                    </label>
                                    <input
                                        type="email"
                                        name="companyEmail"
                                        id="companyEmail"
                                        value={formData.companyEmail}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="Country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <div className="relative mt-1">
                                        <select
                                            id="Country"
                                            name="Country"
                                            value={formData.Country}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2 pr-10 appearance-none"
                                        >
                                            <option>Select Country</option>
                                            <option>India</option>
                                            <option>USA</option>
                                            <option>United Kingdom</option>
                                            <option>Canada</option>
                                            <option>Australia</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="State" className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <div className="relative mt-1">
                                        <select
                                            id="State"
                                            name="State"
                                            value={formData.State}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2 pr-10 appearance-none"
                                        >
                                            <option>Maharashtra</option>
                                            <option>Karnataka</option>
                                            <option>Uttar Pradesh</option>
                                            <option>Gujarat</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="City" className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="City"
                                        id="City"
                                        value={formData.City}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="ZipCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Zip Code
                                    </label>
                                    <input
                                        type="text"
                                        name="ZipCode"
                                        id="ZipCode"
                                        value={formData.ZipCode}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="companyPhone"
                                        id="companyPhone"
                                        value={formData.companyPhone}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="gstNo" className="block text-sm font-medium text-gray-700 mb-1">
                                        GST Number
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNo"
                                        id="gstNo"
                                        value={formData.gstNo}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="fssaiNo" className="block text-sm font-medium text-gray-700 mb-1">
                                        FSSAI Number
                                    </label>
                                    <input
                                        type="text"
                                        name="fssaiNo"
                                        id="fssaiNo"
                                        value={formData.fssaiNo}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "bank" && (
                    <div className="space-y-8">
                        <div className="border-b border-gray-200 pb-8">
                            <h2 className="text-xl font-semibold text-[#D92300]">Bank Account Details</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                For payments and transactions.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-6">
                                <div className="sm:col-span-2">
                                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        id="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Holder Name
                                    </label>
                                    <input
                                        type="text"
                                        name="accountName"
                                        id="accountName"
                                        value={formData.accountName}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        id="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Type
                                    </label>
                                    <div className="relative mt-1">
                                        <select
                                            id="accountType"
                                            name="accountType"
                                            value={formData.accountType}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2 pr-10 appearance-none"
                                        >
                                            <option>Savings</option>
                                            <option>Current</option>
                                            <option>Salary</option>
                                            <option>NRI</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        IFSC Code
                                    </label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        id="ifscCode"
                                        value={formData.ifscCode}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 h-10 px-4 py-2"
                                        placeholder=""
                                    />
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="bankAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Bank Address
                                    </label>
                                    <textarea
                                        id="bankAddress"
                                        name="bankAddress"
                                        rows={3}
                                        value={formData.bankAddress}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border border-gray-400 focus:border-gray-500 p-4"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "documents" && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#D92300]">Business Documents</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Upload all required business documents in PDF or image format
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <DocumentUploadField
                                label="GST Certificate"
                                name="gstDoc"
                                value={formData.gstDoc}
                                onChange={(e) => handleFileUpload(e, 'gstDoc')}
                            />

                            <DocumentUploadField
                                label="FSSAI Certificate"
                                name="fssaiCert"
                                value={formData.fssaiCert}
                                onChange={(e) => handleFileUpload(e, 'fssaiCert')}
                            />

                            <DocumentUploadField
                                label="TIN Number Certificate"
                                name="tinDoc"
                                value={formData.tinDoc}
                                onChange={(e) => handleFileUpload(e, 'tinDoc')}
                            />

                            <DocumentUploadField
                                label="PAN Card"
                                name="panImage"
                                value={formData.panImage}
                                onChange={(e) => handleFileUpload(e, 'panImage')}
                            />

                            <DocumentUploadField
                                label="Excise Certificate"
                                name="exciseCert"
                                value={formData.exciseCert}
                                onChange={(e) => handleFileUpload(e, 'exciseCert')}
                            />

                            <DocumentUploadField
                                label="MOA Certificate"
                                name="moaCert"
                                value={formData.moaCert}
                                onChange={(e) => handleFileUpload(e, 'moaCert')}
                            />

                            <DocumentUploadField
                                label="AOA Certificate"
                                name="aoaCert"
                                value={formData.aoaCert}
                                onChange={(e) => handleFileUpload(e, 'aoaCert')}
                            />

                            <DocumentUploadField
                                label="Incorporation Certificate"
                                name="incorpCert"
                                value={formData.incorpCert}
                                onChange={(e) => handleFileUpload(e, 'incorpCert')}
                            />

                            <DocumentUploadField
                                label="Electricity Bill"
                                name="electricityBill"
                                value={formData.electricityBill}
                                onChange={(e) => handleFileUpload(e, 'electricityBill')}
                            />

                            <DocumentUploadField
                                label="Board Resolution"
                                name="boardResolution"
                                value={formData.boardResolution}
                                onChange={(e) => handleFileUpload(e, 'boardResolution')}
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-[#D92300] px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#BF4F34] focus:outline-none focus:ring-2 focus:ring-[#D92300] focus:ring-offset-2"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}