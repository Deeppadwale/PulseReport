import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../../services/familyMasterApi";
import { 
  LockClosedIcon, 
  UserIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";


function FamilyMasterLogin() {
  const navigate = useNavigate();
  const [User_Name, setUserName] = useState("");
  const [User_Password, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ User_Name, User_Password }).unwrap();
      sessionStorage.setItem("family_id", res.user_id);
      sessionStorage.setItem("user_name", User_Name); 
      navigate("/app/familyMaster");
    } catch {
      alert("Invalid username or password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-sky-100 to-teal-100 rounded-full blur-3xl opacity-40 animate-pulse delay-500"></div>
      </div>

      {/* Geometric Patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-8 h-8 border-2 border-blue-200 rounded-lg rotate-45"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 border-2 border-indigo-200 rounded-full"></div>
        <div className="absolute top-1/3 right-20 w-6 h-6 border-2 border-cyan-200 rotate-12"></div>
        <div className="absolute bottom-1/3 left-20 w-10 h-10 border-2 border-purple-200 rounded-lg rotate-12"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Back Button */}
        {/* <button
          onClick={() => navigate("/")}
          className="absolute -top-16 left-0 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to OTP Login</span>
        </button> */}

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo/Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <BuildingLibraryIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Master Admin 
            </h1>
           
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
            
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={User_Name}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50/50 border-2 border-slate-200 rounded-xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <LockClosedIcon className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={User_Password}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border-2 border-slate-200 rounded-xl p-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300"
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <LockClosedIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-slate-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !User_Name || !User_Password}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            
          </div>
        </div>

      </div>
      
    </div>
  );
}

export default FamilyMasterLogin;