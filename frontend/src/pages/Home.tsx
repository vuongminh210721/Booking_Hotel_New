import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UI_Carousel } from "@/components/Carousel";
import { rooms as roomData } from "@/data/room";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function Index() {
  useScrollToTop();
  const [selectedCity, setSelectedCity] = useState("Tp Hồ Chí Minh");
  const [showBooking, setShowBooking] = useState(false);
  const navigate = useNavigate();
  const cities = ["Tp Hồ Chí Minh", "Hà Nội", "Đà Nẵng"];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [sliderDims, setSliderDims] = useState<{ width: number; left: number }>({ width: 0, left: 0 });

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

  useEffect(() => {
    const update = () => {
      const idx = cities.indexOf(selectedCity);
      const btn = btnRefs.current[idx];
      const container = containerRef.current;
      if (btn && container) {
        const cRect = container.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();
        setSliderDims({ width: bRect.width, left: bRect.left - cRect.left });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [selectedCity]);

  // Persist selected city so other pages (header, view links) can read it
  useEffect(() => {
    try {
      window.localStorage.setItem("hb:selectedCity", selectedCity);
    } catch (e) {
      // ignore
    }
  }, [selectedCity]);

  type HomeProperty = { id: string; name: string; location?: string; image: string };

  const toTitleCase = (str: string) =>
    str
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");

  const normalizeArea = (text: string) => {
    let t = text.trim();
    t = t.replace(/^\d+\s*/, "");
    t = toTitleCase(t);
    // Normalize common Vietnamese prefixes
    t = t.replace(/^Tp\.?\s*/i, "TP ");
    return t.trim();
  };

  const isCityName = (value: string, city: string) =>
    new RegExp("^" + city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i").test(value) ||
    /hà nội|tp\.?\s*hồ chí minh|tp hồ chí minh|đà nẵng/i.test(value);

  const getAreaFromLocation = (location?: string, city?: string) => {
    if (!location && city) return city;
    if (!location) return "";
    const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
    let candidate = parts[parts.length - 1] || "";
    if (city && isCityName(candidate, city) && parts.length > 1) {
      candidate = parts[parts.length - 2] || candidate;
    }
    return normalizeArea(candidate);
  };

  // Build a map of city -> first area encountered (for fallback if needed)
  const firstAreaByCity: Record<string, string> = cities.reduce((m, city) => {
    const room = roomData.find((r) => r.city === city);
    const area = getAreaFromLocation(room?.location, city);
    m[city] = area && !isCityName(area, city) ? area : (room?.location ? normalizeArea(room.location) : city);
    return m;
  }, {} as Record<string, string>);

  const propertiesByCity: Record<string, HomeProperty[]> = cities.reduce((acc, city) => {
    acc[city] = roomData
      .filter((r) => r.city === city)
      .map((r) => {
        let area = getAreaFromLocation(r.location, city);
        if (!area || isCityName(area, city)) {
          area = firstAreaByCity[city] || r.location || city;
        }
        return { id: r.id, name: r.name, location: area, image: r.images?.[0] ?? "" };
      });
    return acc;
  }, {} as Record<string, HomeProperty[]>);

  const bannerImage = {
    src: roomData[3]?.images?.[1] ?? "https://img.mvillage.vn/QRV9VrtOwYGrE9qf0H5D1HpTuPlDy8cauA7Mn9wTlcc/rs:fit:500:500/plain/https%3A%2F%2Fcdn-v2.mvillage.vn%2Fcms%2Fimage_2182091639_d7f3396eed.jpg",
    alt: "Hero banner",
  };

  const featureImg1 = roomData[1]?.images?.[0] ?? bannerImage.src;
  const featureImg2 = roomData[6]?.images?.[0] ?? bannerImage.src;
  const featureImg3 = roomData[9]?.images?.[0] ?? bannerImage.src;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel Section */}
      <section className="relative isolate overflow-hidden">
        <UI_Carousel />
      </section>

      {/* Legacy Banner Section */}
      <section className="w-full py-20 md:py-24 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500">
            <img
              src={bannerImage.src}
              alt={bannerImage.alt}
              className="w-full h-[320px] md:h-[480px] lg:h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/70 flex items-center justify-center">
              <div className="text-center text-white px-6 md:px-10 lg:px-16 max-w-[1100px]">
                <h1 className="text-3xl md:text-5xl lg:text-7xl xl:text-5xl font-bold leading-tight mb-6 md:mb-8 drop-shadow-2xl tracking-tight whitespace-nowrap">
                  Trải nghiệm không gian sống hiện đại
                </h1>
                <p className="text-base md:text-lg lg:text-xl font-normal leading-relaxed drop-shadow-lg max-w-3xl mx-auto opacity-95">
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
      <section className="py-20 md:py-24 lg:py-28 px-4 md:px-8 lg:px-12 bg-white">
        <div className="max-w-[1300px] mx-auto space-y-20 md:space-y-24 lg:space-y-28">
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <img
                  src={featureImg1}
                  alt="Không gian riêng tư tiện nghi"
                  className="w-full h-[300px] md:h-[380px] lg:h-[450px] object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6 md:space-y-7 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 tracking-tight">
                Không gian riêng tư, tiện nghi cho mỗi người
              </h2>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-600">
                HotelHub được xây dựng với sứ mệnh mang đến những nơi lưu trú
                hiện đại, tối giản và ấm cúng. Từng căn phòng đều được thiết kế
                để bạn tận hưởng trọn vẹn sự thoải mái và cảm giác như ở nhà —
                dù là công tác, du lịch hay nghỉ dưỡng.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <img
                  src={featureImg2}
                  alt="Cộng đồng năng động và thân thiện"
                  className="w-full h-[300px] md:h-[380px] lg:h-[450px] object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6 md:space-y-7 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 tracking-tight">
                Cộng đồng kết nối và phát triển
              </h2>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-600">
                HotelHub hướng đến việc tạo ra cộng đồng những người trẻ hiện
                đại — nơi bạn có thể gặp gỡ, chia sẻ và phát triển cùng nhau.
                Không gian HotelHub không chỉ là nơi nghỉ dưỡng, mà còn là nơi
                khơi dậy cảm hứng, giúp bạn kết nối và tìm thấy giá trị mới
                trong hành trình sống và làm việc.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <img
                  src={featureImg3}
                  alt="Hành trình HotelHub tại Việt Nam"
                  className="w-full h-[300px] md:h-[380px] lg:h-[450px] object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6 md:space-y-7 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 tracking-tight">
                Hành trình HotelHub tại Việt Nam
              </h2>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-600">
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
      <section className="py-20 md:py-24 lg:py-28 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 text-center mb-4 tracking-tight">
            Điểm đến hấp dẫn
          </h2>
          <p className="text-base md:text-lg text-gray-600 text-center mb-12 md:mb-16 max-w-2xl">
            Khám phá những địa điểm nghỉ dưỡng tuyệt vời của chúng tôi
          </p>

          {/* City Selector */}
          <div className="flex justify-center items-center mb-14 md:mb-18">
            <div ref={containerRef} className="relative inline-flex items-center rounded-full bg-white p-1.5 shadow-lg border border-gray-200">
              {/* Animated background slider */}
              <div
                className="absolute h-[calc(100%-12px)] rounded-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-300 ease-out shadow-md"
                style={{
                  width: `${sliderDims.width}px`,
                  left: `${sliderDims.left}px`,
                  top: 6,
                }}
              />
              {cities.map((city, idx) => (
                <button
                  key={city}
                  ref={(el) => (btnRefs.current[idx] = el)}
                  onClick={() => setSelectedCity(city)}
                  className={`relative z-10 px-7 md:px-9 py-3 md:py-3.5 rounded-full text-sm md:text-base lg:text-lg font-semibold transition-all duration-300 ${selectedCity === city
                    ? "text-white"
                    : "text-gray-700 hover:text-gray-900"
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
              {(() => {
                const cityDisplayLimits: Record<string, number> = {
                  "Tp Hồ Chí Minh": 6,
                  "Hà Nội": 3,
                  "Đà Nẵng": 5,
                };
                const limit = cityDisplayLimits[selectedCity] ?? propertiesByCity[selectedCity].length;
                const displayProperties = propertiesByCity[selectedCity].slice(0, limit);
                return displayProperties.map((property) => (
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
                ));
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 md:py-24 lg:py-28 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-white to-teal-50">
        <div className="max-w-[1300px] mx-auto">
          {/** Reviews data with optional avatar images (replace URLs with your files later) */}
          {(() => {
            /* Define reviews inline to keep component self-contained */
            const reviews = [
              {
                name: "Alex Nguyễn",
                city: "Tp Hồ Chí Minh",
                text:
                  '"Phòng rất sạch sẽ, hiện đại và tiện nghi. Nhân viên thân thiện, nhiệt tình. Vị trí thuận lợi, gần trung tâm. Tôi rất hài lòng với trải nghiệm lưu trú tại đây!"',
                avatarUrl: `https://i.pravatar.cc/96?u=${encodeURIComponent("Minh Anh Nguyen")}`,
              },
              {
                name: "Cao Thu Hoài",
                city: "Hà Nội",
                text:
                  '"Đồ ăn sáng rất ngon và đa dạng. Phòng có view đẹp, giường ngủ thoải mái. Dịch vụ room service nhanh chóng. Chắc chắn sẽ quay lại lần sau!"',
                avatarUrl: `https://i.pravatar.cc/96?u=${encodeURIComponent("Hoang Tuan Le")}`,
              },
              {
                name: "Lê Minh Quang",
                city: "Đà Nẵng",
                text:
                  '"Khách sạn view biển tuyệt đẹp! Nhà hàng phục vụ hải sản tươi ngon. Spa và bể bơi rất tiện lợi. Kỳ nghỉ của gia đình tôi thật tuyệt vời. Cảm ơn HotelHub!"',
                avatarUrl: `https://i.pravatar.cc/96?u=${encodeURIComponent("Thu Ha Tran")}`,
              },
              {
                name: "Phạm Ngọc Hà",
                city: "Hà Nội",
                text:
                  '"Công tác xa nhà nhưng cảm thấy rất thoải mái như ở nhà. Phòng có đầy đủ tiện nghi làm việc. WiFi nhanh, yên tĩnh. Giá cả hợp lý. Đáng để giới thiệu!"',
                avatarUrl: `https://i.pravatar.cc/96?u=${encodeURIComponent("Duy Khanh Pham")}`,
              },
              {
                name: "Trần Hà Thu",
                city: "Tp Hồ Chí Minh",
                text:
                  '"Buffet sáng rất phong phú với nhiều món Á - Âu. Bar rooftop view đẹp, cocktail ngon. Phòng gym hiện đại. Trải nghiệm 5 sao với mức giá hợp lý!"',
                avatarUrl: `https://i.pravatar.cc/96?u=${encodeURIComponent("Linh Chi Vo")}`,
              },
              {
                name: "Đỗ Quang Minh",
                city: "Đà Nẵng",
                text:
                  '"Dịch vụ chăm sóc khách hàng tuyệt vời! Checkin nhanh chóng, checkout linh hoạt. Phòng ban công có view biển tuyệt đẹp. Cảm ơn team HotelHub đã tạo ra kỳ nghỉ đáng nhớ!"',
                avatarUrl: `https://i.pravatar.cc/96?u=${encodeURIComponent("Quang Minh Do")}`,
              },
            ];
            return (
              <>
                <div className="text-center mb-16 md:mb-20">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                    Khách hàng nói gì về chúng tôi
                  </h2>
                  <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                    Hàng nghìn khách hàng đã tin tưởng và trải nghiệm dịch vụ của HotelHub
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {reviews.map((review, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                    >
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, star) => (
                          <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-6 italic">{review.text}</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center text-white font-bold text-lg">
                          {review.avatarUrl ? (
                            <img src={review.avatarUrl} alt={review.name} className="w-full h-full object-cover" />
                          ) : (
                            (review.name?.[0] || "?").toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.name}</h4>
                          <p className="text-sm text-gray-500">{review.city}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[550px] flex items-center justify-center overflow-hidden">
        <img
          src="https://cdn.pixabay.com/photo/2015/10/20/18/57/furniture-998265_1280.jpg"
          alt="Hotel background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

        <div className="relative z-10 text-center space-y-10 px-6 md:px-10 max-w-[1290px]">
          <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl tracking-tight">
            Bạn đang cần một nơi nghỉ dưỡng hiện đại, tiện nghi?
          </h2>
          <Link
            to="/contact"
            className="inline-block px-10 md:px-8 py-3 md:py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full text-base md:text-lg font-bold hover:from-teal-600 hover:to-green-600 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
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
          <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#2fd680] transition-colors duration-300">
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
