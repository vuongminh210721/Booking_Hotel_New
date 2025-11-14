import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UI_Carousel } from "@/components/Carousel";

export default function Index() {
  const [selectedCity, setSelectedCity] = useState("Tp Hồ Chí Minh");
  const [showBooking, setShowBooking] = useState(false);
  const navigate = useNavigate();
  const cities = ["Tp Hồ Chí Minh", "Hà Nội", "Đà Nẵng"];

  useEffect(() => {
    const openHandler = () => setShowBooking(true);
    window.addEventListener("openBooking", openHandler);
    return () => window.removeEventListener("openBooking", openHandler);
  }, []);

  useEffect(() => {
    const closeHandler = () => setShowBooking(false);
    window.addEventListener("closeBooking", closeHandler);
    return () => window.removeEventListener("closeBooking", closeHandler);
  }, []);

  const propertiesByCity = {
    "Tp Hồ Chí Minh": [
      {
        id: 1,
        name: "EXPRESS BY HOTELHUB",
        location: "HOÀNG SA, Quận 3",
        image:
          "https://cdn.pixabay.com/photo/2016/11/30/08/48/bedroom-1872196_1280.jpg",
      },
      {
        id: 2,
        name: "EXPRESS BY HOTELHUB",
        location: "46 THẢO ĐIỀN, Quận 2",
        image:
          "https://cdn.pixabay.com/photo/2016/09/19/17/20/home-1680800_640.jpg",
      },
      {
        id: 3,
        name: "SIGNATURE BY HOTELHUB",
        location: "THI SÁCH, Quận 1",
        image:
          "https://cdn.pixabay.com/photo/2017/09/09/18/25/living-room-2732939_640.jpg",
      },
      {
        id: 10,
        name: "SIGNATURE BY HOTELHUB",
        location: "TÔN ĐỨC THẮNG, Quận 1",
        image:
          "https://cdn.pixabay.com/photo/2023/09/18/11/57/living-room-8260362_640.jpg",
      },
      {
        id: 11,
        name: "RIVER VIEW BY HOTELHUB",
        location: "BẾN BẠCH ĐẰNG, Quận 1",
        image:
          "https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg",
      },
      {
        id: 12,
        name: "URBAN LOFT BY HOTELHUB",
        location: "LÊ LAI, Quận 1",
        image:
          "https://cdn.pixabay.com/photo/2017/01/07/17/48/interior-1961070_1280.jpg",
      },
    ],
    "Hà Nội": [
      {
        id: 4,
        name: "SIGNATURE BY HOTELHUB",
        location: "36 HOÀN KIẾM",
        image:
          "https://cdn.pixabay.com/photo/2023/09/18/11/57/living-room-8260362_640.jpg",
      },
      {
        id: 5,
        name: "EXPRESS BY HOTELHUB",
        location: "PHAN ĐÌNH PHÙNG, BA ĐÌNH",
        image:
          "https://cdn.pixabay.com/photo/2019/04/23/09/04/indoor-4148894_1280.jpg",
      },
      {
        id: 6,
        name: "EXPRESS BY HOTELHUB",
        location: "TRUNG HÒA, CẦU GIẤY",
        image:
          "https://cdn.pixabay.com/photo/2017/07/09/03/19/home-2486092_1280.jpg",
      },
      {
        id: 13,
        name: "RIVERSIDE STAY",
        location: "TÂY HỒ, Hà Nội",
        image:
          "https://cdn.pixabay.com/photo/2016/04/18/08/50/kitchen-1336160_1280.jpg",
      },
      {
        id: 14,
        name: "CITY CENTER BY HOTELHUB",
        location: "HOÀNG MAI, Hà Nội",
        image:
          "https://cdn.pixabay.com/photo/2017/01/07/17/48/interior-1961070_1280.jpg",
      },
    ],
    "Đà Nẵng": [
      {
        id: 7,
        name: "SIGNATURE BY HOTELHUB",
        location: "BÃI BẮC, NGŨ HÀNH SƠN",
        image:
          "https://cdn.pixabay.com/photo/2016/04/18/08/50/kitchen-1336160_1280.jpg",
      },
      {
        id: 8,
        name: "EXPRESS BY HOTELHUB",
        location: "MỸ KHÊ, SƠN TRÀ",
        image:
          "https://cdn.pixabay.com/photo/2017/01/07/17/48/interior-1961070_1280.jpg",
      },
      {
        id: 9,
        name: "SIGNATURE BY HOTELHUB",
        location: "BẠCH ĐẰNG, HẢI CHÂU",
        image:
          "https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg",
      },
    ],
  };

  const bannerImage = {
    src: "https://cdn.pixabay.com/photo/2023/03/29/10/27/hotel-7885138_1280.jpg",
    alt: "Hero banner",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel Section */}
      <section className="relative isolate overflow-hidden">
        <UI_Carousel />
      </section>

      {/* Legacy Banner Section */}
      <section className="w-full py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={bannerImage.src}
              alt={bannerImage.alt}
              className="w-full h-[300px] md:h-[450px] lg:h-[550px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60 flex items-center justify-center">
              <div className="text-center text-white px-6 md:px-10 lg:px-12 max-w-[1100px]">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 md:mb-6 drop-shadow-lg">
                  Trải nghiệm không gian hiện đại
                </h1>
                <p className="text-sm md:text-base lg:text-lg font-light leading-relaxed drop-shadow-md">
                  HotelHub mang đến cho bạn nơi nghỉ dưỡng, làm việc và tận hưởng
                  cuộc sống trong những không gian sang trọng, tiện nghi và đầy
                  cảm hứng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 lg:py-24 px-4 md:px-8 lg:px-12 bg-white">
        <div className="max-w-[1270px] mx-auto space-y-16 md:space-y-20 lg:space-y-24">
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 lg:gap-16">
            <div className="w-full md:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <img
                  src="https://cdn.pixabay.com/photo/2021/12/11/07/59/hotel-6862159_1280.jpg"
                  alt="Không gian riêng tư tiện nghi"
                  className="w-full h-[280px] md:h-[350px] lg:h-[420px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-5 md:space-y-6 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight text-gray-900">
                Không gian riêng tư, tiện nghi cho mỗi người
              </h2>
              <p className="text-base md:text-lg font-light leading-relaxed text-gray-700">
                HotelHub được xây dựng với sứ mệnh mang đến những nơi lưu trú
                hiện đại, tối giản và ấm cúng. Từng căn phòng đều được thiết kế
                để bạn tận hưởng trọn vẹn sự thoải mái và cảm giác như ở nhà —
                dù là công tác, du lịch hay nghỉ dưỡng.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-10 lg:gap-16">
            <div className="w-full md:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <img
                  src="https://cdn.pixabay.com/photo/2021/08/27/01/33/bedroom-6577523_1280.jpg"
                  alt="Cộng đồng năng động và thân thiện"
                  className="w-full h-[280px] md:h-[350px] lg:h-[420px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-5 md:space-y-6 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight text-gray-900">
                Cộng đồng kết nối và phát triển
              </h2>
              <p className="text-base md:text-lg font-light leading-relaxed text-gray-700">
                HotelHub hướng đến việc tạo ra cộng đồng những người trẻ hiện
                đại — nơi bạn có thể gặp gỡ, chia sẻ và phát triển cùng nhau.
                Không gian HotelHub không chỉ là nơi nghỉ dưỡng, mà còn là nơi
                khơi dậy cảm hứng, giúp bạn kết nối và tìm thấy giá trị mới
                trong hành trình sống và làm việc.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 lg:gap-16">
            <div className="w-full md:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <img
                  src="https://cdn.pixabay.com/photo/2015/09/28/18/30/hotel-del-coronado-962458_1280.jpg"
                  alt="Hành trình HotelHub tại Việt Nam"
                  className="w-full h-[280px] md:h-[350px] lg:h-[420px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-5 md:space-y-6 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight text-gray-900">
                Hành trình HotelHub tại Việt Nam
              </h2>
              <p className="text-base md:text-lg font-light leading-relaxed text-gray-700">
                HotelHub được sáng lập bởi những người trẻ với khát vọng mang
                lại trải nghiệm lưu trú tốt nhất cho khách hàng. Bắt đầu từ
                những căn hộ đầu tiên tại trung tâm TP. Hồ Chí Minh, HotelHub
                nay đã có mặt tại nhiều thành phố lớn, mang đến trải nghiệm lưu
                trú kết hợp tiện ích công nghệ và dịch vụ hiện đại.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-16 md:py-20 lg:py-24 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 text-center mb-10 md:mb-12">
            ĐIỂM ĐẾN HẤP DẪN
          </h2>

          {/* City Selector */}
          <div className="flex justify-center items-center mb-12 md:mb-16">
            <div className="inline-flex items-center rounded-full border-2 border-gray-300 bg-white p-1 shadow-md">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm md:text-base lg:text-lg font-medium transition-all duration-300 ${selectedCity === city
                    ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg scale-105"
                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 justify-items-center max-w-[1300px] w-full">
              {propertiesByCity[selectedCity].map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showBooking={showBooking}
                  onBook={() => {
                    // Navigate to the room system page for the currently selected city
                    // Room_System expects a `location` query param (see Room_System.tsx)
                    const params = new URLSearchParams({ location: selectedCity });
                    navigate(`/rooms?${params.toString()}`);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative h-[350px] md:h-[450px] lg:h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src="https://cdn.pixabay.com/photo/2015/10/20/18/57/furniture-998265_1280.jpg"
          alt="Hotel background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>

        <div className="relative z-10 text-center space-y-8 px-6 md:px-10 max-w-[900px]">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight drop-shadow-lg">
            Bạn đang cần một nơi nghỉ dưỡng hiện đại, tiện nghi?
          </h2>
          <Link
            to="/contact"
            className="inline-block px-8 md:px-10 py-3 md:py-4 border-2 border-white text-white rounded-full text-base md:text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Liên hệ ngay
          </Link>
        </div>
      </section>
    </div>
  );
}

function PropertyCard({
  property,
  onBook,
  showBooking,
}: {
  property: any;
  onBook?: () => void;
  showBooking?: boolean;
}) {
  const [booked, setBooked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!showBooking) setBooked(false);
  }, [showBooking]);

  useEffect(() => {
    const resetBooking = () => setBooked(false);
    window.addEventListener("closeBooking", resetBooking);
    return () => window.removeEventListener("closeBooking", resetBooking);
  }, []);

  return (
    <div
      className="group border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-teal-400 transition-all duration-300 w-full max-w-[400px] bg-white transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[260px] md:h-[280px] overflow-hidden">
        <img
          src={property.image}
          alt={`${property.name} ${property.location}`}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'
            }`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-80' : 'opacity-90'
          }`}></div>

        {/* Floating badge (moved to left) */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-xs font-semibold text-teal-600">⭐ Thịnh hành</span>
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors duration-300">
            {property.name}
          </h3>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h4 className="text-sm md:text-base font-medium line-clamp-1">{property.location}</h4>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              setBooked(true);
              onBook?.();
            }}
            className={`w-fit flex items-center justify-center gap-1 font-semibold py-3 px-4 rounded-xl transition-all duration-500 ${booked
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg"
              : "bg-gradient-to-r from-teal-500 to-green-500 text-white hover:shadow-xl hover:scale-105"
              }`}
          >
            <span className="text-sm md:text-base">{"Xem thêm"}</span>
            {!booked && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform group-hover:translate-x-1"
              >
                <path
                  d="M4 12L12 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 4H12V10.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
