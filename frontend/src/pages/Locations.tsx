import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const locations = [
  {
    id: 1,
    label: "HÀ NỘI",
    title: "HotelHub Kim Mã",
    description:
      "Nằm tại trung tâm khu vực Kim Mã sầm uất của Hà Nội, HotelHub Kim Mã mang đến không gian nghỉ dưỡng hiện đại và thanh lịch giữa nhịp sống thủ đô. Với thiết kế tinh tế, dịch vụ chu đáo và vị trí thuận tiện kết nối các điểm văn hóa, mua sắm và ẩm thực, đây là lựa chọn hoàn hảo cho những ai muốn trải nghiệm Hà Nội một cách trọn vẹn.",
    image:
      "https://cdn.pixabay.com/photo/2016/11/19/13/06/bed-1839184_1280.jpg",
  },

  {
    id: 2,
    label: "HỒ CHÍ MINH",
    title: "HotelHub Thảo Điền",
    description:
      "Tọa lạc tại trung tâm Thảo Điền – khu vực sôi động bậc nhất của Thành phố Hồ Chí Minh, HotelHub Thảo Điền mang đến không gian nghỉ dưỡng hiện đại hòa cùng thiên nhiên xanh mát. Với thiết kế tinh tế, tiện nghi sang trọng và vị trí thuận lợi cho cả làm việc lẫn thư giãn, đây là điểm đến lý tưởng cho những ai muốn tận hưởng nhịp sống thành phố theo cách riêng.",
    image:
      "https://cdn.pixabay.com/photo/2020/03/13/18/17/the-living-room-of-a-photographer-4928794_1280.jpg",
  },
  {
    id: 3,
    label: "ĐÀ NẴNG",
    title: "HotelHub Mỹ Khê",
    description:
      "Nằm bên bờ biển Mỹ Khê – một trong những bãi biển đẹp nhất Đà Nẵng, HotelHub Mỹ Khê mang đến không gian nghỉ dưỡng thanh bình cùng tầm nhìn hướng biển tuyệt đẹp. Với thiết kế hiện đại, tiện nghi đẳng cấp và vị trí thuận lợi để khám phá thành phố, đây là nơi lý tưởng để tận hưởng kỳ nghỉ trọn vẹn.",
    image:
      "https://cdn.pixabay.com/photo/2018/03/29/17/00/bathroom-3272780_1280.jpg",
  },
];

export default function Locations() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < locations.length - 1 ? prev + 1 : prev));
  };
  const places = [
    {
      id: 1,
      name: "Hanoi",
      desc: "Thủ đô với nhiều điểm tham quan.",
      img: "https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg",
    },
    {
      id: 2,
      name: "Da Nang",
      desc: "Bãi biển đẹp và cầu Rồng.",
      img: "https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA",
    },
    {
      id: 3,
      name: "Ho Chi Minh",
      desc: "Thành phố sôi động, ẩm thực phong phú.",
      img: "https://cdn.thuvienphapluat.vn//uploads/tintuc/2024/05/01/vung-do-thi-thanh-pho-ho-chi-minh.jpg",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Vị trí</h1>
      <p className="mb-6 text-gray-600">
        Các địa điểm nơi hệ thống của chúng tôi hoạt động.
      </p>

      <section className="w-full py-12 md:py-16 lg:py-20 bg-white overflow-hidden">
        <div className="max-w-[1270px] mx-auto">
          <div className="max-w-[740px] mx-auto mb-8">
            <h2 className="text-center text-[32px] md:text-[40px] leading-[1.4] font-normal text-[#131313]">
              Khám phá điều mới lạ tại HotelHub
            </h2>
          </div>

          <div className="relative">
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                className="absolute left-0 md:left-4 z-10 w-11 h-11 rounded-full"
                disabled={currentIndex === 0}
                aria-label="Previous location"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="overflow-hidden mx-auto max-w-full">
                <div
                  className="flex transition-transform duration-500 ease-in-out gap-[30px]"
                  style={{
                    transform: `translateX(-${currentIndex * (390 + 30)}px)`,
                  }}
                >
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex-shrink-0 w-[390px] flex flex-col"
                    >
                      <div className="rounded-t-xl overflow-hidden">
                        <img
                          src={location.image}
                          alt={location.title}
                          className="w-full h-[195px] object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-1 bg-[#FBF9F8] rounded-b-xl p-6">
                        <div className="flex flex-col gap-2 mb-4">
                          <span className="text-sm leading-5 text-[#6D6D6D]">
                            {location.label}
                          </span>
                          <h3 className="text-lg leading-[26px] font-medium text-[#131313]">
                            {location.title}
                          </h3>
                          <p className="text-sm leading-5 font-light text-[#131313]">
                            {location.description}
                          </p>
                        </div>
                        <a
                          href="#"
                          className="flex items-center justify-end gap-1 text-[#60A5FA] text-base font-medium leading-6 hover:text-[#3B82F6] transition-colors group"
                        >
                          <span>Khám phá</span>
                          <svg
                            width="16"
                            height="24"
                            viewBox="0 0 16 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex-shrink-0"
                          >
                            <path
                              d="M4.00009 16L12.0001 8"
                              stroke="#60A5FA"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.5 8H12V14.5"
                              stroke="#60A5FA"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="absolute right-0 md:right-4 z-10 w-11 h-11 rounded-full"
                disabled={currentIndex === locations.length - 1}
                aria-label="Next location"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white"
          >
            <img
              src={p.img}
              alt={p.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-sm text-gray-600 mt-2">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
