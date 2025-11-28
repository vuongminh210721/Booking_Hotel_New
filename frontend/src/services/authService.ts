const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

// Local storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  // Lưu token và user vào localStorage
  saveAuth(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Lấy token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Lấy user
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Xóa auth data
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if logged in
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Register
  async register(data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const result: AuthResponse = await response.json();
    // Lưu token và user vào localStorage
    this.saveAuth(result.data.token, result.data.user);
    return result;
  },

  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const result: AuthResponse = await response.json();
    // Lưu token và user vào localStorage
    this.saveAuth(result.data.token, result.data.user);
    return result;
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    const result = await response.json();

    console.log("📤 Avatar upload response:", result);

    // Không cập nhật localStorage ở đây vì AuthContext sẽ gọi getProfile() sau
    // để lấy user mới nhất từ server

    return result.data;
  },

  // Get profile
  async getProfile(): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const result = await response.json();
    // Cập nhật user trong localStorage
    this.saveAuth(token!, result.data);
    return result.data;
  },

  // Update profile
  async updateProfile(data: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    gender?: "Nam" | "Nữ" | "Khác";
    dateOfBirth?: string;
    hometown?: string;
    customerType?: "thường" | "vip";
  }): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Update profile failed");
    }

    const result = await response.json();
    // Cập nhật user trong localStorage
    this.saveAuth(token!, result.data);
    return result.data;
  },

  // Logout
  logout() {
    this.clearAuth();
  },
};
