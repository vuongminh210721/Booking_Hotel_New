import React, { useState, useEffect } from "react";
import {
   X,
   Gift,
   Star,
   Trophy,
   Sparkles,
   Coins,
   Ticket,
   ChevronRight,
   UserPlus,
   Baby,
   Briefcase,
   Users,
   Calendar,
   Copy,
} from "lucide-react";
import confetti from "canvas-confetti";

const API_BASE = "/api/promotions";

// Helper lấy token
const getAuthHeaders = (): Record<string, string> => {
   const token = localStorage.getItem("token");
   return token ? { Authorization: `Bearer ${token}` } : {};
};

// Dữ liệu ưu đãi – hardcode
const promotions = [
   {
      _id: "1",
      title: "Ưu đãi cuối tuần",
      shortDesc: "Giảm 150k cho đơn trên 2.000.000",
      discount: "150k-200k tùy hạng thành viên",
      extraDiscount: "Giảm thêm 10% dịch vụ Spa & Ẩm thực",
      validFrom: "01/01/2025",
      validTo: "31/12/2025",
      applicableRooms: "Tất cả loại phòng",
      conditions: [
         "Chỉ áp dụng cho tài khoản đã đăng nhập",
         "Mỗi voucher dùng 1 lần",
         "Cần đủ điểm để đổi voucher",
      ],
      icon: "Duck",
      bgGradient: "from-amber-500 to-orange-600",
      requiredPoints: 8000,
   },
   {
      _id: "loyal",
      title: "Khách hàng thân thiết",
      shortDesc: "Giảm tới 20% cho lần đặt tiếp theo",
      discount: "15% – 20% (tùy hạng thành viên)",
      extraDiscount: "Giảm thêm 10% dịch vụ Spa & Ẩm thực",
      validFrom: "01/01/2025",
      validTo: "31/12/2025",
      applicableRooms: "Tất cả loại phòng",
      conditions: [
         "Chỉ áp dụng cho tài khoản đã đăng nhập",
         "Mỗi voucher dùng 1 lần",
         "Cần đủ điểm để đổi voucher",
      ],
      icon: "Star",
      bgGradient: "from-amber-500 to-orange-600",
      requiredPoints: 8000,
   },
   {
      _id: "new",
      title: "Khách hàng mới",
      shortDesc: "Giảm ngay 25% cho lần đặt đầu tiên",
      discount: "25% cho toàn bộ hóa đơn",
      extraDiscount: "Tặng kèm bữa sáng buffet 2 người",
      validFrom: "Ngay khi đăng ký",
      validTo: "30 ngày kể từ ngày đăng ký",
      applicableRooms: "Tất cả loại phòng",
      conditions: [
         "Chỉ áp dụng cho tài khoản đã đăng nhập",
         "Mỗi voucher dùng 1 lần",
         "Cần đủ điểm để đổi voucher",
      ],
      icon: "UserPlus",
      bgGradient: "from-teal-500 to-green-500",
      requiredPoints: 5000,
   },
   {
      _id: "family",
      title: "Người già & Trẻ em",
      shortDesc: "Giảm 30% cho trẻ em & người ≥ 60 tuổi",
      discount: "Trẻ em dưới 12 tuổi: Miễn phí / Người ≥ 60 tuổi: Giảm 30%",
      validFrom: "01/01/2025",
      validTo: "31/12/2025",
      applicableRooms: "Phòng Family & Deluxe",
      conditions: [
         "Chỉ áp dụng cho tài khoản đã đăng nhập",
         "Mỗi voucher dùng 1 lần",
         "Cần đủ điểm để đổi voucher",
      ],
      icon: "Baby",
      bgGradient: "from-pink-500 to-rose-600",
      requiredPoints: 6000,
   },
   {
      _id: "business",
      title: "Khách công tác",
      shortDesc: "Giảm 20% + dịch vụ hỗ trợ doanh nghiệp",
      discount: "20% giá phòng",
      extraDiscount: "Miễn phí in ấn, hội nghị nhỏ",
      validFrom: "Thứ 2 – Thứ 6",
      validTo: "31/12/2025",
      applicableRooms: "Phòng Business & Suite",
      conditions: [
         "Chỉ áp dụng cho tài khoản đã đăng nhập",
         "Mỗi voucher dùng 1 lần",
         "Cần đủ điểm để đổi voucher",
      ],
      icon: "Briefcase",
      bgGradient: "from-indigo-500 to-purple-600",
      requiredPoints: 7000,
   },
   {
      _id: "group",
      title: "Đặt nhóm (≥ 5 phòng)",
      shortDesc: "Giảm tới 35% khi đặt nhiều phòng",
      discount: "5–9 phòng: 25% | ≥ 10 phòng: 35%",
      extraDiscount: "Tặng 1 phòng miễn phí cho trưởng nhóm",
      validFrom: "01/01/2025",
      validTo: "31/12/2025",
      applicableRooms: "Tất cả loại phòng",
      conditions: [
         "Chỉ áp dụng cho tài khoản đã đăng nhập",
         "Mỗi voucher dùng 1 lần",
         "Cần đủ điểm để đổi voucher",
      ],
      icon: "Users",
      bgGradient: "from-cyan-500 to-blue-600",
      requiredPoints: 10000,
   },
   {
      _id: "season",
      title: "Ưu đãi theo mùa",
      shortDesc: "Giảm tới 40% các dịp lễ, Tết",
      discount: "30% – 40% tùy dịp",
      validFrom: "Tết Nguyên Đán, 30/4, 2/9, Noel",
      validTo: "Theo từng dịp",
      applicableRooms: "Tất cả loại phòng",
      conditions: [
         "Chỉ áp dụng cho tài khoản đã đăng nhập",
         "Mỗi voucher dùng 1 lần",
         "Cần đủ điểm để đổi voucher",
      ],
      icon: "Calendar",
      bgGradient: "from-emerald-500 to-lime-600",
      requiredPoints: 12000,
   },
];

// Hardcode vòng quay và quiz
const wheelPrizes = [
   { label: "1.000 điểm", value: 1000, color: "#10b981" },
   { label: "2.000 điểm", value: 2000, color: "#3b82f6" },
   { label: "3.000 điểm", value: 3000, color: "#f59e0b" },
   { label: "2.000 điểm", value: 2000, color: "#8b5cf6" },
   { label: "Voucher 500k", value: 0, isVoucher: true, color: "#ef4444" },
   { label: "1.000 điểm", value: 1000, color: "#06b6d4" },
   { label: "5.000 điểm", value: 5000, color: "#f97316" },
   { label: "Chúc may mắn", value: 0, color: "#6b7280" },
   { label: "1.000 điểm", value: 1000, color: "#ec4899" },
   { label: "7.000 điểm", value: 7000, color: "#14b8a6" },
];

const quizQuestions = [
   { q: "Khách sạn HotelHub hiện có bao nhiêu cơ sở?", a: "6", options: ["3", "6", "9", "12"] },
   { q: "Ưu đãi khách hàng mới giảm bao nhiêu %?", a: "25%", options: ["15%", "20%", "25%", "30%"] },
   { q: "Vòng quay may mắn có bao nhiêu ô?", a: "10", options: ["6", "8", "10", "12"] },
   { q: "HotelHub cung cấp dịch vụ nào dưới đây?", a: "Tất cả các dịch vụ trên", options: ["Phòng khách sạn", "Ẩm thực", "Spa & Massage", "Tất cả các dịch vụ trên"] },
   { q: "Bạn có thể bốc thăm may mắn bao nhiêu lần mỗi ngày?", a: "1 lần", options: ["Không giới hạn", "1 lần", "2 lần", "3 lần"] },
];

// ===== COMPONENT VOUCHERSLIST - KHÔNG AUTO-PLAY, CHỈ BẤM NÚT/DOT =====
const VouchersList: React.FC = () => {
   const [vouchers, setVouchers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [currentIndex, setCurrentIndex] = useState(0);

   useEffect(() => {
      const fetchVouchers = async () => {
         try {
            const res = await fetch(`${API_BASE}/vouchers/me`, {
               headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Không thể tải danh sách voucher");
            const data = await res.json();
            setVouchers(data.data || []);
         } catch (err: any) {
            setError(err.message || "Đã có lỗi xảy ra");
            setVouchers([]);
         } finally {
            setLoading(false);
         }
      };
      fetchVouchers();
   }, []);

   const getStatusInfo = (voucher: any) => {
      const now = new Date();
      const expires = new Date(voucher.expiresAt);
      if (voucher.status === "used") return { text: "Đã sử dụng", color: "text-gray-500 bg-gray-100" };
      if (expires < now) return { text: "Hết hạn", color: "text-red-600 bg-red-50" };
      return { text: "Còn hạn", color: "text-green-600 bg-green-50" };
   };

   const handleCopyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
   };

   const getIcon = (iconName: string) => {
      const map: Record<string, React.ReactNode> = {
         Star: <Star className="w-12 h-12" />,
         UserPlus: <UserPlus className="w-12 h-12" />,
         Baby: <Baby className="w-12 h-12" />,
         Briefcase: <Briefcase className="w-12 h-12" />,
         Users: <Users className="w-12 h-12" />,
         Calendar: <Calendar className="w-12 h-12" />,
      };
      return map[iconName] || <Gift className="w-12 h-12" />;
   };

   const goToIndex = (index: number) => setCurrentIndex(index);

   const scrollLeft = () => {
      setCurrentIndex((prev) => prev === 0 ? vouchers.length - 1 : prev - 1);
   };

   const scrollRight = () => {
      setCurrentIndex((prev) => (prev + 1) % vouchers.length);
   };

   if (loading) {
      return (
         <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-amber-400 animate-pulse mx-auto mb-4" />
            <p className="text-lg text-gray-600">Đang tải voucher...</p>
         </div>
      );
   }

   if (error || vouchers.length === 0) {
      return (
         <div className="text-center py-16 bg-white rounded-3xl shadow-xl max-w-3xl mx-auto">
            <Gift className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <p className="text-2xl font-bold text-gray-700 mb-3">
               {error ? "Không thể tải voucher" : "Bạn chưa có voucher nào"}
            </p>
            <p className="text-lg text-gray-500 mb-8 px-6">
               {error ? "Vui lòng thử lại sau." : "Đổi điểm thưởng để nhận ưu đãi hấp dẫn nhé!"}
            </p>
            {!error && (
               <button
                  onClick={() => {
                     const element = document.querySelector("section.bg-white") as HTMLElement | null;
                     window.scrollTo({ top: (element?.offsetTop || 0) - 100, behavior: "smooth" });
                  }}
                  className="bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-all shadow-lg"
               >
                  Xem ưu đãi ngay
               </button>
            )}
         </div>
      );
   }

   return (
      <div className="relative max-w-4xl mx-auto">
         {/* Nút trái */}
         {vouchers.length > 1 && (
            <button
               onClick={scrollLeft}
               className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white shadow-lg rounded-full p-2.5 transition-all hover:scale-110"
            >
               <ChevronRight className="w-6 h-6 text-gray-700 rotate-180" />
            </button>
         )}

         {/* Carousel chính */}
         <div className="overflow-hidden rounded-2xl shadow-xl">
            <div
               className="flex transition-transform duration-700 ease-in-out"
               style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
               {vouchers.map((voucher) => {
                  const details = voucher.promotionDetails;
                  const status = getStatusInfo(voucher);

                  return (
                     <div key={voucher._id} className="w-full flex-shrink-0">
                        <div className="bg-white flex flex-col md:flex-row h-full min-h-48">
                           {/* Icon bên trái */}
                           <div className={`w-full md:w-32 lg:w-40 flex items-center justify-center ${details.bgGradient} bg-gradient-to-br p-6 md:p-0`}>
                              <div className="text-white">{getIcon(details.icon)}</div>
                           </div>

                           {/* Nội dung */}
                           <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                              <div>
                                 <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-2">
                                       {details.title}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                       {status.text}
                                    </span>
                                 </div>

                                 <p className="text-2xl font-bold text-teal-600 mb-2">
                                    {details.discount}
                                 </p>

                                 {details.extraDiscount && (
                                    <p className="text-sm text-green-700 italic mb-4">
                                       + {details.extraDiscount}
                                    </p>
                                 )}

                                 {/* Mã voucher */}
                                 <div className="bg-amber-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-600 mb-2">Mã voucher</p>
                                    <div className="flex items-center justify-between gap-3">
                                       <code className="font-mono font-bold text-amber-700 text-lg bg-white px-4 py-2 rounded-lg border-2 border-amber-300">
                                          {voucher.voucherCode}
                                       </code>
                                       <button
                                          onClick={() => handleCopyCode(voucher.voucherCode)}
                                          className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1.5"
                                       >
                                          <Copy className="w-5 h-5" />
                                          <span className="text-sm">Copy</span>
                                       </button>
                                    </div>
                                 </div>
                              </div>

                              {/* Ngày tháng nhỏ gọn */}
                              <div className="mt-4 text-xs text-gray-500 space-y-1">
                                 <div className="flex justify-between">
                                    <span>Ngày đổi:</span>
                                    <span className="font-medium">{new Date(voucher.issuedAt).toLocaleDateString("vi-VN")}</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span>Hết hạn:</span>
                                    <span className={`font-medium ${status.text === "Hết hạn" ? "text-red-600" : ""}`}>
                                       {new Date(voucher.expiresAt).toLocaleDateString("vi-VN")}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Nút phải */}
         {vouchers.length > 1 && (
            <button
               onClick={scrollRight}
               className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white shadow-lg rounded-full p-2.5 transition-all hover:scale-110"
            >
               <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
         )}

         {/* Dots */}
         {vouchers.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
               {vouchers.map((_, index) => (
                  <button
                     key={index}
                     onClick={() => goToIndex(index)}
                     className={`transition-all duration-300 rounded-full ${currentIndex === index
                        ? "bg-teal-500 w-9 h-2.5"
                        : "bg-gray-300 w-2.5 h-2.5 hover:bg-gray-400"
                        }`}
                  />
               ))}
            </div>
         )}
      </div>
   );
};
// ===== KẾT THÚC COMPONENT VOUCHERSLIST =====

// ===== COMPONENT PREVIEWPAGE - CHƯA ĐĂNG NHẬP =====
const PreviewPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
   // const [selectedPromo, setSelectedPromo] = useState<any>(null); // Unused

   const getIcon = (iconName: string) => {
      const map: Record<string, React.ReactNode> = {
         Star: <Gift className="w-10 h-10" />,
         UserPlus: <UserPlus className="w-10 h-10" />,
         Baby: <Baby className="w-10 h-10" />,
         Briefcase: <Briefcase className="w-10 h-10" />,
         Users: <Users className="w-10 h-10" />,
         Calendar: <Calendar className="w-10 h-10" />,
      };
      return map[iconName] || <Gift className="w-10 h-10" />;
   };

   return (
      <>
         {/* HERO */}
         <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            <div
               className="absolute inset-0 bg-cover bg-center"
               style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')`,
               }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
               <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none">
                  <span className="block text-white/95">Ưu đãi</span>
                  <span className="block text-amber-400 drop-shadow-2xl">Đặc biệt</span>
               </h1>
               <p className="mt-8 text-xl md:text-3xl lg:text-4xl font-light tracking-wider text-white/90">
                  Chơi vui — Nhận quà thật
               </p>
               <div className="mt-12 flex justify-center">
                  <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
               </div>
            </div>
         </div>

         {/* VOUCHER HIỆN CÓ */}
         <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-16 text-gray-800">
                  Voucher hiện có
               </h2>
               <div className="text-center py-16 bg-white rounded-3xl shadow-xl max-w-3xl mx-auto">
                  <Gift className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <p className="text-2xl font-bold text-gray-700 mb-3">
                     Bạn cần đăng nhập để xem voucher
                  </p>
                  <p className="text-lg text-gray-500 mb-8 px-6">
                     Đăng nhập ngay để nhận ưu đãi và đổi điểm thưởng!
                  </p>
                  <button
                     onClick={onLogin}
                     className="bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-4 px-10 rounded-xl hover:scale-105 transition-all shadow-lg text-lg"
                  >
                     Đăng nhập ngay
                  </button>
               </div>
            </div>
         </section>

         {/* CHƯƠNG TRÌNH ƯU ĐÃI */}
         <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-16">Chương trình ưu đãi</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotions.map((promo) => (
                     <div
                        key={promo._id}
                        onClick={onLogin}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                     >
                        <div className={`h-32 bg-gradient-to-br ${promo.bgGradient} flex items-center justify-center relative`}>
                           <div className="text-white">{getIcon(promo.icon)}</div>
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                        </div>
                        <div className="p-6">
                           <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{promo.title}</h3>
                           <p className="text-gray-600 mb-4 line-clamp-2">{promo.shortDesc}</p>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <Coins className="w-6 h-6 text-amber-600" />
                                 <span className="font-semibold text-amber-700">
                                    {promo.requiredPoints.toLocaleString()} điểm
                                 </span>
                              </div>
                              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-2 transition-all" />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* TRÒ CHƠI TÍCH ĐIỂM */}
         <section className="py-20 bg-gradient-to-br from-teal-50 to-green-50">
            <div className="max-w-7xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-12">Chơi ngay – Nhận quà liền tay!</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Vòng quay */}
                  <div className="bg-white rounded-3xl p-10 shadow-2xl text-center hover:shadow-3xl transition-shadow">
                     <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                     <h3 className="text-3xl font-bold mb-4">Vòng quay may mắn</h3>
                     <p className="text-gray-600 mb-8">1 lượt miễn phí mỗi ngày</p>
                     <button
                        onClick={onLogin}
                        className="w-full py-6 rounded-xl font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 shadow-2xl transition-all"
                     >
                        Đăng nhập để quay
                     </button>
                  </div>

                  {/* Quiz */}
                  <div className="bg-white rounded-3xl p-10 shadow-2xl text-center hover:shadow-3xl transition-shadow">
                     <Sparkles className="w-20 h-20 text-purple-500 mx-auto mb-6" />
                     <h3 className="text-3xl font-bold mb-4">Trả lời câu hỏi</h3>
                     <p className="text-gray-600 mb-8">Nhận tới 1000 điểm</p>
                     <button
                        onClick={onLogin}
                        className="w-full py-6 rounded-xl font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-2xl transition-all"
                     >
                        Đăng nhập để chơi
                     </button>
                  </div>

                  {/* Bốc thăm */}
                  <div className="bg-white rounded-3xl p-10 shadow-2xl text-center hover:shadow-3xl transition-shadow">
                     <Gift className="w-20 h-20 text-pink-500 mx-auto mb-6" />
                     <h3 className="text-3xl font-bold mb-4">Bốc thăm may mắn</h3>
                     <p className="text-gray-600 mb-8">Cơ hội nhận điểm thưởng mỗi ngày</p>
                     <button
                        onClick={onLogin}
                        className="w-full py-6 rounded-xl font-bold text-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:scale-105 shadow-2xl transition-all"
                     >
                        Đăng nhập để bốc
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {/* ĐIỂM THƯỞNG */}
         <section className="py-20 bg-gray-100">
            <div className="max-w-5xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-12">Điểm thưởng của bạn</h2>
               <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-3xl p-12 text-white text-center shadow-2xl">
                  <p className="text-3xl mb-6">Tổng điểm hiện tại</p>
                  <p className="text-8xl font-bold flex items-center justify-center gap-6">
                     <Coins className="w-24 h-24" />
                     0
                  </p>
                  <p className="text-xl mt-8 opacity-90">Đăng nhập để tích lũy và đổi điểm thưởng hấp dẫn!</p>
               </div>
            </div>
         </section>
      </>
   );
};
// ===== KẾT THÚC COMPONENT PREVIEWPAGE =====

export default function PromotionsPage() {
   // const { user } = useAuth();
   const [token, setToken] = useState<string | null>(null);

   useEffect(() => {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
   }, []);

   const handleLogin = () => {
      // Redirect to login page with redirect parameter
      const currentPath = "/promotion"; // sau khi login sẽ về trang đầy đủ
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
   };

   // Nếu chưa đăng nhập, hiện PreviewPage
   if (!token) {
      return <PreviewPage onLogin={handleLogin} />;
   }

   // Nếu đã đăng nhập, hiện FullPage
   return <FullPage />;
}

// ===== COMPONENT FULLPAGE - ĐÃ ĐĂNG NHẬP =====
function FullPage() {
   const [points, setPoints] = useState<number>(1250);
   // const [canSpinToday, setCanSpinToday] = useState<boolean>(true); // Unused - replaced by spinsLeftToday
   const [quizDone, setQuizDone] = useState<boolean>(false);

   const [selectedPromo, setSelectedPromo] = useState<any>(null);

   const [canLuckyDrawToday, setCanLuckyDrawToday] = useState<boolean>(true);
   const [todayLuckyDrawPoints, setTodayLuckyDrawPoints] = useState<number | null>(null);

   const [isSpinning, setIsSpinning] = useState<boolean>(false);
   const [rotation, setRotation] = useState<number>(0);
   const [spinsLeftToday, setSpinsLeftToday] = useState<number>(2);

   const [showQuiz, setShowQuiz] = useState<boolean>(false);
   const [currentQ, setCurrentQ] = useState<number>(0);
   const [selectedAns, setSelectedAns] = useState<string | null>(null);
   const [quizScore, setQuizScore] = useState<number>(0);
   const [showFeedback, setShowFeedback] = useState<boolean>(false);
   const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);

   const [redeemMessage, setRedeemMessage] = useState<string>("");
   const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

   // Load điểm từ backend
   useEffect(() => {
      loadUserRewards();
   }, []);

   const handleRedeem = async () => {
      if (!selectedPromo || points < selectedPromo.requiredPoints) return;

      setIsRedeeming(true);
      setRedeemMessage("");

      try {
         const res = await fetch(`${API_BASE}/rewards/redeem`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               ...getAuthHeaders(),
            },
            body: JSON.stringify({ promotion: selectedPromo }),
         });

         if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Đổi thưởng thất bại");
         }

         const data = await res.json();
         setPoints(data.data.newPoints);

         setRedeemMessage(`
         Đổi ưu đãi thành công, vui lòng kiểm tra ở mục "Voucher hiện có"!
      `);

         confetti({
            particleCount: 300,
            spread: 120,
            origin: { y: 0.6 },
         });

         // Refresh sau 2-3 giây để user thấy thông báo thành công
         setTimeout(() => {
            window.location.reload();
         }, 2500);

      } catch (err: any) {
         setRedeemMessage(`<p class="text-red-600 text-center">Lỗi: ${err.message}</p>`);
      } finally {
         setIsRedeeming(false);
      }
   };

   const spinWheel = async () => {
      if (isSpinning || spinsLeftToday <= 0) return;

      setIsSpinning(true);

      // Random chọn ô để biết góc quay
      const targetPrizeIndex = Math.floor(Math.random() * wheelPrizes.length);

      // Tính độ quay để mũi tên (ở top/0 độ) trỏ vào ô được chọn
      const spins = 5 + Math.random() * 4; // Số vòng quay
      const sliceAngle = (360 / wheelPrizes.length);
      const sliceCenter = targetPrizeIndex * sliceAngle + sliceAngle / 2;
      const targetDeg = 360 - sliceCenter; // Góc quay để trỏ ô này
      const totalDeg = spins * 360 + targetDeg; // Tổng độ quay
      setRotation(totalDeg);

      setTimeout(async () => {
         setIsSpinning(false);
         const newSpinsLeft = spinsLeftToday - 1;
         setSpinsLeftToday(newSpinsLeft);

         // Tính ô thực tế được trỏ từ finalDeg (dựa trên UI)
         // Slice i có center = i * sliceAngle + sliceAngle/2
         // Để slice i trỏ lên top (finalDeg), cần: i * sliceAngle + sliceAngle/2 = finalDeg
         // => i = (finalDeg - sliceAngle/2) / sliceAngle
         const finalDeg = totalDeg % 360;
         const actualPrizeIndex = ((Math.round((finalDeg - sliceAngle / 2) / sliceAngle)) % wheelPrizes.length + wheelPrizes.length) % wheelPrizes.length;
         const actualPrize = wheelPrizes[actualPrizeIndex];

         // Log thông tin ô được trỏ (từ giao diện)
         console.log("🎡 VÒNG QUAY KẾT QUẢ:", {
            actualPrizeIndex,
            label: actualPrize.label,
            value: actualPrize.value,
            color: actualPrize.color,
            isVoucher: actualPrize.isVoucher || false,
            finalDeg: `${finalDeg.toFixed(2)}°`,
            totalDeg: `${totalDeg.toFixed(2)}°`,
         });

         // Cộng điểm dựa trên ô thực tế được trỏ (không random)
         if (actualPrize.value > 0) {
            const newPoints = points + actualPrize.value;
            setPoints(newPoints);

            try {
               const res = await fetch(`${API_BASE}/rewards/spin`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                  body: JSON.stringify({ pointsEarned: actualPrize.value }),
               });

               if (res.ok) {
                  const data = await res.json();
                  // Update spinsRemaining từ backend response
                  setSpinsLeftToday(data.data.spinsRemaining ?? 0);
                  console.log(`✅ Cộng thành công: +${actualPrize.value} điểm, còn lại ${data.data.spinsRemaining} lượt`);
               } else {
                  console.error("❌ API spin trả về lỗi");
               }
            } catch (err) {
               console.error("❌ Lỗi API spin:", err);
            }
         } else if (actualPrize.isVoucher) {
            console.log("🎁 Voucher nhận được - không cộng điểm");
         } else {
            console.log("🍀 Chúc may mắn - không cộng điểm");
         }

         confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
         const message = actualPrize.isVoucher
            ? `🎁 Chúc mừng! Bạn nhận được: ${actualPrize.label} (đã gửi qua email)`
            : actualPrize.value === 0
               ? `🍀 Chúc may mắn lần sau!`
               : `✨ Chúc mừng! Bạn nhận được: ${actualPrize.label}`;

         alert(message);
      }, 5200);
   };

   const handleQuizAnswer = async () => {
      if (!showFeedback) {
         // Hiển thị feedback lần đầu tiên
         const isCorrect = selectedAns === quizQuestions[currentQ].a;
         setIsAnswerCorrect(isCorrect);
         setShowFeedback(true);

         // Tự động cập nhật điểm nếu đúng
         if (isCorrect) {
            setQuizScore((prev) => prev + 200);
         }
         return;
      }

      // Nếu đã hiển thị feedback, bấm lần 2 để tiếp tục
      if (currentQ < quizQuestions.length - 1) {
         setShowFeedback(false);
         setCurrentQ((prev) => prev + 1);
         setSelectedAns(null);
         return;
      }

      // Hoàn thành quiz
      const totalEarned = quizScore + (isAnswerCorrect ? 200 : 0);

      if (totalEarned > 0) {
         const newPoints = points + totalEarned;
         setPoints(newPoints);

         try {
            await fetch(`${API_BASE}/rewards/quiz/complete`, {
               method: "POST",
               headers: { "Content-Type": "application/json", ...getAuthHeaders() },
               body: JSON.stringify({ totalScore: totalEarned }),
            });
         } catch (err) { }
      }

      setQuizDone(true);
      confetti({ particleCount: 150, spread: 100 });
      alert(`Hoàn thành! Bạn nhận được ${totalEarned} điểm thưởng!`);
      setShowQuiz(false);
      setCurrentQ(0);
      setQuizScore(0);
      setSelectedAns(null);
      setShowFeedback(false);
      setIsAnswerCorrect(false);
   };

   // Tách ra thành hàm để gọi lại khi cần
   const loadUserRewards = async () => {
      try {
         // Cache busting cực mạnh: timestamp + random
         const bust = Date.now();
         const res = await fetch(`${API_BASE}/rewards/me?_=${bust}`, {
            method: "GET",
            headers: {
               ...getAuthHeaders(),
               "Cache-Control": "no-cache, no-store, must-revalidate",
               Pragma: "no-cache",
               Expires: "0",
            },
            cache: "no-store",
         });

         if (!res.ok) throw new Error("Failed to fetch rewards");

         const data = await res.json();

         setPoints(data.data.points || 0);
         setQuizDone(data.data.quizCompleted ?? false);
         setCanLuckyDrawToday(data.data.canLuckyDrawToday ?? true);
         setTodayLuckyDrawPoints(data.data.todayLuckyDrawPoints ?? null);
         // Load số lượt quay còn lại hôm nay từ backend
         setSpinsLeftToday(data.data.spinsRemaining ?? 2);
      } catch (err) {
         console.error("Load rewards error:", err);
      }
   };

   // 2. Hàm bốc thăm – đơn giản, tin cậy, không cần set false trước
   const startLuckyDraw = async () => {
      if (!canLuckyDrawToday) return;

      try {
         const res = await fetch(`${API_BASE}/rewards/luckydraw`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               ...getAuthHeaders(),
            },
         });

         if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || "Lỗi khi bốc thăm");
         }

         const { data } = await res.json();

         // Cập nhật điểm ngay cho đẹp
         setPoints(data.newPoints);

         // Confetti nếu trúng thật
         if (data.pointsEarned > 0) {
            confetti({
               particleCount: 250,
               spread: 120,
               origin: { y: 0.5 },
            });
         }

         // BẮT BUỘC load lại dữ liệu mới nhất từ DB
         await loadUserRewards(); // ← cái này sẽ làm nút TỐI ĐÚNG 100% khi reload

      } catch (err: any) {
         alert(err.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
   };

   const getIcon = (iconName: string) => {
      const map: Record<string, React.ReactNode> = {
         Star: <Star className="w-10 h-10" />,
         UserPlus: <UserPlus className="w-10 h-10" />,
         Baby: <Baby className="w-10 h-10" />,
         Briefcase: <Briefcase className="w-10 h-10" />,
         Users: <Users className="w-10 h-10" />,
         Calendar: <Calendar className="w-10 h-10" />,
      };
      return map[iconName] || <Gift className="w-10 h-10" />;
   };

   return (
      <>
         {/* HERO */}
         <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            <div
               className="absolute inset-0 bg-cover bg-center"
               style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')`,
               }}
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
               <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none">
                  <span className="block text-white/95">Ưu đãi</span>
                  <span className="block text-amber-400 drop-shadow-2xl">Đặc biệt</span>
               </h1>
               <p className="mt-8 text-xl md:text-3xl lg:text-4xl font-light tracking-wider text-white/90">
                  Chơi vui — Nhận quà thật
               </p>
               <div className="mt-12 flex justify-center">
                  <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
               </div>
               <div className="mt-16 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full" />
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
               <ChevronRight className="w-10 h-10 text-amber-400 rotate-90" />
            </div>
         </div>

         {/* VOUCHER HIỆN CÓ */}
         <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-16 text-gray-800">
                  Voucher hiện có
               </h2>

               <VouchersList />
            </div>
         </section>

         {/* CHƯƠNG TRÌNH ƯU ĐÃI */}
         <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-16">Chương trình ưu đãi</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotions.map((promo) => (
                     <div
                        key={promo._id}
                        onClick={() => {
                           const token = localStorage.getItem("token");
                           if (token) {
                              setSelectedPromo(promo);
                           } else {
                              // Chuyển đến login và lưu đường dẫn quay lại
                              const currentPath = window.location.pathname;
                              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                           }
                        }}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                     >
                        <div className={`h-32 bg-gradient-to-br ${promo.bgGradient} flex items-center justify-center relative`}>
                           <div className="text-white">{getIcon(promo.icon)}</div>
                           <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                        </div>

                        <div className="p-5">
                           <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{promo.title}</h3>
                           <p className="text-sm text-gray-600 mb-4 line-clamp-2">{promo.shortDesc}</p>

                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <Coins className="w-5 h-5 text-amber-600" />
                                 <span className="text-sm font-semibold text-amber-700">
                                    {promo.requiredPoints.toLocaleString()} điểm
                                 </span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* TRÒ CHƠI TÍCH ĐIỂM */}
         <section className="py-20 bg-gradient-to-br from-teal-50 to-green-50">
            <div className="max-w-7xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-12">Chơi ngay – Nhận quà liền tay!</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* VÒNG QUAY */}
                  <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
                     <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                     <h3 className="text-3xl font-bold mb-4">Vòng quay may mắn</h3>
                     <p className="text-gray-600 mb-8">2 lượt miễn phí mỗi ngày</p>
                     <div className="relative w-full flex justify-center mb-8">
                        <div className="relative w-72 h-72">


                           <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl">
                              <svg
                                 viewBox="0 0 320 320"
                                 className="w-full h-full"
                                 style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: isSpinning ? "transform 5.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                                 }}
                              >
                                 {wheelPrizes.map((prize, i) => {
                                    const angle = (360 / wheelPrizes.length) * i;
                                    const sliceAngle = angle + 180 / wheelPrizes.length; // Góc giữa của slice
                                    const textRadius = 95; // Tăng lên để tránh đè nhau khi có 10 ô
                                    const textX = 160 + textRadius * Math.cos((sliceAngle - 90) * Math.PI / 180);
                                    const textY = 160 + textRadius * Math.sin((sliceAngle - 90) * Math.PI / 180);

                                    return (
                                       <g key={i}>
                                          <path
                                             d={`M160,160 L${160 + 150 * Math.cos((angle - 90) * Math.PI / 180)},${160 + 150 * Math.sin((angle - 90) * Math.PI / 180)} A150,150 0 0 1 ${160 + 150 * Math.cos((angle + 360 / wheelPrizes.length - 90) * Math.PI / 180)},${160 + 150 * Math.sin((angle + 360 / wheelPrizes.length - 90) * Math.PI / 180)} Z`}
                                             fill={prize.color}
                                          />
                                          <text
                                             x={textX}
                                             y={textY}
                                             fill="white"
                                             fontSize="14"
                                             fontWeight="bold"
                                             textAnchor="middle"
                                             dominantBaseline="middle"
                                             transform={`rotate(${sliceAngle - 90} ${textX} ${textY})`}
                                          >
                                             {prize.label}
                                          </text>
                                       </g>
                                    );
                                 })}
                              </svg>
                           </div>
                        </div>
                     </div>
                     <button
                        onClick={spinWheel}
                        disabled={isSpinning || spinsLeftToday <= 0}
                        className={`w-full py-6 rounded-xl font-bold text-xl text-white transition-all ${isSpinning || spinsLeftToday <= 0 ? "bg-gray-400" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-2xl"}`}
                     >
                        {isSpinning ? "Đang quay..." : spinsLeftToday > 0 ? `Quay ngay! (${spinsLeftToday} lượt còn lại)` : "Đã quay hết lượt hôm nay"}
                     </button>
                  </div>

                  {/* QUIZ */}
                  <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
                     <Sparkles className="w-20 h-20 text-purple-500 mx-auto mb-6" />
                     <h3 className="text-3xl font-bold mb-4">Trả lời câu hỏi</h3>
                     <p className="text-gray-600 mb-8">Nhận tới 1000 điểm</p>
                     {quizDone ? (
                        <div className="text-green-600 font-bold text-2xl">Đã hoàn thành!</div>
                     ) : (
                        <button
                           onClick={() => setShowQuiz(true)}
                           className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-6 rounded-xl hover:scale-105 transition-all shadow-2xl text-xl"
                        >
                           Bắt đầu ngay
                        </button>
                     )}
                  </div>
                  {/* BỐC THĂM */}
                  <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
                     <Gift className="w-20 h-20 text-pink-500 mx-auto mb-6" />
                     <h3 className="text-3xl font-bold mb-4">Bốc thăm may mắn</h3>
                     <p className="text-gray-600 mb-8">
                        Cơ hội nhận điểm thưởng mỗi ngày
                     </p>

                     {/* Nút bốc thăm - chỉ mở modal nếu chưa bốc */}
                     <button
                        onClick={() => canLuckyDrawToday && startLuckyDraw()}
                        disabled={!canLuckyDrawToday}
                        className={`w-full py-6 rounded-xl font-bold text-xl transition-all shadow-2xl mb-4
         ${!canLuckyDrawToday
                              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                              : "bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:scale-105"
                           }`}
                     >
                        {canLuckyDrawToday ? "Bốc thăm ngay" : "Đã bốc hôm nay"}
                     </button>

                     {/* Thông báo nhỏ nếu đã bốc hôm nay */}
                     {!canLuckyDrawToday && todayLuckyDrawPoints != null && (
                        <p className="text-lg font-semibold text-teal-600">
                           Hôm nay bạn đã nhận: {todayLuckyDrawPoints.toLocaleString()} điểm
                        </p>
                     )}
                  </div>
               </div>
            </div>
         </section>

         {/* ĐIỂM THƯỞNG */}
         <section className="py-20 bg-gray-100">
            <div className="max-w-5xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-12">Điểm thưởng của bạn</h2>
               <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-3xl p-12 text-white text-center shadow-2xl">
                  <p className="text-3xl mb-6">Tổng điểm hiện tại</p>
                  <p className="text-8xl font-bold flex items-center justify-center gap-6">
                     <Coins className="w-24 h-24" />
                     {points.toLocaleString()}
                  </p>
               </div>
            </div>
         </section>

         {/* MODAL CHI TIẾT ƯU ĐÃI - ĐÃ CHUYỂN THÀNH ĐỔI THƯỞNG */}
         {selectedPromo && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedPromo(null)}>
               <div
                  className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className={`relative h-56 bg-gradient-to-br ${selectedPromo.bgGradient} flex items-center justify-center text-white`}>
                     {getIcon(selectedPromo.icon)}
                     <button
                        onClick={() => setSelectedPromo(null)}
                        className="absolute top-6 right-6 text-white/80 hover:text-white hover:scale-110 transition-all"
                     >
                        <X className="w-8 h-8" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                     <h2 className="text-4xl font-bold mb-6 text-gray-800">{selectedPromo.title}</h2>
                     <div className="space-y-8 text-lg">
                        <div className="text-center py-8 bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl">
                           <p className="text-5xl font-bold text-teal-600">{selectedPromo.discount}</p>
                           {selectedPromo.extraDiscount && (
                              <p className="text-2xl text-green-700 mt-4 font-medium">{selectedPromo.extraDiscount}</p>
                           )}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                           <div className="bg-gray-50 rounded-2xl p-6 text-center">
                              <p className="text-gray-600">Từ ngày</p>
                              <p className="text-2xl font-bold text-gray-800">{selectedPromo.validFrom}</p>
                           </div>
                           <div className="bg-gray-50 rounded-2xl p-6 text-center">
                              <p className="text-gray-600">Đến ngày</p>
                              <p className="text-2xl font-bold text-gray-800">{selectedPromo.validTo}</p>
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                           <p className="text-gray-600 mb-2">Áp dụng cho</p>
                           <p className="text-xl font-bold text-teal-600">{selectedPromo.applicableRooms}</p>
                        </div>

                        <div>
                           <p className="font-bold text-xl mb-4 text-gray-800">Điều kiện áp dụng:</p>
                           <ul className="space-y-3">
                              {selectedPromo.conditions.map((c: string, i: number) => (
                                 <li key={i} className="flex items-start gap-3 text-gray-700">
                                    <Ticket className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
                                    <span>{c}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>

                        {/* PHẦN ĐỔI THƯỞNG MỚI */}
                        <div className="mt-10 p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border-4 border-dashed border-amber-300">
                           <div className="flex items-center justify-between mb-6">
                              <div>
                                 <p className="text-2xl font-bold text-amber-800">Đổi bằng điểm thưởng</p>
                                 <p className="text-4xl font-bold text-orange-600 mt-2 flex items-center gap-3">
                                    <Coins className="w-12 h-12" />
                                    {selectedPromo.requiredPoints.toLocaleString()} điểm
                                 </p>
                              </div>
                              <div className="text-right">
                                 <p className="text-lg text-gray-600">Bạn hiện có</p>
                                 <p className="text-3xl font-bold text-teal-600">{points.toLocaleString()} điểm</p>
                              </div>
                           </div>

                           {redeemMessage && (
                              <div className="mb-6 p-4 bg-green-100 border-2 border-green-400 rounded-2xl text-green-800 font-bold text-center text-xl">
                                 {redeemMessage}
                              </div>
                           )}

                           <button
                              onClick={handleRedeem}
                              disabled={isRedeeming || points < selectedPromo.requiredPoints}
                              className={`w-full py-6 rounded-2xl font-bold text-2xl text-white transition-all shadow-xl ${points >= selectedPromo.requiredPoints
                                 ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105"
                                 : "bg-gray-400 cursor-not-allowed"
                                 }`}
                           >
                              {isRedeeming ? "Đang xử lý..." : points >= selectedPromo.requiredPoints ? "Đổi ngay" : `Còn thiếu ${(selectedPromo.requiredPoints - points).toLocaleString()} điểm`}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* MODAL QUIZ */}
         {showQuiz && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
               <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 relative">
                  {/* Nút Close */}
                  <button
                     onClick={() => setShowQuiz(false)}
                     className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-all shadow-md"
                  >
                     <X className="w-6 h-6 text-gray-700" />
                  </button>

                  <h3 className="text-3xl font-bold mb-8 text-center">Câu {currentQ + 1} / {quizQuestions.length}</h3>
                  <p className="text-2xl text-center mb-10">{quizQuestions[currentQ].q}</p>

                  {!showFeedback ? (
                     <>
                        <div className="grid grid-cols-2 gap-6">
                           {quizQuestions[currentQ].options.map((opt) => (
                              <button
                                 key={opt}
                                 onClick={() => setSelectedAns(opt)}
                                 className={`py-6 rounded-2xl border-4 text-xl font-medium transition-all ${selectedAns === opt ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-teal-400"}`}
                              >
                                 {opt}
                              </button>
                           ))}
                        </div>
                        <button
                           onClick={handleQuizAnswer}
                           disabled={!selectedAns}
                           className="mt-10 w-full bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-6 rounded-xl disabled:opacity-50 text-xl"
                        >
                           Xác nhận
                        </button>
                     </>
                  ) : (
                     <>
                        <div className={`mb-8 p-6 rounded-2xl text-center text-white text-xl font-bold ${isAnswerCorrect ? "bg-green-500" : "bg-red-500"}`}>
                           {isAnswerCorrect ? (
                              <>
                                 <p className="text-3xl mb-2">✓ Chính xác!</p>
                                 <p>Câu trả lời đúng: <span className="text-2xl">{quizQuestions[currentQ].a}</span></p>
                                 <p className="mt-3 text-lg">+200 điểm</p>
                              </>
                           ) : (
                              <>
                                 <p className="text-3xl mb-2">✗ Sai rồi!</p>
                                 <p>Câu trả lời đúng: <span className="text-2xl">{quizQuestions[currentQ].a}</span></p>
                                 <p className="mt-2 text-sm">Câu trả lời của bạn: {selectedAns}</p>
                              </>
                           )}
                        </div>
                        <button
                           onClick={handleQuizAnswer}
                           className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-6 rounded-xl text-xl hover:scale-105 transition-all"
                        >
                           {currentQ === quizQuestions.length - 1 ? "Hoàn thành Quiz" : "Câu tiếp theo"}
                        </button>
                     </>
                  )}
               </div>
            </div>
         )}

      </>
   );
}