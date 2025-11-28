import { useState } from "react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function FAQ() {
   useScrollToTop();
   const [openIndex, setOpenIndex] = useState<number | null>(null);

   const faqs = [
      {
         question:
            "Chính sách đặt phòng của HOTELHUB như thế nào? Có cần thanh toán trước không?",
         answer: `
        Khi bạn đặt phòng tại **HOTELHUB**, chúng tôi cung cấp hai hình thức thanh toán linh hoạt:

        🔹 **Thanh toán ngay khi đặt phòng**: bạn có thể thanh toán trực tuyến bằng thẻ hoặc ví điện tử, đảm bảo giữ chỗ 100% và nhận xác nhận ngay lập tức.

        🔹 **Thanh toán tại khách sạn**: áp dụng cho một số đối tác nhất định, bạn chỉ cần đặt phòng và thanh toán trực tiếp khi đến nhận phòng.

        HOTELHUB không thu bất kỳ khoản phí ẩn nào. Mọi chi tiết về giá phòng, thuế và phụ phí (nếu có) đều được hiển thị rõ ràng trước khi bạn xác nhận đặt phòng.
      `,
      },
      {
         question:
            "Nếu tôi muốn hủy hoặc thay đổi đặt phòng thì phải làm thế nào?",
         answer: `
        Việc hủy hoặc thay đổi đặt phòng rất đơn giản. Bạn chỉ cần truy cập vào mục **“Đặt phòng của tôi”** trên trang web hoặc ứng dụng HOTELHUB.

        💡 Lưu ý:
        - Với **phòng có chính sách hủy miễn phí**, bạn có thể hủy đặt trước thời hạn quy định mà không bị mất phí.
        - Với **phòng không hoàn hủy**, HOTELHUB vẫn có thể hỗ trợ bạn liên hệ khách sạn để xem xét linh hoạt từng trường hợp cụ thể.

        Ngoài ra, nếu bạn gặp vấn đề khẩn cấp, đội ngũ **Hỗ trợ khách hàng 24/7** của chúng tôi luôn sẵn sàng hỗ trợ qua hotline hoặc email.
      `,
      },
      {
         question:
            "Làm sao tôi biết phòng còn trống thật sự khi đặt qua HOTELHUB?",
         answer: `
        HOTELHUB kết nối **trực tiếp với hệ thống quản lý phòng của khách sạn**, vì vậy tình trạng phòng luôn được cập nhật **theo thời gian thực (real-time)**.

        Khi bạn bấm “Đặt phòng ngay”, hệ thống sẽ kiểm tra lại lần cuối trước khi xác nhận để đảm bảo rằng **phòng bạn chọn vẫn còn trống**.

        Trong trường hợp hiếm hoi khách sạn bị quá tải hoặc lỗi đồng bộ, HOTELHUB sẽ:
        - Hỗ trợ đổi sang khách sạn tương đương hoặc tốt hơn cùng khu vực.
        - Hoàn tiền 100% nếu bạn không đồng ý đổi.
      `,
      },
      {
         question: "HOTELHUB có chương trình ưu đãi hoặc mã giảm giá không?",
         answer: `
        Có chứ 💚 HOTELHUB thường xuyên triển khai các chương trình ưu đãi hấp dẫn:

        🎁 **Mã giảm giá theo mùa**: giảm đến 50% cho các dịp lễ, Tết, du lịch hè, hoặc Black Friday.  
        🏨 **Ưu đãi độc quyền HOTELHUB+**: dành cho thành viên đăng ký tài khoản, bạn sẽ nhận được mã giảm giá riêng và quyền truy cập sớm vào các deal đặc biệt.  
        ✈️ **Combo du lịch**: đặt khách sạn kèm vé máy bay để nhận ưu đãi tốt hơn.

        Bạn có thể theo dõi các khuyến mãi mới nhất tại mục **“Ưu đãi HOT”** trên website hoặc trong ứng dụng HOTELHUB nhé!
      `,
      },
      {
         question: "HOTELHUB có đảm bảo an toàn và chất lượng phòng không?",
         answer: `
        Chắc chắn rồi. HOTELHUB chỉ hợp tác với **các khách sạn, resort, homestay được cấp phép hoạt động hợp pháp** và có đánh giá tích cực từ khách hàng thực tế.

        Trước khi hiển thị, mỗi đối tác đều trải qua quy trình **xác minh thông tin và kiểm duyệt chất lượng nghiêm ngặt**, bao gồm:
        - Hình ảnh thực tế của phòng.  
        - Cơ sở vật chất và dịch vụ đi kèm.  
        - Đánh giá và phản hồi từ khách lưu trú trước đó.

        HOTELHUB cam kết mang lại **trải nghiệm đặt phòng minh bạch, an toàn và đáng tin cậy nhất** cho bạn.
      `,
      },
   ];

   return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
         <h1 className="text-2xl md:text-3xl font-bold text-[#2fd680] mb-6 text-center">
            Những câu hỏi thường gặp
         </h1>

         <p className="text-center text-gray-700 mb-8">
            Dưới đây là những câu hỏi phổ biến mà khách hàng thường gửi về{" "}
            <strong>HOTELHUB</strong>. Nếu bạn cần thêm hỗ trợ, vui lòng liên hệ qua
            email{" "}
            <a
               href="mailto:hotline@hotelhub.vn"
               target="_blank"
               rel="noreferrer"
               className="text-[#24f1d2] underline hover:text-[#40ffe2]"
            >
               hotline@hotelhub.vn
            </a>{" "}
            hoặc hotline <strong>1900 888 369</strong> để được tư vấn nhanh nhất 🌿
         </p>

         <div className="space-y-4">
            {faqs.map((faq, index) => (
               <div
                  key={index}
                  className="border rounded-lg shadow-sm overflow-hidden"
               >
                  <button
                     className="w-full text-left p-4 flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
                     onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                     <span className="font-medium text-[#2fd680]">{faq.question}</span>
                     <svg
                        className={`w-6 h-6 text-[#2fd680] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                  </button>

                  {openIndex === index && (
                     <div className="p-4 border-t bg-gray-50 animate-fadeIn text-gray-800 whitespace-pre-line">
                        {faq.answer}
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>
   );
}
