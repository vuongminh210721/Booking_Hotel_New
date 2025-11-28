import React, { useState, useEffect, useRef } from "react";
import {
   X,
   Gift,
   Star,
   Trophy,
   Sparkles,
   Coins,
   CheckCircle,
   AlertCircle,
   Copy,
   Ticket,
   ChevronRight,
   RotateCw,
   Zap,
   UserPlus,
   Baby,
   Briefcase,
   Users,
   Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";

type Promotion = {
   id: string;
   title: string;
   icon: React.ReactNode;
   bgGradient: string;
   shortDesc: string;
   details: {
      discount: string;
      extraDiscount?: string;
      validFrom: string;
      validTo: string;
      applicableRooms: string;
      conditions: string[];
   };
};

const promotions: Promotion[] = [
   {
      id: "loyal",
      title: "Khách hàng thân thiết",
      icon: <Star className="w-10 h-10" />,
      bgGradient: "from-amber-500 to-orange-600",
      shortDesc: "Giảm tới 20% cho lần đặt tiếp theo",
      details: {
         discount: "15% – 20% (tùy hạng thành viên)",
         extraDiscount: "Giảm thêm 10% dịch vụ Spa & Ẩm thực",
         validFrom: "01/01/2025",
         validTo: "31/12/2025",
         applicableRooms: "Tất cả loại phòng",
         conditions: [
            "Đã đặt ≥ 5 đêm trong 12 tháng gần nhất",
            "Hạng thành viên Silver trở lên",
            "Áp dụng khi đặt trực tiếp trên website",
         ],
      },
   },
   {
      id: "new",
      title: "Khách hàng mới",
      icon: <UserPlus className="w-10 h-10" />,
      bgGradient: "from-teal-500 to-green-600",
      shortDesc: "Giảm ngay 25% cho lần đặt đầu tiên",
      details: {
         discount: "25% cho toàn bộ hóa đơn",
         extraDiscount: "Tặng kèm bữa sáng buffet 2 người",
         validFrom: "Ngay khi đăng ký",
         validTo: "30 ngày kể từ ngày đăng ký",
         applicableRooms: "Tất cả loại phòng",
         conditions: ["Chỉ áp dụng cho tài khoản mới", "Không áp dụng cùng ưu đãi khác"],
      },
   },
   {
      id: "family",
      title: "Người già & Trẻ em",
      icon: <Baby className="w-10 h-10" />,
      bgGradient: "from-pink-500 to-rose-600",
      shortDesc: "Giảm 30% cho trẻ em & người ≥ 60 tuổi",
      details: {
         discount: "Trẻ em dưới 12 tuổi: Miễn phí / Người ≥ 60 tuổi: Giảm 30%",
         validFrom: "01/01/2025",
         validTo: "31/12/2025",
         applicableRooms: "Phòng Family & Deluxe",
         conditions: ["Cần xuất trình giấy tờ tùy thân", "Tối đa 2 trẻ/phòng"],
      },
   },
   {
      id: "business",
      title: "Khách công tác",
      icon: <Briefcase className="w-10 h-10" />,
      bgGradient: "from-indigo-500 to-purple-600",
      shortDesc: "Giảm 20% + dịch vụ hỗ trợ doanh nghiệp",
      details: {
         discount: "20% giá phòng",
         extraDiscount: "Miễn phí in ấn, hội nghị nhỏ",
         validFrom: "Thứ 2 – Thứ 6",
         validTo: "31/12/2025",
         applicableRooms: "Phòng Business & Suite",
         conditions: ["Cần giấy giới thiệu công ty hoặc danh thiếp"],
      },
   },
   {
      id: "group",
      title: "Đặt nhóm (≥ 5 phòng)",
      icon: <Users className="w-10 h-10" />,
      bgGradient: "from-cyan-500 to-blue-600",
      shortDesc: "Giảm tới 35% khi đặt nhiều phòng",
      details: {
         discount: "5–9 phòng: 25% | ≥ 10 phòng: 35%",
         extraDiscount: "Tặng 1 phòng miễn phí cho trưởng nhóm",
         validFrom: "01/01/2025",
         validTo: "31/12/2025",
         applicableRooms: "Tất cả loại phòng",
         conditions: ["Thanh toán trước 50%", "Đặt trước ít nhất 14 ngày"],
      },
   },
   {
      id: "season",
      title: "Ưu đãi theo mùa",
      icon: <Calendar className="w-10 h-10" />,
      bgGradient: "from-emerald-500 to-lime-600",
      shortDesc: "Giảm tới 40% các dịp lễ, Tết",
      details: {
         discount: "30% – 40% tùy dịp",
         validFrom: "Tết Nguyên Đán, 30/4, 2/9, Noel",
         validTo: "Theo từng dịp",
         applicableRooms: "Tất cả loại phòng",
         conditions: ["Số lượng có hạn", "Không hoàn, không hủy"],
      },
   },
];

// Dữ liệu vòng quay
const wheelPrizes = [
   { label: "500 điểm", value: 500, color: "#10b981" },
   { label: "200 điểm", value: 200, color: "#3b82f6" },
   { label: "1.000 điểm", value: 1000, color: "#f59e0b" },
   { label: "300 điểm", value: 300, color: "#8b5cf6" },
   { label: "Voucher 500k", value: 500000, color: "#ef4444", isVoucher: true },
   { label: "100 điểm", value: 100, color: "#06b6d4" },
   { label: "2.000 điểm", value: 2000, color: "#f97316" },
   { label: "Chúc may mắn", value: 0, color: "#6b7280" },
];

// Câu hỏi quiz
const quizQuestions = [
   { q: "Khách sạn HotelHub hiện có bao nhiêu cơ sở?", a: "6", options: ["3", "6", "9", "12"] },
   { q: "Ưu đãi khách hàng mới giảm bao nhiêu %?", a: "25%", options: ["15%", "20%", "25%", "30%"] },
   { q: "1 điểm thưởng đổi được bao nhiêu tiền?", a: "100 ₫", options: ["50 ₫", "100 ₫", "200 ₫", "500 ₫"] },
];

export default function PromotionsPage() {
   const [points, setPoints] = useState<number>(() => Number(localStorage.getItem("hotelHubPoints") || "1250"));
   const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
   const [customerId, setCustomerId] = useState("");
   const [promoCode, setPromoCode] = useState<string | null>(null);
   const [codeMessage, setCodeMessage] = useState("");

   // Vòng quay
   const [isSpinning, setIsSpinning] = useState(false);
   const [rotation, setRotation] = useState(0);
   const lastSpinDate = localStorage.getItem("lastSpinDate") || "";

   // Quiz
   const [showQuiz, setShowQuiz] = useState(false);
   const [currentQ, setCurrentQ] = useState(0);
   const [selectedAns, setSelectedAns] = useState<string | null>(null);
   const [quizScore, setQuizScore] = useState(0);
   const quizDone = localStorage.getItem("quizCompleted") === "true";

   // Bốc thăm
   const [showLuckyDraw, setShowLuckyDraw] = useState(false);
   const [drawResult, setDrawResult] = useState<string | null>(null);

   // Lưu điểm
   useEffect(() => {
      localStorage.setItem("hotelHubPoints", points.toString());
   }, [points]);

   // Kiểm tra có được quay hôm nay chưa
   const canSpinToday = () => {
      const today = new Date().toISOString().slice(0, 10);
      return lastSpinDate !== today;
   };

   // Vòng quay
   const spinWheel = () => {
      if (isSpinning || !canSpinToday()) return;

      setIsSpinning(true);
      const spins = 5 + Math.random() * 4;
      const prizeIndex = Math.floor(Math.random() * wheelPrizes.length);
      const prize = wheelPrizes[prizeIndex];
      const deg = spins * 360 + prizeIndex * (360 / wheelPrizes.length) + 360 / (wheelPrizes.length * 2);

      setRotation(prev => prev + deg);

      setTimeout(() => {
         setIsSpinning(false);
         localStorage.setItem("lastSpinDate", new Date().toISOString().slice(0, 10));

         if (prize.value > 0) {
            setPoints(p => p + (prize.isVoucher ? 0 : prize.value));
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
         }

         alert(`Chúc mừng! Bạn nhận được: ${prize.label}${prize.isVoucher ? " (đã gửi qua email)" : ""}`);
      }, 5200);
   };

   // Quiz
   const handleQuizAnswer = () => {
      if (selectedAns === quizQuestions[currentQ].a) {
         setQuizScore(prev => prev + 200);
      }

      if (currentQ < quizQuestions.length - 1) {
         setCurrentQ(prev => prev + 1);
         setSelectedAns(null);
      } else {
         const total = quizScore + (selectedAns === quizQuestions[currentQ].a ? 200 : 0);
         setPoints(p => p + total);
         localStorage.setItem("quizCompleted", "true");
         confetti({ particleCount: 150, spread: 100 });
         alert(`Hoàn thành! Bạn nhận được ${total} điểm thưởng!`);
         setShowQuiz(false);
      }
   };

   // Bốc thăm
   const startLuckyDraw = () => {
      const prizes = [
         "Voucher 1.000.000 ₫",
         "500 điểm",
         "Voucher 500.000 ₫",
         "300 điểm",
         "Chúc may mắn lần sau!",
      ];
      const result = prizes[Math.floor(Math.random() * prizes.length)];
      setDrawResult(result);

      if (result.includes("điểm")) {
         const pts = parseInt(result.replace(/\D/g, ""));
         setPoints(p => p + pts);
      }
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
   };

   // Nhận mã ưu đãi
   const generateCode = () => {
      if (!customerId.trim()) return setCodeMessage("Vui lòng nhập ID");

      const valid = ["MV2024", "GOLD123", "VIP888", "NEW2025"];
      if (valid.includes(customerId.toUpperCase())) {
         const code = `MV${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
         setPromoCode(code);
         setCodeMessage("Chúc mừng! Mã ưu đãi của bạn:");
      } else {
         setPromoCode(null);
         setCodeMessage("Rất tiếc, ID chưa đủ điều kiện");
      }
   };

   const copyCode = () => promoCode && navigator.clipboard.writeText(promoCode);

   return (
      <>
         {/* HERO */}
         <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Ảnh nền */}
            <div
               className="absolute inset-0 bg-cover bg-center"
               style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')`,
               }}
            />

            {/* Overlay tối + hiệu ứng mờ nhẹ */}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

            {/* Nội dung – siêu tối giản & sang */}
            <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
               {/* Dòng đầu tiên – siêu to, siêu mỏng, siêu sang */}
               <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none">
                  <span className="block text-white/95">Ưu đãi</span>
                  <span className="block text-amber-400 drop-shadow-2xl">Đặc biệt</span>
               </h1>

               {/* Dòng phụ – nhỏ hơn, thanh lịch */}
               <p className="mt-8 text-xl md:text-3xl lg:text-4xl font-light tracking-wider text-white/90">
                  Chơi vui — Nhận quà thật
               </p>

               {/* Icon nhỏ nhấp nháy nhẹ ở dưới làm điểm nhấn */}
               <div className="mt-12 flex justify-center">
                  <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
               </div>

               {/* Đường viền vàng mỏng chạy ngang – cực kỳ sang */}
               <div className="mt-16 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full" />
            </div>

            {/* Nút cuộn xuống (tùy chọn thêm cho sang) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
               <ChevronRight className="w-10 h-10 text-amber-400 rotate-90" />
            </div>
         </div>

         {/* NHẬN MÃ THEO ID */}
         <section className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
               <h2 className="text-4xl font-bold mb-8">Nhập ID nhận mã ưu đãi</h2>
               <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                     type="text"
                     value={customerId}
                     onChange={(e) => setCustomerId(e.target.value)}
                     placeholder="VD: MV2024"
                     className="flex-1 px-6 py-4 rounded-xl border-2 focus:border-teal-500 outline-none text-lg"
                  />
                  <button
                     onClick={generateCode}
                     className="bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                  >
                     <Gift className="w-6 h-6" /> Nhận mã
                  </button>
               </div>
               {codeMessage && (
                  <div className={`mt-8 p-6 rounded-2xl flex items-center gap-4 ${promoCode ? "bg-green-50 border-2 border-green-300" : "bg-red-50 border-2 border-red-300"}`}>
                     {promoCode ? <CheckCircle className="w-12 h-12 text-green-600" /> : <AlertCircle className="w-12 h-12 text-red-600" />}
                     <div>
                        <p className={promoCode ? "text-green-800 font-bold text-xl" : "text-red-800 font-bold text-xl"}>{codeMessage}</p>
                        {promoCode && (
                           <div className="mt-4 flex items-center gap-4">
                              <code className="bg-white px-6 py-3 rounded-lg font-mono text-3xl border-2 border-teal-500">{promoCode}</code>
                              <button onClick={copyCode} className="text-teal-600 hover:text-teal-800 flex items-center gap-2">
                                 <Copy className="w-6 h-6" /> Copy
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
         </section>

         {/* 6 ƯU ĐÃI */}
         <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-16">Chương trình ưu đãi</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {promotions.map(promo => (
                     <div key={promo.id} className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-4 border">
                        <div className={`h-40 bg-gradient-to-br ${promo.bgGradient} flex items-center justify-center text-white`}>
                           {promo.icon}
                        </div>
                        <div className="p-8">
                           <h3 className="text-2xl font-bold mb-3">{promo.title}</h3>
                           <p className="text-gray-600 mb-6">{promo.shortDesc}</p>
                           <button
                              onClick={() => setSelectedPromo(promo)}
                              className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-4 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                           >
                              Xem chi tiết <ChevronRight className="w-5 h-5" />
                           </button>
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
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                  {/* VÒNG QUAY MAY MẮN */}
                  <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
                     <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                     <h3 className="text-3xl font-bold mb-4">Vòng quay may mắn</h3>
                     <p className="text-gray-600 mb-8">1 lượt miễn phí mỗi ngày</p>
                     <div className="relative w-80 h-80 mx-auto mb-8">
                        <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl">
                           <svg viewBox="0 0 320 320" className="w-full h-full" style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? "transform 5.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none" }}>
                              {wheelPrizes.map((prize, i) => {
                                 const angle = (360 / wheelPrizes.length) * i;
                                 return (
                                    <g key={i}>
                                       <path
                                          d={`M160,160 L${160 + 150 * Math.cos((angle - 90) * Math.PI / 180)},${160 + 150 * Math.sin((angle - 90) * Math.PI / 180)} A150,150 0 0 1 ${160 + 150 * Math.cos((angle + 360 / wheelPrizes.length - 90) * Math.PI / 180)},${160 + 150 * Math.sin((angle + 360 / wheelPrizes.length - 90) * Math.PI / 180)} Z`}
                                          fill={prize.color}
                                       />
                                       <text x="160" y="40" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" transform={`rotate(${angle + 22.5} 160 160)`}>
                                          {prize.label}
                                       </text>
                                    </g>
                                 );
                              })}
                           </svg>
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-0 h-0 border-l-12 border-r-12 border-t-24 border-l-transparent border-r-transparent border-t-yellow-400"></div>
                        </div>
                     </div>
                     <button
                        onClick={spinWheel}
                        disabled={isSpinning || !canSpinToday()}
                        className={`w-full py-6 rounded-xl font-bold text-xl text-white transition-all ${(isSpinning || !canSpinToday()) ? "bg-gray-400" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-2xl"}`}
                     >
                        {isSpinning ? "Đang quay..." : canSpinToday() ? "Quay ngay!" : "Đã quay hôm nay"}
                     </button>
                  </div>

                  {/* TRẢ LỜI CÂU HỎI */}
                  <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
                     <Sparkles className="w-20 h-20 text-purple-500 mx-auto mb-6" />
                     <h3 className="text-3xl font-bold mb-4">Trả lời câu hỏi</h3>
                     <p className="text-gray-600 mb-8">Nhận tới 600 điểm</p>
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
                     <h3 className="text-3xl font-bold mb-4">Bốc thăm trúng thưởng</h3>
                     <p className="text-gray-600 mb-8">Cơ hội trúng voucher 1 triệu</p>
                     <button
                        onClick={() => setShowLuckyDraw(true)}
                        className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-6 rounded-xl hover:scale-105 transition-all shadow-2xl text-xl"
                     >
                        Bốc thăm ngay
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
                     {points.toLocaleString()}
                  </p>
                  <p className="text-3xl mt-8">= {(points * 100).toLocaleString("vi-VN")} ₫</p>
               </div>
            </div>
         </section>

         {/* MODAL CHI TIẾT ƯU ĐÃI */}
         {/* MODAL CHI TIẾT ƯU ĐÃI – PHIÊN BẢN SIÊU SANG, CÓ NHẬP MÃ */}
         {selectedPromo && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedPromo(null)}>
               <div
                  className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                  onClick={e => e.stopPropagation()}
               >
                  {/* Header gradient + icon + nút đóng X trong suốt */}
                  <div className={`relative h-56 bg-gradient-to-br ${selectedPromo.bgGradient} flex items-center justify-center text-white`}>
                     {selectedPromo.icon}
                     <button
                        onClick={() => setSelectedPromo(null)}
                        className="absolute top-6 right-6 text-white/80 hover:text-white hover:scale-110 transition-all"
                     >
                        <X className="w-8 h-8" />
                     </button>
                  </div>

                  {/* Nội dung cuộn đẹp */}
                  <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                     <h2 className="text-4xl font-bold mb-6 text-gray-800">{selectedPromo.title}</h2>

                     <div className="space-y-8 text-lg">
                        <div className="text-center py-6 bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl">
                           <p className="text-4xl font-bold text-teal-600">{selectedPromo.details.discount}</p>
                           {selectedPromo.details.extraDiscount && (
                              <p className="text-xl text-green-700 mt-3 font-medium">{selectedPromo.details.extraDiscount}</p>
                           )}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                           <div className="bg-gray-50 rounded-2xl p-6 text-center">
                              <p className="text-gray-600">Từ ngày</p>
                              <p className="text-2xl font-bold text-gray-800">{selectedPromo.details.validFrom}</p>
                           </div>
                           <div className="bg-gray-50 rounded-2xl p-6 text-center">
                              <p className="text-gray-600">Đến ngày</p>
                              <p className="text-2xl font-bold text-gray-800">{selectedPromo.details.validTo}</p>
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                           <p className="text-gray-600 mb-2">Áp dụng cho</p>
                           <p className="text-xl font-bold text-teal-600">{selectedPromo.details.applicableRooms}</p>
                        </div>

                        <div>
                           <p className="font-bold text-xl mb-4 text-gray-800">Điều kiện áp dụng:</p>
                           <ul className="space-y-3">
                              {selectedPromo.details.conditions.map((c, i) => (
                                 <li key={i} className="flex items-start gap-3 text-gray-700">
                                    <Ticket className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
                                    <span>{c}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>

                  {/* Footer nhập mã – cố định dưới cùng */}
                  <div className="border-t border-gray-200 bg-gray-50 px-10 py-8">
                     <div className="max-w-md mx-auto">
                        <label className="block text-lg font-semibold text-gray-800 mb-3">Nhập mã ưu đãi của bạn</label>
                        <div className="flex gap-4">
                           <input
                              type="text"
                              placeholder="VD: MV2025GOLD"
                              className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 focus:border-teal-500 outline-none text-lg font-medium transition-all"
                              onChange={(e) => {
                                 const value = e.target.value.trim().toUpperCase();
                                 // Bạn có thể thêm logic kiểm tra mã hợp lệ ở đây sau
                              }}
                           />
                           <button
                              disabled={true} // bật khi có mã hợp lệ
                              className="px-10 py-4 rounded-xl font-bold text-white transition-all 
                      bg-gray-400 cursor-not-allowed 
                      disabled:bg-gray-400 disabled:cursor-not-allowed
                      hover:bg-teal-600 hover:scale-105"
                           >
                              Áp dụng
                           </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-3 text-center">
                           Chưa có mã? Nhận mã tại phần <span className="font-semibold text-teal-600">Nhập ID nhận ưu đãi</span> bên trên
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* MODAL QUIZ */}
         {showQuiz && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
               <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10">
                  <h3 className="text-3xl font-bold mb-8 text-center">Câu {currentQ + 1} / {quizQuestions.length}</h3>
                  <p className="text-2xl text-center mb-10">{quizQuestions[currentQ].q}</p>
                  <div className="grid grid-cols-2 gap-6">
                     {quizQuestions[currentQ].options.map(opt => (
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
                     {currentQ === quizQuestions.length - 1 ? "Hoàn thành" : "Tiếp theo"}
                  </button>
               </div>
            </div>
         )}

         {/* MODAL BỐC THĂM */}
         {showLuckyDraw && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
               <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-12 text-center">
                  {drawResult ? (
                     <>
                        <Trophy className="w-28 h-28 text-yellow-500 mx-auto mb-6" />
                        <h3 className="text-5xl font-bold mb-6">Chúc mừng!</h3>
                        <p className="text-3xl text-teal-600">{drawResult}</p>
                     </>
                  ) : (
                     <>
                        <Gift className="w-28 h-28 text-pink-500 mx-auto mb-10 animate-bounce" />
                        <button
                           onClick={startLuckyDraw}
                           className="bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-3xl py-10 px-20 rounded-3xl hover:scale-110 transition-all shadow-2xl"
                        >
                           BỐC THĂM NGAY
                        </button>
                     </>
                  )}
                  <button onClick={() => { setShowLuckyDraw(false); setDrawResult(null); }} className="mt-10 text-gray-600 hover:underline text-lg">
                     Đóng
                  </button>
               </div>
            </div>
         )}
         {/* ==================== PHẦN QUY ĐỔI ĐIỂM THƯỞNG – SIÊU ĐẸP ==================== */}
         <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6">
               <h2 className="text-5xl font-bold text-center mb-16">Cách kiếm & Quy đổi điểm thưởng</h2>

               <div className="grid lg:grid-cols-2 gap-12">

                  {/* CÁCH KIẾM ĐIỂM */}
                  <div className="bg-white rounded-3xl shadow-2xl p-10">
                     <h3 className="text-3xl font-bold mb-8 text-teal-600 flex items-center gap-4">
                        <Sparkles className="w-10 h-10 text-amber-400" />
                        Cách kiếm điểm thưởng
                     </h3>
                     <div className="space-y-6">
                        {[
                           { action: "Ở lại thêm mỗi đêm", points: "+100 điểm / đêm" },
                           { action: "Đặt phòng trực tuyến", points: "+50 điểm / đặt phòng" },
                           { action: "Sử dụng dịch vụ Spa & Nhà hàng", points: "+10 điểm / 100.000đ chi tiêu" },
                           { action: "Giới thiệu bạn bè đặt phòng", points: "+500 điểm / người thành công" },
                           { action: "Tham gia trò chơi trên trang", points: "Tới 2.000 điểm / lượt" },
                           { action: "Đánh giá sau khi trải nghiệm", points: "+200 điểm / đánh giá" },
                        ].map((item, i) => (
                           <div key={i} className="flex justify-between items-center py-5 px-6 bg-gradient-to-r from-teal-50 to-green-50 rounded-2xl border border-teal-100">
                              <p className="text-lg font-medium text-gray-800">{item.action}</p>
                              <span className="text-xl font-bold text-teal-600">{item.points}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* QUY ĐỔI ĐIỂM */}
                  <div className="bg-white rounded-3xl shadow-2xl p-10">
                     <h3 className="text-3xl font-bold mb-8 text-amber-600 flex items-center gap-4">
                        <Gift className="w-10 h-10 text-pink-500" />
                        Quy đổi điểm thưởng
                     </h3>
                     <div className="space-y-6">
                        {[
                           { gift: "Voucher giảm 200.000đ", points: 2000, color: "from-teal-500 to-green-500" },
                           { gift: "Spa miễn phí 60 phút", points: 3500, color: "from-purple-500 to-pink-500" },
                           { gift: "Gấu bông HotelHub chính hãng", points: 5000, color: "from-rose-500 to-pink-500" },
                           { gift: "Bữa tối lãng mạn 2 người", points: 8000, color: "from-orange-500 to-red-500" },
                           { gift: "1 đêm nghỉ miễn phí (Deluxe)", points: 15000, color: "from-amber-500 to-yellow-500" },
                           { gift: "Chuyển thành tiền mặt", points: 1000, per: "100.000đ", special: true },
                        ].map((item, i) => (
                           <div key={i} className={`p-6 rounded-2xl border-2 ${item.special ? "border-dashed border-amber-400 bg-amber-50" : "border-gray-200"}`}>
                              <div className="flex justify-between items-center mb-3">
                                 <p className="text-lg font-semibold text-gray-800">{item.gift}</p>
                                 <span className="text-2xl font-bold text-amber-600">{item.points.toLocaleString()} điểm</span>
                              </div>
                              {item.special ? (
                                 <div className="mt-4 space-y-4">
                                    <p className="text-sm text-gray-600">→ 1.000 điểm = 100.000 ₫ chuyển khoản</p>
                                    <input
                                       type="text"
                                       placeholder="Nhập số tài khoản ngân hàng"
                                       className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-amber-500 outline-none text-center"
                                    />
                                    <div className="flex justify-center gap-6 items-center">
                                       <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center">
                                          <span className="text-xs text-gray-500 text-center">QR Code<br />ngân hàng</span>
                                       </div>
                                       <button
                                          disabled={points < item.points}
                                          className={`px-8 py-4 rounded-xl font-bold text-white transition-all ${points >= item.points
                                             ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105 shadow-lg"
                                             : "bg-gray-400 cursor-not-allowed"
                                             }`}
                                       >
                                          {points >= item.points ? "Chuyển khoản ngay" : "Chưa đủ điểm"}
                                       </button>
                                    </div>
                                 </div>
                              ) : (
                                 <button
                                    disabled={points < item.points}
                                    className={`w-full mt-3 py-4 rounded-xl font-bold text-white transition-all ${points >= item.points
                                       ? `bg-gradient-to-r ${item.color} hover:scale-105 shadow-lg`
                                       : "bg-gray-400 cursor-not-allowed"
                                       }`}
                                 >
                                    {points >= item.points ? "Đổi ngay" : `Còn thiếu ${item.points - points} điểm`}
                                 </button>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Ghi chú nhỏ */}
               <div className="mt-16 text-center">
                  <p className="text-lg text-gray-600">
                     Điểm thưởng có giá trị trong <strong>12 tháng</strong> kể từ ngày tích lũy •
                     Mọi thắc mắc vui lòng liên hệ <strong className="text-teal-600">1900 1234</strong>
                  </p>
               </div>
            </div>
         </section>
      </>
   );
}