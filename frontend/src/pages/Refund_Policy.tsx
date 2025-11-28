import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function CheckInPolicy() {
   useScrollToTop();
   return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800 leading-relaxed">
         <h1 className="text-3xl font-bold text-center text-[#2fd680] mb-8">
            Chính sách đổi, trả phòng và hoàn tiền
         </h1>

         <p className="mb-4">
            Trong trường hợp Quý khách muốn đổi ngày trả phòng, đổi loại phòng khác
            hay hủy đặt phòng, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi qua
            thông tin được cung cấp trên website HOTELHUB để được hỗ trợ nhanh chóng
            và thuận tiện.
         </p>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            1. Chính sách đổi phòng
         </h2>
         <p className="mb-4">
            Nếu Quý khách muốn đổi sang hạng phòng cao cấp hơn, sẽ phụ thu theo mức
            chênh lệch giá hạng phòng tại thời điểm phát sinh nhu cầu. Giá phòng
            chênh lệch tùy thuộc vào từng khách sạn và loại phòng.
         </p>
         <p className="mb-4">
            Trong trường hợp Quý khách muốn đổi xuống hạng phòng thấp hơn hạng phòng
            đã đặt hoặc đang ở, HOTELHUB sẽ không hoàn lại phần tiền chênh lệch.
         </p>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            2. Chính sách đổi ngày nhận phòng
         </h2>
         <p className="mb-4">
            Nếu Quý khách gửi yêu cầu điều chỉnh ngày nhận phòng{" "}
            <strong>trước 3 ngày</strong> so với thời điểm nhận phòng, HOTELHUB sẽ
            cố gắng hỗ trợ điều chỉnh tùy thuộc vào tình trạng phòng hiện tại.
         </p>
         <p className="mb-4">
            Nếu Quý khách gửi yêu cầu điều chỉnh ngày nhận phòng{" "}
            <strong>trong vòng 3 ngày</strong> so với thời điểm nhận phòng, HOTELHUB
            sẽ giữ nguyên thời gian lưu trú ban đầu và không thể hỗ trợ điều chỉnh
            theo yêu cầu.
         </p>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            3. Chính sách hủy phòng
         </h2>
         <ul className="list-disc list-inside mb-4 space-y-2">
            <li>
               Quý khách hủy đặt phòng <strong>trước 7 ngày</strong> so với ngày nhận
               phòng: được hoàn <strong>100% số tiền đã thanh toán.</strong>
            </li>
            <li>
               Quý khách hủy đặt phòng <strong>trong vòng 7 ngày</strong> so với ngày
               nhận phòng: phí hủy là <strong>100% toàn bộ chi phí phòng.</strong>
            </li>
            <li>
               Trường hợp Quý khách không đến làm thủ tục nhận phòng trong ngày
               Check-in, đơn đặt phòng được xem là{" "}
               <strong>vắng mặt (no-show)</strong> và sẽ không được hoàn trả.
            </li>
            <li>
               Khi Quý khách không đến nhận phòng, phòng đã đặt sẽ không được giữ và
               sẽ được xử lý theo Chính sách giao – nhận phòng trong email xác nhận
               đặt phòng.
            </li>
            <li>
               Nếu Quý khách hủy đơn đặt phòng trong các dịp{" "}
               <strong>Lễ / Tết</strong> (theo quy định của Nhà nước Việt Nam), phí
               hủy sẽ là <strong>100% toàn bộ chi phí phòng.</strong> Quy định này áp
               dụng cho tất cả khách hàng, bao gồm Hội viên HOTELHUB.
            </li>
         </ul>

         <p className="mb-4">
            Sau khi hủy đơn đặt phòng, HOTELHUB sẽ gửi thông báo chi tiết dịch vụ,
            chi phí phát sinh và số tiền hoàn trả (nếu có). Trong trường hợp được
            hoàn tiền, HOTELHUB sẽ thanh toán bằng{" "}
            <strong>chuyển khoản ngân hàng</strong> đến tài khoản Quý khách đã cung
            cấp. Thời gian hoàn tiền là <strong>15–30 ngày làm việc</strong> tùy
            thuộc ngân hàng thụ hưởng. Quý khách sẽ{" "}
            <strong>không phải chịu phí</strong> cho việc hoàn tiền này.
         </p>

         <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
            4. Chính sách gia hạn phòng
         </h2>
         <p>
            Trong trường hợp Quý khách muốn gia hạn thêm thời gian lưu trú, HOTELHUB
            sẽ áp dụng <strong>giá phòng tại thời điểm gia hạn</strong>. Giá có thể
            thay đổi tùy theo thời gian và tình trạng phòng thực tế.
         </p>
      </div>
   );
}
