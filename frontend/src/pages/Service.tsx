import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useInView } from "react-intersection-observer";

// Định nghĩa kiểu dữ liệu 
interface Service {
  id: number;
  title: string;
  desc: string;
  img: string;
  longDesc: string;
  galleryImages: string[];
  price: string;
  contactPerson?: string;
  process?: string[];
}

// Component: PageBanner 
const PageBanner = ({
  title,
  imageUrls
}: {
  title: string;
  imageUrls: string[]
}) => {

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [imageUrls.length]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
    >
      {imageUrls.map((url, index) => (
        <div
          key={index}
          className={`
              absolute inset-0 w-full h-full bg-cover bg-center
              transition-opacity duration-1000 ease-in-out 
            `}
          style={{
            backgroundImage: `url(${url})`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}

      {/* Lớp phủ mờ với gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/70"></div>

      {/* Nội dung (Tiêu đề) */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
          {title}
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl max-w-4xl leading-relaxed">
          Trải nghiệm những tiện ích đẳng cấp và dịch vụ chuyên nghiệp tại HotelHub
        </p>
      </div>
    </div>
  );
};

// Component: ServiceIntro 
const ServiceIntro = ({
  onServiceSelect,
  services
}: {
  onServiceSelect: (service: Service) => void;
  services: Service[];
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dữ liệu dịch vụ cho dropdown 
  const dropdownServices = services.map(service => ({
    id: service.id,
    title: service.title
  }));

  const filteredServices = dropdownServices.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceClick = (serviceTitle: string) => {
    // Tìm service đầy đủ từ services array
    const fullService = services.find(s => s.title === serviceTitle);
    if (fullService) {
      onServiceSelect(fullService);
      setIsDropdownOpen(false);
      setSearchTerm('');
    }
  };

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white py-20 md:py-24 lg:py-28">
      <div className="max-w-[1300px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Dịch vụ & Trải nghiệm khác biệt
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-green-500 mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Tại <span className="font-semibold text-teal-600">HotelHub</span>, chúng tôi không chỉ cung cấp chỗ ở mà còn mang đến những trải nghiệm đáng nhớ.
            Từ những dịch vụ cơ bản nhất đến những tiện ích cao cấp, mọi thứ đều được chăm chút tỉ mỉ để đảm bảo
            kỳ nghỉ của bạn thực sự trọn vẹn và thoải mái.
          </p>
        </div>

        {/* THANH SEARCH DROPDOWN */}
        <div className="max-w-2xl mx-auto mb-16" ref={dropdownRef}>
          <div className="relative">
            <div className="flex items-center bg-white border-2 border-teal-500 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-green-500">
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full px-6 py-4 text-gray-700 text-lg focus:outline-none"
              />
              <button className="px-6 text-teal-500 hover:text-green-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl mt-2 max-h-60 overflow-y-auto z-50">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service.title)}
                      className="px-6 py-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:pl-8"
                    >
                      <div className="font-medium text-gray-800">{service.title}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-gray-500 text-center">
                    Không tìm thấy dịch vụ phù hợp
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Các điểm nổi bật về dịch vụ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-3xl p-8 shadow-xl border border-teal-100 text-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">Tiện nghi hiện đại</h3>
            <p className="text-gray-600 leading-relaxed">
              Hệ thống trang thiết bị đầy đủ, công nghệ tiên tiến phục vụ mọi nhu cầu của bạn
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 shadow-xl border border-green-100 text-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">Chuyên nghiệp</h3>
            <p className="text-gray-600 leading-relaxed">
              Đội ngũ nhân viên được đào tạo bài bản, luôn sẵn sàng phục vụ 24/7
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 via-green-50 to-teal-50 rounded-3xl p-8 shadow-xl border border-teal-100 text-center transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">Đa dạng</h3>
            <p className="text-gray-600 leading-relaxed">
              Nhiều loại hình dịch vụ từ cơ bản đến cao cấp, đáp ứng mọi yêu cầu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con 1: ServiceCard 
const ServiceCard = ({
  service,
  index,
  onClick,
}: {
  service: Service;
  index: number;
  onClick: () => void;
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const animationDelay = {
    transitionDelay: `${index * 150}ms`,
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
          group relative cursor-pointer overflow-hidden rounded-3xl shadow-xl
          transition-all duration-700 ease-out 
          hover:shadow-2xl hover:scale-[1.02]
          ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
        `}
      style={animationDelay}
    >
      <img
        src={service.img}
        alt={service.title}
        className="w-full h-64 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 transition-opacity duration-500 ease-in-out group-hover:opacity-80"></div>
      <div className="absolute bottom-0 left-0 w-full p-6">
        <div className="inline-block bg-gradient-to-r from-teal-500 to-green-500 px-4 py-2 rounded-xl transition-all duration-500 ease-in-out transform group-hover:-translate-y-2 shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {service.title}
          </h2>
        </div>
        <p className="text-sm md:text-base text-gray-100 mt-3 opacity-0 transition-all duration-500 ease-in-out transform translate-y-4 group-hover:opacity-100 group-hover:-translate-y-2">
          {service.desc}
        </p>
      </div>
    </div>
  );
};

// Component con 2: ServiceModal 
const ServiceModal = ({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(service.img);

  useEffect(() => {
    setCurrentImage(service.img);
    setIsVisible(true);
  }, [service.img]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const allImages = [service.img, ...service.galleryImages];

  return createPortal(
    // Lớp phủ (Overlay)
    <div
      onClick={handleClose}
      className={`
          fixed inset-0 flex items-center justify-center p-4
          transition-opacity duration-300 ease-out
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          
          z-[9999]
        `}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      {/* Hộp nội dung (Modal Box) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
            bg-white rounded-3xl shadow-2xl w-full max-w-5xl
            transition-all duration-300 ease-out
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            overflow-hidden flex flex-col max-h-[90vh]
          `}
      >

        <div className="flex flex-col md:flex-row">
          {/* GALLERY ẢNH */}
          <div className="w-full md:w-1/2 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={currentImage}
              alt={service.title}
              className="w-full h-72 object-cover rounded-2xl shadow-lg mb-3"
            />
            <div className="flex gap-3">
              {allImages.slice(1).map((imgUrl, index) => (
                <img
                  key={index}
                  src={imgUrl}
                  onClick={() => setCurrentImage(imgUrl)}
                  alt={`${service.title} thumbnail ${index + 1}`}
                  className={`
                      w-1/3 h-20 object-cover rounded-xl cursor-pointer border-3 transition-all duration-300
                      ${currentImage === imgUrl ? 'border-4 border-teal-500 shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100'}
                    `}
                />
              ))}
            </div>
          </div>

          {/* THÔNG TIN & ĐẶT DỊCH VỤ */}
          <div className="w-full md:w-1/2 p-8 flex flex-col bg-white">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{service.title}</h3>
            <div className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-6">
              {service.price}
            </div>
            {service.contactPerson && (
              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-4 rounded-2xl mb-6 border border-teal-200">
                <h5 className="font-semibold text-gray-700 mb-1">Người phụ trách</h5>
                <p className="text-gray-600">{service.contactPerson}</p>
              </div>
            )}
            <button className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-4 rounded-2xl hover:from-teal-600 hover:to-green-600 transition-all duration-300 mt-auto shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
              Đặt dịch vụ
            </button>
          </div>
        </div>

        {/* PHẦN MÔ TẢ & QUY TRÌNH */}
        <div className="p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-white to-gray-50">
          {/* CONTAINER MÔ TẢ CHI TIẾT */}
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-6 border border-teal-200 shadow-md">
            <h4 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mô tả chi tiết
            </h4>
            <p className="text-gray-700 leading-relaxed text-base">{service.longDesc}</p>
          </div>

          {/* CONTAINER QUY TRÌNH THỰC HIỆN */}
          {service.process && service.process.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200 shadow-md">
              <h4 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Quy trình thực hiện
              </h4>
              <ul className="space-y-4">
                {service.process.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-500 to-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 shadow-md">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed pt-1">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Nút đóng (X) */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white bg-black/40 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/60 transition-all duration-300 backdrop-blur-sm hover:scale-110"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
};
// Component chính: Services (Trang Dịch Vụ)
export default function Services() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Hàm xử lý khi chọn dịch vụ từ search dropdown
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  // 1. DỮ LIỆU: 
  const services: Service[] = [
    {
      id: 1,
      title: "Giặt ủi",
      desc: "Dịch vụ giặt ủi nhanh, sạch sẽ.",
      img: "https://cdn.pixabay.com/photo/2021/02/02/12/38/iron-5973837_1280.jpg",
      longDesc: "Dịch vụ giặt ủi chuyên nghiệp của chúng tôi đảm bảo quần áo của bạn luôn sạch sẽ và thơm tho. Chúng tôi sử dụng công nghệ giặt sấy hiện đại và quy trình kiểm tra chất lượng nghiêm ngặt, sẵn sàng phục vụ 24/7.",
      galleryImages: [
        "https://images.unsplash.com/photo-1652664767434-9cf9447d499a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGF1bmRyeXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
        "https://cdn.pixabay.com/photo/2021/02/02/12/38/iron-5973837_1280.jpg",
      ],
      price: "Từ 50.000 VNĐ / kg",
      contactPerson: "Chị Lan - Trưởng bộ phận Buồng phòng",
      process: ["Nhận đồ tại phòng", "Phân loại & Giặt sấy", "Ủi phẳng & Gấp gọn", "Trả đồ tận phòng trong 24h"],
    },
    {
      id: 2,
      title: "Đưa đón sân bay",
      desc: "Xe đưa đón tiện lợi, an toàn.",
      img: "https://cdn.pixabay.com/photo/2018/02/14/15/50/lufthansa-regional-3153209_1280.jpg",
      longDesc: "Bắt đầu kỳ nghỉ của bạn một cách thoải mái nhất với dịch vụ đưa đón sân bay riêng tư. Tài xế chuyên nghiệp của chúng tôi sẽ đợi bạn tại sảnh đến, hỗ trợ hành lý và đưa bạn đến khách sạn một cách an toàn và nhanh chóng.",
      galleryImages: [
        "https://images.unsplash.com/photo-1566827267844-39de9bcad5ee?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1450",
        "https://images.unsplash.com/photo-1698223532694-2020d939dbd3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        "https://cdn.pixabay.com/photo/2018/02/14/15/50/lufthansa-regional-3153209_1280.jpg",
      ],
      price: "1.000.000 VNĐ / lượt",
      contactPerson: "Anh Minh - Trưởng bộ phận Vận chuyển",
      process: ["Xác nhận lịch bay", "Tài xế đợi tại Cổng đến (có bảng tên)", "Di chuyển về khách sạn (30 phút)"],
    },
    {
      id: 3,
      title: "Ăn sáng Buffet",
      desc: "Buffet sáng phong phú, dinh dưỡng.",
      img: "https://images.unsplash.com/photo-1722477936580-84aa10762b0b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1331",
      longDesc: "Thưởng thức bữa sáng buffet thịnh soạn với hàng trăm món ăn Á-Âu đa dạng. Từ các món trứng nóng hổi, bánh mì tươi nướng, đến các món ăn truyền thống địa phương, tất cả đều được chuẩn bị từ nguyên liệu tươi ngon nhất.",
      galleryImages: [
        "https://images.unsplash.com/photo-1696940823960-ee5242bddc47?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735",
        "https://images.unsplash.com/photo-1662982693758-f69fcb81e7d2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
        "https://images.unsplash.com/photo-1722477936580-84aa10762b0b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1331",
      ],
      price: "Bao gồm trong giá phòng",
      contactPerson: "Anh Hà - Bếp trưởng (có thể liên hệ đặt món riêng)",
      process: ["Yêu cầu xuất trình thẻ khách sạn", "Tự phục vụ thức ăn - nước uống", "Hạn chế đồ ăn thừa"],
    },
    {
      id: 4,
      title: "Hồ bơi vô cực",
      desc: "Thư giãn và ngắm nhìn toàn cảnh thành phố.",
      img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=60",
      longDesc: "Hồ bơi vô cực trên tầng thượng là ốc đảo thư giãn lý tưởng. Đắm mình trong làn nước mát lạnh, nhâm nhi ly cocktail và ngắm nhìn đường chân trời tuyệt đẹp của thành phố, đặc biệt là vào lúc hoàng hôn.",
      galleryImages: [
        "https://plus.unsplash.com/premium_photo-1671707003199-ebaadc77d080?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=60",
      ],
      price: "Miễn phí cho khách lưu trú",
      contactPerson: "Chị Uyên - Cứu hộ",
      process: ["Yêu cầu xuất trình thẻ khách sạn", "Yêu cầu mặc đồ bơi"],
    },
    {
      id: 5,
      title: "Nhà hàng & Quầy Bar",
      desc: "Trải nghiệm ẩm thực Á-Âu.",
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=60",
      longDesc: "Nhà hàng của chúng tôi phục vụ các món ăn tinh tế kết hợp giữa ẩm thực quốc tế và đặc sản địa phương. Vào buổi tối, quầy bar là nơi hoàn hảo để thưởng thức các loại rượu vang và cocktail sáng tạo trong không gian sang trọng.",
      galleryImages: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=60",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=60",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=60",
      ],
      price: "Từ 300.000 VNĐ / món",
      contactPerson: "Bếp trưởng David",
      process: ["Yêu cầu xuất trình thẻ khách sạn", "Bảo quản vật tư cá nhân cẩn thận"],
    },
    {
      id: 6,
      title: "Spa & Trị liệu",
      desc: "Phục hồi năng lượng cơ thể.",
      img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=60",
      longDesc: "Tìm lại sự cân bằng cho cơ thể và tâm trí tại spa của chúng tôi. Các chuyên gia trị liệu sẽ tư vấn cho bạn các gói massage, chăm sóc da mặt và xông hơi, giúp bạn xua tan mọi mệt mỏi và căng thẳng.",
      galleryImages: [
        "https://plus.unsplash.com/premium_photo-1679430887921-31e1047e5b55?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        "https://images.unsplash.com/photo-1560932992-a93e9ca8a0c9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=60",
      ],
      price: "Từ 500.000 VNĐ / liệu trình",
      contactPerson: "Chị Huyền - Quản lý phòng spa",
      process: ["Tư vấn trị liệu", "Xông hơi (15 phút)", "Massage trị liệu (60 phút)", "Thưởng thức trà thảo mộc"],
    },
    {
      id: 7,
      title: "Phòng Gym & Fitness",
      desc: "Duy trì thói quen luyện tập.",
      img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1075",
      longDesc: "Phòng gym hiện đại của chúng tôi được trang bị đầy đủ máy chạy bộ, tạ, và các thiết bị cardio tiên tiến nhất. Giúp bạn duy trì thói quen luyện tập ngay cả khi đang đi du lịch hoặc công tác.",
      galleryImages: [
        "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1075",
      ],
      price: "Miễn phí cho khách lưu trú",
      contactPerson: "Huấn luyện viên (luôn có mặt tại phòng)",
      process: ["Yêu cầu xuất trình thẻ khách sạn", "Đảm bảo quần áo phù hợp", "Vui lòng trả thiết bị dụng cụ tại nơi bạn lấy"],
    },
    {
      id: 8,
      title: "Cho thuê xe máy",
      desc: "Tự do khám phá thành phố.",
      img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=60",
      longDesc: "Không gì tuyệt vời hơn tự mình lái xe khám phá các cung đường ven biển và các ngõ ngách của thành phố. Chúng tôi cung cấp các dòng xe tay ga đời mới, an toàn và tiết kiệm nhiên liệu.",
      galleryImages: [
        "https://images.unsplash.com/photo-1761227394140-232c73436799?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        "https://plus.unsplash.com/premium_photo-1697968233472-72ec2a8466b5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=60",
      ],
      price: "Từ 120.000 VNĐ / ngày",
      contactPerson: "Anh Phong - Quản lý bãi đậu xe",
      process: ["Chọn loại xe", "Cung cấp CCCD/Passport và bằng lái", "Nhận xe tại sảnh"],
    },
    {
      id: 9,
      title: "Hướng dẫn viên du lịch",
      desc: "Các tour trong ngày (Bà Nà, Hội An).",
      img: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=60",
      longDesc: "Khám phá các địa danh nổi tiếng nhất miền Trung một cách dễ dàng. Chúng tôi tổ chức các tour trọn gói trong ngày đến Bà Nà Hills, Phố cổ Hội An, Ngũ Hành Sơn... đã bao gồm xe đưa đón và vé vào cửa.",
      galleryImages: [
        "https://images.unsplash.com/photo-1586810724476-c294fb7ac01b?auto=format&fit=crop&w=600&q=60",
        "https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
        "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=60",
      ],
      price: "Từ 1.000.000 VNĐ / người",
      contactPerson: "Bộ phận Lễ tân",
      process: ["Chọn loại địa điểm", "Chọn hướng dẫn viên", "Hẹn ngày giờ tham gia"],
    },
  ];

  return (
    <>
      {/* BANNER TOÀN MÀN HÌNH */}
      <PageBanner
        title="Dịch vụ"
        imageUrls={[
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1544986581-efac024faf62?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
        ]}
      />

      {/* PHẦN GIỚI THIỆU DỊCH VỤ TỔNG QUAN VỚI SEARCH */}
      <ServiceIntro
        onServiceSelect={handleServiceSelect}
        services={services}
      />

      {/* KHỐI 2: NỘI DUNG TRANG */}
      <div className="relative bg-gradient-to-b from-white to-gray-50 py-20 md:py-24 lg:py-28">
        <div className="max-w-[1300px] mx-auto px-6">

          {/* Tiêu đề cho danh sách dịch vụ */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Khám phá các dịch vụ của chúng tôi
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-green-500 mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Từ những tiện ích cơ bản đến dịch vụ cao cấp, mọi thứ đều được thiết kế để mang đến trải nghiệm tốt nhất cho bạn
            </p>
          </div>

          {/* Lưới dịch vụ với khung container đẹp */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  onClick={() => setSelectedService(service)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Render Modal */}
        {selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </div>
    </>
  );
}