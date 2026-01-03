const PreviewModal = ({ isOpen, file, onClose, onDownload }) => {
    if (!isOpen || !file) return null;

    const isImage = typeof file === 'string' 
        ? file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        : file.type?.startsWith('image/');
    
    const isPDF = typeof file === 'string'
        ? file.endsWith('.pdf')
        : file.type === 'application/pdf';

    const getFileName = () => {
        return typeof file === 'string' 
            ? file.split('/').pop() 
            : file.name;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">File Preview</h2>
                    <button onClick={onClose} className="text-2xl">×</button>
                </div>
                
                <div className="p-4 overflow-auto">
                    {isImage ? (
                        <img
                            src={typeof file === 'string' 
                                ? `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/memberreport/download/${getFileName(file)}`
                                : URL.createObjectURL(file)}
                            alt="Preview"
                            className="max-w-full max-h-[70vh] mx-auto"
                        />
                    ) : isPDF ? (
                        <iframe
                            src={typeof file === 'string'
                                ? `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/memberreport/download/${getFileName(file)}`
                                : URL.createObjectURL(file)}
                            className="w-full h-[70vh] border-0"
                            title="PDF Preview"
                        />
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">📄</div>
                            <p className="text-lg">{getFileName()}</p>
                            <p className="text-gray-500">Preview not available for this file type</p>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={() => onDownload(file)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;