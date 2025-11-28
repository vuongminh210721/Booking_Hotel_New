import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Star, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserMenu: React.FC = () => {
   const { user, logout } = useAuth();

   // Log khi user thay đổi
   useEffect(() => {
      if (user) {
         console.log("🔄 UserMenu - User updated:", {
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            hasAvatar: !!user.avatarUrl,
         });
      }
   }, [user?.avatarUrl, user?.fullName]);

   if (!user) return null;

   const getInitials = (name: string) => {
      return name
         .split(" ")
         .map((n) => n[0])
         .join("")
         .toUpperCase()
         .slice(0, 2);
   };

   // Construct full avatar URL
   const avatarUrl = user.avatarUrl
      ? `http://localhost:5000${user.avatarUrl}`
      : undefined;

   // Debug logging - render được gọi
   console.log("👤 UserMenu Render:", {
      fullName: user.fullName,
      rawAvatarUrl: user.avatarUrl,
      fullAvatarUrl: avatarUrl,
      hasAvatar: !!avatarUrl,
   });

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
               <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage
                     src={avatarUrl}
                     alt={user.fullName}
                     onError={(e) => {
                        console.error("❌ Avatar image failed to load:", avatarUrl);
                        e.currentTarget.style.display = 'none';
                     }}
                     onLoad={() => {
                        console.log("✅ Avatar image loaded successfully:", avatarUrl);
                     }}
                  />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                     {getInitials(user.fullName)}
                  </AvatarFallback>
               </Avatar>
               <span className="hidden md:block font-medium text-sm">
                  {user.fullName}
               </span>
            </button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
               <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
               </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
               <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
               </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link to="/my-reviews" className="cursor-pointer">
                  <Star className="mr-2 h-4 w-4" />
                  <span>Đánh giá của tôi</span>
               </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
               onClick={logout}
               className="cursor-pointer text-red-600 focus:text-red-600"
            >
               <LogOut className="mr-2 h-4 w-4" />
               <span>Đăng xuất</span>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
};

export default UserMenu;
