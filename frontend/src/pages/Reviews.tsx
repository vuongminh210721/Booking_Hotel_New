import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Star, ArrowLeft, MessageSquare, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Reviews() {
   const { user } = useAuth();
   const navigate = useNavigate();

   // Form state for new review
   const [showNewReview, setShowNewReview] = useState(false);
   const [newReview, setNewReview] = useState({
      hotelName: "",
      rating: 0,
      comment: "",
   });
   const [hoverRating, setHoverRating] = useState(0);
   const [submitting, setSubmitting] = useState(false);

   // Mock reviews data
   const [reviews, setReviews] = useState([
      {
         id: 1,
         hotelName: "Space Room",
         rating: 5,
         comment: "Khách sạn tuyệt vời! Dịch vụ chu đáo, phòng ốc sạch sẽ. Sẽ quay lại lần sau.",
         date: "15/01/2025",
      },
      {
         id: 2,
         hotelName: "Ocean View Hotel",
         rating: 4,
         comment: "Vị trí đẹp, view biển tuyệt vời. Nhân viên thân thiện.",
         date: "10/12/2024",
      },
   ]);

   const handleSubmitReview = async () => {
      if (!newReview.hotelName || !newReview.rating || !newReview.comment.trim()) {
         alert("Vui lòng điền đầy đủ thông tin đánh giá");
         return;
      }

      setSubmitting(true);

      // Simulate API call
      setTimeout(() => {
         const review = {
            id: reviews.length + 1,
            hotelName: newReview.hotelName,
            rating: newReview.rating,
            comment: newReview.comment,
            date: new Date().toLocaleDateString("vi-VN"),
         };

         setReviews([review, ...reviews]);
         setNewReview({ hotelName: "", rating: 0, comment: "" });
         setShowNewReview(false);
         setSubmitting(false);
      }, 500);
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 py-12 px-4">
         <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <button
               onClick={() => navigate("/")}
               className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
               <ArrowLeft className="w-5 h-5" />
               Quay lại trang chủ
            </button>

            {/* Reviews Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
               {/* Header */}
               <div className="bg-gradient-to-r from-teal-600 to-green-600 px-8 py-10">
                  <div className="flex justify-between items-center">
                     <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Đánh giá của tôi</h1>
                        <p className="text-white/90">Quản lý các đánh giá khách sạn của bạn</p>
                     </div>
                     <button
                        onClick={() => setShowNewReview(!showNewReview)}
                        className="bg-white hover:bg-gray-50 text-teal-600 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all hover:scale-105"
                     >
                        {showNewReview ? "Đóng" : "+ Viết đánh giá mới"}
                     </button>
                  </div>
               </div>

               {/* Content */}
               <div className="p-8">
                  {/* New Review Form */}
                  {showNewReview && (
                     <div className="mb-8 bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200 rounded-2xl p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Viết đánh giá mới</h2>

                        {/* Hotel Name */}
                        <div className="mb-6">
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phòng/Khách sạn bạn đã ở
                           </label>
                           <input
                              type="text"
                              value={newReview.hotelName}
                              onChange={(e) => setNewReview({ ...newReview, hotelName: e.target.value })}
                              placeholder="Nhập tên khách sạn..."
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all"
                           />
                        </div>

                        {/* Star Rating */}
                        <div className="mb-6">
                           <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Đánh giá của bạn
                           </label>
                           <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                 <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                 >
                                    <Star
                                       className={`w-10 h-10 transition-colors ${star <= (hoverRating || newReview.rating)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                          }`}
                                    />
                                 </button>
                              ))}
                              {newReview.rating > 0 && (
                                 <span className="ml-4 text-lg font-bold text-teal-600">
                                    {newReview.rating}/5
                                 </span>
                              )}
                           </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-6">
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nhận xét của bạn
                           </label>
                           <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              placeholder="Chia sẻ trải nghiệm của bạn về khách sạn..."
                              rows={5}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all resize-none"
                           />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3">
                           <button
                              onClick={() => {
                                 setShowNewReview(false);
                                 setNewReview({ hotelName: "", rating: 0, comment: "" });
                              }}
                              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                           >
                              Hủy
                           </button>
                           <button
                              onClick={handleSubmitReview}
                              disabled={submitting}
                              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                           >
                              <Send className="w-5 h-5" />
                              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                           </button>
                        </div>
                     </div>
                  )}
                  {reviews.length === 0 ? (
                     <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Bạn chưa có đánh giá nào</p>
                     </div>
                  ) : (
                     <div className="space-y-6">
                        {reviews.map((review) => (
                           <div
                              key={review.id}
                              className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                           >
                              {/* Hotel Name & Date */}
                              <div className="flex justify-between items-start mb-4">
                                 <h3 className="text-xl font-bold text-gray-900">{review.hotelName}</h3>
                                 <span className="text-sm text-gray-500">{review.date}</span>
                              </div>

                              {/* Rating */}
                              <div className="flex items-center gap-1 mb-4">
                                 {[...Array(5)].map((_, i) => (
                                    <Star
                                       key={i}
                                       className={`w-5 h-5 ${i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                          }`}
                                    />
                                 ))}
                                 <span className="ml-2 font-semibold text-gray-700">
                                    {review.rating}/5
                                 </span>
                              </div>

                              {/* Comment */}
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
