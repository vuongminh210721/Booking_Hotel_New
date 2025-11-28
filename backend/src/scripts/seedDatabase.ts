import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "../models/Review";
import MenuItem from "../models/MenuItem";
import Location from "../models/Location";
import Service from "../models/Service";
import Room from "../models/Room";
import User from "../models/User";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hotelhub";

// Sample user for reviews
const createSampleUser = async () => {
  const existingUser = await User.findOne({ email: "demo@hotelhub.vn" });
  if (existingUser) return existingUser;

  const hashedPassword = await bcrypt.hash("Demo123!", 10);
  const user = new User({
    fullName: "Khách hàng HotelHub",
    email: "demo@hotelhub.vn",
    password: hashedPassword,
    phone: "0901234567",
  });
  await user.save();
  return user;
};

// Sample data for Reviews
const getReviewsData = (userId: mongoose.Types.ObjectId) => [
  {
    user: userId,
    hotelName: "HotelHub Resort Phú Quốc",
    rating: 5,
    comment:
      "Khách sạn tuyệt vời! Phòng sạch sẽ, view đẹp, nhân viên thân thiện. Chắc chắn sẽ quay lại!",
    isVerified: true,
    helpful: 12,
  },
  {
    user: userId,
    hotelName: "HotelHub Resort Đà Nẵng",
    rating: 5,
    comment:
      "Dịch vụ chăm sóc khách hàng tuyệt vời! Checkin nhanh chóng, checkout linh hoạt. Phòng ban công có view biển tuyệt đẹp.",
    isVerified: true,
    helpful: 8,
  },
  {
    user: userId,
    hotelName: "HotelHub Kim Mã Hà Nội",
    rating: 4,
    comment:
      "Vị trí thuận tiện, gần trung tâm. Phòng ốc hiện đại, tiện nghi đầy đủ. Nhân viên nhiệt tình.",
    isVerified: true,
    helpful: 5,
  },
];

// Sample data for Menu Items
const menuItemsData = [
  {
    name: "Phở Bò Đặc Biệt",
    description:
      "Phở bò truyền thống Hà Nội với nước dùng ninh từ xương trong 12 tiếng, thịt bò tươi mềm và rau thơm.",
    category: "Món Châu Á",
    images: [
      "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=800&q=60",
    ],
    price: 85000,
    isAvailable: true,
    preparationTime: 15,
    isVegetarian: false,
    isSpicy: false,
    rating: 4.8,
    reviewCount: 245,
  },
  {
    name: "Cơm Sườn Nướng",
    description:
      "Sườn lợn ướp mềm, nướng trên than hoa, kèm cơm trắng dẻo và đồ chua.",
    category: "Món Châu Á",
    images: [
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=60",
    ],
    price: 95000,
    isAvailable: true,
    preparationTime: 20,
    isVegetarian: false,
    isSpicy: false,
    rating: 4.6,
    reviewCount: 189,
  },
  {
    name: "Steak Ribeye",
    description:
      "Bò Úc nướng 250g, giữ trọn độ mềm và mọng nước. Phục vụ kèm khoai tây nghiền và sốt rượu vang đỏ.",
    category: "Món Châu Âu",
    images: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=60",
    ],
    price: 450000,
    isAvailable: true,
    preparationTime: 25,
    isVegetarian: false,
    isSpicy: false,
    rating: 4.9,
    reviewCount: 312,
  },
  {
    name: "Pasta Carbonara",
    description:
      "Mì Ý sốt kem trứng, thịt xông khói giòn và phô mai Parmesan thơm ngon.",
    category: "Món Châu Âu",
    images: [
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=60",
    ],
    price: 180000,
    isAvailable: true,
    preparationTime: 15,
    isVegetarian: false,
    isSpicy: false,
    rating: 4.7,
    reviewCount: 156,
  },
  {
    name: "Sushi Set Deluxe",
    description:
      "12 miếng sushi tươi ngon gồm cá hồi, cá ngừ, tôm và lươn nướng.",
    category: "Món Nhật Bản",
    images: [
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=60",
    ],
    price: 320000,
    isAvailable: true,
    preparationTime: 20,
    isVegetarian: false,
    isSpicy: false,
    rating: 4.8,
    reviewCount: 278,
  },
  {
    name: "Mojito Classic",
    description: "Cocktail cổ điển với rum trắng, bạc hà, chanh và soda.",
    category: "Thức Uống Pha Chế",
    images: [
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=60",
    ],
    price: 120000,
    isAvailable: true,
    preparationTime: 5,
    isVegetarian: true,
    isSpicy: false,
    rating: 4.5,
    reviewCount: 89,
  },
  {
    name: "Tiramisu",
    description:
      "Bánh ngọt Ý với lớp kem mascarpone, cà phê espresso và bột ca cao.",
    category: "Tráng Miệng",
    images: [
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=60",
    ],
    price: 85000,
    isAvailable: true,
    preparationTime: 5,
    isVegetarian: true,
    isSpicy: false,
    rating: 4.9,
    reviewCount: 234,
  },
];

// Sample data for Locations
const locationsData = [
  {
    name: "HotelHub Kim Mã",
    label: "HÀ NỘI",
    city: "Hà Nội",
    address: "123 Kim Mã, Ba Đình, Hà Nội",
    description:
      "Tọa lạc tại trung tâm Hà Nội, HotelHub Kim Mã mang đến không gian hiện đại, sang trọng cùng dịch vụ 5 sao. Chỉ vài phút đi bộ đến Hồ Gươm, Nhà hát Lớn và các điểm tham quan nổi tiếng.",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 21.0285, lng: 105.8542 },
    phone: "024 3555 1234",
    email: "kimma@hotelhub.vn",
    amenities: [
      "Hồ bơi vô cực",
      "Spa & Gym",
      "Nhà hàng cao cấp",
      "Phòng hội nghị",
    ],
    roomCount: 150,
    isActive: true,
  },
  {
    name: "HotelHub Vincom Landmark 81",
    label: "TP HỒ CHÍ MINH",
    city: "Hồ Chí Minh",
    address: "Landmark 81, Vinhomes Central Park, Bình Thạnh, TP.HCM",
    description:
      "Nằm tại tầng cao của tòa nhà Landmark 81 - biểu tượng của Sài Gòn hiện đại. HotelHub Vincom mang đến tầm nhìn 360° toàn cảnh thành phố ánh đèn lung linh về đêm, cùng những tiện ích đẳng cấp quốc tế.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 10.7944, lng: 106.7218 },
    phone: "028 3777 5678",
    email: "landmark81@hotelhub.vn",
    amenities: ["Sky Bar", "Infinity Pool", "Fine Dining", "Concierge 24/7"],
    roomCount: 200,
    isActive: true,
  },
  {
    name: "HotelHub Mỹ Khê Beach",
    label: "ĐÀ NẴNG",
    city: "Đà Nẵng",
    address: "Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
    description:
      "Với vị trí đắc địa ngay sát bãi biển Mỹ Khê - một trong những bãi biển đẹp nhất hành tinh, HotelHub Mỹ Khê Beach là điểm dừng chân lý tưởng cho kỳ nghỉ dưỡng trọn vẹn bên bờ biển.",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 16.0544, lng: 108.2442 },
    phone: "0236 3888 9999",
    email: "mykhe@hotelhub.vn",
    amenities: [
      "Beach Access",
      "Water Sports",
      "Seafood Restaurant",
      "Kids Club",
    ],
    roomCount: 180,
    isActive: true,
  },
];

// Sample data for Services
const servicesData = [
  {
    title: "Giặt ủi",
    desc: "Dịch vụ giặt ủi nhanh, sạch sẽ.",
    longDesc:
      "Dịch vụ giặt ủi chuyên nghiệp của chúng tôi đảm bảo quần áo của bạn luôn sạch sẽ và thơm tho. Chúng tôi sử dụng công nghệ giặt sấy hiện đại và quy trình kiểm tra chất lượng nghiêm ngặt, sẵn sàng phục vụ 24/7.",
    img: "https://cdn.pixabay.com/photo/2021/02/02/12/38/iron-5973837_1280.jpg",
    galleryImages: [
      "https://images.unsplash.com/photo-1652664767434-9cf9447d499a?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=60",
    ],
    price: "Từ 50.000 VNĐ / kg",
    contactPerson: "Chị Lan - Trưởng bộ phận Buồng phòng",
    process: [
      "Nhận đồ tại phòng",
      "Phân loại & Giặt sấy",
      "Ủi phẳng & Gấp gọn",
      "Trả đồ tận phòng trong 24h",
    ],
    category: "hotel_service",
    isAvailable: true,
  },
  {
    title: "Đưa đón sân bay",
    desc: "Xe đưa đón tiện lợi, an toàn.",
    longDesc:
      "Bắt đầu kỳ nghỉ của bạn một cách thoải mái nhất với dịch vụ đưa đón sân bay riêng tư. Tài xế chuyên nghiệp của chúng tôi sẽ đợi bạn tại sảnh đến, hỗ trợ hành lý và đưa bạn đến khách sạn một cách an toàn và nhanh chóng.",
    img: "https://cdn.pixabay.com/photo/2018/02/14/15/50/lufthansa-regional-3153209_1280.jpg",
    galleryImages: [
      "https://images.unsplash.com/photo-1566827267844-39de9bcad5ee?auto=format&fit=crop&w=800&q=60",
    ],
    price: "1.000.000 VNĐ / lượt",
    contactPerson: "Anh Minh - Trưởng bộ phận Vận chuyển",
    process: [
      "Xác nhận lịch bay",
      "Tài xế đợi tại Cổng đến (có bảng tên)",
      "Di chuyển về khách sạn (30 phút)",
    ],
    category: "transportation",
    isAvailable: true,
  },
  {
    title: "Spa & Trị liệu",
    desc: "Phục hồi năng lượng cơ thể.",
    longDesc:
      "Tìm lại sự cân bằng cho cơ thể và tâm trí tại spa của chúng tôi. Các chuyên gia trị liệu sẽ tư vấn cho bạn các gói massage, chăm sóc da mặt và xông hơi, giúp bạn xua tan mọi mệt mỏi và căng thẳng.",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=60",
    galleryImages: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=60",
    ],
    price: "Từ 500.000 VNĐ / liệu trình",
    contactPerson: "Chị Huyền - Quản lý phòng spa",
    process: [
      "Tư vấn trị liệu",
      "Xông hơi (15 phút)",
      "Massage trị liệu (60 phút)",
      "Thưởng thức trà thảo mộc",
    ],
    category: "spa_wellness",
    isAvailable: true,
  },
  {
    title: "Hồ bơi vô cực",
    desc: "Thư giãn và ngắm nhìn toàn cảnh thành phố.",
    longDesc:
      "Hồ bơi vô cực trên tầng thượng là ốc đảo thư giãn lý tưởng. Đắm mình trong làn nước mát lạnh, nhâm nhi ly cocktail và ngắm nhìn đường chân trời tuyệt đẹp của thành phố, đặc biệt là vào lúc hoàng hôn.",
    img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=60",
    galleryImages: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    ],
    price: "Miễn phí cho khách lưu trú",
    contactPerson: "Chị Uyên - Cứu hộ",
    process: ["Yêu cầu xuất trình thẻ khách sạn", "Yêu cầu mặc đồ bơi"],
    category: "hotel_service",
    isAvailable: true,
  },
  {
    title: "Hướng dẫn viên du lịch",
    desc: "Các tour trong ngày (Bà Nà, Hội An).",
    longDesc:
      "Khám phá các địa danh nổi tiếng nhất miền Trung một cách dễ dàng. Chúng tôi tổ chức các tour trọn gói trong ngày đến Bà Nà Hills, Phố cổ Hội An, Ngũ Hành Sơn... đã bao gồm xe đưa đón và vé vào cửa.",
    img: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=60",
    galleryImages: [
      "https://images.unsplash.com/photo-1586810724476-c294fb7ac01b?auto=format&fit=crop&w=800&q=60",
    ],
    price: "Từ 1.000.000 VNĐ / người",
    contactPerson: "Bộ phận Lễ tân",
    process: [
      "Chọn loại địa điểm",
      "Chọn hướng dẫn viên",
      "Hẹn ngày giờ tham gia",
    ],
    category: "activities",
    isAvailable: true,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Create sample user for reviews
    console.log("\n👤 Creating sample user...");
    const sampleUser = await createSampleUser();
    console.log(`✅ Sample user ready: ${sampleUser.email}`);

    // Clear existing data
    console.log("\n🗑️  Clearing existing data...");
    await Review.deleteMany({});
    await MenuItem.deleteMany({});
    await Location.deleteMany({});
    await Service.deleteMany({});

    // Insert Reviews
    console.log("\n📝 Seeding Reviews...");
    const reviewsData = getReviewsData(
      sampleUser._id as mongoose.Types.ObjectId
    );
    const reviews = await Review.insertMany(reviewsData);
    console.log(`✅ Inserted ${reviews.length} reviews`);

    // Insert Menu Items
    console.log("\n🍽️  Seeding Menu Items...");
    const menuItems = await MenuItem.insertMany(menuItemsData);
    console.log(`✅ Inserted ${menuItems.length} menu items`);

    // Insert Locations
    console.log("\n📍 Seeding Locations...");
    const locations = await Location.insertMany(locationsData);
    console.log(`✅ Inserted ${locations.length} locations`);

    // Insert Services
    console.log("\n🛎️  Seeding Services...");
    const services = await Service.insertMany(servicesData);
    console.log(`✅ Inserted ${services.length} services`);

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Menu Items: ${menuItems.length}`);
    console.log(`   - Locations: ${locations.length}`);
    console.log(`   - Services: ${services.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  }
}

// Run the seed function
seedDatabase();
