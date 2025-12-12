import { useEffect, useState } from "react";
import { Star, ArrowLeft, MessageSquare, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { reviewService, type Review } from "@/services/reviewService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Reviews() {
   const { user } = useAuth();
   const navigate = useNavigate();

   const [showNewReview, setShowNewReview] = useState(false);
   const [newReview, setNewReview] = useState({
      hotelName: "",
      location: "",
      rating: 0,
      comment: "",
   });
   const [hoverRating, setHoverRating] = useState(0);
   const [submitting, setSubmitting] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [editingData, setEditingData] = useState({
      hotelName: "",
      location: "",
      rating: 0,
      comment: "",
   });
   const [savingEdit, setSavingEdit] = useState(false);
   const [deletingId, setDeletingId] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [reviews, setReviews] = useState<Review[]>([]);

   useEffect(() => {
      if (!user) return;
      const fetchReviews = async () => {
         try {
            setLoading(true);
            setError(null);
            const data = await reviewService.getMyReviews();
            setReviews(data);
         } catch (err: any) {
            setError(err.message || "Không thể tải đánh giá");
         } finally {
            setLoading(false);
         }
      };
      fetchReviews();
   }, [user]);

   const handleSubmitReview = async () => {
      if (!newReview.hotelName || !newReview.location || !newReview.rating || !newReview.comment.trim()) {
         alert("Vui lòng điền đầy đủ thông tin đánh giá");
         return;
      }

      setSubmitting(true);
      setError(null);
      try {
         const created = await reviewService.createReview({
            hotelName: newReview.hotelName,
            location: newReview.location,
            rating: newReview.rating,
            comment: newReview.comment,
         });

         setReviews((prev) => [created, ...prev]);
         setNewReview({ hotelName: "", location: "", rating: 0, comment: "" });
         setShowNewReview(false);
      } catch (err: any) {
         setError(err.message || "Gửi đánh giá thất bại");
      } finally {
         setSubmitting(false);
      }
   };

   const startEdit = (review: Review) => {
      setEditingId(review._id);
      setEditingData({
         hotelName: review.hotelName,
         location: review.location,
         rating: review.rating,
         comment: review.comment,
      });
   };

   const cancelEdit = () => {
      setEditingId(null);
      setEditingData({ hotelName: "", location: "", rating: 0, comment: "" });
      setSavingEdit(false);
   };

   const handleUpdateReview = async () => {
      if (!editingId) return;
      if (!editingData.hotelName || !editingData.location || !editingData.rating || !editingData.comment.trim()) {
         alert("Vui lòng điền đầy đủ thông tin đánh giá");
         return;
      }

      setSavingEdit(true);
      setError(null);
      try {
         const updated = await reviewService.updateReview(editingId, {
            hotelName: editingData.hotelName,
            location: editingData.location,
            rating: editingData.rating,
            comment: editingData.comment,
         });
         setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
         cancelEdit();
      } catch (err: any) {
         setError(err.message || "Cập nhật đánh giá thất bại");
      } finally {
         setSavingEdit(false);
      }
   };

   const handleDeleteReview = async (id: string) => {
      const confirmed = window.confirm("Bạn có chắc muốn xóa đánh giá này?");
      if (!confirmed) return;
      setDeletingId(id);
      setError(null);
      try {
         await reviewService.deleteReview(id);
         setReviews((prev) => prev.filter((r) => r._id !== id));
      } catch (err: any) {
         setError(err.message || "Xóa đánh giá thất bại");
      } finally {
         setDeletingId(null);
      }
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
                        <h1 className="text-3xl font-bold text-white mb-2">Đánh giá của bạn</h1>
                        <p className="text-white/90">Quản lý các đánh giá khách sạn/phòng đã ở</p>
                     </div>
                     <button
                        onClick={() => setShowNewReview(!showNewReview)}
                        className="bg-white hover:bg-gray-50 text-teal-600 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all hover:scale-105"
                        disabled={!user}
                     >
                        {showNewReview ? "Đóng" : "+ Viết đánh giá của bạn"}
                     </button>
                  </div>
               </div>

               {/* Content */}
               <div className="p-8">
                  {!user && (
                     <div className="mb-6 flex flex-col items-center gap-3 text-center">
                        <p className="text-gray-700 font-semibold">Vui lòng đăng nhập để xem và viết đánh giá.</p>
                        <div className="flex gap-3">
                           <button
                              onClick={() => navigate("/login")}
                              className="px-5 py-2 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                           >
                              Đăng nhập
                           </button>
                           <button
                              onClick={() => navigate("/register")}
                              className="px-5 py-2 bg-white border border-teal-600 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-colors"
                           >
                              Đăng ký
                           </button>
                        </div>
                     </div>
                  )}

                  {error && (
                     <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                        {error}
                     </div>
                  )}

                  {loading && user && (
                     <div className="mb-6 text-gray-500">Đang tải đánh giá...</div>
                  )}

                  {/* New Review Form */}
                  {showNewReview && user && (
                     <div className="mb-8 bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200 rounded-2xl p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Viết đánh giá của bạn</h2>

                        {/* Hotel Name */}
                        <div className="mb-6">
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phòng bạn đã ở
                           </label>
                           <input
                              type="text"
                              value={newReview.hotelName}
                              onChange={(e) => setNewReview({ ...newReview, hotelName: e.target.value })}
                              placeholder="Nhập tên phòng..."
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all"
                           />
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Địa điểm
                           </label>
                           <select
                              value={newReview.location}
                              onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all"
                           >
                              <option value="">Chọn địa điểm</option>
                              <option value="Tp Hồ Chí Minh">Tp Hồ Chí Minh</option>
                              <option value="Hà Nội">Hà Nội</option>
                              <option value="Đà Nẵng">Đà Nẵng</option>
                           </select>
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
                                 setNewReview({ hotelName: "", location: "", rating: 0, comment: "" });
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
                  {user && !loading && reviews.length === 0 ? (
                     <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Bạn chưa có đánh giá nào</p>
                     </div>
                  ) : (
                     user && (
                        <div className="space-y-6">
                           {reviews.map((review) => (
                              <div
                                 key={review._id}
                                 className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                              >
                                 {/* Hotel Name & Date */}
                                 <div className="flex justify-between items-start mb-4">
                                    <div>
                                       {editingId === review._id ? (
                                          <div className="space-y-2">
                                             <input
                                                className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-lg font-semibold text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                                value={editingData.hotelName}
                                                onChange={(e) =>
                                                   setEditingData((prev) => ({ ...prev, hotelName: e.target.value }))
                                                }
                                                placeholder="Tên phòng"
                                             />
                                             <select
                                                className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                                                value={editingData.location}
                                                onChange={(e) =>
                                                   setEditingData((prev) => ({ ...prev, location: e.target.value }))
                                                }
                                             >
                                                <option value="">Chọn địa điểm</option>
                                                <option value="Tp Hồ Chí Minh">Tp Hồ Chí Minh</option>
                                                <option value="Hà Nội">Hà Nội</option>
                                                <option value="Đà Nẵng">Đà Nẵng</option>
                                             </select>
                                          </div>
                                       ) : (
                                          <div>
                                             <h3 className="text-xl font-bold text-gray-900">{review.hotelName}</h3>
                                             <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <svg className="w-3.5 h-3.5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                                   <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                {review.location}
                                             </p>
                                          </div>
                                       )}
                                       <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
                                          <Avatar className="h-9 w-9">
                                             <AvatarImage
                                                src={review.user?.avatarUrl ? `http://localhost:5000${review.user.avatarUrl}` : undefined}
                                                alt={review.user?.fullName || "avatar"}
                                                onError={(e) => {
                                                   e.currentTarget.style.display = "none";
                                                }}
                                             />
                                             <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                                                {review.user?.fullName
                                                   ? review.user.fullName
                                                      .split(" ")
                                                      .map((n) => n[0])
                                                      .join("")
                                                      .toUpperCase()
                                                      .slice(0, 2)
                                                   : "GU"}
                                             </AvatarFallback>
                                          </Avatar>
                                          <span className="font-semibold">{review.user?.fullName || "Ẩn danh"}</span>
                                       </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                       <span className="text-sm text-gray-500">
                                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                       </span>
                                       <div className="flex gap-2 text-sm">
                                          {editingId === review._id ? (
                                             <>
                                                <button
                                                   onClick={handleUpdateReview}
                                                   disabled={savingEdit}
                                                   className="px-3 py-1 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60"
                                                >
                                                   {savingEdit ? "Đang lưu..." : "Lưu"}
                                                </button>
                                                <button
                                                   onClick={cancelEdit}
                                                   className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                                                >
                                                   Hủy
                                                </button>
                                             </>
                                          ) : (
                                             <>
                                                <button
                                                   onClick={() => startEdit(review)}
                                                   className="px-3 py-1 rounded-lg bg-white border border-teal-200 text-teal-700 font-semibold hover:bg-teal-50"
                                                >
                                                   Sửa
                                                </button>
                                                <button
                                                   onClick={() => handleDeleteReview(review._id)}
                                                   disabled={deletingId === review._id}
                                                   className="px-3 py-1 rounded-lg bg-white border border-red-200 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-60"
                                                >
                                                   {deletingId === review._id ? "Đang xóa..." : "Xóa"}
                                                </button>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                 </div>

                                 {/* Rating */}
                                 <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                       <button
                                          key={i}
                                          type="button"
                                          onClick={() => {
                                             if (editingId === review._id) {
                                                setEditingData((prev) => ({ ...prev, rating: i + 1 }));
                                             }
                                          }}
                                          className={editingId === review._id ? "cursor-pointer" : "cursor-default"}
                                       >
                                          <Star
                                             className={`w-5 h-5 ${i < (editingId === review._id ? editingData.rating : review.rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                          />
                                       </button>
                                    ))}
                                    <span className="ml-2 font-semibold text-gray-700">
                                       {editingId === review._id ? editingData.rating : review.rating}/5
                                    </span>
                                 </div>

                                 {/* Comment */}
                                 {editingId === review._id ? (
                                    <textarea
                                       value={editingData.comment}
                                       onChange={(e) =>
                                          setEditingData((prev) => ({ ...prev, comment: e.target.value }))
                                       }
                                       rows={4}
                                       className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all"
                                       placeholder="Cập nhật nhận xét..."
                                    />
                                 ) : (
                                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                 )}
                              </div>
                           ))}
                        </div>
                     )
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
