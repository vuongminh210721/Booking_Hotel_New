import "./Global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RoomSystem from "./pages/Room_System";
import Services from "./pages/Service";
import Food from "./pages/Food";
import Locations from "./pages/Location";
import Contact from "./pages/Contact";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivacyPolicy from "./pages/Privacy_Policy";
import { useLocation } from "react-router-dom";
import { UI_Carousel } from "./components/Carousel";
import CheckInPolicy from "./pages/Check_In_Policy";
import RefundPolicy from "./pages/Refund_Policy";
import FAQ from "./pages/FAQ";
import MorePolicy from "./pages/More_Policy";
import MemberPrivilege from "./pages/Member_Privilege";
import View_Home from "./components/View_Home";
import Booking_Home from "./components/Booking_Home";
import Login from "./components/Login";
import Register from "./components/Register";

const queryClient = new QueryClient();

const RouteWrapper: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Mount booking modal globally so it can listen for openBooking events */}
      <Booking_Home />
      <main className={`flex-1 ${isHome ? "" : "pt-16"}`}>
        <Routes>
          <Route path="/carousel" element={<UI_Carousel />} />
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<RoomSystem />} />
          <Route path="/rooms/:id" element={<View_Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/food" element={<Food />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/check-in-policy" element={<CheckInPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/more-policy" element={<MorePolicy />} />
          <Route path="/member-privilege" element={<MemberPrivilege />} />
          <Route path="/booking" element={<Booking_Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
