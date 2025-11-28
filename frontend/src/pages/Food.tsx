import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useInView } from "react-intersection-observer";

// 1. ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU
interface Dish {
  id: number;
  title: string;
  desc: string;
  images: string[];
  price: string;
}

interface Category {
  id: string;
  title: string;
  longDesc: string;
  img: string;
  dishes: Dish[];
}

// Component 1: PageBanner 
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
    <div className="relative w-full h-screen overflow-hidden">
      {imageUrls.map((url, index) => (
        <div
          key={index}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${url})`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center p-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-xl md:text-2xl max-w-2xl">
          Khám phá thế giới ẩm thực đa dạng và tinh tế tại HotelHub
        </p>
      </div>
    </div>
  );
};
// Component: FoodIntro - PHẦN GIỚI THIỆU ẨM THỰC
const FoodIntro = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Ẩm Thực Đẳng Cấp - Hương Vị Tinh Tế
        </h2>
        <div className="w-24 h-1 bg-teal-500 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Tại <span className="font-semibold text-teal-600">HotelHub</span>, chúng tôi mang đến trải nghiệm ẩm thực đa dạng từ các nền văn hóa ẩm thực trên khắp thế giới.
          Từ những món ăn truyền thống đậm đà hương vị Á Đông đến các món Âu sang trọng tinh tế, mỗi món ăn đều được chế biến tỉ mỉ
          từ những nguyên liệu tươi ngon nhất, dưới bàn tay của các đầu bếp tài hoa. Hãy để chúng tôi đưa bạn vào hành trình khám phá
          hương vị tuyệt vời ngay tại không gian ấm cúng của chúng tôi.
        </p>
      </div>
    </div>
  );
};
// Component: DrinkIntro - PHẦN GIỚI THIỆU THỨC UỐNG
const DrinkIntro = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Thức Uống Tinh Tế - Cảm Giác Sảng Khoái
        </h2>
        <div className="w-24 h-1 bg-teal-500 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Khám phá thế giới thức uống đa dạng tại <span className="font-semibold text-teal-600">HotelHub</span>, từ những ly cocktail
          nghệ thuật được pha chế tinh tế, các loại rượu vang cao cấp từ khắp nơi trên thế giới, đến những thức uống không cồn
          tươi mát. Mỗi ly đồ uống là một tác phẩm nghệ thuật, kết hợp hài hòa giữa hương vị và thẩm mỹ, mang đến cho bạn
          những trải nghiệm giác quan tuyệt vời trong không gian quầy bar sang trọng và ấm cúng.
        </p>
      </div>
    </div>
  );
};

// Component 2: CategorySection 
const CategorySection = ({
  category,
  index,
  onOpenModal,
}: {
  category: Category;
  index: number;
  onOpenModal: () => void;
}) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const isReversed = index % 2 !== 0;

  return (
    <div
      ref={ref}
      className={`
        flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'}
        items-center bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#2fd680]
        transition-all duration-700 ease-out
        ${inView ? 'opacity-100 translate-x-0' : (isReversed ? 'opacity-0 translate-x-10' : 'opacity-0 -translate-x-10')}
      `}
    >
      <img
        src={category.img}
        alt={category.title}
        className="w-full md:w-1/2 h-64 md:h-80 object-cover"
      />
      <div className="w-full md:w-1/2 p-6 md:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">{category.title}</h2>
        <p className="text-gray-600 leading-relaxed mb-4">{category.longDesc}</p>
        <button
          onClick={onOpenModal}
          className="w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-teal-500 to-green-500 text-white hover:shadow-xl hover:scale-105"
        >
          Xem chi tiết
          <span>&raquo;</span>
        </button>
      </div>
    </div>
  );
};


// Component 3: DishCard 
const DishCard = ({ dish }: { dish: Dish }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (dish.images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % dish.images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [dish.images.length]);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col h-full min-h-[380px]">
      <div className="relative w-full h-40 overflow-hidden">
        {dish.images.map((imgUrl, index) => (
          <img
            key={index}
            src={imgUrl}
            alt={dish.title}
            className={`
              w-full h-full object-cover absolute inset-0
              transition-opacity duration-1000 ease-in-out
              ${index === currentImgIndex ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}
      </div>

      {/* Phần nội dung */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 h-14 mb-0">
          {dish.title}
        </h3>
        <div className="flex-grow min-h-[60px] max-h-[80px] overflow-y-auto">
          <p className="text-sm text-gray-600 leading-relaxed">
            {dish.desc}
          </p>
        </div>
        <p className="text-lg font-bold text-teal-600 mt-3 mb-3">
          {dish.price}
        </p>
        <button className="w-full bg-teal-500 text-white font-bold py-2 rounded-lg hover:bg-teal-600 transition-colors mt-auto">
          Đặt món
        </button>
      </div>
    </div>
  );
};

// Component 4: CategoryModal 
const CategoryModal = ({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleDishClick = (dishTitle: string) => {
    // Cuộn đến món ăn được chọn
    const dishElement = document.getElementById(`dish-${dishTitle.replace(/\s+/g, '-')}`);
    if (dishElement) {
      dishElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight món ăn được chọn
      dishElement.classList.add('ring-2', 'ring-teal-500', 'transition-all', 'duration-300');
      setTimeout(() => {
        dishElement.classList.remove('ring-2', 'ring-teal-500');
      }, 2000);
    }
    setIsDropdownOpen(false);
  };

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return createPortal(
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
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-gray-100 rounded-lg shadow-xl w-full max-w-6xl
          transition-all duration-300 ease-out
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          relative overflow-hidden flex flex-col max-h-[90vh]
        `}
      >
        <h2 className="text-3xl font-bold text-gray-800 p-6 border-b">
          {category.title}
        </h2>

        {/* DROPDOWN LIST */}
        <div className="px-6 pt-4" ref={searchRef}>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border-2 border-teal-500 rounded-lg shadow-sm px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Chọn món nhanh</span>
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* DROPDOWN MENU - HIỂN THỊ TẤT CẢ MÓN */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-64 overflow-y-auto z-50">
                <div className="p-3 border-b border-gray-100 bg-teal-50">
                  <p className="text-sm text-teal-700 font-medium">
                    Danh sách món ({category.dishes.length})
                  </p>
                </div>

                {category.dishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => handleDishClick(dish.title)}
                    className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 group-hover:text-teal-700">
                          {dish.title}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {dish.desc}
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="font-semibold text-teal-600 text-sm">
                          {dish.price}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Click
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DANH SÁCH MÓN ĂN */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.dishes.map((dish) => (
              <div
                key={dish.id}
                id={`dish-${dish.title.replace(/\s+/g, '-')}`}
                className="transition-all duration-300"
              >
                <DishCard dish={dish} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors text-2xl"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
};

// Component chính: Food 
export default function Food() {

  // State quản lý 2 loại popup
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<Category | null>(null);
  const [selectedDrinkCategory, setSelectedDrinkCategory] = useState<Category | null>(null);

  // DỮ LIỆU 
  const foodCategories: Category[] = [
    {
      id: "asia",
      title: "Ẩm thực Châu Á",
      longDesc: "Khám phá hương vị đậm đà, tinh tế từ các nền ẩm thực hàng đầu châu Á. Từ Phở bò Việt Nam, Sushi Nhật Bản đến Tom Yum Thái Lan, mỗi món ăn là một hành trình.",
      img: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=60",
      dishes: [
        { id: 1, title: "Phở bò", desc: "Nước dùng ninh 8 tiếng, thịt bò mềm, bánh phở tươi. Một trải nghiệm ẩm thực tinh túy của Việt Nam.", images: ["https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074", "https://images.unsplash.com/photo-1511910849309-0dffb8785146?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGglRTElQkIlOUZ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"], price: "95.000 VNĐ" },
        { id: 2, title: "Sashimi Set", desc: "Cá hồi Na-uy, cá ngừ vây xanh và sò điệp Hokkaido tươi sống, nhập khẩu trực tiếp mỗi ngày.", images: ["https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=60", "https://images.unsplash.com/photo-1724115862102-ca5de83eff8b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNldCUyMHNhc2hpbWl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"], price: "250.000 VNĐ" },
        { id: 3, title: "Gỏi cuốn", desc: "Tôm, thịt, bún và rau thơm tươi mát, cuốn trong bánh tráng mỏng, chấm sốt đậu phộng béo ngậy.", images: ["https://plus.unsplash.com/premium_photo-1663850685033-a8557389963e?auto=format&fit=crop&w=600&q=60", "https://plus.unsplash.com/premium_photo-1663850685040-19a026ba8032?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3ByaW5nJTIwcm9sbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"], price: "75.000 VNĐ" },
        { id: 4, title: "Cơm Gà Hải Nam", desc: "Thịt gà luộc mềm mọng, da giòn, ăn kèm cơm nấu nước luộc gà và 3 loại sốt chấm đặc biệt.", images: ["https://images.unsplash.com/photo-1569058242252-623df46b5025?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHJpY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600", "https://images.unsplash.com/photo-1749640566096-5d8098d452b4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaWNrZW4lMjByaWNlfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"], price: "110.000 VNĐ" },
        { id: 5, title: "Pad Thái", desc: "Mì xào chua ngọt đặc trưng của Thái Lan, với tôm tươi, đậu hũ, giá đỗ và đậu phộng rang.", images: ["https://images.unsplash.com/photo-1655091273851-7bdc2e578a88?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFkJTIwdGhhaXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600", "https://images.unsplash.com/photo-1637806930600-37fa8892069d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFkJTIwdGhhaXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"], price: "135.000 VNĐ" },
        { id: 6, title: "Vịt Quay Bắc Kinh", desc: "Da vịt quay giòn tan, ăn kèm bánh bía, hành lá, dưa leo và sốt tương đen truyền thống.", images: ["https://media.istockphoto.com/id/1557558337/vi/anh/c%E1%BA%AFt-v%E1%BB%8Bt-quay-b%E1%BA%AFc-kinh-c%C3%A1c-m%C3%B3n-%C4%83n-theo-phong-c%C3%A1ch-trung-qu%E1%BB%91c-n%E1%BB%95i-ti%E1%BA%BFng-trong-c%C3%A1c-nh%C3%A0-h%C3%A0ng-th%C3%A1i.jpg?s=612x612&w=0&k=20&c=AMAycRWR-c5P8iYiXB1Rd9elXwvzSuaewZs0JfPwtXk=", "https://media.istockphoto.com/id/2207020944/photo/close-up-of-chinese-food-grilled-peking-duck-and-pancake.webp?a=1&b=1&s=612x612&w=0&k=20&c=ApQrbjcX8_V2aJiRaSRDkKq1wZS8GmUAOp39RalIsXk="], price: "350.000 VNĐ / nửa con" },
        { id: 7, title: "Cà Ri Xanh Gà", desc: "Cà ri xanh béo ngậy vị nước cốt dừa, thơm lừng lá chanh Kaffir, ăn kèm cơm trắng.", images: ["https://images.unsplash.com/photo-1668665772043-bdd32e348998?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdyZWVuJTIwY3Vycnl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600", "https://plus.unsplash.com/premium_photo-1661265874417-f9a2f1981eda?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Z3JlZW4lMjBjdXJyeXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"], price: "140.000 VNĐ" },
        { id: 8, title: "Kim Chi Jjigae", desc: "Canh kim chi cay nồng chuẩn vị Hàn Quốc, với đậu hũ non, thịt ba chỉ và hành baro.", images: ["https://media.istockphoto.com/id/1967525733/vi/anh/l%E1%BA%A9u-kim-chi-h%C3%A0n-qu%E1%BB%91c.jpg?s=612x612&w=0&k=20&c=fzKpOi5pD2zidTsJvlkCR6PaxR9zC8qyVMDlsDVRgLc=", "https://media.istockphoto.com/id/171115699/vi/anh/s%C3%BAp-%C4%91%E1%BA%ADu-ph%E1%BB%A5-m%E1%BB%81m.jpg?s=612x612&w=0&k=20&c=ZniUfJjPoue7ATH3bZfOc6NRi_YKr_dvkMRfNzq6e0U="], price: "120.000 VNĐ" },
        { id: 9, title: "Dimsum Tổng Hợp", desc: "Xíu mại tôm thịt, há cảo sò điệp, bánh bao kim sa. Trải nghiệm tinh hoa điểm tâm Hồng Kông.", images: ["https://media.istockphoto.com/id/1439364517/vi/anh/dim-sum-%C4%91%E1%BA%A7y-m%C3%A0u-s%E1%BA%AFc-tr%C3%AAn-m%E1%BB%99t-t%E1%BA%A5m-tr%E1%BA%AFng-v%E1%BB%9Bi-n%E1%BB%81n-g%E1%BB%97.jpg?s=612x612&w=0&k=20&c=k23eFRLN8q9wrvWZK98mmmhVcOwFLKdxpHTEzXFl4GM=", "https://media.istockphoto.com/id/523664801/vi/anh/dim-sum.jpg?s=612x612&w=0&k=20&c=c23EYMrG2TH_jrjl8AglGcw97WHVKrlYzD5Uu7MCEsc="], price: "160.000 VNĐ / xửng" },
      ]
    },
    {
      id: "europe",
      title: "Ẩm thực Châu Âu",
      longDesc: "Trải nghiệm phong cách ẩm thực sang trọng, từ Steak bò Úc mọng nước, mỳ Ý Carbonara béo ngậy đến các món salad tươi mát từ Địa Trung Hải.",
      img: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=800&q=60",
      dishes: [
        { id: 10, title: "Steak Ribeye", desc: "Bò Úc nướng 250g, giữ trọn độ mềm và mọng nước. Phục vụ kèm khoai tây nghiền và sốt rượu vang đỏ.", images: ["https://media.istockphoto.com/id/522134088/vi/anh/steack-v%E1%BB%9Bi-c%C3%A0-chua.jpg?s=612x612&w=0&k=20&c=pXgMRy7NGh_ypxLOnDgSwd18-S4baF4tLvZpoO3SDJI=", "https://media.istockphoto.com/id/1498613278/vi/anh/th%E1%BB%8Bt-b%C3%B2-th%C3%A1i-l%C3%A1t-v%E1%BB%9Bi-h%E1%BA%A1t-ti%C3%AAu-tr%C3%AAn-b%E1%BA%A3ng-%C4%91%C3%A1-phi%E1%BA%BFn-c%E1%BA%ADn-c%E1%BA%A3nh.jpg?s=612x612&w=0&k=20&c=Q5IlNjZgLFWXlWVxNW14vhe2BTCj4-V3hH3VnWpcdFE="], price: "450.000 VNĐ" },
        { id: 11, title: "Mỳ Ý Carbonara", desc: "Sốt kem trứng béo ngậy, phô mai Parmesan, và thịt xông khói Guanciale giòn tan.", images: ["https://media.istockphoto.com/id/470065924/vi/anh/cabonara-ramen.jpg?s=612x612&w=0&k=20&c=-ETY-fNchGvKpHVFGyABA3T-FXEa0IF0TZzPYHY2tvk=", "https://media.istockphoto.com/id/997423908/vi/anh/s%E1%BB%91t-kem-tr%E1%BA%AFng-spaghetti-carbonara-v%E1%BB%9Bi-th%E1%BB%8Bt-x%C3%B4ng-kh%C3%B3i-gi%C3%B2n-v%C3%A0-n%E1%BA%A5m-tr%C3%AAn-n%E1%BB%81n-tr%E1%BA%AFng.jpg?s=612x612&w=0&k=20&c=q4LQs99g6Sw0ZXUnzEMUCUGSSJwRcfNmPvTU5Xmgn38="], price: "180.000 VNĐ" },
        { id: 12, title: "Salad Caesar", desc: "Rau romaine tươi, bánh mì sấy giòn, cá cơm, và sốt Caesar gà nướng đặc biệt.", images: ["https://media.istockphoto.com/id/1495924977/vi/anh/m%E1%BB%99t-m%C3%B3n-salad-caesar-g%C3%A0-ngon-v%E1%BB%9Bi-ph%C3%B4-mai-parmesan-c%C3%A0-chua-b%C3%A1nh-m%C3%AC-v%C3%A0-n%C6%B0%E1%BB%9Bc-s%E1%BB%91t.jpg?s=612x612&w=0&k=20&c=nacARQkMaQDjtsKP_htWbKWs0vxOSl30xmHFpruXW-A=", "https://media.istockphoto.com/id/952313596/vi/anh/salad-g%C3%A0-caesar.jpg?s=612x612&w=0&k=20&c=rQnAZuyJefxUr_2lAYFpHgvZZ9GgWmCSLPDVl5UlJZU="], price: "150.000 VNĐ" },
        { id: 13, title: "Pizza Parma Ham", desc: "Đế bánh mỏng giòn, phô mai Mozzarella, thịt heo muối Parma và lá Arugula tươi.", images: ["https://media.istockphoto.com/id/1167700422/vi/anh/meat-mix-pizza-v%E1%BB%9Bi-gi%C4%83m-b%C3%B4ng-parma-%C4%91%C6%B0%E1%BB%A3c-c%C3%B4-l%E1%BA%ADp-tr%C3%AAn-n%E1%BB%81n-tr%E1%BA%AFng.jpg?s=612x612&w=0&k=20&c=Kw6EGzVr9cuSVTTxoqOPRpD_PnBjR_2yaP6XtkEru6s=", "https://media.istockphoto.com/id/1221202265/vi/anh/pinsa-v%E1%BB%9Bi-gi%C4%83m-b%C3%B4ng-parma-v%C3%A0-aragula-tr%C3%AAn-b%C3%A0n-g%E1%BB%97-pizza-rome.jpg?s=612x612&w=0&k=20&c=CUGfpIo9Q3LmThsBsr9RE6BFqZb4x6sFAybN7LO3J-c="], price: "220.000 VNĐ" },
        { id: 14, title: "Cá Hồi Áp Chảo", desc: "Da cá hồi giòn rụm, thịt cá mềm, ăn kèm măng tây nướng và sốt bơ chanh.", images: ["https://media.istockphoto.com/id/2211865912/vi/anh/fried-salmon-steak-with-boiled-potatoes-and-lemon-served-on-white-plate-on-wooden-background.jpg?s=612x612&w=0&k=20&c=OpgzCeWcX9kbHauByFaSYPXiIPTUzUiposWJzUq3CqE=", "https://media.istockphoto.com/id/627676604/vi/anh/c%C3%A1-h%E1%BB%93i-seared.jpg?s=612x612&w=0&k=20&c=bG6Ohw9WLmPnotJL1ozEWvyRvNZZIMqhMhPD_Vf-QR4="], price: "280.000 VNĐ" },
        { id: 15, title: "Sườn Cừu Nướng", desc: "Sườn cừu New Zealand nướng thảo mộc, mềm tan, phục vụ kèm khoai tây và sốt bạc hà.", images: ["https://media.istockphoto.com/id/1080892544/vi/anh/than-n%C6%B0%E1%BB%9Bng-s%C6%B0%E1%BB%9Dn-c%E1%BB%ABu-ph%C3%A1p-v%E1%BB%9Bi-h%C6%B0%C6%A1ng-th%E1%BA%A3o.jpg?s=612x612&w=0&k=20&c=fYbrpuig3vc3voy0o-zqt8wyO-VHJ9xjA1tX_iwdjc4=", "https://media.istockphoto.com/id/467413730/vi/anh/s%C6%B0%E1%BB%9Dn-c%E1%BB%ABu-n%C6%B0%E1%BB%9Bng-%C4%91%C6%B0%E1%BB%A3c-t%E1%BB%95-ch%E1%BB%A9c-tr%C3%AAn-m%E1%BB%99t-%C4%91%C4%A9a-tr%E1%BA%AFng-tr%C3%AAn-g%E1%BB%97.jpg?s=612x612&w=0&k=20&c=oPvNZr0rCtlgnkG-hFiH1WAebzRgIB9u553a9ep6oE0="], price: "420.000 VNĐ" },
        { id: 16, title: "Duck Confit", desc: "Đùi vịt Pháp om mỡ chậm, da giòn rụm, thịt mềm, phục vụ với khoai tây và nấm.", images: ["https://media.istockphoto.com/id/1150368715/vi/anh/v%E1%BB%8Bt-ch%C3%A2n-confit.jpg?s=612x612&w=0&k=20&c=C6wwjNiIsJ5YT1ddVL8YZQ0-YYvza7Kg8kukK5SdgAM=", "https://media.istockphoto.com/id/1987122996/vi/anh/ch%C3%A2n-v%E1%BB%8Bt-quay-khoai-t%C3%A2y-nghi%E1%BB%81n-h%C3%A0nh-t%C3%A2y-kem-b%E1%BA%AFp-c%E1%BA%A3i-t%C3%ADm-vi%E1%BB%87t-qu%E1%BA%A5t-jus.jpg?s=612x612&w=0&k=20&c=eRtGpIg4VMVulatqZsEM2hZpMzTAqT0ldu9sio1PVLE="], price: "320.000 VNĐ" },
        { id: 17, title: "Ratatouille", desc: "Món rau củ hầm cổ điển của Pháp với cà tím, bí ngòi, ớt chuông và sốt cà chua.", images: ["https://media.istockphoto.com/id/498303420/vi/anh/ratatouille-rau-n%C6%B0%E1%BB%9Bng-trong-ch%E1%BA%A3o-r%C3%A1n-gang-truy%E1%BB%81n-th%E1%BB%91ng-t%E1%BB%B1-l%C3%A0m.jpg?s=612x612&w=0&k=20&c=gzcAZKP4jEP0gm3gBupzhOXr9xEO91rP5lffe55VHLY=", "https://media.istockphoto.com/id/1286156506/vi/anh/ratatouille-rau-h%E1%BA%A7m-c%C3%A0-t%C3%ADm-th%C3%A1i-l%C3%A1t-b%C3%AD-xanh-h%C3%A0nh-t%C3%A2y-v%C3%A0-khoai-t%C3%A2y-v%E1%BB%9Bi-s%E1%BB%91t-c%C3%A0-chua-nguy%C3%AAn-li%E1%BB%87u-%E1%BB%9F.jpg?s=612x612&w=0&k=20&c=5RxkHjOHjD-9MpmPzbJxL5XfniD1cJPjTK9trjg8zAo="], price: "130.000 VNĐ" },
        { id: 18, title: "Crème Brûlée", desc: "Tráng miệng cổ điển với lớp kem trứng béo ngậy và lớp đường caramel giòn tan.", images: ["https://media.istockphoto.com/id/864319230/vi/anh/creme-brulee.jpg?s=612x612&w=0&k=20&c=E02YkQgAz4ouiK6sL0GOQyP63z6pW0xHJmUa6C-_vBE=", "https://media.istockphoto.com/id/504045700/vi/anh/creme-brulee-m%C3%B3n-tr%C3%A1ng-mi%E1%BB%87ng-kem-vani-truy%E1%BB%81n-th%E1%BB%91ng-c%E1%BB%A7a-ph%C3%A1p.jpg?s=612x612&w=0&k=20&c=YGNzh-CmHDzSTe5k-SsWdg-WQcM-ubv3l6MmsS25DLM="], price: "90.000 VNĐ" },
      ]
    },
  ];

  const drinkCategories: Category[] = [
    {
      id: "alcoholic",
      title: "Thức Uống Có Cồn",
      longDesc: "Bộ sưu tập rượu vang quốc tế, các loại bia thủ công và bia nhập khẩu chọn lọc, hoàn hảo cho mọi bữa tiệc.",
      img: "https://media.istockphoto.com/id/1479800728/vi/anh/nh%C3%B3m-b%E1%BA%A1n-u%E1%BB%91ng-v%C3%A0-n%C3%A2ng-ly-bia-t%E1%BA%A1i-nh%C3%A0-h%C3%A0ng-qu%C3%A1n-r%C6%B0%E1%BB%A3u-bia-nh%E1%BB%AFng-ng%C6%B0%E1%BB%9Di-%C4%91a-ch%E1%BB%A7ng-t%E1%BB%99c-h%E1%BA%A1nh-ph%C3%BAc-t%E1%BA%ADn.jpg?s=612x612&w=0&k=20&c=TxkPE_Cw5I3r6pCs7WVICgF_adPF4QzvQ9GGi_ckjzQ=",
      dishes: [
        { id: 19, title: "Heineken", desc: "Bia Lager Hà Lan với hương vị cân bằng, sảng khoái và hậu vị êm dịu.", images: ["https://media.istockphoto.com/id/458411525/vi/anh/bia-heineken.jpg?s=612x612&w=0&k=20&c=BZe1TwrHFE81vJTk-vpT2QGEcn3KSBWKoTjMpPNDZno=", "https://media.istockphoto.com/id/147307096/vi/anh/bia-heineken-tr%C3%AAn-b%C4%83ng.jpg?s=612x612&w=0&k=20&c=HmVTQ8WJNu1pZwEPAQuTH9bs2TIIQ1lWZpkzGbLlVsg="], price: "55.000 VNĐ" },
        { id: 20, title: "Tiger Crystal", desc: "Bia Tiger Bạc sảng khoái, được lọc bằng công nghệ -1°C, giữ trọn vị ngon.", images: ["https://m.media-amazon.com/images/I/71UFITN4MBL._AC_SL1200_.jpg", "https://media.istockphoto.com/id/458609193/vi/anh/bia-tiger.jpg?s=612x612&w=0&k=20&c=D0jLuJU8r-qRvLNOC1tcgMYdP5NLwk3924if_m2L4RA="], price: "55.000 VNĐ" },
        { id: 21, title: "Corona Extra", desc: "Bia Mexico nổi tiếng, thường được phục vụ với một lát chanh để tăng hương vị.", images: ["https://media.istockphoto.com/id/533717776/vi/anh/chai-bia-corona-extra.jpg?s=612x612&w=0&k=20&c=407Dk_e_xcZhm3ouUnK1SXXbATfaPHAa0ByhiI0LOSU=", "https://media.istockphoto.com/id/533717716/vi/anh/chai-bia-corona-extra.jpg?s=612x612&w=0&k=20&c=TAhjd-DjByhbZvyckFDgXTR1ebRZIqjuIPeG6qND3Hk="], price: "70.000 VNĐ" },
        { id: 22, title: "Budweiser", desc: "Vua của các loại bia từ Mỹ, nổi tiếng với hương vị êm dịu từ gỗ sồi.", images: ["https://media.istockphoto.com/id/519869570/vi/anh/s%C3%A1u-g%C3%B3i-budweiser.jpg?s=612x612&w=0&k=20&c=E_A672E5U-4wVTJWp318xV6aAHS2In2VYwLOvzuTmc4=", "https://media.istockphoto.com/id/458594513/vi/anh/chai-%C4%91%C3%A1-l%E1%BA%A1nh-budweiser.jpg?s=612x612&w=0&k=20&c=e_BObcD5d-OcttSWN_UWkeL1EtTDWpFbBqg53SUVQQ8="], price: "60.000 VNĐ" },
        { id: 23, title: "Hoegaarden", desc: "Bia Bỉ trắng (wheat beer) với hương vị vỏ cam và rau mùi độc đáo.", images: ["https://media.istockphoto.com/id/458736089/vi/anh/g%E1%BA%A5u-hoegaarden.jpg?s=612x612&w=0&k=20&c=3Iocrr5yxA1As-mClzGTusHwoPkafIZm88vTY4Xkk6o=", "https://media.istockphoto.com/id/516036214/vi/anh/6-g%C3%B3i-bia.jpg?s=612x612&w=0&k=20&c=I2f0-yeBbYRfSOlXCyrbftP62cc9kOnh4HFYwlwhbhI="], price: "85.000 VNĐ" },
        { id: 24, title: "Saigon Special", desc: "Bia Lager cao cấp của Việt Nam, hương vị đậm đà và sảng khoái.", images: ["https://platformcms.hndedu.com/uploads/2025/03/22/Saigon-Special-Beer.webp", "https://platformcms.hndedu.com/uploads/2025/03/22/Saigon-Chill-beer.webp"], price: "50.000 VNĐ" },
        { id: 25, title: "Cabernet Sauvignon", desc: "Rượu vang đỏ đậm (full-bodied) từ Chile, với hương vị quả lý đen, anh đào.", images: ["https://wineonsale.com/cdn/shop/products/Barefoot_Merlot_2_700x.png?v=1601487487", "https://wineonsale.com/cdn/shop/products/Barefoot_Cabernet_Sauvignon_Bottle_1_1_700x.png?v=1601487445"], price: "180.000 VNĐ / ly" },
        { id: 26, title: "Chardonnay", desc: "Rượu vang trắng cổ điển từ Pháp, với hương vị bơ, vani và trái cây nhiệt đới.", images: ["https://media.istockphoto.com/id/505822694/vi/anh/r%C6%B0%E1%BB%A3u-vang-tr%E1%BA%AFng-v%E1%BB%9Bi-nho-tr%C3%AAn-b%C3%A0n-g%E1%BB%97-c%C5%A9.jpg?s=612x612&w=0&k=20&c=LQ-1B5r6BG9YCRI12nxEc90UU-KPOdf5a5k1WRKDeE8=", "https://media.istockphoto.com/id/170936606/vi/anh/r%C6%B0%E1%BB%A3u-vang-tr%E1%BA%AFng-monte-carlo.jpg?s=612x612&w=0&k=20&c=FmtpueoYnLFxBHUHC1aOg1fOdQkmNEQbesuspgB8H8w="], price: "170.000 VNĐ / ly" },
        { id: 27, title: "Merlot", desc: "Rượu vang đỏ (medium-bodied) mềm mại từ Ý, dễ uống với hương vị mận và socola.", images: ["https://media.gettyimages.com/id/2156871728/photo/someones-hand-pouring-red-wine-into-a-wine-glass-in-a-home-environment.jpg?s=612x612&w=0&k=20&c=ccwPhgJyPxOon5ObufysitmIFNgqHJ6LIBLajUlFsyE=", "https://media.gettyimages.com/id/1297401631/photo/red-wineglass-and-bottle-copy-space.jpg?s=612x612&w=0&k=20&c=rPJgK0AsgxfXH_T5YcrJ0_EVaERP7CmyYkHGtdNX5z0="], price: "160.000 VNĐ / ly" },
        { id: 28, title: "Sauvignon Blanc", desc: "Vang trắng New Zealand tươi mát, nổi bật với hương chanh dây và ớt chuông xanh.", images: ["https://media.gettyimages.com/id/1818780917/photo/white-wineglass-on-outdoors-restaurant-table.jpg?s=612x612&w=0&k=20&c=vCcq3LBUtXIG8TEsxl49V1_cNR-Ncdwsp7wRwMAl3EE=", "https://media.gettyimages.com/id/1804541689/photo/close-up-of-a-woman-pouring-white-for-dinner.jpg?s=612x612&w=0&k=20&c=quOvs9p9x7dADSKMisb6FiJEjLkRcpFTIOxuSZnnPkw="], price: "170.000 VNĐ / ly" },
        { id: 29, title: "Pinot Noir", desc: "Vang đỏ (light-bodied) thanh lịch, với hương dâu tây, anh đào và nấm.", images: ["https://media.gettyimages.com/id/173597966/photo/wine-composition.jpg?s=612x612&w=0&k=20&c=jZdHCu0WfOKl5SYmcMxEVXHfKrCJvI5W8Kgh99YnS5k=", "https://media.gettyimages.com/id/157721043/photo/red-wine-glass-on-white.jpg?s=612x612&w=0&k=20&c=E8KRPs_lstMzm1qGbT_poETqj6mA90XAlL3-rqRresE="], price: "190.000 VNĐ / ly" },
        { id: 30, title: "Rosé", desc: "Vang hồng Provence (Pháp) nhẹ nhàng, sảng khoái, lý tưởng cho buổi chiều hè.", images: ["https://media.gettyimages.com/id/861681070/photo/rose-champagne-cocktails.jpg?s=612x612&w=0&k=20&c=a9xwtKYaQ9wZrsVTW786bLwmABuo7OPLj7Ilar1vY6U=", "https://media.gettyimages.com/id/157619922/photo/rose-wine-alfresco.jpg?s=612x612&w=0&k=20&c=Ut07rvELJL5f_SZ5r1_0bU-fRnkYJr8AR59fCXp8SLc="], price: "160.000 VNĐ / ly" },
      ]
    },
    {
      id: "cocktails",
      title: "Thức Uống Pha Chế",
      longDesc: "Trải nghiệm sự sáng tạo của các bartender chuyên nghiệp với 6 loại cocktail đặc sắc, từ cổ điển đến hiện đại.",
      img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=60",
      dishes: [
        { id: 31, title: "Mojito Chanh Bạc Hà", desc: "Vị cay nồng của rượu Rum, chua của chanh, và thơm mát của bạc hà.", images: ["https://media.gettyimages.com/id/1253999472/photo/mojito-cocktail.jpg?s=612x612&w=0&k=20&c=xOA8MH1DkjTEf0zXnlRGMLcGBTcT5Y-fENVfD3ZVVyc=", "https://media.gettyimages.com/id/157398263/photo/mojito-cocktail-on-white-background.jpg?s=612x612&w=0&k=20&c=lHG097_IGsxziCojuWEplNWhr9owRQZCMiVw8uBaaK4="], price: "120.000 VNĐ" },
        { id: 32, title: "Old Fashioned", desc: "Mạnh mẽ và cổ điển với rượu Bourbon, đường, và Angostura bitters.", images: ["https://media.gettyimages.com/id/2158795194/photo/smoked-cinnamon-old-fashioned-cocktail.jpg?s=612x612&w=0&k=20&c=n7Sp8Ot0UT7k2e4pxP5RnJqdyWY69wYa-rtAsfVB_xg=", "https://media.gettyimages.com/id/1300890639/photo/old-fashioned-whiskey-drink-on-ice-with-orange-zest-garnish.jpg?s=612x612&w=0&k=20&c=ejECWW3HqajRp3Ux8Xwzt83ASpq-QkprOL1MZ4nVy1w="], price: "150.000 VNĐ" },
        { id: 33, title: "Margarita", desc: "Vị chua thanh của chanh, nồng nàn của Tequila, và viền muối đặc trưng.", images: ["https://media.gettyimages.com/id/1646896493/photo/margarita-classic-style-in-margarita-glass.jpg?s=612x612&w=0&k=20&c=0Hy6lGSk2kLBYV1RmOPjqYuzD5en9X-iKr4GxXwWLmY=", "https://media.gettyimages.com/id/157531517/photo/margarita.jpg?s=612x612&w=0&k=20&c=rQkSKKHNWXgN_YLc8c58Fyse_Z6Arvt7mvtkioeE598="], price: "140.000 VNĐ" },
        { id: 34, title: "Espresso Martini", desc: "Sự kết hợp hoàn hảo giữa cà phê Espresso, rượu vodka và Kahlua.", images: ["https://media.gettyimages.com/id/1455558757/photo/espresso-martini-cocktails-garnished-with-coffee-beans-romania.jpg?s=612x612&w=0&k=20&c=kgscEbokXhLb3x8nSRPBYLDGHZaEo5L8L80sjpLuSTA=", "https://media.gettyimages.com/id/2159073460/photo/espresso-martini.jpg?s=612x612&w=0&k=20&c=cBExmf8fVD1Fj5kRfy2pPLZTVdYVEC_p0rMviW078MQ="], price: "160.000 VNĐ" },
        { id: 35, title: "Aperol Spritz", desc: "Món khai vị hoàn hảo từ Ý, sảng khoái với vị cam đắng nhẹ và sủi tăm Prosecco.", images: ["https://media.gettyimages.com/id/1590137752/photo/aperol-syringe-with-straw-and-orange-slice-and-ice-italian-alcoholic-drink-aperitif.jpg?s=612x612&w=0&k=20&c=98MV-hZqFeh9f6HkvI8SC15qtzAPWMldXcUO5DZyOpY=", "https://media.gettyimages.com/id/1488273252/photo/close-up-of-two-spritz-drinks-on-sunny-beige-background.jpg?s=612x612&w=0&k=20&c=HDJfjpY3hQlPT9p_I2ayOGVw22R_gwB8y2m8QsUpQ4k="], price: "130.000 VNĐ" },
        { id: 36, title: "Negroni", desc: "Một ly cocktail mạnh mẽ, cân bằng giữa vị ngọt (Vermouth) và đắng (Campari, Gin).", images: ["https://media.gettyimages.com/id/2166661958/photo/negroni-cocktail.jpg?s=612x612&w=0&k=20&c=8AoS0vHiHnY8Xde0aeYABADH-p8Qg6a_yI-oPNTYgRg=", "https://media.gettyimages.com/id/1461692575/photo/negroni.jpg?s=612x612&w=0&k=20&c=cIEuapj5G9FXZ2Y57c4cd-NTqPFPZR9J71nJ-QBzt-c="], price: "150.000 VNĐ" },
      ]
    },
  ];

  return (
    <>
      {/* KHỐI 1: BANNER SLIDER */}
      <PageBanner
        title="Ẩm thực"
        imageUrls={[
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=1200&q=80",
        ]}
      />
      {/* PHẦN GIỚI THIỆU ẨM THỰC */}
      <FoodIntro />

      {/* KHỐI 2: CÁC KHỐI XEN KẼ */}
      <div className="max-w-7xl mx-auto p-6 space-y-16">
        {foodCategories.map((category, index) => (
          <CategorySection
            key={category.id}
            category={category}
            index={index}
            onOpenModal={() => setSelectedFoodCategory(category)}
          />
        ))}
      </div>

      {/* BANNER THỨC UỐNG TOÀN MÀN HÌNH */}
      <PageBanner
        title="Thức uống & Quầy Bar"
        imageUrls={[
          "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
          "https://media.gettyimages.com/id/1153582461/photo/modern-empty-night-bar-wide-angle-near-bar-counter.jpg?s=612x612&w=0&k=20&c=M556X_uZNGLk8MddpEr0DuHEXtacxXaPUkJTqOTZ_XI=",
          "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80",
        ]}
      />

      {/* PHẦN GIỚI THIỆU THỨC UỐNG */}
      <DrinkIntro />

      {/* KHỐI 3: KHU VỰC THỨC UỐNG */}
      <div className="max-w-7xl mx-auto p-6 space-y-16">
        {drinkCategories.map((category, index) => (
          <CategorySection
            key={category.id}
            category={category}
            index={index}
            onOpenModal={() => setSelectedDrinkCategory(category)}
          />
        ))}
      </div>

      {/* Render Modal 1 (cho Á/Âu) */}
      {
        selectedFoodCategory && (
          <CategoryModal
            category={selectedFoodCategory}
            onClose={() => setSelectedFoodCategory(null)}
          />
        )
      }

      {/* Render Modal 2 (cho Thức Uống) */}
      {
        selectedDrinkCategory && (
          <CategoryModal
            category={selectedDrinkCategory}
            onClose={() => setSelectedDrinkCategory(null)}
          />
        )
      }
    </>
  );
}