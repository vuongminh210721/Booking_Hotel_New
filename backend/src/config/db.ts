import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env file");
  process.exit(1);
}

// Mask password for logging
const maskedURI = MONGODB_URI.replace(/:[^:@]+@/, ":****@");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log(`📍 URI: ${maskedURI}`);

    await mongoose.connect(MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });

    console.log("✅ MongoDB Atlas connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check if MONGODB_URI in .env is correct");
    console.error("   2. Whitelist your IP in MongoDB Atlas:");
    console.error(
      "      https://cloud.mongodb.com -> Network Access -> Add IP Address"
    );
    console.error(
      "   3. Add 0.0.0.0/0 for development (Allow access from anywhere)\n"
    );
    process.exit(1);
  }
};

export default connectDB;
export { connectDB };
