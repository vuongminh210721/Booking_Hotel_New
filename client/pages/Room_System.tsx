import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, Search } from "lucide-react";
import SearchBar from "@/components/Search_Bar";
import RoomCard from "@/components/Room_Card";
import rooms from "@/data/rooms";

export default function RoomSystem() {
  const navigate = useNavigate();
  const location = useLocation();

  const [filteredRooms, setFilteredRooms] = useState(rooms);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  const handleSearch = (searchFilters) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const filtered = rooms.filter((room) => {
        // Filter by city/location
        if (searchFilters.location && room.city !== searchFilters.location) {
          return false;
        }

        // If guests filter is provided, parse number of guests from room data and match exactly
        if (typeof searchFilters.guests !== "undefined" && searchFilters.guests !== null) {
          const roomGuests = parseInt(room.guests.split(" ")[0], 10) || 1;
          return roomGuests === searchFilters.guests;
        }

        // No guests filter -> include the room
        return true;
      });
      setFilteredRooms(filtered);
      setLoading(false);
    }, 500);
    // Persist filters to URL so navigating away and back restores state
    try {
      const params = new URLSearchParams(location.search);
      if (searchFilters.location) params.set("location", searchFilters.location);
      else params.delete("location");
      if (searchFilters.checkIn) params.set("checkIn", searchFilters.checkIn);
      else params.delete("checkIn");
      if (searchFilters.checkOut)
        params.set("checkOut", searchFilters.checkOut);
      else params.delete("checkOut");
      if (typeof searchFilters.guests !== "undefined")
        params.set("guests", String(searchFilters.guests));
      else params.delete("guests");

      navigate(
        { pathname: "/rooms", search: params.toString() },
        { replace: false }
      );
    } catch (e) {
      // ignore URL update failures
    }
  };

  useEffect(() => {
    // Initial load
    // If there are query params, use them to initialize filters and run search
    const params = new URLSearchParams(location.search);
    const qLocation = params.get("location") || "";
    const qCheckIn = params.get("checkIn") || "";
    const qCheckOut = params.get("checkOut") || "";
    const qGuestsParam = params.get("guests");
    const qGuests = qGuestsParam !== null ? parseInt(qGuestsParam, 10) : undefined;

    if (qLocation || qCheckIn || qCheckOut || typeof qGuests !== "undefined") {
      const initial = {
        location: qLocation,
        checkIn: qCheckIn,
        checkOut: qCheckOut,
        // If guests param present but invalid (NaN) or zero, default to 2; if absent, leave undefined
        guests:
          typeof qGuests === "undefined"
            ? undefined
            : Number.isNaN(qGuests) || qGuests === 0
              ? 2
              : qGuests,
      };
      setFilters(initial);
      // run search with parsed params so filteredRooms matches
      handleSearch(initial);
    } else {
      setFilteredRooms(rooms);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-[1300px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-10 md:mb-12 pt-6 md:pt-10">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Lựa chọn phòng
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Khám phá không gian nghỉ dưỡng lý tưởng của bạn
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 md:mb-16">
          <SearchBar
            onSearch={handleSearch}
            initialGuests={filters.guests}
            initialCheckIn={filters.checkIn}
            initialCheckOut={filters.checkOut}
            initialLocation={filters.location}
          />
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 md:py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-teal-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-teal-100"></div>
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Đang tìm phòng cho bạn...</p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            {filteredRooms.length > 0 && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="text-base md:text-lg text-gray-700">
                    <p className="mb-1">
                      Tìm thấy <span className="font-bold text-teal-600">{filteredRooms.length}</span> phòng
                      {filters.location && <span> tại <span className="font-semibold text-gray-900">{filters.location}</span></span>}
                    </p>
                    {(filters.checkIn || filters.checkOut) && (
                      <p className="text-sm text-gray-500">
                        {filters.checkIn && <span>Nhận phòng: <span className="font-medium">{filters.checkIn}</span></span>}
                        {filters.checkIn && filters.checkOut && <span className="mx-2">•</span>}
                        {filters.checkOut && <span>Trả phòng: <span className="font-medium">{filters.checkOut}</span></span>}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Info className="w-5 h-5" />
                    <span>Giá đã bao gồm thuế phí</span>
                  </div>
                </div>
              </div>
            )}

            {/* Room Cards Grid */}
            <div className="flex flex-col gap-6 md:gap-8">
              {filteredRooms.map((room, index) => (
                <div
                  key={room.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <RoomCard {...room} />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredRooms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 px-6">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                  <Search className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
                  Không tìm thấy phòng phù hợp
                </h3>
                <p className="text-gray-600 text-center max-w-md mb-6">
                  Xin lỗi! Chúng tôi không có phòng phù hợp với tiêu chí của bạn. Vui lòng thử lại với điều kiện khác.
                </p>
                <button
                  onClick={() => {
                    setFilters({ location: "", checkIn: "", checkOut: "", guests: 2 });
                    setFilteredRooms(rooms);
                    navigate("/rooms");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Xem tất cả phòng
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
