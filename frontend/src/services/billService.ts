const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface Bill {
  _id: string;
  billNumber: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  roomInfo: {
    roomId?: string;
    roomName: string;
    // roomType: string;
    nightlyPrice: number;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomPrice: number;
  totalPrice: number;
  discount: number;
  tax: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: "paid" | "unpaid" | "partial";
  specialRequests?: string;
  status: "active" | "cancelled" | "refunded";
  issuedDate: string;
  createdAt: string;
  updatedAt: string;
}

export const billService = {
  async getMyBills(): Promise<Bill[]> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/bills/my-bills`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bills");
    }

    const data = await response.json();
    return data.data;
  },

  async getBillById(id: string): Promise<Bill> {
    const response = await fetch(`${API_BASE_URL}/bills/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch bill");
    }

    const data = await response.json();
    return data.data;
  },

  async getBillByBooking(bookingId: string): Promise<Bill> {
    const response = await fetch(`${API_BASE_URL}/bills/booking/${bookingId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch bill");
    }

    const data = await response.json();
    return data.data;
  },

  async createBill(bookingId: string): Promise<Bill> {
    const response = await fetch(`${API_BASE_URL}/bills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create bill");
    }

    const data = await response.json();
    return data.data;
  },

  // Tạo Bill trực tiếp (không cần Booking trước)
  async createBillDirect(billData: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  }): Promise<Bill> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/bills/create-direct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(billData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create bill");
    }

    const data = await response.json();
    return data.data;
  },

  // Chuyển Bill thành Booking sau khi thanh toán
  async convertBillToBooking(
    billId: string
  ): Promise<{ bill: Bill; booking: any }> {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/bills/${billId}/convert-to-booking`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to convert bill to booking");
    }

    const data = await response.json();
    return data.data;
  },
  async addExtra(
    billId: string,
    extra: {
      type: string;
      title: string;
      price: number;
      quantity?: number;
      image?: string;
    }
  ) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/bills/${billId}/extras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(extra),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Add extra failed:", response.status, errorText);
      throw new Error(
        `Failed to add extra: ${response.status} ${
          errorText || "unknown error"
        }`
      );
    }
    const data = await response.json();
    console.log("✅ Extra added to server successfully");
    return data.data;
  },

  async removeExtra(billId: string, extraId: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/bills/${billId}/extras/${extraId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Remove extra failed:", response.status, errorText);
      throw new Error(
        `Failed to remove extra: ${response.status} ${
          errorText || "unknown error"
        }`
      );
    }
    const data = await response.json();
    console.log("✅ Extra removed from server successfully");
    return data.data;
  },

  async updateExtra(
    billId: string,
    extraId: string,
    updateData: { quantity?: number }
  ) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/bills/${billId}/extras/${extraId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Update extra failed:", response.status, errorText);
      throw new Error(
        `Failed to update extra: ${response.status} ${
          errorText || "unknown error"
        }`
      );
    }
    const data = await response.json();
    console.log("✅ Extra updated on server successfully");
    return data.data;
  },
};
