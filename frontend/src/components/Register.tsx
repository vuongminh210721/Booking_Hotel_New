import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, CheckCircle, Sparkles, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function Register() {
   useScrollToTop();
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirm, setConfirm] = useState("");
   const [phone, setPhone] = useState("");
   const [avatarFile, setAvatarFile] = useState<File | null>(null);
   const [avatarPreview, setAvatarPreview] = useState<string>("");
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const { register, uploadAvatar } = useAuth();

   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         if (file.size > 5 * 1024 * 1024) {
            setError("Kích thước ảnh không được vượt quá 5MB");
            return;
         }
         setAvatarFile(file);
         const reader = new FileReader();
         reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   const validate = () => {
      if (!fullName.trim()) return "Vui lòng nhập họ và tên.";
      if (!email.trim()) return "Vui lòng nhập email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ.";
      if (!phone.trim()) return "Vui lòng nhập số điện thoại.";
      if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
      if (password !== confirm) return "Mật khẩu nhập lại không khớp.";
      return null;
   };

   const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const v = validate();
      if (v) return setError(v);

      setLoading(true);
      setSuccess(null);
      try {
         // Đăng ký tài khoản
         await register({ fullName, email, password, phone });

         console.log("✅ Registration successful");

         // Upload avatar nếu có
         if (avatarFile) {
            try {
               console.log("📤 Uploading avatar...");
               const result = await uploadAvatar(avatarFile);
               console.log("✅ Avatar uploaded successfully:", result);
            } catch (avatarError) {
               console.error("❌ Avatar upload failed:", avatarError);
               // Không block registration nếu upload avatar fail
            }
         }

         setSuccess("Đăng ký thành công! Đang chuyển hướng...");

         // Chờ một chút để đảm bảo state đã được cập nhật
         setTimeout(() => {
            navigate("/");
         }, 1000);
      } catch (err: any) {
         setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 flex items-center justify-center px-4 py-12">
         {/* Blur bokeh trang trí */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
         </div>

         <div className="relative z-10 w-full max-w-lg">
            {/* Card chính */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
               {/* Header gradient */}
               <div className="bg-gradient-to-r from-teal-600 to-green-600 px-8 py-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                     <Sparkles className="w-9 h-9 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Tạo tài khoản mới</h2>
                  <p className="text-white/90 text-sm">Tham gia cùng chúng tôi ngay hôm nay!</p>
               </div>

               {/* Form */}
               <div className="p-8 space-y-6">
                  {error && (
                     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span>⚠</span> {error}
                     </div>
                  )}

                  {success && (
                     <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> {success}
                     </div>
                  )}

                  <form onSubmit={submit} className="space-y-6">
                     {/* Avatar Upload */}
                     <div className="flex flex-col items-center">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                           Ảnh đại diện (không bắt buộc)
                        </label>
                        <div className="relative">
                           <div className="w-32 h-32 rounded-full border-4 border-teal-500 overflow-hidden bg-gray-100 flex items-center justify-center">
                              {avatarPreview ? (
                                 <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <User className="w-16 h-16 text-gray-400" />
                              )}
                           </div>
                           <label className="absolute bottom-0 right-0 bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110">
                              <Camera className="w-5 h-5" />
                              <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleAvatarChange}
                                 className="hidden"
                              />
                           </label>
                        </div>
                     </div>

                     {/* Họ và tên */}
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Họ và tên
                        </label>
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              <User className="w-5 h-5" />
                           </div>
                           <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Nguyễn Văn A"
                              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 font-medium text-gray-900 placeholder-gray-400"
                           />
                        </div>
                     </div>

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

                     {/* Số điện thoại */}
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Số điện thoại
                        </label>
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              <User className="w-5 h-5" />
                           </div>
                           <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="0912345678"
                              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 font-medium text-gray-900 placeholder-gray-400"
                           />
                        </div>
                     </div>

                     {/* Mật khẩu & Nhập lại */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                        <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nhập lại mật khẩu
                           </label>
                           <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                 <CheckCircle className="w-5 h-5" />
                              </div>
                              <input
                                 type="password"
                                 value={confirm}
                                 onChange={(e) => setConfirm(e.target.value)}
                                 placeholder="••••••••"
                                 className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 font-medium text-gray-900 placeholder-gray-400"
                              />
                           </div>
                        </div>
                     </div>

                     {/* Nút tạo tài khoản */}
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-bold py-5 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                     >
                        {loading ? (
                           <>
                              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                              Đang xử lý...
                           </>
                        ) : (
                           <>
                              <CheckCircle className="w-6 h-6" />
                              Tạo tài khoản ngay
                           </>
                        )}
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

                  {/* Đăng nhập */}
                  <div className="text-center">
                     <p className="text-gray-600 text-sm">
                        Đã có tài khoản?{" "}
                        <Link
                           to="/login"
                           className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-all"
                        >
                           Đăng nhập ngay
                        </Link>
                     </p>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-500 text-xs mt-8">
               © 2025 M Village Resort • Trải nghiệm nghỉ dưỡng 5 sao
            </p>
         </div>
      </div>
   );
}