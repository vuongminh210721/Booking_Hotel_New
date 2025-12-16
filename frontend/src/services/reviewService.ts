const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface ReviewUser {
  _id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Review {
  _id: string;
  hotelName: string;
  location: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
}

const buildHeaders = (contentType = "application/json"): HeadersInit => {
  const headers: Record<string, string> = { "Content-Type": contentType };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const reviewService = {
  async getMyReviews(): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/reviews/my`, {
      headers: buildHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Không thể tải đánh giá");
    }

    const data = await response.json();
    return data.data as Review[];
  },

  async createReview(payload: {
    hotelName: string;
    location: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: buildHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Không thể gửi đánh giá");
    }

    const data = await response.json();
    return data.data as Review;
  },

  async updateReview(
    id: string,
    payload: {
      hotelName?: string;
      location?: string;
      rating?: number;
      comment?: string;
    }
  ): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: "PATCH",
      headers: buildHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Không thể cập nhật đánh giá");
    }

    const data = await response.json();
    return data.data as Review;
  },

  async deleteReview(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: "DELETE",
      headers: buildHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Không thể xóa đánh giá");
    }
  },

  async getAllReviews(): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      headers: buildHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Không thể tải đánh giá");
    }

    const data = await response.json();
    return data.data as Review[];
  },
};
