import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll to top of page when route changes
 */
export function useScrollToTop() {
   const { pathname } = useLocation();

   useEffect(() => {
      window.scrollTo(0, 0);
   }, [pathname]);
}
