import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./UserMenu";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [heroThreshold, setHeroThreshold] = useState(0);
  const { isAuthenticated } = useAuth();

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const navigate = useNavigate();

  useEffect(() => {
    const computeThreshold = () => {
      if (location.pathname !== "/") {
        setHeroThreshold(0);
        setScrolled(true);
        return;
      }
      const hero = document.getElementById("UI_banner");
      const height = hero?.offsetHeight ?? window.innerHeight;
      setHeroThreshold(height);
      const headerH = 64;
      setScrolled(window.scrollY > height - headerH);
    };

    const onScroll = () => {
      const headerH = 64;
      setScrolled(window.scrollY > Math.max(0, heroThreshold - headerH));
    };

    computeThreshold();
    window.addEventListener("resize", computeThreshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", computeThreshold);
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.pathname, heroThreshold]);

  console.log(JSON.parse(localStorage.getItem('auth_user')))

  return (
    <header
      className={`w-full fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isHomePage
        ? scrolled
          ? "bg-white/60 backdrop-blur-md backdrop-saturate-150 border-b border-white/25 shadow-lg"
          : "bg-gradient-to-b from-black/50 to-transparent"
        : "bg-white/60 backdrop-blur-md backdrop-saturate-150 border-b border-white/25 shadow-lg"
        }`}
    >
      <div className="max-w-[1521px] mx-auto px-4 sm:px-8 lg:px-[125.4px]">
        <div className="flex items-center justify-between h-16 gap-4">
          <Logo
            scrolled={scrolled}
            isHomePage={isHomePage}
            className="py-0 px-[15px] flex-shrink-0"
          />

          <nav className="hidden lg:flex items-center gap-5 flex-1 justify-end px-[15px]">
            <a
              href="/rooms"
              onClick={(e) => {
                e.preventDefault();
                try {
                  const selected = window.localStorage.getItem("hb:selectedCity");
                  const params = new URLSearchParams();
                  if (selected) params.set("location", selected);
                  navigate({ pathname: "/rooms", search: params.toString() });
                } catch (err) {
                  navigate("/rooms");
                }
              }}
              className={`font-['Be_Vietnam_Pro'] text-base font-semibold leading-5 capitalize transition-colors ${isHomePage && !scrolled
                ? "text-white hover:text-[#2fd680] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                : "text-gray-900 hover:text-[#2fd680]"
                }`}
            >
              HỆ THỐNG PHÒNG
            </a>

            <Link
              to="/services"
              className={`font-['Be_Vietnam_Pro'] text-base font-semibold leading-5 capitalize transition-colors ${isHomePage && !scrolled
                ? "text-white hover:text-[#2fd680] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                : "text-gray-900 hover:text-[#2fd680]"
                }`}
            >
              DỊCH VỤ
            </Link>
            <Link
              to="/food"
              className={`font-['Be_Vietnam_Pro'] text-base font-semibold leading-5 capitalize transition-colors ${isHomePage && !scrolled
                ? "text-white hover:text-[#2fd680] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                : "text-gray-900 hover:text-[#2fd680]"
                }`}
            >
              ẨM THỰC
            </Link>
            <Link
              to="/locations"
              className={`font-['Be_Vietnam_Pro'] text-base font-semibold leading-5 capitalize transition-colors ${isHomePage && !scrolled
                ? "text-white hover:text-[#2fd680] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                : "text-gray-900 hover:text-[#2fd680]"
                }`}
            >
              ƯU ĐÃI
            </Link>
            <Link
              to="/contact"
              className={`font-['Be_Vietnam_Pro'] text-base font-semibold leading-5 capitalize transition-colors ${isHomePage && !scrolled
                ? "text-white hover:text-[#2fd680] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                : "text-gray-900 hover:text-[#2fd680]"
                }`}
            >
              LIÊN HỆ
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                {/* <button
                  onClick={() => navigate('/login')}
                  className={`flex px-4 py-2 justify-center items-center rounded-xl transition-colors duration-300 whitespace-nowrap font-['Be_Vietnam_Pro'] text-sm font-semibold leading-6 ${isHomePage && !scrolled
                    ? "text-white border border-white/70 hover:bg-white/10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                    : "bg-[#2fd680] text-white hover:bg-[#41deb9] hover:text-black shadow-sm"
                    }`}
                >
                  Đăng nhập
                </button> */}
                <button
                  onClick={() => navigate('/login')}
                  className={`flex px-4 py-2 justify-center items-center rounded-xl transition-colors duration-300 whitespace-nowrap font-['Be_Vietnam_Pro'] text-sm font-semibold leading-6 ${isHomePage && !scrolled
                    ? "bg-white/20 text-white border border-white/70 hover:bg-white/30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                    : "border-2 border-[#2fd680] text-[#2fd680] hover:bg-[#2fd680] hover:text-white shadow-sm"
                    }`}
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}