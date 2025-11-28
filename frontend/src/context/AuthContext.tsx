import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/authService";

interface User {
   id: string;
   fullName: string;
   email: string;
   phone: string;
   avatarUrl?: string;
   address?: string;
   gender?: "Nam" | "Nữ" | "Khác";
   dateOfBirth?: string;
   hometown?: string;
   customerType: "thường" | "vip";
   bookedRooms: string[];
   role: string;
}

interface AuthContextType {
   user: User | null;
   isAuthenticated: boolean;
   login: (email: string, password: string) => Promise<void>;
   register: (data: {
      fullName: string;
      email: string;
      password: string;
      phone: string;
   }) => Promise<void>;
   logout: () => void;
   uploadAvatar: (file: File) => Promise<{ avatarUrl: string }>;
   updateProfile: (data: {
      fullName?: string;
      email?: string;
      phone?: string;
      address?: string;
      gender?: "Nam" | "Nữ" | "Khác";
      dateOfBirth?: string;
      hometown?: string;
      customerType?: "thường" | "vip";
   }) => Promise<void>;
   updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
   children,
}) => {
   const [user, setUser] = useState<User | null>(null);

   // Load user từ localStorage khi app khởi động
   useEffect(() => {
      const loadUser = async () => {
         if (authService.isAuthenticated()) {
            try {
               const savedUser = authService.getUser();
               if (savedUser) {
                  setUser(savedUser);
               }
            } catch (error) {
               console.error("Failed to load user:", error);
               authService.clearAuth();
            }
         }
      };
      loadUser();
   }, []);

   const login = async (email: string, password: string) => {
      const response = await authService.login(email, password);
      setUser(response.data.user);
   };

   const register = async (data: {
      fullName: string;
      email: string;
      password: string;
      phone: string;
   }) => {
      const response = await authService.register(data);
      setUser(response.data.user);
   };

   const logout = () => {
      authService.logout();
      setUser(null);
   };

   const uploadAvatar = async (file: File) => {
      const result = await authService.uploadAvatar(file);
      // Lấy user data mới nhất từ server sau khi upload
      try {
         const updatedUser = await authService.getProfile();
         console.log("✅ Profile refreshed after avatar upload:", updatedUser);
         setUser(updatedUser);
         return result;
      } catch (error) {
         console.error("Failed to refresh profile after avatar upload:", error);
         // Fallback: cập nhật local nếu API fail
         const currentUser = authService.getUser();
         if (currentUser) {
            const updatedUser = { ...currentUser, avatarUrl: result.avatarUrl };
            console.log("⚠️ Using fallback update:", updatedUser);
            setUser(updatedUser);
            const token = authService.getToken();
            if (token) {
               authService.saveAuth(token, updatedUser);
            }
         }
         return result;
      }
   };

   const updateProfile = async (data: {
      fullName?: string;
      email?: string;
      phone?: string;
      address?: string;
      gender?: "Nam" | "Nữ" | "Khác";
      dateOfBirth?: string;
      hometown?: string;
      customerType?: "thường" | "vip";
   }) => {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
   };

   const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
      const token = authService.getToken();
      if (token) {
         authService.saveAuth(token, updatedUser);
      }
   };

   return (
      <AuthContext.Provider
         value={{
            user,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            uploadAvatar,
            updateProfile,
            updateUser,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within AuthProvider");
   }
   return context;
};
