/**
 * Example: Tích hợp Payment Email Check vào Booking Flow
 * 
 * Copy component này vào trang thanh toán của bạn
 * Hoặc tham khảo cách sử dụng hook usePaymentEmailCheck
 */

import { useState } from "react";
import { usePaymentEmailCheck } from "@/hooks/use-payment-email-check";

interface BookingPaymentProps {
   bookingId: string;
   userEmail: string;
   amount: number;
   qrCodeUrl: string;
   onPaymentConfirmed: () => void;
}

export default function BookingPaymentExample({
   bookingId,
   userEmail,
   amount,
   qrCodeUrl,
   onPaymentConfirmed,
}: BookingPaymentProps) {
   const [step, setStep] = useState<"qr" | "checking" | "done">("qr");

   const { checkPayment, loading, result, countdown } = usePaymentEmailCheck({
      timeoutMs: 60000,
      intervalMs: 5000,
      onSuccess: () => {
         setStep("done");
         onPaymentConfirmed();
      },
      onFailure: () => {
         alert("Không nhận được xác nhận. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
         setStep("qr");
      },
   });

   const handleConfirmTransfer = () => {
      setStep("checking");
      checkPayment(userEmail);
   };

   return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
         <h2 className="text-2xl font-bold mb-4">Thanh toán booking</h2>

         {/* Step 1: Show QR Code */}
         {step === "qr" && (
            <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Mã booking: {bookingId}</p>
                  <p className="text-sm text-gray-600">Email: {userEmail}</p>
                  <p className="text-2xl font-bold mt-2">
                     Số tiền: {amount.toLocaleString("vi-VN")} VNĐ
                  </p>
               </div>

               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <img
                     src={qrCodeUrl}
                     alt="QR Code"
                     className="w-48 h-48 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-600">
                     Quét mã QR để chuyển khoản
                  </p>
               </div>

               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                     📧 Sau khi chuyển khoản:
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                     <li>
                        Gửi email từ <strong>{userEmail}</strong>
                     </li>
                     <li>
                        Đến: <strong>hotelhub2202@gmail.com</strong>
                     </li>
                     <li>Tiêu đề/nội dung: bất kỳ</li>
                     <li>Nhấn nút "Tôi đã chuyển khoản" bên dưới</li>
                  </ol>
               </div>

               <button
                  onClick={handleConfirmTransfer}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
               >
                  Tôi đã chuyển khoản
               </button>
            </div>
         )}

         {/* Step 2: Checking for email */}
         {step === "checking" && loading && (
            <div className="space-y-4">
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                        <p className="font-semibold text-yellow-900 text-lg">
                           ⏳ Đang xác nhận thanh toán...
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                           Vui lòng gửi email xác nhận đến hotelhub2202@gmail.com
                        </p>
                     </div>
                     <div className="text-4xl font-bold text-yellow-900">
                        {countdown}s
                     </div>
                  </div>
                  <div className="bg-yellow-200 rounded-full h-3 overflow-hidden">
                     <div
                        className="bg-yellow-600 h-full transition-all duration-1000"
                        style={{ width: `${(countdown / 60) * 100}%` }}
                     />
                  </div>
               </div>

               <div className="text-center text-sm text-gray-600">
                  <p>Hệ thống đang kiểm tra hộp thư...</p>
                  <p>Khi nhận được email, thanh toán sẽ được xác nhận tự động</p>
               </div>
            </div>
         )}

         {/* Step 3: Payment confirmed */}
         {step === "done" && result?.success && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
               <div className="text-7xl mb-4">✅</div>
               <h3 className="text-3xl font-bold text-green-900 mb-2">
                  Thanh toán thành công!
               </h3>
               <p className="text-green-700 mb-4">
                  Booking của bạn đã được xác nhận
               </p>
               <div className="bg-white rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-600">
                     Mã booking: <span className="font-mono">{bookingId}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                     Email xác nhận đã được gửi đến: {userEmail}
                  </p>
               </div>
            </div>
         )}

         {/* Failed state */}
         {result && !result.success && !loading && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 text-center">
               <div className="text-6xl mb-4">❌</div>
               <h3 className="text-2xl font-bold text-red-900 mb-2">
                  Chưa nhận được xác nhận
               </h3>
               <p className="text-red-700 mb-4">
                  Vui lòng gửi email xác nhận hoặc liên hệ hỗ trợ
               </p>
               <button
                  onClick={() => setStep("qr")}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
               >
                  Thử lại
               </button>
            </div>
         )}
      </div>
   );
}

/**
 * Cách sử dụng:
 * 
 * import BookingPaymentExample from "@/components/BookingPaymentExample";
 * 
 * function BookingPage() {
 *   const handlePaymentConfirmed = async () => {
 *     // Update booking status in database
 *     await fetch(`/api/bookings/${bookingId}`, {
 *       method: 'PATCH',
 *       body: JSON.stringify({ status: 'paid' })
 *     });
 *     
 *     // Redirect to confirmation page
 *     navigate('/booking-confirmed');
 *   };
 *   
 *   return (
 *     <BookingPaymentExample
 *       bookingId="BK001"
 *       userEmail="user@example.com"
 *       amount={2500000}
 *       qrCodeUrl="/qr-code.png"
 *       onPaymentConfirmed={handlePaymentConfirmed}
 *     />
 *   );
 * }
 */
