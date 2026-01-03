
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useMemo } from "react";
// import routes from "./components/routesConfig";
// import Navbar from "./common/layout/navbar";


// // Layout that uses the config to conditionally hide navbar
// function LayoutWithNavbar() {
//   const location = useLocation();

//   const hideNavbar = useMemo(() => {
//     const route = routes.find((r) => r.path === location.pathname);
//     return route?.hideNavbar || false;
//   }, [location.pathname]);

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       {!hideNavbar && <Navbar />}
//       <main className="flex-1 overflow-y-auto p-6">
//         <Routes>
//           {routes
//             .filter((r) => r.path.startsWith("/app/"))
//             .map((route, i) => (
//               <Route key={i} path={route.path.replace("/app", "")} element={<route.element />} />
//             ))}
//           {/* Default inside /app */}
//           <Route path="/" element={<Navigate to="company_list" />} />
//           <Route path="*" element={<Navigate to="usermaster" />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         {routes
//           .filter((r) => !r.path.startsWith("/app/"))
//           .map((route, i) => (
//             <Route key={i} path={route.path} element={<route.element />} />
//           ))}

//         {/* App routes with navbar */}
//         <Route path="/app/*" element={<LayoutWithNavbar />} />

//         {/* Catch-all */}
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./Pages/Login/Login";
// import MainLayout from "./common/layout/mainlayout";
// import ProtectedRoute from "./common/ProtectedRoutes/ProtectedRoute";
// import OtpLoginPage from "./Pages/Login/otpLogin";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public Route */}
//         <Route path="/" element={<OtpLoginPage />} />

//         {/* Protected Routes */}
//         <Route
//           path="/app/*"
//           element={
//             <ProtectedRoute>
//               <MainLayout />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }
// export default App;






import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useMemo } from "react";
import routes from "./components/routesConfig";
import Navbar from "./common/layout/navbar";
import ProtectedRoute from "./common/ProtectedRoutes/ProtectedRoute";

// Layout with Navbar
function LayoutWithNavbar() {
  const location = useLocation();

  const hideNavbar = useMemo(() => {
    const current = routes.find((r) => r.path === location.pathname);
    return current?.hideNavbar || false;
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {!hideNavbar && <Navbar />}

      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          {routes
            .filter((r) => r.path.startsWith("/app/"))
            .map((route, i) => (
              <Route
                key={i}
                path={route.path.replace("/app", "")}
                element={
                  <ProtectedRoute>
                    <route.element />
                  </ProtectedRoute>
                }
              />
            ))}

          {/* Default after login */}
          <Route path="/" element={<Navigate to="member-list" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        {routes
          .filter((r) => !r.path.startsWith("/app/"))
          .map((route, i) => (
            <Route key={i} path={route.path} element={<route.element />} />
          ))}

        {/* APP */}
        <Route path="/app/*" element={<LayoutWithNavbar />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
