// import React, { useEffect, useRef } from 'react';

// const Modal = ({ isOpen, onClose, title, children, size = 'md', width }) => {
//   const modalRef = useRef(null);
  
//   const sizeClasses = {
//     sm: 'max-w-sm',
//     md: 'max-w-md',
//     lg: 'max-w-lg',
//     xl: 'max-w-xl',
//     '2xl': 'max-w-2xl',
//     full: 'w-full max-w-full',
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     };

//     const handleEscape = (event) => {
//       if (event.key === 'Escape') {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       document.addEventListener('keydown', handleEscape);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', handleEscape);
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200 p-4">
//       <div 
//         ref={modalRef}
//         style={width ? { width } : {}}
//         className={`bg-white rounded-lg shadow-xl ${
//           width ? '' : sizeClasses[size] || 'max-w-md'
//         } w-full`}
//       >
//         <div className="flex justify-between items-center p-6 pb-2 border-b">
//           <h3 className="text-lg font-medium text-gray-900">{title}</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
//             aria-label="Close modal"
//           >
//             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
        
//         <div className="p-6 max-h-[80vh] overflow-y-auto">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Modal;











// import React, { useEffect, useRef } from 'react';

// const Modal = ({ 
//   isOpen, 
//   onClose, 
//   title, 
//   children, 
//   size = 'md', 
//   width, 
//   headerRight, 
//   createdBy,
//   modifiedBy, 
// }) => {
//   const modalRef = useRef(null);

//   const sizeClasses = {
//     sm: 'max-w-sm',
//     md: 'max-w-md',
//     lg: 'max-w-lg',
//     xl: 'max-w-xl',
//     '2xl': 'max-w-2xl',
//     full: 'w-full max-w-full',
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     };

//     const handleEscape = (event) => {
//       if (event.key === 'Escape') {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       document.addEventListener('keydown', handleEscape);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', handleEscape);
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200 p-4">
//       <div 
//         ref={modalRef}
//         style={width ? { width } : {}}
//         className={`bg-white rounded-lg shadow-xl ${
//           width ? '' : sizeClasses[size] || 'max-w-md'
//         } w-full`}
//       >
//         <div className="flex justify-between items-center p-6 pb-2 border-b">
//           <h3 className="text-lg font-medium text-gray-900">{title}</h3>
//           <div className="flex items-center space-x-4">
//             {/* Conditional rendering for Created By and Modified By */}
//             {(createdBy || modifiedBy) && (
//               <div className="text-sm text-gray-500 flex space-x-4">
//                 {createdBy && (
//                   <div>
//                     <span className="font-semibold">Created by:</span> {createdBy}
//                   </div>
//                 )}
//                 {modifiedBy && (
//                   <div>
//                     <span className="font-semibold">Modified by:</span> {modifiedBy}
//                   </div>
//                 )}
//               </div>
//             )}
//             {headerRight && (
//               <div className="text-sm text-gray-500">
//                 {headerRight}
//               </div>
//             )}
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
//               aria-label="Close modal"
//             >
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         </div>
        
//         <div className="p-6 max-h-[80vh] overflow-y-auto">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Modal;


















import React, { useEffect, useRef, useState } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  width, 
  headerRight, 
  createdBy, 
  modifiedBy,
}) => {
  const modalRef = useRef(null);
  const [showDetails, setShowDetails] = useState(false);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'w-full max-w-full',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200 p-4">
      <div 
        ref={modalRef}
        style={width ? { width } : {}}
        className={`bg-white rounded-lg shadow-xl ${
          width ? '' : sizeClasses[size] || 'max-w-md'
        } w-full`}
      >
        <div className="flex justify-between items-center p-6 pb-2 border-b">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-center space-x-4">
            {(createdBy || modifiedBy) && (
              <div className="relative">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label="Show details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Details
                </button>
                
                {showDetails && (
                  <div className="absolute right-0 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="text-xs font-semibold text-gray-500 mb-2">DOCUMENT INFO</div>
                    
                    {createdBy && (
                      <div className="mb-2">
                        <div className="flex items-center text-xs text-gray-400 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          CREATED BY
                        </div>
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-semibold text-blue-600">
                              {createdBy.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{createdBy}</span>
                        </div>
                      </div>
                    )}
                    
                    {modifiedBy && (
                      <div>
                        <div className="flex items-center text-xs text-gray-400 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          MODIFIED BY
                        </div>
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-semibold text-purple-600">
                              {modifiedBy.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{modifiedBy}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-0 right-0 mt-2 mr-2">
                      <button 
                        onClick={() => setShowDetails(false)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close details"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {headerRight && (
              <div className="text-sm text-gray-500">
                {headerRight}
              </div>
            )}
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;



