import { Link } from "react-router-dom";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function More_Policy() {
   useScrollToTop();
   return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
         <h1 className="text-2xl md:text-3xl font-bold text-[#2fd680] mb-6 text-center">
            Chính sách & Bảo vệ quyền riêng tư
         </h1>

         <section className="space-y-6 text-justify">
            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               1. CHÍNH SÁCH BẢO MẬT VÀ CHIA SẺ THÔNG TIN
            </h2>
            <p>
               Trước khi tiến hành đặt hàng hoặc sử dụng dịch vụ, Hội viên phải đồng
               ý với chính sách Bảo vệ thông tin cá nhân và xử lý dữ liệu cá nhân của
               HotelHub. Để đảm bảo an toàn và bảo vệ thông tin cá nhân của Hội
               viên, vui lòng đọc kỹ và đồng ý với các chính sách bảo mật thông tin
               dưới đây:
            </p>

            <h3 className="font-semibold">
               1.1. Mục đích thu thập thông tin cá nhân
            </h3>
            <p>
               Chúng tôi chỉ thu thập thông tin cá nhân của Hội viên với mục đích sau
               đây:
            </p>
            <ul className="list-disc pl-6 space-y-1">
               <li>
                  Định danh tài khoản: xác nhận và xử lý đơn hàng, giao dịch, thanh
                  toán.
               </li>
               <li>
                  Nâng cao chất lượng trải nghiệm: hỗ trợ, tư vấn, cá nhân hóa trải
                  nghiệm của khách hàng.
               </li>
            </ul>

            <h3 className="font-semibold">1.2. Phạm vi sử dụng thông tin</h3>
            <p>
               Chúng tôi cam kết bảo vệ thông tin cá nhân và chỉ sử dụng trong phạm
               vi cần thiết. Thông tin không được chia sẻ cho bên thứ ba, trừ khi có
               yêu cầu pháp lý hoặc nhằm bảo vệ quyền lợi của HotelHub hoặc khách
               hàng.
            </p>

            <h3 className="font-semibold">
               1.3. Đối tượng có thể tiếp cận thông tin
            </h3>
            <ul className="list-disc pl-6 space-y-1">
               <li>Đối tác cung cấp dịch vụ có cam kết bảo mật.</li>
               <li>Cơ quan pháp luật khi có yêu cầu hợp pháp.</li>
            </ul>

            <h3 className="font-semibold">1.4. Thời gian lưu trữ thông tin</h3>
            <p>
               Chúng tôi lưu trữ thông tin trong thời gian cần thiết để phục vụ mục
               đích thu thập. Sau đó, thông tin sẽ được xóa hoặc ẩn đi.
            </p>

            <h3 className="font-semibold">
               1.5. Thông tin đơn vị thu thập và quản lý thông tin
            </h3>
            <p>
               <strong>CÔNG TY CỔ PHẦN HOTELHUB</strong>
               <br />
               Địa chỉ: 107/2 Điện Biên Phủ, P.17, Q.Bình Thạnh, TP.HCM
               <br />
               SĐT: 028 9999 5559
               <br />
               Email: booking@hotelhub.vn
            </p>

            <h3 className="font-semibold">1.6. Quản lý dữ liệu cá nhân</h3>
            <p>
               Hội viên có quyền chỉnh sửa, cập nhật thông tin cá nhân trên website
               hoặc liên hệ trực tiếp. Việc cung cấp dữ liệu đồng nghĩa với việc đồng
               ý cho HotelHub sử dụng theo quy định tại{" "}
               <Link
                  to="/privacy-policy"
                  rel="noopener noreferrer"
                  className="text-[#24f1d2] underline hover:text-[#40ffe2]"
               >
                  Chính sách bảo mật
               </Link>
               .
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               2. GIỚI THIỆU VỀ CHƯƠNG TRÌNH KHÁCH HÀNG THÂN THIẾT
            </h2>
            <p>
               "HotelHub More" là chương trình khách hàng thân thiết ra mắt tháng
               4/2024, dành để tri ân khách hàng sử dụng dịch vụ lưu trú thường xuyên
               tại các chi nhánh HotelHub.
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               3. ĐIỀU KIỆN TRỞ THÀNH HỘI VIÊN
            </h2>
            <p>
               Bất kỳ cá nhân đủ 18 tuổi có giấy tờ tùy thân hợp lệ (hoặc hộ chiếu
               với người nước ngoài) đều có thể đăng ký trở thành hội viên HotelHub
               More. Mỗi hội viên chỉ có 1 tài khoản định danh duy nhất.
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               4. HÌNH THỨC TÍCH LŨY
            </h2>
            <p>
               Khách hàng sẽ được tích lũy số đơn/số đêm khi đặt phòng trực tiếp hoặc
               qua OTA nếu đã đăng ký hội viên. Mỗi hạng hội viên sẽ có quyền lợi và
               ưu đãi riêng.
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               5. PHÂN HẠNG HỘI VIÊN
            </h2>
            <ul className="list-disc pl-6 space-y-1">
               <li>Hội viên Mới</li>
               <li>Hội viên Bạc</li>
               <li>Hội viên Vàng</li>
               <li>Hội viên Bạch kim</li>
            </ul>
            <p>
               Việc nâng hạng dựa vào số đơn hoặc số đêm lưu trú/năm. Với khách hàng
               doanh nghiệp, hạng được xác định theo vị trí (nhân viên, người đại
               diện, lãnh đạo).
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               6. QUY ĐỊNH GIẢM HẠNG HỘI VIÊN
            </h2>
            <p>
               Sau 12 tháng, hạng hội viên sẽ được xét lại dựa trên số lượng đơn/đêm
               thực tế. Có thêm 2 tháng gia hạn trước khi điều chỉnh tăng hoặc giảm
               hạng.
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               7. QUYỀN LỢI ƯU ĐÃI HỘI VIÊN
            </h2>
            <p>
               Quyền lợi chỉ áp dụng cho hội viên đã đăng ký thành công, không được
               chuyển nhượng và tùy thuộc vào tình trạng phòng thực tế. Một số ưu đãi
               yêu cầu xác nhận trực tiếp tại lễ tân.
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               8. CHUYỂN NHƯỢNG QUYỀN LỢI
            </h2>
            <p>
               Quyền lợi hội viên không được chuyển nhượng cho người khác, kể cả khi
               đặt phòng hộ.
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               9. MIỄN TRỪ TRÁCH NHIỆM
            </h2>
            <p>
               Việc đăng ký tham gia đồng nghĩa với việc hội viên đã đọc và đồng ý
               với toàn bộ quy định chương trình. HotelHub có thể thay đổi thể lệ
               chương trình khi cần thiết và thông báo đến hội viên. HotelHub không
               chịu trách nhiệm với các thiệt hại do nguyên nhân bất khả kháng hoặc
               thông tin không chính xác từ phía hội viên.
            </p>
         </section>
      </div>
   );
}
