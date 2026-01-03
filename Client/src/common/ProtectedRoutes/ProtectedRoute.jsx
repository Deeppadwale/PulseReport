// import { Navigate, useLocation } from 'react-router-dom';
// import { decryptData } from "../../common/Functions/DecryptData"

// const ProtectedRoute = ({ children }) => {
//   const location = useLocation();
//   const encryptedToken = sessionStorage.getItem('access_token');
//   let isAuthenticated = false;

//   if (encryptedToken) {
//     try {
//       const token = decryptData(encryptedToken);
//       isAuthenticated = !!token;
//     } catch (error) {
//       console.error('Token validation error:', error);
//       isAuthenticated = false;
//     }
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/" state={{ from: location }} replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;


// import { Navigate, useLocation } from "react-router-dom";
// import { useGetCurrentUserQuery } from "../../services/userMasterApi";

// const ProtectedRoute = ({ children }) => {
//   const location = useLocation();

  
//   const { data: user, isLoading, isError } = useGetCurrentUserQuery();

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen text-gray-500">
//         Checking authentication...
//       </div>
//     );
//   }

//   //  If API says not authenticated
//   if (isError || !user) {
//     return <Navigate to="/" state={{ from: location }} replace />;
//   }

//   //  If authenticated
//   return children;
// };

// export default ProtectedRoute;


import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const familyId = sessionStorage.getItem("family_id");

  if (!familyId) {
    return <Navigate to="/" replace />;
  }

  return children;
}
