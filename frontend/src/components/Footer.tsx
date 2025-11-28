import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Footer() {
  const [isGlass, setIsGlass] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const compute = () => {
      // If we're not on the home page, show glass (matches Header behavior)
      if (location.pathname !== "/") {
        setIsGlass(true);
        return;
      }

      const hero = document.getElementById("UI_banner");
      const heroHeight = hero?.offsetHeight ?? window.innerHeight;
      const headerH = 64; // approximate header height used for threshold
      setIsGlass(window.scrollY > Math.max(0, heroHeight - headerH));
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, { passive: true });
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute);
    };
  }, [location.pathname]);

  const baseClass =
    "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-colors duration-200";
  const normalClass = "text-white border border-white/70 hover:bg-white/10";
  const glassClass =
    "bg-white/60 backdrop-blur-md backdrop-saturate-150 border-t border-white/10 text-gray-900";

  return (
    <footer className={`${baseClass} ${isGlass ? glassClass : normalClass}`}>
      <div className="max-w-[1536px] mx-auto px-5 md:px-12 py-5 md:py-8 lg:py-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-8 mb-6">
          <div className="flex-1 max-w-[428px] flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-bold leading-6 text-[#2fd680]">
                HOTELHUB luôn bên bạn
              </h3>
              <br />
              <p className="text-sm leading-6">
                Mọi phản hồi của bạn đều được trân trọng — hãy liên hệ với chúng
                tôi qua hotline hoặc email.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Hotline */}
            <div className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-[45px] h-[45px] text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.05-.24 11.36 11.36 0 003.55.57 1 1 0 011 1v3.54a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.54a1 1 0 011 1 11.36 11.36 0 00.57 3.55 1 1 0 01-.24 1.05l-2.25 2.19z" />
              </svg>
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-[#2fd680]">
                  Hotline
                </span>
                <span className="text-xl font-bold leading-5">0396256658</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-[45px] h-[45px] text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v.01L12 13l8-6.99V6H4z" />
              </svg>
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-[#2fd680]">
                  Email
                </span>
                <span className="text-xl font-bold leading-5">
                  trongluffy22@gmail.com
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-[428px] flex flex-col gap-3">
            <h2 className="text-base font-bold leading-6 text-[#2fd680]">
              Theo dõi chúng tôi qua
            </h2>
            <div className="flex items-start gap-6">
              <Link
                to="https://www.facebook.com/?locale=vi_VN"
                target="_blank"
                className="hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.38538 25.0001C3.38538 13.0626 13.0625 3.3855 25 3.3855C36.9374 3.3855 46.6145 13.0626 46.6145 25.0001C46.6145 35.7893 38.7101 44.7305 28.3763 46.3521C28.1507 46.3875 27.9209 46.3224 27.7474 46.174C27.5738 46.0256 27.4739 45.8087 27.4739 45.5803V31.0222C27.4739 30.5907 27.8237 30.2409 28.2552 30.2409H32.4389L33.1229 25.7813H28.2552C27.8237 25.7813 27.4739 25.4315 27.4739 25.0001V21.0921C27.4739 20.1547 27.7022 19.1333 28.3913 18.3365C29.0987 17.5185 30.1866 17.0574 31.6503 17.0574H33.4961V13.384C33.2769 13.3536 33.0107 13.3189 32.7107 13.2843C31.8451 13.1843 30.7119 13.086 29.6138 13.086C27.3923 13.086 25.6417 13.7563 24.4474 14.9516C23.2539 16.1462 22.526 17.9554 22.526 20.4102V25.0001C22.526 25.4315 22.1762 25.7813 21.7448 25.7813H17.2363V30.2409H21.7448C22.1762 30.2409 22.526 30.5907 22.526 31.0222V45.5803C22.526 45.8087 22.4261 46.0256 22.2526 46.174C22.079 46.3224 21.8492 46.3875 21.6236 46.3521C11.2898 44.7305 3.38538 35.7893 3.38538 25.0001ZM34.4087 11.9415C34.7841 12.0056 35.0586 12.3309 35.0586 12.7116V17.8386C35.0586 18.2701 34.7088 18.6199 34.2773 18.6199H31.6503C30.5259 18.6199 29.9163 18.9617 29.5732 19.3585C29.2117 19.7765 29.0364 20.3818 29.0364 21.0921V24.2188H34.0332C34.261 24.2188 34.4776 24.3183 34.626 24.4912C34.7744 24.6641 34.8399 24.8933 34.8054 25.1185L33.8817 31.1406C33.8232 31.5219 33.4952 31.8034 33.1095 31.8034H29.0364V44.6456C38.176 42.7779 45.052 34.6914 45.052 25.0001C45.052 13.9256 36.0744 4.948 25 4.948C13.9255 4.948 4.94788 13.9256 4.94788 25.0001C4.94788 34.6914 11.8239 42.7779 20.9635 44.6456V31.8034H16.455C16.0236 31.8034 15.6738 31.4537 15.6738 31.0222V25.0001C15.6738 24.5686 16.0236 24.2188 16.455 24.2188H20.9635V20.4102C20.9635 17.6436 21.7907 15.4001 23.342 13.8473C24.8926 12.2953 27.0766 11.5235 29.6138 11.5235C30.7951 11.5235 31.9936 11.6286 32.8899 11.7321C33.3398 11.784 33.7172 11.836 33.9829 11.8751C34.1159 11.8947 34.2211 11.9111 34.2937 11.9227L34.3775 11.9363L34.3999 11.94L34.406 11.9411L34.4087 11.9415Z"
                    fill="currentColor"
                  />
                </svg>
              </Link>
              <Link
                to="https://www.instagram.com/"
                target="_blank"
                className="hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.37854 15.0931C6.47598 12.9639 6.80936 11.5907 7.26021 10.4251L7.26627 10.409C7.71305 9.22289 8.41294 8.14838 9.31723 7.26027L9.32992 7.24781L9.34237 7.23511C10.2312 6.32966 11.3061 5.63046 12.4912 5.18487L12.5116 5.17705C13.6746 4.72479 15.0451 4.39265 17.176 4.29523M6.37854 15.0931C6.2761 17.368 6.25 18.0731 6.25 23.9714C6.25 29.8712 6.27467 30.5747 6.37849 32.8501M6.37854 15.0931V15.6669M17.176 4.29523C19.4515 4.19142 20.1564 4.16675 26.0547 4.16675C31.953 4.16675 32.6576 4.19282 34.9325 4.29526M17.176 4.29523H17.7513M6.37849 32.8501C6.47591 34.9811 6.80805 36.3516 7.26031 37.5145L7.26813 37.535M6.37849 32.8501L6.41338 33.0338M6.37849 32.8501V32.2748M6.37854 15.6669C6.38651 15.4846 6.39508 15.2945 6.40427 15.0924C6.51103 12.7628 6.90706 11.4017 7.28453 10.4363C7.77307 9.17553 8.39193 8.22416 9.3374 7.2748C10.2361 6.35292 11.3285 5.64251 12.5357 5.19503C13.4968 4.82224 14.8543 4.4274 17.1751 4.32105C17.3779 4.31182 17.5685 4.30323 17.7513 4.29523M6.37854 15.6669C6.29422 17.5947 6.2761 18.6582 6.2761 23.9714C6.2761 29.2831 6.29424 30.348 6.37849 32.2748M6.37854 15.6669L6.37849 32.2748M7.26813 37.535C7.71372 38.72 8.41292 39.7949 9.31837 40.6838L9.33104 40.6962L9.34348 40.7089C10.2316 41.6132 11.3062 42.3131 12.4923 42.7599L12.51 42.7666C13.674 43.218 15.0452 43.5503 17.176 43.6477M7.26813 37.535L7.24141 37.3943M7.24141 37.3943L6.41338 33.0338M7.24141 37.3943C6.88974 36.4652 6.52761 35.1689 6.41338 33.0338M7.24141 37.3943C7.25375 37.4269 7.26607 37.459 7.27837 37.4907C7.72436 38.693 8.43101 39.7817 9.34754 40.6785C10.244 41.5948 11.3322 42.3013 12.5341 42.7473C13.4987 43.1231 14.8578 43.5157 17.1757 43.6219C19.5149 43.7283 20.2375 43.7501 26.0547 43.7501C31.8719 43.7501 32.5952 43.7283 34.9343 43.6219C37.2551 43.5155 38.6126 43.1207 39.5738 42.7479C40.7764 42.3021 41.8652 41.5953 42.7619 40.6784C43.6782 39.782 44.3847 38.6938 44.8306 37.492C45.2063 36.5274 45.5989 35.1683 45.7052 32.8504C45.8116 30.5113 45.8333 29.7872 45.8333 23.9714C45.8333 18.1557 45.8116 17.431 45.7051 15.0918C45.5982 12.7589 45.1998 11.3994 44.8253 10.4374C44.3357 9.17346 43.7148 8.21752 42.7604 7.26315C41.808 6.31256 40.8546 5.69131 39.5897 5.20121C38.6243 4.82376 37.2638 4.4278 34.9343 4.32105C34.7318 4.31183 34.5413 4.30324 34.3586 4.29525M6.41338 33.0338C6.41015 32.9736 6.40712 32.9127 6.4043 32.8511C6.39507 32.6483 6.38648 32.4577 6.37849 32.2748M34.3586 4.29525L34.9325 4.29526M34.3586 4.29525L17.7513 4.29523M34.3586 4.29525C32.4315 4.21099 31.3668 4.19285 26.0547 4.19285C20.7431 4.19285 19.6781 4.21098 17.7513 4.29523M34.9325 4.29526C37.062 4.39265 38.4354 4.72599 39.6011 5.17689L39.6172 5.18302C40.8033 5.62979 41.8778 6.32968 42.7659 7.23397L42.7782 7.24653L42.7908 7.25887C43.6952 8.14707 44.3951 9.22187 44.8414 10.4083L44.8491 10.4284C45.3014 11.5913 45.6335 12.9618 45.7309 15.0928M45.7309 32.8501C45.6335 34.9809 45.3014 36.3521 44.8499 37.5162L44.8432 37.5339C44.3964 38.72 43.6965 39.7945 42.7922 40.6826L42.7795 40.6951L42.7671 40.7078C41.8782 41.6132 40.8033 42.3124 39.6182 42.758L39.5978 42.7658C38.4348 43.2181 37.0643 43.5502 34.9334 43.6477M22.5323 32.4753C23.6491 32.9379 24.846 33.1759 26.0547 33.1759C28.4959 33.1759 30.8371 32.2062 32.5633 30.48C34.2895 28.7538 35.2592 26.4126 35.2592 23.9714C35.2592 21.5303 34.2895 19.1891 32.5633 17.4629C30.8371 15.7367 28.4959 14.7669 26.0547 14.7669C24.846 14.7669 23.6491 15.005 22.5323 15.4676C21.4156 15.9302 20.4009 16.6082 19.5462 17.4629C18.6914 18.3176 18.0135 19.3323 17.5509 20.449C17.0883 21.5658 16.8502 22.7627 16.8502 23.9714C16.8502 25.1802 17.0883 26.3771 17.5509 27.4939C18.0134 28.6106 18.6914 29.6253 19.5462 30.48C20.4009 31.3347 21.4156 32.0127 22.5323 32.4753ZM19.5257 17.4424C21.2573 15.7108 23.6058 14.7379 26.0547 14.7379C28.5036 14.7379 30.8522 15.7108 32.5838 17.4424C34.3154 19.174 35.2882 21.5226 35.2882 23.9714C35.2882 26.4203 34.3154 28.7689 32.5838 30.5005C30.8522 32.2321 28.5036 33.2049 26.0547 33.2049C23.6058 33.2049 21.2573 32.2321 19.5257 30.5005C17.794 28.7689 16.8212 26.4203 16.8212 23.9714C16.8212 21.5226 17.794 19.174 19.5257 17.4424ZM40.4875 12.5882C40.4875 13.2891 40.2091 13.9613 39.7135 14.4569C39.2179 14.9525 38.5457 15.231 37.8447 15.231C37.1438 15.231 36.4716 14.9525 35.976 14.4569C35.4804 13.9613 35.2019 13.2891 35.2019 12.5882C35.2019 11.8873 35.4804 11.215 35.976 10.7194C36.4716 10.2238 37.1438 9.94539 37.8447 9.94539C38.5457 9.94539 39.2179 10.2238 39.7135 10.7194C40.2091 11.215 40.4875 11.8873 40.4875 12.5882Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                to="https://www.tiktok.com/"
                target="_blank"
                className="hover:opacity-80 transition-opacity"
                aria-label="TikTok"
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M35.0453 10.6967C33.518 8.94579 32.5998 6.66268 32.5998 4.16675H30.686M35.0453 10.6967C36.4372 12.293 38.3217 13.454 40.4676 13.9086C41.1345 14.0537 41.8305 14.1312 42.5554 14.1312V21.2899C38.8437 21.2899 35.4026 20.1001 32.5995 18.0878V32.6474C32.5995 39.9224 26.6838 45.8334 19.4247 45.8334C15.6259 45.8334 12.1945 44.208 9.78763 41.6251C7.59346 39.2646 6.24988 36.1108 6.24988 32.6474C6.24988 25.4788 11.9915 19.6357 19.1057 19.4809M35.0453 10.6967C35.0081 10.6725 34.971 10.648 34.9341 10.6233M14.5531 36.1495C13.8379 35.1627 13.4126 33.9535 13.4126 32.6378C13.4126 29.3196 16.1094 26.6204 19.4249 26.6204C20.0435 26.6204 20.6427 26.7268 21.2034 26.901V19.5874C20.6233 19.5099 20.0338 19.4615 19.4249 19.4615C19.3185 19.4615 18.462 19.5185 18.3557 19.5185M30.6759 4.16675H25.4369L25.4272 32.8699C25.3113 36.0817 22.6627 38.6648 19.4247 38.6648C17.4141 38.6648 15.6452 37.6683 14.5433 36.1592"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#404041] mb-4"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-20 text-left w-full max-w-10xl mx-auto justify-between">
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-bold leading-6 text-[#2fd680]">
              HOTELHUB MORE
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/member-privilege"
                className="text-sm leading-5 hover:text-[#41de8d] transition-colors"
              >
                Đặc quyền hội viên
              </Link>
              <Link
                to="/more-policy"
                className="text-sm leading-5 hover:text-[#41de8d] transition-colors"
              >
                Chính sách & Điều khoản
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-base font-bold leading-6 text-[#2fd680]">
              CHÍNH SÁCH
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/privacy-policy"
                className="text-sm leading-5 hover:text-[#41de8d] transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                to="/check-in-policy"
                className="text-sm leading-5 hover:text-[#41de8d] transition-colors"
              >
                Chính sách giao và nhận phòng
              </Link>
              <Link
                to="/refund-policy"
                className="text-sm leading-5 hover:text-[#41de8d] transition-colors"
              >
                Chính sách đổi, trả phòng và hoàn tiền
              </Link>
              <Link
                to="/faq"
                className="text-sm leading-5 hover:text-[#41de8d] transition-colors"
              >
                Câu hỏi thường gặp
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-base font-bold leading-6 text-[#2fd680]">
              ĐỊA CHỈ
            </h4>
            <p className="text-sm leading-5">
              Giấy phép Dịch vụ Lưu Trú số 256/GCN, ngày cấp 05-07-2023, nơi cấp
              Công An Thành Phố Hồ Chí Minh
            </p>
            <a
              href="https://moit.gov.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="https://webmedia.com.vn/images/2021/09/logo-da-thong-bao-bo-cong-thuong-mau-xanh.png"
                alt="Bộ Công Thương"
                className="w-[120px] h-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
