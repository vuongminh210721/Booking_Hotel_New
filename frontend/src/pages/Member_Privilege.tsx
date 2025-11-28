import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function MemberPrivilege() {
   useScrollToTop();
   return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
         <h1 className="text-2xl md:text-3xl font-bold text-[#2fd680] mb-6 text-center">
            Đặc quyền Hội viên HotelHub More
         </h1>

         <section className="space-y-6 text-justify">
            <p>
               Chào mừng Quý khách đến với chương trình{" "}
               <strong>HotelHub More</strong> — chương trình khách hàng thân thiết
               được thiết kế nhằm tri ân và mang đến nhiều ưu đãi hấp dẫn dành cho
               các khách hàng thường xuyên lưu trú tại hệ thống HotelHub trên toàn
               quốc.
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               1. GIỚI THIỆU CHƯƠNG TRÌNH HOTELHUB MORE
            </h2>
            <p>
               HotelHub More mang đến cho Hội viên nhiều quyền lợi vượt trội khi sử
               dụng dịch vụ lưu trú tại các cơ sở HotelHub. Tùy theo hạng Hội viên,
               bạn sẽ nhận được ưu đãi đặc biệt, ưu tiên đặt phòng, và nhiều phần quà
               hấp dẫn khác.
            </p>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               2. PHÂN HẠNG HỘI VIÊN & CÁCH TÍCH LŨY
            </h2>
            <p>
               Hội viên được phân hạng dựa trên số lượng đêm lưu trú hoặc đơn đặt
               phòng mỗi năm. Càng sử dụng nhiều, hạng của bạn càng cao và quyền lợi
               càng lớn.
            </p>
            <ul className="list-disc pl-6 space-y-1">
               <li>
                  <strong>Hội viên Mới:</strong> Đăng ký miễn phí khi sử dụng dịch vụ
                  HotelHub.
               </li>
               <li>
                  <strong>Hội viên Bạc:</strong> Tích lũy từ 2 đơn đặt phòng hoặc 4
                  đêm/năm.
               </li>
               <li>
                  <strong>Hội viên Vàng:</strong> Tích lũy từ 4 đơn hoặc 10 đêm/năm.
               </li>
               <li>
                  <strong>Hội viên Bạch Kim:</strong> Tích lũy từ 10 đơn hoặc 31
                  đêm/năm.
               </li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               3. QUYỀN LỢI HỘI VIÊN
            </h2>
            <p>
               Khi trở thành Hội viên, bạn sẽ được hưởng những quyền lợi hấp dẫn sau:
            </p>
            <ul className="list-disc pl-6 space-y-1">
               <li>Ưu đãi giảm giá đặc biệt khi đặt phòng trực tiếp tại website.</li>
               <li>
                  Được ưu tiên chọn phòng sớm, nhận phòng sớm và trả phòng muộn (tùy
                  tình trạng phòng).
               </li>
               <li>Ưu đãi độc quyền cho các sự kiện, quà tặng tri ân định kỳ.</li>
               <li>
                  Hưởng thêm điểm thưởng hoặc đêm miễn phí khi giới thiệu bạn bè tham
                  gia chương trình.
               </li>
               <li>
                  Dịch vụ chăm sóc khách hàng ưu tiên thông qua tổng đài riêng cho hội
                  viên.
               </li>
            </ul>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               4. QUYỀN LỢI THEO HẠNG HỘI VIÊN
            </h2>
            <div className="overflow-x-auto">
               <table className="min-w-full border border-gray-300 text-sm md:text-base">
                  <thead>
                     <tr className="bg-gray-100">
                        <th className="border px-3 py-2 text-left">Hạng Hội viên</th>
                        <th className="border px-3 py-2 text-left">Quyền lợi</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr>
                        <td className="border px-3 py-2">Mới</td>
                        <td className="border px-3 py-2">
                           Giảm 5% cho lần đặt đầu tiên, nhận thông tin ưu đãi sớm.
                        </td>
                     </tr>
                     <tr>
                        <td className="border px-3 py-2">Bạc</td>
                        <td className="border px-3 py-2">
                           Giảm 10%, check-in sớm/checkout muộn miễn phí 1 giờ.
                        </td>
                     </tr>
                     <tr>
                        <td className="border px-3 py-2">Vàng</td>
                        <td className="border px-3 py-2">
                           Giảm 15%, tặng 1 đêm miễn phí sau 10 đêm lưu trú, ưu tiên đặt
                           phòng cao điểm.
                        </td>
                     </tr>
                     <tr>
                        <td className="border px-3 py-2">Bạch kim</td>
                        <td className="border px-3 py-2">
                           Giảm 20%, tặng 2 đêm miễn phí/năm, nâng hạng phòng miễn phí
                           (tùy tình trạng phòng).
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>

            <h2 className="text-xl font-semibold text-[#2fd680] mt-8 mb-3">
               5. CÁCH THỨC ĐĂNG KÝ THAM GIA
            </h2>
            <p>
               Quý khách có thể đăng ký chương trình <strong>HotelHub More</strong>{" "}
               qua:
            </p>
            <ul className="list-disc pl-6 space-y-1">
               <li>
                  Website chính thức:{" "}
                  <a
                     href="http://localhost:8080/"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-[#24f1ee] underline hover:text-[#24f1b7]"
                  >
                     HotelHub
                  </a>
               </li>
               <li>Ứng dụng di động HotelHub (iOS và Android).</li>
               <li>Đăng ký trực tiếp tại quầy lễ tân các chi nhánh.</li>
            </ul>

            <h2 className="font-semibold text-lg">VI. LIÊN HỆ HỖ TRỢ</h2>
            <p>
               Mọi thắc mắc về chương trình vui lòng liên hệ:
               <br />
               📞 <strong>0396256658</strong> hoặc ✉️{" "}
               <a
                  href="mailto:booking@hotelhub.vn"
                  className="text-[#24f1ee] underline hover:text-[#24f1b7]"
               >
                  booking@hotelhub.vn
               </a>
            </p>
         </section>
      </div>
   );
}
