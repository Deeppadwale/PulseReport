import { useState } from "react";
import { Eye, Download, Trash2, Upload } from "lucide-react";

const FileUploadField = ({ label, file, onChange, onRemove, onDownload, onPreview }) => {
    const isImage = file?.type?.startsWith('image/');
    const isPDF = file?.type === 'application/pdf';

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
            onChange(selectedFile);
        }
    };

    return (
        <div className="border rounded p-3">
            <label className="block font-medium mb-2">{label}</label>
            
            {file ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div>
                            {isImage ? '🖼️' : isPDF ? '📄' : '📎'}
                        </div>
                        <div>
                            <div className="font-medium truncate max-w-xs">
                                {file.name || file}
                            </div>
                            {file.size && (
                                <div className="text-sm text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex space-x-2">
                        {(isImage || isPDF) && (
                            <button
                                type="button"
                                onClick={onPreview}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Preview"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                        )}
                        
                        <button
                            type="button"
                            onClick={onDownload}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                        
                        <button
                            type="button"
                            onClick={onRemove}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Remove"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`file-${label}`}
                    />
                    <label
                        htmlFor={`file-${label}`}
                        className="flex items-center justify-center p-4 border-2 border-dashed rounded cursor-pointer hover:border-blue-400"
                    >
                        <Upload className="h-6 w-6 mr-2" />
                        <span>Click to upload</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                        Max 10MB. Supports: Images, PDF, Word, Excel
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileUploadField;