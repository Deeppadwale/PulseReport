
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useSendOtpMutation,
  useVerifyOtpMutation
} from "../../services/otpVerification";
import logo from "../../assets/DP 3.png";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

function OtpLoginPage() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const inputRefs = useRef([]);
  const mobileInputRef = useRef(null);

  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  useEffect(() => {
    if (!otpSent && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [otpSent]);
  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const normalizeMobile = num => num.replace(/\D/g, "").slice(-10);
  const isValidMobile = num => normalizeMobile(num).length === 10;

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(value);
  };

  const handleMobileKeyDown = (e) => {
    if (e.key === "Enter" && isValidMobile(mobile) && !sending) {
      handleSendOtp();
    }
  };

  const handleSendOtp = async () => {
    if (!isValidMobile(mobile)) return;
    try {
      await sendOtp({ mobile: normalizeMobile(mobile) }).unwrap();
      setOtpSent(true);
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      alert(err?.data?.detail || "OTP send failed");
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      setTimeout(() => inputRefs.current[5]?.focus(), 50);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Enter" && otp.join("").length === 6 && !verifying) {
      handleVerifyOtp();
    }
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;
    try {
      const res = await verifyOtp({
        mobile: normalizeMobile(mobile),
        otp_code: otpValue
      }).unwrap();
      sessionStorage.setItem("family_id", res.Family_id || "");
      sessionStorage.setItem("User_Name", res.User_Name || "");
      sessionStorage.setItem("User_Type", res.User_Type || "");
      sessionStorage.setItem("member_id", res.Member_id || "");
      sessionStorage.setItem("Family_Name", res.Family_Name || "");

      sessionStorage.setItem("mobile", normalizeMobile(mobile));
      navigate("/app/dashboard");
    } catch (error) {
      alert(error?.data?.detail || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#f0f2f5] flex flex-col items-center justify-center font-sans p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-[1040px] md:min-h-[500px] md:rounded-[28px] md:border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-none md:shadow-sm"
      >

        <div className="p-8 md:p-12 flex flex-col">
          <div >
            <img src={logo} alt="PulseReport" className="h-20 w-auto object-contain" />
          </div>

          <h1 className="text-[32px] md:text-[40px] font-normal text-[#1f1f1f] leading-tight mb-6">
            {otpSent ? "Verify it's you" : "Sign in"}
          </h1>
          <p className="text-base md:text-lg text-[#444] max-w-[400px]">
            {otpSent
              ? `A text message with a 6-digit verification code was just sent to +91 ${mobile}`
              : "with your PulseReport Account to continue to Dashboard."}
          </p>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div
                key="mobile-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="relative group pt-4">
                  <input
                    ref={mobileInputRef}
                    type="tel"
                    value={mobile}
                    onChange={handleMobileChange}
                    onKeyDown={handleMobileKeyDown}
                    placeholder=" "
                    className="peer w-full border border-gray-400 rounded-md px-4 py-4 text-lg focus:border-[#0b57d0] focus:border-2 outline-none transition-all placeholder-transparent"
                  />
                  <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-[#0b57d0] transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-600 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#0b57d0]">
                    Phone number
                  </label>
                </div>

                <div className="flex justify-end items-center gap-4 pt-10">
                  <button
                    onClick={handleSendOtp}
                    disabled={sending || mobile.length !== 10}
                    className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-8 py-2.5 rounded-full font-semibold transition shadow-sm disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {sending ? "Sending..." : "Next"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => (inputRefs.current[index] = el)}
                      value={digit}
                      maxLength={1}
                      inputMode="numeric"
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-full h-14 border border-gray-400 rounded-md text-center text-2xl focus:border-[#0b57d0] focus:border-2 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center pt-6">
                  <button
                    onClick={() => setOtpSent(false)}
                    className="text-[#0b57d0] font-semibold hover:underline text-sm"
                  >

                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={verifying || otp.join("").length !== 6}
                    className="bg-[#0b57d0] hover:bg-[#0842a0] text-white px-8 py-2.5 rounded-full font-semibold transition disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {verifying ? "Checking..." : "Next"}
                  </button>
                </div>

                <div className="text-sm">
                  {timer > 0 ? (
                    <span className="text-gray-500 italic">Resend code in {timer}s</span>
                  ) : (
                    <button onClick={handleSendOtp} className="text-[#0b57d0] font-bold">Resend code</button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default OtpLoginPage;