import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  File,
  FileText,
  FileSpreadsheet,
  Video,
  Music,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  Printer,
  RotateCw,
  Info,
  ExternalLink,
} from 'lucide-react';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FilePreviewModal = ({ fileUrl, fileName, onClose }) => {
  const [fileType, setFileType] = useState('unknown');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [fileSize, setFileSize] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [fileInfo, setFileInfo] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (fileName) {
      detectFileType(fileName);
      fetchFileInfo();
    }
  }, [fileName, fileUrl]);

  const detectFileType = (fileName) => {
    if (!fileName) return 'unknown';
    
    const extension = fileName.toLowerCase().split('.').pop();
    
    const fileTypes = {
      // Images
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
      'bmp': 'image', 'svg': 'image', 'webp': 'image', 'tiff': 'image', 'ico': 'image',
      
      // PDF
      'pdf': 'pdf',
      
      // Office Documents
      'doc': 'word', 'docx': 'word', 'dot': 'word', 'dotx': 'word',
      'xls': 'excel', 'xlsx': 'excel', 'xlsm': 'excel', 'xlt': 'excel',
      'ppt': 'powerpoint', 'pptx': 'powerpoint', 'pps': 'powerpoint', 'ppsx': 'powerpoint',
      'odt': 'opendocument', 'ods': 'opendocument', 'odp': 'opendocument',
      
      // Text files
      'txt': 'text', 'csv': 'text', 'json': 'text', 'xml': 'text',
      'html': 'text', 'htm': 'text', 'css': 'text', 'js': 'text', 'ts': 'text',
      'md': 'text', 'rtf': 'text', 'log': 'text',
      
      // Audio files
      'mp3': 'audio', 'wav': 'audio', 'ogg': 'audio', 'm4a': 'audio',
      'flac': 'audio', 'aac': 'audio', 'wma': 'audio', 'mid': 'audio', 'midi': 'audio',
      
      // Video files
      'mp4': 'video', 'avi': 'video', 'mov': 'video', 'mkv': 'video',
      'webm': 'video', 'flv': 'video', 'wmv': 'video', 'm4v': 'video',
      '3gp': 'video', 'mpeg': 'video', 'mpg': 'video',
      
      // Archive files
      'zip': 'archive', 'rar': 'archive', '7z': 'archive',
      'tar': 'archive', 'gz': 'archive', 'bz2': 'archive',
      
      // Other
      'exe': 'executable', 'dll': 'executable', 'msi': 'executable',
      'iso': 'diskimage', 'dmg': 'diskimage', 'apk': 'android',
    };
    
    setFileType(fileTypes[extension] || 'unknown');
  };

  const fetchFileInfo = async () => {
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      if (response.ok) {
        const size = response.headers.get('content-length');
        const type = response.headers.get('content-type');
        const lastModified = response.headers.get('last-modified');
        
        setFileInfo({
          size: size ? formatFileSize(size) : 'Unknown',
          type: type || 'Unknown',
          lastModified: lastModified || 'Unknown',
        });
      }
    } catch (err) {
      console.error('Error fetching file info:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const handlePreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
    setRotation(0);
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const printDocument = () => {
    window.print();
  };

  const openInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf': return <File className="h-6 w-6 text-red-500" />;
      case 'image': return <ImageIcon className="h-6 w-6 text-green-500" />;
      case 'word': return <FileText className="h-6 w-6 text-blue-500" />;
      case 'excel': return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
      case 'powerpoint': return <FileSpreadsheet className="h-6 w-6 text-orange-500" />;
      case 'video': return <Video className="h-6 w-6 text-purple-500" />;
      case 'audio': return <Music className="h-6 w-6 text-yellow-500" />;
      case 'text': return <FileText className="h-6 w-6 text-gray-500" />;
      case 'archive': return <File className="h-6 w-6 text-amber-500" />;
      default: return <File className="h-6 w-6 text-gray-400" />;
    }
  };

  const renderOfficeDocument = () => {
    // For Office documents, use Microsoft Office Online Viewer
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    
    return (
      <div className="w-full h-full">
        <iframe
          src={officeViewerUrl}
          className="w-full h-full border-0 rounded-lg"
          title={`${fileName} preview`}
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => setLoading(false)}
          onError={() => setError('Failed to load document')}
        />
      </div>
    );
  };

  const renderPDF = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading PDF...</span>
            </div>
          }
          className="pdf-container"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="pdf-page shadow-lg"
          />
        </Document>
        {numPages > 1 && (
          <div className="flex items-center justify-center mt-6 space-x-4 bg-gray-100 p-3 rounded-xl">
            <button
              onClick={handlePreviousPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded-lg bg-white hover:bg-gray-200 disabled:opacity-50 transition-colors shadow"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 rounded-lg bg-white hover:bg-gray-200 disabled:opacity-50 transition-colors shadow"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderImage = () => {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-xl"
            style={{ 
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
            onLoad={(e) => {
              setLoading(false);
              setDimensions({
                width: e.target.naturalWidth,
                height: e.target.naturalHeight
              });
            }}
            onError={() => setError('Failed to load image')}
          />
        </div>
      </div>
    );
  };

  const renderTextFile = () => {
    return (
      <div className="w-full h-full">
        <iframe
          src={fileUrl}
          className="w-full h-full border-0 rounded-lg bg-gray-50"
          title={fileName}
          sandbox="allow-same-origin"
          onLoad={() => setLoading(false)}
          onError={() => setError('Failed to load text file')}
        />
      </div>
    );
  };

  const renderAudio = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Music className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <audio 
            controls 
            className="w-full"
            onLoadedData={() => setLoading(false)}
            onError={() => setError('Failed to load audio')}
          >
            <source src={fileUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div className="mt-6 text-center">
            <p className="font-medium text-gray-800">{fileName}</p>
            {fileInfo && (
              <p className="text-sm text-gray-600 mt-1">
                {fileInfo.size} • {fileInfo.type}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVideo = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl">
          <video 
            controls 
            className="w-full"
            poster="/api/placeholder/800/450"
            onLoadedData={() => setLoading(false)}
            onError={() => setError('Failed to load video')}
          >
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="bg-gray-900 p-4">
            <p className="text-white font-medium">{fileName}</p>
            {fileInfo && (
              <p className="text-gray-400 text-sm mt-1">
                {fileInfo.size} • {dimensions.width}x{dimensions.height}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUnsupportedFile = () => {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg max-w-md">
          <File className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Preview Not Available
          </h3>
          <p className="text-gray-600 mb-6">
            This file type ({fileType}) cannot be previewed directly.
            Please download the file to view its contents.
          </p>
          <div className="space-y-3">
            <a
              href={fileUrl}
              download={fileName}
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Download className="mr-2" size={20} />
              Download File
            </a>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading preview...</p>
          <p className="text-sm text-gray-500 mt-2">{fileName}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-red-600 font-medium text-lg mb-2">Error Loading File</p>
          <p className="text-gray-600 text-center max-w-md">{error}</p>
          <button
            onClick={openInNewTab}
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <ExternalLink className="mr-2" size={18} />
            Open in New Tab
          </button>
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return renderPDF();
      case 'image':
        return renderImage();
      case 'word':
      case 'excel':
      case 'powerpoint':
      case 'opendocument':
        return renderOfficeDocument();
      case 'text':
        return renderTextFile();
      case 'audio':
        return renderAudio();
      case 'video':
        return renderVideo();
      default:
        return renderUnsupportedFile();
    }
  };

  const renderFileInfo = () => {
    if (!fileInfo) return null;
    
    return (
      <div className="bg-gray-50 p-3 rounded-lg mt-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Size:</span>
            <span className="ml-2 font-medium">{fileInfo.size}</span>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium">{fileInfo.type}</span>
          </div>
          {dimensions.width > 0 && (
            <div>
              <span className="text-gray-600">Dimensions:</span>
              <span className="ml-2 font-medium">{dimensions.width}×{dimensions.height}</span>
            </div>
          )}
          <div>
            <span className="text-gray-600">Pages:</span>
            <span className="ml-2 font-medium">
              {numPages ? `${numPages} pages` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${fullscreen ? 'p-0' : 'p-4'}`}
      ref={containerRef}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col ${fullscreen ? 'w-screen h-screen max-w-none max-h-none rounded-none' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center min-w-0 flex-1">
            <div className="mr-3 sm:mr-4">
              {getFileIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 
                className="text-lg sm:text-xl font-semibold text-gray-800 truncate" 
                title={fileName}
              >
                {fileName}
              </h3>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
                  {fileType}
                </span>
                {fileInfo && (
                  <span className="text-xs text-gray-500">
                    {fileInfo.size}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 ml-4">
            {/* File Info Button */}
            <button
              onClick={() => setFileInfo(prev => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="File Information"
            >
              <Info size={20} />
            </button>

            {/* Print Button */}
            {(fileType === 'pdf' || fileType === 'image' || fileType === 'text') && (
              <button
                onClick={printDocument}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Print"
              >
                <Printer size={20} />
              </button>
            )}

            {/* Rotation Button (for images) */}
            {fileType === 'image' && (
              <button
                onClick={rotateImage}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Rotate"
              >
                <RotateCw size={20} />
              </button>
            )}

            {/* Zoom Controls */}
            {(fileType === 'pdf' || fileType === 'image') && (
              <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={zoomOut}
                  className="p-2 rounded hover:bg-gray-200"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={resetZoom}
                  className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  onClick={zoomIn}
                  className="p-2 rounded hover:bg-gray-200"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {/* Download Button */}
            <a
              href={fileUrl}
              download={fileName}
              className="p-2 rounded-lg hover:bg-gray-100 text-blue-600 transition-colors"
              title="Download"
            >
              <Download size={20} />
            </a>

            {/* External Link */}
            <button
              onClick={openInNewTab}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink size={20} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {renderContent()}
          {fileInfo && renderFileInfo()}
        </div>

        {/* Mobile Controls */}
        {(fileType === 'pdf' || fileType === 'image') && (
          <div className="sm:hidden flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="flex items-center space-x-2">
              <button
                onClick={zoomOut}
                className="p-2 rounded-lg bg-white shadow"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <span className="font-medium text-gray-700">{Math.round(scale * 100)}%</span>
              <button
                onClick={zoomIn}
                className="p-2 rounded-lg bg-white shadow"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              {fileType === 'image' && (
                <button
                  onClick={rotateImage}
                  className="p-2 rounded-lg bg-white shadow ml-2"
                  title="Rotate"
                >
                  <RotateCw size={20} />
                </button>
              )}
            </div>
            {fileType === 'pdf' && numPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={pageNumber <= 1}
                  className="p-2 rounded-lg bg-white shadow disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium">
                  {pageNumber}/{numPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                  className="p-2 rounded-lg bg-white shadow disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreviewModal;