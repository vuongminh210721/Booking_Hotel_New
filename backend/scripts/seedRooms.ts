import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Room from "../src/models/Room";
import config from "../src/utils/env";
import connectDB from "../src/utils/db";

// Helpers to map frontend data to backend schema
const normalizeLocation = (
  city: string
): "Hồ Chí Minh" | "Hà Nội" | "Đà Nẵng" => {
  const c = city.toLowerCase();
  if (c.includes("hà nội")) return "Hà Nội";
  if (c.includes("đà nẵng")) return "Đà Nẵng";
  return "Hồ Chí Minh"; // covers "Tp Hồ Chí Minh"
};

const parsePrice = (priceStr?: string): number => {
  if (!priceStr) return 0;
  const digits = priceStr.replace(/[^0-9]/g, "");
  return Number(digits) || 0;
};

const parseGuests = (guests?: string): number => {
  if (!guests) return 1;
  const m = guests.match(/(\d+)/);
  return m ? Number(m[1]) : 1;
};

const inferType = (
  name: string
): "Deluxe" | "Suite" | "Presidential" | "Standard" => {
  const n = name.toLowerCase();
  if (n.includes("presidential")) return "Presidential";
  if (n.includes("suite")) return "Suite";
  if (n.includes("deluxe")) return "Deluxe";
  return "Standard";
};

const defaultBrand: "express" | "hotel" | "signature" = "hotel";

async function seedRooms() {
  try {
    await connectDB();

    const dataPath = path.resolve(__dirname, "data", "rooms.seed.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const rooms = JSON.parse(raw);

    const docs = rooms.map((r: any) => ({
      name: r.name,
      type: inferType(r.name),
      size: r.size?.replace(/\s/g, "") || "25m²",
      bedType: r.bedType || "Queen",
      maxGuests: parseGuests(r.guests),
      description: r.description || "",
      amenities: Array.isArray(r.amenities) ? r.amenities : [],
      images: Array.isArray(r.images)
        ? r.images.map((p: string) => `/assets/${p}`)
        : [],
      price: parsePrice(r.price),
      discountPrice: undefined,
      availability: r.soldOut ? false : true,
      soldOut: !!r.soldOut,
      location: normalizeLocation(r.city || r.location || "Tp Hồ Chí Minh"),
      brand: defaultBrand,
    }));

    const count = await Room.countDocuments();
    if (count > 0) {
      console.log(
        `⚠️  Found ${count} existing rooms. Deleting and re-seeding...`
      );
      await Room.deleteMany({});
      console.log(`✅ Deleted ${count} old rooms.`);
    }

    await Room.insertMany(docs);
    console.log(`✅ Seeded ${docs.length} rooms successfully.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding rooms failed:", err);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

seedRooms();
