import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function CheckInPolicy() {
   useScrollToTop();
   return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800 leading-relaxed">
         <h1 className="text-3xl font-bold text-center text-[#2fd680] mb-8">
            Chính sách giao và nhận phòng
         </h1>

         <p className="mb-4">
            Sau khi nhận được đơn đặt phòng và hoàn tất việc thanh toán, chúng tôi
            sẽ xác nhận thông tin đặt dịch vụ của Quý khách qua email, điện thoại
            hoặc tin nhắn từ hệ thống của HOTELHUB.
         </p>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            1. Quy định Giấy tờ / Thủ tục Check-in
         </h2>
         <p className="mb-4">
            Quý khách vui lòng xuất trình thông tin xác nhận đặt phòng cho lễ tân
            của HOTELHUB để nhận phòng theo thời gian đã đặt. Độ tuổi tối thiểu để
            nhận phòng là <strong>18 tuổi trở lên</strong>. Trường hợp khách hàng
            dưới 18 tuổi cần có người giám hộ hợp pháp để xác minh và chịu trách
            nhiệm trong suốt thời gian lưu trú.
         </p>
         <ul className="list-disc list-inside space-y-1 mb-4">
            <li>
               <strong>Khách Việt Nam:</strong> Xuất trình CCCD bản cứng hoặc VNeID
               (định danh mức 2).
            </li>
            <li>
               <strong>Khách nước ngoài:</strong> Xuất trình một trong hai giấy tờ
               sau (còn hiệu lực): Hộ chiếu (Passport) kèm Visa hoặc Thẻ tạm trú bản
               cứng.
            </li>
         </ul>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            2. Quy định Thời gian Nhận - Trả phòng
         </h2>
         <ul className="list-disc list-inside mb-4">
            <li>Thời gian Nhận phòng: sau 14h</li>
            <li>Thời gian Trả phòng: trước 12h</li>
         </ul>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            3. Chính sách Trả phòng muộn
         </h2>
         <p className="mb-4">
            Trong trường hợp Quý khách có nhu cầu trả phòng trễ hơn thời gian quy
            định, HOTELHUB sẽ áp dụng phụ thu dựa trên thời gian lưu trú thêm như
            sau:
         </p>
         <ul className="list-disc list-inside mb-4">
            <li>
               Từ 12:00 – 18:00: Phụ thu <strong>50% giá phòng</strong> (tính theo
               giá phòng của ngày trả phòng).
            </li>
            <li>
               Sau 18:00: Phụ thu <strong>100% giá phòng</strong> (tính như một đêm
               lưu trú mới theo giá phòng của ngày trả phòng).
            </li>
         </ul>
         <p className="mb-4">
            Để thuận tiện cho việc hỗ trợ và sắp xếp phòng, Quý khách vui lòng thông
            báo trước cho HOTELHUB nếu có nhu cầu ở lại lâu hơn để chúng tôi hỗ trợ
            phù hợp.
         </p>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            4. Chính sách phụ thu Ăn sáng cho Trẻ em
         </h2>
         <ul className="list-disc list-inside mb-4">
            <li>Trẻ từ 0 đến 5 tuổi: miễn phí ăn sáng cùng Bố Mẹ.</li>
            <li>Trẻ từ 6 đến 11 tuổi: phụ thu 50% phí ăn sáng cùng Bố Mẹ.</li>
            <li>Trẻ từ 12 tuổi trở lên: phụ thu 100% phí ăn sáng như người lớn.</li>
         </ul>
         <p className="mb-6">
            Mọi chi phí phát sinh khác trong thời gian lưu trú được niêm yết theo
            giá và quy định của khách sạn, Quý khách vui lòng thanh toán khi trả
            phòng.
         </p>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            5. Quy định dành riêng cho từng khách sạn
         </h2>
         <p className="mb-4">
            Dưới đây là các quy định cụ thể về số lượng khách, trẻ em và phí giường
            phụ áp dụng cho từng khách sạn trong hệ thống HOTELHUB tại các thành phố
            Hồ Chí Minh, Hà Nội và Đà Nẵng.
         </p>

         <p className="mb-4 italic">
            * Do nội dung chi tiết có thể dài, bạn có thể chia phần quy định riêng
            cho từng khu vực (Hồ Chí Minh, Hà Nội, Đà Nẵng) thành các tab hoặc
            accordion để người dùng dễ theo dõi hơn.
         </p>

         <p>
            Quý khách vui lòng đến nhận phòng đúng thời gian và địa điểm đã đặt. Nếu
            Quý khách gặp khó khăn trong việc di chuyển, vui lòng liên hệ với đội
            ngũ hỗ trợ của HOTELHUB để được hướng dẫn. HOTELHUB không chịu trách
            nhiệm trong trường hợp Quý khách không liên hệ khi cần hỗ trợ.
         </p>
      </div>
   );
}
