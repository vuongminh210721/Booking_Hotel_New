import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Users, Home as HomeIcon, Maximize2, CheckCircle, MapPin, ArrowLeft } from "lucide-react";
import rooms from "@/data/room";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useAuth } from "@/context/AuthContext";

export default function View_Home() {
   useScrollToTop();
   const { id } = useParams();
   const room = rooms.find((r) => r.id === id);
   const location = useLocation();
   const navigate = useNavigate();
   const { isAuthenticated } = useAuth();

   const [currentImageIndex, setCurrentImageIndex] = useState(0);

   useEffect(() => {
      setCurrentImageIndex(0);
   }, [id]);

   useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
         if (!room || !room.images?.length) return;
         if (e.key === "ArrowLeft")
            setCurrentImageIndex(
               (i) => (i - 1 + room.images.length) % room.images.length
            );
         if (e.key === "ArrowRight")
            setCurrentImageIndex((i) => (i + 1) % room.images.length);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
   }, [room]);

   if (!room)
      return (
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center px-6">
               <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <HomeIcon className="w-8 h-8 text-gray-400" />
               </div>
               <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy phòng</h2>
               <p className="text-sm text-gray-600 mb-6">Phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
               <a
                  href="/rooms"
                  onClick={(e) => {
                     e.preventDefault();
                     try {
                        const selected = window.localStorage.getItem("hb:selectedCity");
                        const params = new URLSearchParams();
                        if (selected) params.set("location", selected);
                        navigate({ pathname: "/rooms", search: params.toString() });
                     } catch (err) {
                        navigate("/rooms");
                     }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2fd680] text-white text-sm rounded-full font-semibold hover:shadow-lg hover:bg-[#25a060] transition-all"
               >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách phòng</span>
               </a>
            </div>
         </div>
      );

   const images = room.images || [];

   const nextImage = () =>
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
   const prevImage = () =>
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

   return (
      <div className="min-h-screen bg-black/50 flex items-center justify-center p-4">
         <div className="w-full max-w-5xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            {/* Left side - Image Gallery */}
            <div className="lg:w-[58%] relative bg-gray-900">
               <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
                  {images && images.length > 0 ? (
                     <>
                        <img
                           src={images[currentImageIndex]}
                           alt={`${room.name} - Image ${currentImageIndex + 1}`}
                           className="w-full h-full object-cover"
                        />

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                           <>
                              <button
                                 onClick={prevImage}
                                 className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                                 aria-label="Previous image"
                              >
                                 <ChevronLeft className="w-5 h-5 text-gray-900" />
                              </button>
                              <button
                                 onClick={nextImage}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                                 aria-label="Next image"
                              >
                                 <ChevronRight className="w-5 h-5 text-gray-900" />
                              </button>

                              {/* Image Counter */}
                              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                                 {currentImageIndex + 1} / {images.length}
                              </div>
                           </>
                        )}
                     </>
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <HomeIcon className="w-16 h-16 text-gray-400" />
                     </div>
                  )}
               </div>

               {/* Thumbnail Strip */}
               {images && images.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                     <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-center">
                        {images.map((img, idx) => (
                           <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all ${currentImageIndex === idx
                                 ? "ring-2 ring-white scale-105"
                                 : "opacity-60 hover:opacity-100"
                                 }`}
                           >
                              <img
                                 src={img}
                                 alt={`Thumbnail ${idx + 1}`}
                                 className="w-full h-full object-cover"
                              />
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {/* Right side - Details */}
            <div className="lg:w-[42%] flex flex-col relative">
               {/* Close button */}
               <div className="sticky top-0 z-50 flex justify-end bg-white p-3 border-b border-gray-100">
                  <button
                     onClick={() => {
                        window.dispatchEvent(new CustomEvent("closeBooking"));
                        navigate(-1);
                     }}
                     className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
                     aria-label="Close"
                  >
                     <ArrowLeft className="w-4 h-4 text-gray-700" />
                  </button>
               </div>

               {/* Room Details */}
               <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-5">
                  {/* Header */}
                  <div>
                     <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {room.name}
                     </h1>

                     {room.city && (
                        <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                           <MapPin className="w-4 h-4 text-[#2fd680]" />
                           <span className="text-sm font-medium">{room.city}</span>
                        </div>
                     )}

                     {room.floor && (
                        <div className="text-xs text-gray-500 mb-3">
                           {room.floor} {room.view && `• ${room.view}`}
                        </div>
                     )}

                     {/* Brand Badge */}
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-[#2fd680] rounded-full mb-4">
                        <span className="text-lg font-extrabold text-gray-900">HOTEL</span>
                        <span className="text-sm font-semibold text-[#2fd680]">HUB</span>
                     </div>

                     <p className="text-sm text-gray-700 leading-relaxed">
                        {room.description}
                     </p>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-3 gap-3">
                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="flex flex-col items-center text-center">
                           <Maximize2 className="w-6 h-6 text-[#2fd680] mb-1.5" />
                           <span className="text-xs text-gray-500 font-medium mb-0.5">Diện tích</span>
                           <span className="text-base font-bold text-gray-900">{(room.size || 'N/A').replace(/�/g, '').trim()}</span>
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="flex flex-col items-center text-center">
                           <HomeIcon className="w-6 h-6 text-[#2fd680] mb-1.5" />
                           <span className="text-xs text-gray-500 font-medium mb-0.5">Loại giường</span>
                           <span className="text-base font-bold text-gray-900">{(room.bedType || 'N/A').replace(/🛏️/g, '').trim()}</span>
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="flex flex-col items-center text-center">
                           <Users className="w-6 h-6 text-[#2fd680] mb-1.5" />
                           <span className="text-xs text-gray-500 font-medium mb-0.5">Khách</span>
                           <span className="text-base font-bold text-gray-900">{room.guests.replace(/👤|👥|👨‍👩‍👧‍�/g, '').trim()}</span>
                        </div>
                     </div>
                  </div>

                  {/* Amenities */}
                  <div>
                     <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#2fd680]" />
                        Tiện nghi
                     </h2>
                     <div className="grid grid-cols-1 gap-2">
                        {room.amenities.map((amenity, index) => (
                           <div
                              key={index}
                              className="flex items-center gap-2.5 p-2.5 bg-teal-50 hover:bg-teal-100 rounded-lg border border-[#2fd680] transition-all"
                           >
                              <div className="flex-shrink-0 w-7 h-7 bg-[#2fd680] rounded-md flex items-center justify-center">
                                 <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{amenity.label}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Sticky Footer - Booking */}
               <div className="sticky bottom-0 bg-[#2fd680] p-4 lg:p-5 border-t border-white/20">
                  <div className="flex items-center justify-center gap-4">
                     {/* Nếu có giá thì hiển thị giá + nút đặt phòng */}
                     {room.price ? (
                        <>
                           <div className="flex-1">
                              <div className="text-white/80 text-base font-medium mb-2">Giá mỗi đêm</div>
                              <div className="flex items-baseline gap-2">
                                 <span className="text-3xl font-bold text-white">
                                    {room.price}
                                 </span>
                                 <span className="text-white/80 text-sm">vnđ</span>
                              </div>
                           </div>

                           <button
                              onClick={() => {
                                 const intent = {
                                    roomId: room.id,
                                    roomName: room.name,
                                    price: room.price,
                                    guests: room.guests,
                                    redirectAfterLogin: location.pathname + location.search,
                                 };
                                 if (!isAuthenticated) {
                                    try { sessionStorage.setItem("pendingBooking", JSON.stringify(intent)); } catch { }
                                    navigate(`/login?redirect=${encodeURIComponent(intent.redirectAfterLogin)}&action=openBooking`);
                                    return;
                                 }
                                 window.dispatchEvent(new CustomEvent("openBooking", { detail: intent }));
                              }}
                              className="px-6 py-3 bg-white text-[#2fd680] font-bold text-sm rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-lg whitespace-nowrap"
                           >
                              Đặt phòng ngay
                           </button>
                        </>
                     ) : (
                        <Link
                           to="/contact"
                           className="px-8 py-3 bg-white text-[#2fd680] font-bold text-base rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-lg whitespace-nowrap"
                        >
                           Liên hệ
                        </Link>
                     )}
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
}
