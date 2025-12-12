const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Room = require("../src/models/Room").default;
const { loadEnv } = require("../src/config/env");
const { connectDB } = require("../src/config/db");

const normalizeLocation = (city) => {
  const c = (city || "").toLowerCase();
  if (c.includes("hà nội")) return "Hà Nội";
  if (c.includes("đà nẵng")) return "Đà Nẵng";
  return "Hồ Chí Minh";
};

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  const digits = String(priceStr).replace(/[^0-9]/g, "");
  return Number(digits) || 0;
};

const parseGuests = (guests) => {
  if (!guests) return 1;
  const m = String(guests).match(/(\d+)/);
  return m ? Number(m[1]) : 1;
};

const inferType = (name) => {
  const n = String(name).toLowerCase();
  if (n.includes("presidential")) return "Presidential";
  if (n.includes("suite")) return "Suite";
  if (n.includes("deluxe")) return "Deluxe";
  return "Standard";
};

const defaultBrand = "hotel";

async function seedRooms() {
  try {
    loadEnv();
    await connectDB();

    const dataPath = path.resolve(__dirname, "data", "rooms.seed.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const rooms = JSON.parse(raw);

    const docs = rooms.map((r) => ({
      name: r.name,
      type: inferType(r.name),
      size: (r.size || "25 m²").replace(/\s/g, ""),
      bedType: r.bedType || "Queen",
      maxGuests: parseGuests(r.guests),
      description: r.description || "",
      amenities: Array.isArray(r.amenities) ? r.amenities : [],
      images: Array.isArray(r.images) ? r.images.map((p) => `/assets/${p}`) : [],
      price: parsePrice(r.price),
      discountPrice: undefined,
      availability: r.soldOut ? false : true,
      soldOut: !!r.soldOut,
      location: normalizeLocation(r.city || r.location || "Tp Hồ Chí Minh"),
      brand: defaultBrand,
    }));

    const count = await Room.countDocuments();
    if (count > 0) {
      console.log(`Rooms already exist: ${count}. Skipping seeding.`);
      await mongoose.disconnect();
      return;
    }

    await Room.insertMany(docs);
    console.log(`Seeded ${docs.length} rooms.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding rooms failed:", err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

seedRooms();
