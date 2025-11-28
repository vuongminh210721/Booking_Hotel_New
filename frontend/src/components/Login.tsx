import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function Login() {
   useScrollToTop();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const { login } = useAuth();

   const validate = () => {
      if (!email.trim()) return "Vui lòng nhập email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ.";
      if (!password) return "Vui lòng nhập mật khẩu.";
      return null;
   };

   const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const v = validate();
      if (v) return setError(v);

      setLoading(true);
      try {
         await login(email, password);

         // Check if user came from booking flow
         const redirect = searchParams.get("redirect");
         const action = searchParams.get("action");

         if (action === "openBooking") {
            // Navigate to redirect page first
            if (redirect) {
               navigate(redirect);
            } else {
               navigate("/");
            }

            // After navigation, dispatch openBooking event to open modal
            // Use setTimeout to ensure page has loaded and Booking_Home component is ready
            setTimeout(() => {
               try {
                  const pendingBooking = sessionStorage.getItem("pendingBooking");
                  if (pendingBooking) {
                     const intent = JSON.parse(pendingBooking);
                     console.log("Dispatching openBooking event with intent:", intent);
                     window.dispatchEvent(
                        new CustomEvent("openBooking", {
                           detail: intent
                        })
                     );
                     // Don't remove here - let Booking_Home handle it
                  }
               } catch (err) {
                  console.error("Failed to resume booking:", err);
               }
            }, 500); // Increase timeout to ensure component is mounted
         } else if (redirect) {
            navigate(redirect);
         } else {
            navigate("/");
         }
      } catch (err: any) {
         setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 flex items-center justify-center px-4 py-12">
         {/* Decorative blur */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
         </div>

         <div className="relative z-10 w-full max-w-md">
            {/* Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
               {/* Header gradient */}
               <div className="bg-gradient-to-r from-teal-600 to-green-600 px-8 py-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                     <LogIn className="w-9 h-9 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại!</h2>
                  <p className="text-white/90 text-sm">Đăng nhập để tiếp tục trải nghiệm</p>
               </div>

               {/* Form */}
               <div className="p-8 space-y-6">
                  {error && (
                     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                        {error}
                     </div>
                  )}

                  <form onSubmit={submit} className="space-y-6">
                     {/* Email */}
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Email
                        </label>
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              <Mail className="w-5 h-5" />
                           </div>
                           <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="email@example.com"
                              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 font-medium text-gray-900 placeholder-gray-400"
                           />
                        </div>
                     </div>

                     {/* Password */}
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Mật khẩu
                        </label>
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              <Lock className="w-5 h-5" />
                           </div>
                           <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 font-medium text-gray-900 placeholder-gray-400"
                           />
                        </div>
                     </div>

                     {/* Submit Button */}
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-bold py-5 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                     >
                        <LogIn className="w-6 h-6" />
                        {loading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
                     </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                     <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                     </div>
                     <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-500 font-medium">Hoặc</span>
                     </div>
                  </div>

                  {/* Register link */}
                  <div className="text-center">
                     <p className="text-gray-600 text-sm">
                        Chưa có tài khoản?{" "}
                        <Link
                           to="/register"
                           className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-all"
                        >
                           Đăng ký miễn phí
                        </Link>
                     </p>
                  </div>
               </div>
            </div>

            {/* Footer text */}
            <p className="text-center text-gray-500 text-xs mt-8">
               © 2025 M Village Resort. Trải nghiệm nghỉ dưỡng đẳng cấp.
            </p>
         </div>
      </div>
   );
}