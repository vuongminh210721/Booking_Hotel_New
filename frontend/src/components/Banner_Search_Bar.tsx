import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CITIES = ["Tp Hồ Chí Minh", "Đà Nẵng", "Hà Nội"];

export default function Banner_Search_Bar({
   isHomePage = false,
   scrolled = false,
}) {
   const [guests, setGuests] = useState(2);
   const [checkIn, setCheckIn] = useState("");
   const [checkOut, setCheckOut] = useState("");
   const [location, setLocation] = useState(CITIES[0]);
   const [priceRange, setPriceRange] = useState("");
   const [clicked, setClicked] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");
   const navigate = useNavigate();

   const applySearch = () => {
      // Validate dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn) {
         const checkInDate = new Date(checkIn);
         if (checkInDate < today) {
            setErrorMessage("Ngày nhận phòng không hợp lệ");
            return;
         }
      }

      if (checkIn && checkOut) {
         const checkInDate = new Date(checkIn);
         const checkOutDate = new Date(checkOut);
         if (checkOutDate <= checkInDate) {
            setErrorMessage("Ngày trả phòng không hợp lệ");
            return;
         }
      }

      setErrorMessage("");
      const params = new URLSearchParams();
      if (location) params.set("location", location);
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      if (guests) params.set("guests", String(guests));
      if (priceRange) params.set("priceRange", priceRange);
      navigate(`/rooms?${params.toString()}`);
   };

   const handleClick = () => {
      setClicked(true);
      applySearch();
      setTimeout(() => setClicked(false), 1500); // trở lại bình thường sau 1.5s
   };

   return (
      <div className="w-full max-w-[1200px] mx-auto px-4">
         {/* Transparent frame for banner (no background color) */}
         <div className="rounded-2xl overflow-hidden bg-transparent p-6">
            <div className="flex items-center gap-4">
               {/* Các ô input */}
               <div className="flex w-full items-stretch">
                  {/* Địa điểm */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                     <label className="text-[#2fd680] text-base font-semibold mb-2 block">
                        Địa điểm
                     </label>
                     <select
                        className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-white bg-transparent text-base focus:ring-[#2fd680] focus:border-[#2fd680] cursor-pointer appearance-none"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                     >
                        {CITIES.map((city) => (
                           <option
                              key={city}
                              value={city}
                              className="bg-gray-800 text-white"
                           >
                              {city}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Thanh ngăn nhỏ */}
                  <div className="hidden sm:flex w-[1px] bg-gray-200 my-5 self-stretch"></div>

                  {/* Nhận phòng */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                     <label className="text-[#2fd680] text-base font-semibold mb-2 block">
                        Nhận phòng
                     </label>
                     <input
                        type="date"
                        className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-white bg-transparent text-base focus:ring-[#2fd680] focus:border-[#2fd680] cursor-pointer"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                     />
                  </div>

                  {/* Thanh ngăn nhỏ */}
                  <div className="hidden sm:flex w-[1px] bg-gray-200 my-5 self-stretch"></div>

                  {/* Trả phòng */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                     <label className="text-[#2fd680] text-base font-semibold mb-2 block">
                        Trả phòng
                     </label>
                     <input
                        type="date"
                        className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-white bg-transparent text-base focus:ring-[#2fd680] focus:border-[#2fd680] cursor-pointer"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                     />
                  </div>

                  {/* Thanh ngăn nhỏ */}
                  <div className="hidden sm:flex w-[1px] bg-gray-200 my-5 self-stretch"></div>

                  {/* Khách */}
                  <div className="w-[150px] p-4 flex flex-col justify-between">
                     <label className="text-[#2fd680] text-base font-semibold mb-2 block">
                        Khách
                     </label>
                     <div className="flex items-center justify-between border border-gray-300 rounded-md px-4 py-2.5">
                        <button
                           className="text-gray-200 hover:text-[#2fd680] text-xl"
                           onClick={() => setGuests(Math.max(1, guests - 1))}
                        >
                           −
                        </button>
                        <span className="text-white text-base font-medium">
                           {guests}
                        </span>
                        <button
                           className="text-gray-200 hover:text-[#2fd680] text-xl"
                           onClick={() => setGuests(Math.min(10, guests + 1))}
                        >
                           +
                        </button>
                     </div>
                  </div>
               </div>

               {/* Thanh ngăn nhỏ giữa Khách và Áp dụng */}
               <div className="hidden sm:flex w-px h-8 bg-gray-200 self-center" />

               {/* Nút Tìm phòng */}
               <button
                  onClick={handleClick}
                  className={`flex px-5 py-2 justify-center font-semibold items-center rounded-full transition-colors duration-300 whitespace-nowrap text-sm leading-6
    border border-white/70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
    ${clicked ? "text-[#2fd680]" : "text-white"}
    hover:text-[#2fd680] hover:bg-white/10`}
               >
                  Tìm phòng
               </button>
            </div>

            {/* Error message */}
            {errorMessage && (
               <div className="mt-4 text-center text-red-400 bg-red-900/30 border border-red-400/50 rounded-lg px-4 py-2">
                  {errorMessage}
               </div>
            )}
         </div>
      </div>
   );
}
