import multer from "multer";
import path from "path";
import fs from "fs";

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, "../../uploads/avatars");
console.log("📁 Upload directory:", uploadDir);
console.log("📁 Directory exists:", fs.existsSync(uploadDir));

if (!fs.existsSync(uploadDir)) {
  console.log("📁 Creating upload directory...");
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Tạo tên file unique: timestamp-random-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `avatar-${uniqueSuffix}${ext}`;
    console.log("📸 Saving avatar as:", filename);
    cb(null, filename);
  },
});

// File filter - chỉ cho phép ảnh
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Export multer upload middleware
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
}).single("avatar");
