import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, User, Mail, Phone, Calendar, Users, Hotel, CheckCircle, Sparkles } from "lucide-react";

// API URL từ environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function Booking_Home() {
   const [showBooking, setShowBooking] = useState(false);
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [roomName, setRoomName] = useState<string>(""); // Actual room name selected (e.g., "EXECUTIVE PLUS")
   const [roomPrice, setRoomPrice] = useState<string>("");
   const [roomId, setRoomId] = useState<string>("");
   const [checkIn, setCheckIn] = useState("");
   const [checkOut, setCheckOut] = useState("");
   const [guests, setGuests] = useState<number>(2);
   const [status, setStatus] = useState<"idle" | "sending" | "success" | "payment" | "error">("idle");
   const [error, setError] = useState<string | null>(null);
   const [paymentMethod, setPaymentMethod] = useState<"deposit" | "full">("deposit");

   // Auth + navigation
   const navigate = useNavigate();
   const { user, isAuthenticated } = useAuth();


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
            roomId: detail.roomId ? String(detail.roomId) : "",
            roomName: String(detail.roomName || ""),
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
            setRoomName(intent.roomName);
         }
         if (intent.roomId) setRoomId(intent.roomId);
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
   }, [isAuthenticated, navigate, roomPrice, guests, checkIn, checkOut, user]);

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
                  if (intent.roomName) setRoomName(String(intent.roomName));
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
      setRoomName("");
      setRoomPrice("");
      setRoomId("");
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
               roomId,
               roomName: roomName || "",
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
         await new Promise((res) => setTimeout(res, 400));
         // Bỏ qua bước hiển thị thanh toán, lưu đặt phòng và thêm vào hóa đơn
         await handleCompletePayment();
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
         // Kiểm tra token trước khi gửi request (hỗ trợ cả key cũ/new)
         const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
         if (!token) {
            setStatus("error");
            // Không hiển thị thông báo yêu cầu đăng nhập nếu isAuthenticated đã được kiểm tra trước đó
            setError("Vui lòng đăng nhập để đặt phòng.");
            const currentPath = window.location.pathname + window.location.search;
            navigate(`/login?redirect=${encodeURIComponent(currentPath)}&action=openBooking`);
            return;
         }

         // Lấy giá phòng
         const pricePerNight = roomPrice
            ? parseFloat(roomPrice.replace(/\./g, ""))
            : 0;

         // Gọi API để lưu booking
         console.log("\n\n📤 ============= Booking Request Sent =============");
         console.log("📤 URL:", `${API_BASE_URL}/bookings`);
         console.log("📤 Token (first 30 chars):", token.substring(0, 30) + "...");
         console.log("📤 Body:", {
            roomName,
            roomPrice: pricePerNight,
            fullName,
            email,
            phone,
            checkIn,
            checkOut,
            guests,
            paymentMethod,
         });

         const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
               roomId: roomId || undefined,
               roomName: roomName || "",
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

         console.log("📤 Response Status:", response.status, response.statusText);
         console.log("📤 ===============================================\n");

         if (response.ok) {
            // Parse response to obtain bill/booking details (robust to multiple shapes)
            let parsed: any = null;
            try {
               parsed = await response.json();
            } catch { parsed = null; }

            console.log("\n\n📥 ============= Booking Response Received =============");
            console.log("📥 Full response object:", JSON.stringify(parsed, null, 2));
            console.log("📥 Response.success:", parsed?.success);
            console.log("📥 Response.data:", parsed?.data);
            console.log("📥 Response.data.booking:", parsed?.data?.booking);
            console.log("📥 Response.data.bill:", parsed?.data?.bill);
            console.log("📥 Response.booking:", parsed?.booking);
            console.log("📥 Response.bill:", parsed?.bill);
            console.log("📥 Response keys:", Object.keys(parsed || {}));
            console.log("📥 ======================================================\n");

            // Backend returns { success, data: { booking, bill }, message }
            let billObj = parsed?.data?.bill || parsed?.bill || null;

            console.log("🔍 Extracted billObj from response:", billObj);

            // If backend didn't return a bill but returned booking data, build
            // a normalized temporary bill object so the FloatingBills UI can
            // immediately display the booked room and amounts.
            if (!billObj) {
               const booking = parsed?.data?.booking || parsed?.booking || null;
               console.log("🔍 No bill in response, trying to build from booking:", booking);
               if (booking) {
                  try {
                     const bCheckIn = booking.checkIn ? new Date(booking.checkIn) : new Date(checkIn);
                     const bCheckOut = booking.checkOut ? new Date(booking.checkOut) : new Date(checkOut);
                     const nights = Math.max(1, Math.ceil((bCheckOut.getTime() - bCheckIn.getTime()) / (1000 * 60 * 60 * 24)));
                     const nightlyPrice = booking.nightlyPrice || booking.room?.price || (roomPrice ? parseFloat(roomPrice.toString().replace(/\./g, "")) : 0);
                     const total = booking.totalPrice ?? nightlyPrice * nights;
                     const tax = total * 0.08;
                     const finalAmount = total + tax;

                     const resolvedRoomName = booking.room?.name || booking.roomName || roomName || undefined;

                     billObj = {
                        _id: booking._id ? `temp-${booking._id}` : `temp-${Date.now()}`,
                        booking: booking._id || null,
                        customerInfo: {
                           fullName: booking.fullName || fullName,
                           email: booking.email || email,
                           phone: booking.phone || phone,
                        },
                        roomInfo: {
                           roomName: resolvedRoomName,
                           // roomType: booking.roomType || undefined,
                           nightlyPrice,
                        },
                        bookingDetails: {
                           roomName: resolvedRoomName,
                           // roomType: booking.roomType || undefined,
                           nightlyPrice,
                           nights,
                           guests: booking.guests || guests,
                           checkIn: booking.checkIn || checkIn,
                           checkOut: booking.checkOut || checkOut,
                           specialRequests: booking.specialRequests || "",
                        },
                        checkIn: booking.checkIn || checkIn,
                        checkOut: booking.checkOut || checkOut,
                        nights,
                        guests: booking.guests || guests,
                        roomPrice: nightlyPrice,
                        totalPrice: total,
                        discount: 0,
                        tax,
                        finalAmount,
                        paymentMethod: booking.paymentMethod || paymentMethod,
                        paymentStatus: booking.paymentStatus || (paymentMethod === "deposit" ? "unpaid" : "paid"),
                        specialRequests: booking.specialRequests || "",
                        status: booking.status || "active",
                        issuedDate: new Date().toISOString(),
                     };
                     console.log("✅ Built fallback bill from booking:", billObj);
                  } catch (e) {
                     console.warn("Could not build fallback bill from booking data:", e);
                  }
               }
            }

            const evtDetail = billObj ? { bill: billObj } : { raw: parsed };

            // Persist the bill locally so FloatingBills can show it even if network fetch is delayed
            try {
               if (billObj) {
                  localStorage.setItem("last_bill", JSON.stringify(billObj));
               }
            } catch (err) {
               console.warn("⚠️ Could not cache last bill locally:", err);
            }

            console.log("\n\n📤 ============= Dispatching Events =============");
            console.log("📤 billObj found:", !!billObj);
            console.log("📤 evtDetail:", evtDetail);
            console.log("📤 Event 1: bookingCreated with detail:", evtDetail);
            console.log("📤 Event 2: openBills (same detail)");
            console.log("📤 ==============================================\n");

            // Thông báo và phát sự kiện để FloatingBills cập nhật và tự mở modal
            try {
               const evt = new CustomEvent("bookingCreated", { detail: evtDetail });
               window.dispatchEvent(evt);

               // Also request the bills modal to open so user sees the created bill
               const openEvt = new CustomEvent("openBills", { detail: evtDetail });
               window.dispatchEvent(openEvt);
            } catch (e) { console.warn('Failed to dispatch booking events', e); }

            setStatus("success");

            // Close booking modal shortly after success so bills modal can be visible
            setTimeout(() => {
               setShowBooking(false);
               resetForm();
            }, 700);
         } else {
            const error = await response.json();
            setStatus("error");

            // Nếu lỗi token, redirect về login
            if (response.status === 401) {
               setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
               localStorage.removeItem("token");
               localStorage.removeItem("auth_token");
               setTimeout(() => {
                  const currentPath = window.location.pathname + window.location.search;
                  navigate(`/login?redirect=${encodeURIComponent(currentPath)}&action=openBooking`);
               }, 1500);
            } else {
               setError(error.message || "Lưu đặt phòng thất bại. Vui lòng thử lại.");
            }
         }
      } catch (error) {
         setStatus("error");
         setError("Có lỗi xảy ra khi lưu đặt phòng. Vui lòng thử lại.");
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
                              Chọn phòng
                              <Sparkles className="w-5 h-5 text-amber-200" />
                           </h3>
                           <p className="text-white/80 text-sm">Trải nghiệm sang trọng đang chờ bạn</p>
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

               {/* PAYMENT STEP REMOVED: Nội dung thanh toán sẽ được thêm vào bill và không hiển thị tại đây */}

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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                       {roomName ? "Phòng đã chọn" : "Loại phòng"}
                                    </label>
                                    {roomName && roomPrice ? (
                                       // Hiển thị tên phòng cụ thể (không cho thay đổi)
                                       <div className="relative">
                                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600"><Hotel className="w-5 h-5" /></div>
                                          <div className="w-full pl-12 pr-4 py-3 border-2 border-teal-300 rounded-xl bg-teal-50 font-bold text-teal-700">
                                             {roomName}
                                          </div>
                                       </div>
                                    ) : (
                                       <div className="relative">
                                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Hotel className="w-5 h-5" /></div>
                                          <div className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-600">Vui lòng chọn phòng trên trang danh sách</div>
                                       </div>
                                    )}
                                 </div>
                                 <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Số khách</label>
                                    {roomName && roomPrice ? (
                                       // Hiển thị số khách cố định (không cho thay đổi)
                                       <div className="relative">
                                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600"><Users className="w-5 h-5" /></div>
                                          <div className="w-full pl-12 pr-4 py-3 border-2 border-teal-300 rounded-xl bg-teal-50 font-bold text-teal-700">
                                             {guests} người
                                          </div>
                                       </div>
                                    ) : (
                                       // Cho phép nhập số khách
                                       <div className="relative">
                                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Users className="w-5 h-5" /></div>
                                          <input type="number" min={1} max={10} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 outline-none transition-all duration-300 font-medium" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
                                       </div>
                                    )}
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
                                                : 0
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
