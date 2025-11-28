"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Banner_Search_Bar from "./Banner_Search_Bar";
import { rooms as roomData } from "../data/room";

// Build a daily-rotating list of unique image URLs, excluding Home's images
// Only use the first image of each room (typically landscape/hero images)
const images = (() => {
  // Images used on Home: banner (room 0 img 0) + features (rooms 1,6,9 img 0)
  const exclude = new Set<string>();
  const homePick = (idx: number) => roomData[idx]?.images?.[0];
  [0, 1, 6, 9].forEach((i) => {
    const u = homePick(i);
    if (u) exclude.add(u);
  });

  // Collect only the first (hero) image from each room - these are landscape format
  const pool: string[] = [];
  const seen = new Set<string>();
  for (const r of roomData) {
    // Only take the first image which is typically the main landscape photo
    const heroImage = r.images?.[0];
    if (!heroImage) continue;
    if (exclude.has(heroImage)) continue;
    if (seen.has(heroImage)) continue;
    seen.add(heroImage);
    pool.push(heroImage);
  }

  // Seeded shuffle by current date (changes daily)
  const dateKey = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  let seed = dateKey || 1;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Limit for performance
  const limit = 10;
  return pool.slice(0, limit).map((url, idx) => ({ id: idx + 1, url }));
})();

export function UI_Carousel() {
  return (
    <div className="relative w-full h-[550px] md:h-[650px] lg:h-[750px]">
      {/* Hero Text */}
      {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center px-4 w-full max-w-5xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
          Trải nghiệm nghỉ dưỡng đẳng cấp
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light drop-shadow-xl">
          Nơi mọi khoảnh khắc đều trở nên đáng nhớ
        </p>
      </div> */}

      <div className="absolute bottom-16 md:bottom-20 lg:bottom-24 left-1/2 transform -translate-x-1/2 z-10 w-full px-4">
        <Banner_Search_Bar />
      </div>
      <Carousel
        className="h-full w-full"
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        opts={{
          loop: true,
          align: "center",
        }}
      >
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative h-full w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                <img
                  src={image.url}
                  alt={`Modern living space ${index + 1}`}
                  className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
