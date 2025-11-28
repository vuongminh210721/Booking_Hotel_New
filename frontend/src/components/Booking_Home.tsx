import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, User, Mail, Phone, Calendar, Users, Hotel, CheckCircle, Sparkles, CreditCard, Banknote, Wallet } from "lucide-react";
import qrImage from "@/assets/Screenshot 2025-11-26 223920.png";

// Định nghĩa loại phòng với giá tiền
const ROOM_TYPES = {
   "Phòng cơ bản": { price: 850000, description: "Phòng tiêu chuẩn với tiện nghi cơ bản" },
   "Phòng trung cấp": { price: 1500000, description: "Phòng rộng rãi với tiện nghi đầy đủ" },
   "Phòng cao cấp": { price: 3500000, description: "Phòng sang trọng với view đẹp và tiện nghi 5 sao" },
};

export default function Booking_Home() {
   const [showBooking, setShowBooking] = useState(false);
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [roomType, setRoomType] = useState<keyof typeof ROOM_TYPES>("Phòng trung cấp");
   const [roomPrice, setRoomPrice] = useState<string>("");
   const [checkIn, setCheckIn] = useState("");
   const [checkOut, setCheckOut] = useState("");
   const [guests, setGuests] = useState<number>(2);
   const [status, setStatus] = useState<"idle" | "sending" | "success" | "payment" | "error">("idle");
   const [error, setError] = useState<string | null>(null);
   const [paymentMethod, setPaymentMethod] = useState<"deposit" | "full">("deposit");

   // Auth + navigation
   const navigate = useNavigate();
   const { user, isAuthenticated } = useAuth();

   // Debug: Log khi component mount
   useEffect(() => {
      console.log("🏨 Booking_Home component mounted");
      console.log("🔐 isAuthenticated:", isAuthenticated);
      console.log("👤 user:", user);
      return () => {
         console.log("🏨 Booking_Home component unmounted");
      };
   }, []);

   useEffect(() => {
      const handleOpenBooking = (e: any) => {
         const detail = (e && e.detail) || {};
         console.log("🎉 openBooking event received:", detail);
         console.log("🔐 Current auth state:", { isAuthenticated, user: user?.fullName });

         // Parse guests from string format "2 người" to number
         let guestsNumber = guests;
         if (detail.guests) {
            if (typeof detail.guests === 'string') {
               const parsed = parseInt(detail.guests.split(" ")[0], 10);
               guestsNumber = isNaN(parsed) ? guests : parsed;
            } else if (typeof detail.guests === 'number') {
               guestsNumber = detail.guests;
            }
         }

         // Save intended booking details so we can resume after login
         const intent = {
            roomName: String(detail.roomName || roomType),
            price: String(detail.price || roomPrice || ""),
            guests: guestsNumber,
            checkIn: String(detail.checkIn || checkIn),
            checkOut: String(detail.checkOut || checkOut),
         };

         console.log("📋 Booking intent:", intent);

         if (!isAuthenticated) {
            console.log("❌ User not authenticated, saving to sessionStorage and redirecting to login");
            try {
               sessionStorage.setItem("pendingBooking", JSON.stringify(intent));
            } catch { }
            // Redirect to login with redirect back to current page
            const currentPath = window.location.pathname + window.location.search;
            navigate(`/login?redirect=${encodeURIComponent(currentPath)}&action=openBooking`);
            return;
         }

         console.log("✅ User authenticated, opening booking modal with intent:", intent);

         // Prefill user info
         if (user?.fullName) setFullName(user.fullName);
         if (user?.email) setEmail(user.email);
         if (user?.phone) setPhone(user.phone);

         // Prefill booking info from intent
         if (intent.roomName) {
            // Check if roomName matches a key in ROOM_TYPES
            if (intent.roomName in ROOM_TYPES) {
               setRoomType(intent.roomName as keyof typeof ROOM_TYPES);
               // If no price provided, use the default price from ROOM_TYPES
               if (!intent.price) {
                  setRoomPrice(""); // Empty means use ROOM_TYPES price
               }
            }
         }
         if (intent.price) setRoomPrice(intent.price);
         if (intent.guests) setGuests(intent.guests);
         if (intent.checkIn) setCheckIn(intent.checkIn);
         if (intent.checkOut) setCheckOut(intent.checkOut);

         // Clear pending booking after using it
         try {
            sessionStorage.removeItem("pendingBooking");
         } catch { }

         console.log("🚀 Setting showBooking to true");
         setShowBooking(true);
      };

      console.log("📡 Registering openBooking event listener");
      window.addEventListener("openBooking", handleOpenBooking as EventListener);
      return () => {
         console.log("📡 Removing openBooking event listener");
         window.removeEventListener("openBooking", handleOpenBooking as EventListener);
      };
   }, [isAuthenticated, navigate, roomType, roomPrice, guests, checkIn, checkOut, user]);

   // After login: if there is a pending booking intent, resume and prefill user info
   useEffect(() => {
      if (isAuthenticated && user) {
         console.log("✅ User authenticated, prefilling user info");
         // Always prefill user info when authenticated
         if (user.fullName) setFullName(user.fullName);
         if (user.email) setEmail(user.email);
         if (user.phone) setPhone(user.phone);

         // Check if there's a pending booking that wasn't handled by the event
         // This is a backup mechanism
         setTimeout(() => {
            try {
               const raw = sessionStorage.getItem("pendingBooking");
               if (raw) {
                  console.log("📦 Found pending booking in backup check:", raw);
                  const intent = JSON.parse(raw);
                  // Validate and set room type
                  if (intent.roomName && intent.roomName in ROOM_TYPES) {
                     setRoomType(String(intent.roomName) as keyof typeof ROOM_TYPES);
                  }
                  if (intent.price) setRoomPrice(String(intent.price));
                  if (intent.guests) {
                     // Parse guests if it's a string
                     if (typeof intent.guests === 'string') {
                        const parsed = parseInt(intent.guests.split(" ")[0], 10);
                        setGuests(isNaN(parsed) ? 2 : parsed);
                     } else {
                        setGuests(Number(intent.guests));
                     }
                  }
                  if (intent.checkIn) setCheckIn(String(intent.checkIn));
                  if (intent.checkOut) setCheckOut(String(intent.checkOut));
                  setShowBooking(true);
                  sessionStorage.removeItem("pendingBooking");
               }
            } catch (e) {
               console.error("Error processing pending booking:", e);
            }
         }, 100);
      }
   }, [isAuthenticated, user]);

   const resetForm = () => {
      setFullName("");
      setEmail("");
      setPhone("");
      setRoomType("Phòng trung cấp");
      setRoomPrice("");
      setCheckIn("");
      setCheckOut("");
      setGuests(2);
      setError(null);
      setStatus("idle");
      setPaymentMethod("deposit");
   };

   // Tính toán số tiền
   const calculateTotalPrice = () => {
      let price = 0;
      if (roomPrice) {
         // Nếu có giá từ phòng cụ thể
         price = parseFloat(roomPrice.replace(/\./g, ""));
      } else if (ROOM_TYPES[roomType]) {
         // Nếu chọn loại phòng chuẩn
         price = ROOM_TYPES[roomType].price;
      }

      // Tính số đêm
      if (checkIn && checkOut) {
         const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
         price = price * nights;
      }

      return price;
   };

   const formatPrice = (price: number) => {
      return new Intl.NumberFormat('vi-VN').format(price);
   };

   const totalPrice = calculateTotalPrice();
   const depositPrice = Math.round(totalPrice * 0.3);

   const validateBooking = () => {
      if (!fullName.trim()) return "Vui lòng nhập họ tên.";
      if (!email.trim()) return "Vui lòng nhập email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ.";
      if (!phone.trim()) return "Vui lòng nhập số điện thoại.";
      if (!checkIn || !checkOut) return "Vui lòng chọn ngày nhận/trả phòng.";

      // Kiểm tra ngày nhận phòng phải từ hôm nay trở đi
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const checkInDate = new Date(checkIn);
      checkInDate.setHours(0, 0, 0, 0);

      if (checkInDate < today) return "Ngày nhận phòng không hợp lệ (phải bắt đầu từ ngày hôm nay).";

      // Kiểm tra ngày nhận và trả phòng không được giống nhau
      const checkOutDate = new Date(checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      if (checkInDate.getTime() === checkOutDate.getTime()) {
         return "Ngày nhận phòng và trả phòng không thể cùng ngày. Vui lòng chọn ít nhất 1 đêm.";
      }

      if (new Date(checkIn) > new Date(checkOut)) return "Ngày trả phải sau ngày nhận.";
      return null;
   };

   const handleBookingSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      // Auth guard: if not logged in, redirect to login and preserve current form state
      if (!isAuthenticated) {
         try {
            const pending = {
               roomName: roomType,
               guests,
               checkIn,
               checkOut,
               fullName,
               email,
               phone,
            };
            sessionStorage.setItem("pendingBooking", JSON.stringify(pending));
         } catch { }
         const currentPath = window.location.pathname + window.location.search;
         navigate(`/login?redirect=${encodeURIComponent(currentPath)}&action=openBooking`);
         return;
      }
      const v = validateBooking();
      if (v) {
         setError(v);
         return;
      }
      setStatus("sending");
      try {
         await new Promise((res) => setTimeout(res, 800));
         // Chuyển thẳng đến trang thanh toán
         setStatus("payment");
      } catch (err) {
         setStatus("error");
         setError("Gửi đặt phòng thất bại, vui lòng thử lại.");
      }
   };

   const handleFinalClose = () => {
      setShowBooking(false);
      resetForm();
   };

   const handleCompletePayment = async () => {
      try {
         // Lấy giá phòng
         const pricePerNight = roomPrice
            ? parseFloat(roomPrice.replace(/\./g, ""))
            : (ROOM_TYPES[roomType]?.price || 0);

         // Gọi API để lưu booking
         const response = await fetch("http://localhost:5000/api/bookings", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
               roomType,
               roomPrice: pricePerNight.toString(),
               fullName,
               email,
               phone,
               checkIn,
               checkOut,
               guests,
               paymentMethod,
            }),
         });

         if (response.ok) {
            console.log("✅ Booking saved successfully");
            setStatus("success");
         } else {
            const error = await response.json();
            console.error("❌ Booking save failed:", error);
            alert("Lưu đặt phòng thất bại: " + (error.message || "Lỗi không xác định"));
         }
      } catch (error) {
         console.error("❌ Error saving booking:", error);
         alert("Có lỗi xảy ra khi lưu đặt phòng");
      }
   };

   if (!showBooking) return null;

   return createPortal(
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
         <div className="min-h-screen px-4 py-6 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleFinalClose} />

            {/* Decorative blur */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-20 left-10 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl animate-pulse"></div>
               <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Modal */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl transform transition-all max-w-4xl w-full mx-auto relative z-10 overflow-hidden border border-gray-100">
               <div className="bg-gradient-to-r from-teal-500 to-green-500 px-8 py-6 relative">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="bg-white/25 backdrop-blur-sm p-3 rounded-xl">
                           <Hotel className="w-6 h-6 text-white" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                              {status === "payment" ? "Thanh toán đặt phòng" : "Đặt phòng ngay"}
                              {status !== "payment" && <Sparkles className="w-5 h-5 text-amber-200" />}
                           </h3>
                           <p className="text-white/80 text-sm">
                              {status === "payment" ? "Hoàn tất thanh toán an toàn" : "Trải nghiệm sang trọng đang chờ bạn"}
                           </p>
                        </div>
                     </div>
                     <button onClick={handleFinalClose} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 hover:rotate-90">
                        <X className="w-6 h-6" />
                     </button>
                  </div>
               </div>

               {/* SUCCESS */}
               {status === "success" && (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                     <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-full mb-6 animate-bounce shadow-xl">
                        <CheckCircle className="w-20 h-20 text-white" />
                     </div>
                     <h3 className="text-4xl font-bold text-gray-800 mb-4">Đặt phòng thành công!</h3>
                     <p className="text-gray-600 text-lg mb-2">Cảm ơn quý khách đã tin tưởng.</p>
                     <p className="text-gray-500 mb-6">Xác nhận đã được gửi qua email.</p>
                  </div>
               )}

               {/* PAYMENT */}
               {status === "payment" && (
                  <div className="p-8">
                     <div className="space-y-6">
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                           <h4 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đặt phòng</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div><span className="font-medium text-gray-600">Khách:</span> <strong>{fullName}</strong></div>
                              <div><span className="font-medium text-gray-600">Phòng:</span> <strong>{roomType}</strong></div>
                              <div><span className="font-medium text-gray-600">Nhận:</span> <strong>{checkIn ? new Date(checkIn).toLocaleDateString("vi-VN") : ""}</strong></div>
                              <div><span className="font-medium text-gray-600">Trả:</span> <strong>{checkOut ? new Date(checkOut).toLocaleDateString("vi-VN") : ""}</strong></div>
                              <div><span className="font-medium text-gray-600">Số khách:</span> <strong>{guests} người</strong></div>
                              <div><span className="font-medium text-gray-600">Số đêm:</span> <strong>{checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) : 1} đêm</strong></div>
                           </div>
                           <div className="mt-4 pt-4 border-t border-gray-300">
                              <div className="flex justify-between items-center">
                                 <span className="font-semibold text-gray-700">Tổng tiền:</span>
                                 <strong className="text-2xl text-teal-600">{formatPrice(totalPrice)} ₫</strong>
                              </div>
                           </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                           <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Chính sách đặt phòng
                           </h4>
                           <ul className="text-xs text-blue-800 space-y-1.5">
                              <li>• Nhận phòng: 8:00 | Trả phòng: 8:00</li>
                              <li>• Hủy miễn phí trước 24h check-in</li>
                              <li>• Hủy sau 24h: giữ 30% tiền cọc</li>
                              <li>• Xuất hóa đơn VAT theo yêu cầu</li>
                              <li>• Thanh toán bằng tiền mặt hoặc chuyển khoản</li>
                           </ul>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-slate-600" /> Hình thức thanh toán</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-sm ${paymentMethod === "deposit" ? "border-teal-500 bg-teal-50" : "border-gray-300"
                                 }`}>
                                 <input type="radio" name="pay" value="deposit" checked={paymentMethod === "deposit"} onChange={() => setPaymentMethod("deposit")} className="w-5 h-5 text-teal-600" />
                                 <div className="ml-3">
                                    <p className="font-bold text-gray-800">Đặt cọc 30%</p>
                                    <p className="text-sm text-gray-600">{formatPrice(depositPrice)} ₫</p>
                                 </div>
                              </label>
                              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-sm ${paymentMethod === "full" ? "border-teal-500 bg-teal-50" : "border-gray-300"
                                 }`}>
                                 <input type="radio" name="pay" value="full" checked={paymentMethod === "full"} onChange={() => setPaymentMethod("full")} className="w-5 h-5 text-teal-600" />
                                 <div className="ml-3">
                                    <p className="font-bold text-gray-800">Thanh toán hết</p>
                                    <p className="text-sm text-gray-600">{formatPrice(totalPrice)} ₫</p>
                                 </div>
                              </label>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2"><CreditCard className="w-5 h-5 text-slate-600" /> Phương thức thanh toán</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm">
                                 <div className="bg-gray-50 p-4 rounded-xl mb-4 w-full flex justify-center border border-gray-300">
                                    <img src={qrImage} alt="QR Thanh toán" loading="lazy" className="w-60 h-60 object-contain drop-shadow-sm" />
                                 </div>
                                 <h5 className="font-bold text-gray-800 mb-2">Quét mã QR</h5>
                                 <p className="text-sm text-gray-600 mb-3">Dùng ứng dụng ngân hàng</p>
                                 <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono text-gray-700">VietQR • TPBank • 0123456789</div>
                                 <p className="text-lg font-bold text-slate-700 mt-3">{formatPrice(paymentMethod === "deposit" ? depositPrice : totalPrice)} ₫</p>
                              </div>
                              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                 <div className="flex items-center gap-3 mb-4"><Banknote className="w-8 h-8 text-slate-600" /><div><h5 className="font-bold text-gray-800">Chuyển khoản</h5><p className="text-xs text-gray-600">Nội dung: {fullName} - {roomType}</p></div></div>
                                 <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-600">Ngân hàng:</span><strong>TPBank</strong></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Chủ TK:</span><strong>CÔNG TY RESORT XYZ</strong></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Số TK:</span><strong>0123456789</strong></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Số tiền:</span><strong className="text-slate-700">{formatPrice(paymentMethod === "deposit" ? depositPrice : totalPrice)} ₫</strong></div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="pt-4">
                           <button onClick={handleCompletePayment} className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-bold py-5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg">
                              <CheckCircle className="w-6 h-6" /> Hoàn tất thanh toán
                           </button>
                           <p className="text-center text-sm text-gray-500 mt-3">Chụp biên lai → gửi email: <strong>booking@resort.xyz</strong></p>

                        </div>
                     </div>
                  </div>
               )}

               {/* FORM */}
               {status !== "success" && status !== "payment" && (
                  <div className="p-8">
                     <div className="space-y-6">
                        {error && (
                           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
                        )}

                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-slate-600" /> Thông tin cá nhân</h4>
                           <div className="space-y-4">
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                                 <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-5 h-5" /></div>
                                    <input type="text" placeholder="Nguyễn Văn A" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 font-medium" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-5 h-5" /></div>
                                       <input type="email" placeholder="email@example.com" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 font-medium" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                                    <div className="relative">
                                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Phone className="w-5 h-5" /></div>
                                       <input type="tel" placeholder="0901234567" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 font-medium" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Hotel className="w-5 h-5 text-slate-600" /> Thông tin đặt phòng</h4>
                           <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Loại phòng</label>
                                    <div className="relative">
                                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Hotel className="w-5 h-5" /></div>
                                       <select
                                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 font-medium appearance-none bg-white cursor-pointer"
                                          value={roomType}
                                          onChange={(e) => {
                                             const newType = e.target.value as keyof typeof ROOM_TYPES;
                                             setRoomType(newType);
                                             setRoomPrice(""); // Reset room price khi đổi loại phòng
                                          }}
                                       >
                                          {Object.keys(ROOM_TYPES).map(type => (
                                             <option key={type} value={type}>
                                                {type}
                                             </option>
                                          ))}
                                       </select>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{ROOM_TYPES[roomType]?.description || ""}</p>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Số khách</label>
                                    <div className="relative">
                                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Users className="w-5 h-5" /></div>
                                       <input type="number" min={1} max={10} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 font-medium" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
                                    </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày nhận phòng</label>
                                    <div className="relative">
                                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Calendar className="w-5 h-5" /></div>
                                       <input type="date" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 font-medium" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                                    </div>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày trả phòng</label>
                                    <div className="relative">
                                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Calendar className="w-5 h-5" /></div>
                                       <input type="date" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 font-medium" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                                    </div>
                                 </div>
                              </div>

                              {/* Hiển thị giá phòng hiện tại */}
                              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-4 rounded-xl border-2 border-teal-200">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <p className="text-sm font-medium text-gray-600">Giá phòng/đêm</p>
                                       <p className="text-xs text-gray-500 mt-1">
                                          {checkIn && checkOut ? `${Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))} đêm` : '1 đêm'}
                                       </p>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-2xl font-bold text-teal-600">
                                          {formatPrice(
                                             roomPrice
                                                ? parseFloat(roomPrice.replace(/\./g, ""))
                                                : (ROOM_TYPES[roomType]?.price || 0)
                                          )} ₫
                                       </p>
                                       {checkIn && checkOut && (
                                          <p className="text-sm font-bold text-gray-700 mt-1">
                                             Tổng: {formatPrice(calculateTotalPrice())} ₫
                                          </p>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="pt-2">
                           <button onClick={handleBookingSubmit} disabled={status === "sending"} className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-bold py-5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg">
                              {status === "sending" ? (
                                 <>
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang xử lý...
                                 </>
                              ) : (
                                 <>
                                    <CheckCircle className="w-6 h-6" />
                                    Xác nhận đặt phòng
                                 </>
                              )}
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>,
      document.body
   );
}
