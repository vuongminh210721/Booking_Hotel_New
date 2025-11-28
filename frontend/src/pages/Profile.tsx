import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, Camera, Save, ArrowLeft, MapPin, Award, Edit2, X, MapPinned, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
   const { user, uploadAvatar, updateProfile } = useAuth();
   const navigate = useNavigate();

   const [avatarFile, setAvatarFile] = useState<File | null>(null);
   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
   const [uploading, setUploading] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   // Form states
   const [formData, setFormData] = useState({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      hometown: user?.hometown || "",
      customerType: user?.customerType || "thường" as "thường" | "vip",
      address: user?.address || "",
      gender: user?.gender || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
   });

   // Reset form khi user thay đổi
   React.useEffect(() => {
      if (user) {
         setFormData({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            hometown: user.hometown || "",
            customerType: user.customerType,
            address: user.address || "",
            gender: user.gender || "",
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
         });
      }
   }, [user]);

   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
         setError("Chỉ chấp nhận file JPG, JPEG, PNG");
         return;
      }

      if (file.size > 5 * 1024 * 1024) {
         setError("File không được vượt quá 5MB");
         return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
   };

   const handleAvatarUpload = async () => {
      if (!avatarFile) return;

      setUploading(true);
      setError(null);
      setSuccess(null);

      try {
         await uploadAvatar(avatarFile);
         setSuccess("Cập nhật ảnh đại diện thành công!");
         setAvatarFile(null);
         setAvatarPreview(null);
      } catch (err: any) {
         setError(err.response?.data?.message || "Tải ảnh lên thất bại");
      } finally {
         setUploading(false);
      }
   };

   const handleSaveProfile = async () => {
      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
         await updateProfile({
            ...formData,
            gender: formData.gender as "Nam" | "Nữ" | "Khác" | undefined,
         });
         setSuccess("Cập nhật thông tin thành công!");
         setIsEditing(false);
      } catch (err: any) {
         setError(err.message || "Cập nhật thông tin thất bại");
      } finally {
         setSaving(false);
      }
   };

   const handleCancelEdit = () => {
      if (user) {
         setFormData({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            hometown: user.hometown || "",
            customerType: user.customerType,
            address: user.address || "",
            gender: user.gender || "",
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
         });
      }
      setIsEditing(false);
      setError(null);
   };

   const currentAvatar = avatarPreview || (user?.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : null);

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 py-12 px-4">
         <div className="max-w-6xl mx-auto">
            <button
               onClick={() => navigate("/")}
               className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
               <ArrowLeft className="w-5 h-5" />
               Quay lại trang chủ
            </button>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
               <div className="bg-gradient-to-r from-teal-600 to-green-600 px-8 py-10">
                  <h1 className="text-3xl font-bold text-white mb-2">Hồ sơ khách hàng</h1>
                  <p className="text-white/90">Quản lý thông tin cá nhân của bạn</p>
               </div>

               <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                     {/* Left: Avatar Section */}
                     <div className="md:col-span-1 flex flex-col items-center space-y-4">
                        <div className="relative">
                           <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-teal-500 shadow-xl">
                              {currentAvatar ? (
                                 <img
                                    src={currentAvatar}
                                    alt={user?.fullName}
                                    className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <div className="w-full h-full bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center">
                                    <User className="w-24 h-24 text-white" />
                                 </div>
                              )}
                           </div>
                           <button
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute bottom-2 right-2 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                           >
                              <Camera className="w-5 h-5" />
                           </button>
                           <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={handleAvatarChange}
                              className="hidden"
                           />
                        </div>

                        {avatarFile && (
                           <button
                              onClick={handleAvatarUpload}
                              disabled={uploading}
                              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                           >
                              <Save className="w-5 h-5" />
                              {uploading ? "Đang tải lên..." : "Lưu ảnh đại diện"}
                           </button>
                        )}

                        {/* Customer Type Badge */}
                        <div className="mt-4">
                           <div className={`px-4 py-2 rounded-full font-semibold text-sm ${user?.customerType === "vip"
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                              : "bg-gray-200 text-gray-700"
                              }`}>
                              <Award className="w-4 h-4 inline mr-2" />
                              Khách hàng {user?.customerType === "vip" ? "VIP" : "Thường"}
                           </div>
                        </div>
                     </div>

                     {/* Right: User Info */}
                     <div className="md:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="pb-4 border-b border-gray-200">
                           <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
                        </div>

                        {/* Messages */}
                        {error && (
                           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                              {error}
                           </div>
                        )}

                        {success && (
                           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                              {success}
                           </div>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-4">
                           {/* User ID (read-only) */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                 ID người dùng
                              </label>
                              <div className="relative">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User className="w-5 h-5" />
                                 </div>
                                 <input
                                    type="text"
                                    value={user?.id || ""}
                                    disabled
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-medium font-mono text-sm"
                                 />
                              </div>
                           </div>

                           {/* Full Name */}
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
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all disabled:bg-gray-50"
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
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all disabled:bg-gray-50"
                                 />
                              </div>
                           </div>

                           {/* Phone */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                 Số điện thoại
                              </label>
                              <div className="relative">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone className="w-5 h-5" />
                                 </div>
                                 <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all disabled:bg-gray-50"
                                 />
                              </div>
                           </div>

                           {/* Hometown */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                 Quê quán
                              </label>
                              <div className="relative">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                 </div>
                                 <input
                                    type="text"
                                    value={formData.hometown}
                                    onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                                    placeholder="Nhập quê quán của bạn"
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all disabled:bg-gray-50 placeholder-gray-400"
                                 />
                              </div>
                           </div>

                           {/* Address */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                 Địa chỉ
                              </label>
                              <div className="relative">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <MapPinned className="w-5 h-5" />
                                 </div>
                                 <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Nhập địa chỉ hiện tại của bạn"
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all disabled:bg-gray-50 placeholder-gray-400"
                                 />
                              </div>
                           </div>

                           {/* Gender */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                 Giới tính
                              </label>
                              <div className="relative">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Users className="w-5 h-5" />
                                 </div>
                                 <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all disabled:bg-gray-50 appearance-none cursor-pointer"
                                 >
                                    <option value="">Chọn giới tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                 </select>
                              </div>
                           </div>

                           {/* Date of Birth */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                 Ngày sinh
                              </label>
                              <div className="relative">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Calendar className="w-5 h-5" />
                                 </div>
                                 <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all disabled:bg-gray-50 cursor-pointer"
                                 />
                              </div>
                           </div>

                           {/* Customer Type */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                 Loại khách hàng
                              </label>
                              <div className="relative">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Award className="w-5 h-5" />
                                 </div>
                                 <select
                                    value={formData.customerType}
                                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as "thường" | "vip" })}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all disabled:bg-gray-50 appearance-none cursor-pointer"
                                 >
                                    <option value="thường">Khách hàng Thường</option>
                                    <option value="vip">Khách hàng VIP</option>
                                 </select>
                              </div>
                           </div>

                           {/* Booked Rooms */}
                           <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                 Phòng đã đặt
                              </label>
                              {user?.bookedRooms && user.bookedRooms.length > 0 ? (
                                 <div className="flex flex-wrap gap-2">
                                    {user.bookedRooms.map((room, index) => (
                                       <span
                                          key={index}
                                          className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg font-medium text-sm"
                                       >
                                          {room}
                                       </span>
                                    ))}
                                 </div>
                              ) : (
                                 <p className="text-gray-500 text-sm italic">Chưa có phòng nào được đặt</p>
                              )}
                           </div>
                        </div>

                        {/* Action Buttons - Fixed at bottom right */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                           {!isEditing ? (
                              <button
                                 onClick={() => setIsEditing(true)}
                                 className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-lg transition-all hover:scale-105"
                              >
                                 <Edit2 className="w-5 h-5" />
                                 Chỉnh sửa
                              </button>
                           ) : (
                              <>
                                 <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                                 >
                                    <X className="w-5 h-5" />
                                    Hủy
                                 </button>
                                 <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                 >
                                    <Save className="w-5 h-5" />
                                    {saving ? "Đang lưu..." : "Lưu"}
                                 </button>
                              </>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
