import { useState } from "react";
import { usePaymentEmailCheck } from "@/hooks/use-payment-email-check";

export default function PaymentEmailCheck() {
   const [userEmail, setUserEmail] = useState("trongluffy22@gmail.com");

   const { checkPayment, loading, result, countdown, reset } =
      usePaymentEmailCheck({
         timeoutMs: 60000,
         intervalMs: 5000,
         onSuccess: () => {
            console.log("✅ Payment verified successfully!");
         },
         onFailure: () => {
            console.log("❌ Payment verification failed");
         },
      });

   const handleCheckPayment = () => {
      checkPayment(userEmail);
   };

   return (
      <div className="max-w-2xl mx-auto p-8">
         <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
               Xác nhận thanh toán qua Email
            </h2>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-2">
                     Email của bạn:
                  </label>
                  <input
                     type="email"
                     value={userEmail}
                     onChange={(e) => setUserEmail(e.target.value)}
                     disabled={loading}
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                     placeholder="example@gmail.com"
                  />
               </div>

               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                     📧 Hướng dẫn:
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                     <li>Nhấn nút "Bắt đầu kiểm tra" bên dưới</li>
                     <li>
                        Gửi email từ <strong>{userEmail}</strong> đến{" "}
                        <strong>hotelhub2202@gmail.com</strong>
                     </li>
                     <li>Tiêu đề và nội dung email: bất kỳ</li>
                     <li>Hệ thống sẽ tự động phát hiện trong vòng 1 phút</li>
                  </ol>
               </div>

               <button
                  onClick={handleCheckPayment}
                  disabled={loading || !userEmail}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
               >
                  {loading ? "Đang kiểm tra..." : "Bắt đầu kiểm tra thanh toán"}
               </button>

               {loading && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="font-semibold text-yellow-900">
                              ⏳ Đang chờ email từ {userEmail}...
                           </p>
                           <p className="text-sm text-yellow-700 mt-1">
                              Vui lòng gửi email đến hotelhub2202@gmail.com
                           </p>
                        </div>
                        <div className="text-3xl font-bold text-yellow-900">
                           {countdown}s
                        </div>
                     </div>
                     <div className="mt-3 bg-yellow-200 rounded-full h-2 overflow-hidden">
                        <div
                           className="bg-yellow-600 h-full transition-all duration-1000"
                           style={{ width: `${(countdown / 60) * 100}%` }}
                        />
                     </div>
                  </div>
               )}

               {result && !loading && (
                  <div
                     className={`rounded-lg p-6 text-center ${result.success
                        ? "bg-green-50 border-2 border-green-500"
                        : "bg-red-50 border-2 border-red-500"
                        }`}
                  >
                     <div className="text-6xl mb-4">
                        {result.success ? "✅" : "❌"}
                     </div>
                     <h3
                        className={`text-2xl font-bold mb-2 ${result.success ? "text-green-900" : "text-red-900"
                           }`}
                     >
                        {result.success
                           ? "Thanh toán thành công!"
                           : "Thanh toán thất bại"}
                     </h3>
                     <p
                        className={`text-sm ${result.success ? "text-green-700" : "text-red-700"
                           }`}
                     >
                        {result.success
                           ? `Đã nhận được email xác nhận từ ${userEmail}`
                           : "Không nhận được email xác nhận trong vòng 1 phút"}
                     </p>
                     {result.error && (
                        <p className="text-red-600 text-sm mt-2">
                           Lỗi: {result.error}
                        </p>
                     )}
                     <button
                        onClick={reset}
                        className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                     >
                        Thử lại
                     </button>
                  </div>
               )}

               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold mb-2">🔒 Lưu ý:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                     <li>Email hệ thống: <strong>hotelhub2202@gmail.com</strong></li>
                     <li>Thời gian chờ: 60 giây</li>
                     <li>Không cần quan tâm nội dung email</li>
                     <li>Chỉ cần email từ địa chỉ bạn đã nhập được gửi đến</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
   );
}
