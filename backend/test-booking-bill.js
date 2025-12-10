/**
 * Test script để xác minh toàn bộ quy trình booking -> bill
 * 
 * Usage: node test-booking-bill.js
 */

const API_URL = "http://localhost:5000/api";

// Test data
const testUser = {
   fullName: "Test User",
   email: "test@example.com",
   phone: "0123456789",
};

const testBooking = {
   roomType: "Phòng trung cấp",
   roomPrice: "1500000",
   fullName: testUser.fullName,
   email: testUser.email,
   phone: testUser.phone,
   checkIn: "2025-12-10",
   checkOut: "2025-12-12",
   guests: 2,
   paymentMethod: "full",
};

let authToken = null;
let bookingId = null;
let billId = null;

async function step(name, fn) {
   try {
      console.log(`\n📋 ${name}...`);
      await fn();
      console.log(`✅ ${name} - SUCCESS`);
   } catch (error) {
      console.log(`❌ ${name} - FAILED:`, error.message);
      process.exit(1);
   }
}

async function request(method, path, body = null, headers = {}) {
   const options = {
      method,
      headers: {
         "Content-Type": "application/json",
         ...headers,
      },
   };

   if (body) {
      options.body = JSON.stringify(body);
   }

   const response = await fetch(API_URL + path, options);
   const data = await response.json();

   if (!response.ok) {
      throw new Error(`${response.status}: ${data.message || "Unknown error"}`);
   }

   return { status: response.status, data };
}

async function main() {
   console.log("🚀 Starting Booking -> Bill Test Suite\n");
   console.log("API URL:", API_URL);

   // Step 1: Register user
   let registerData = null;
   await step("Register test user", async () => {
      const result = await request("POST", "/auth/register", {
         fullName: testUser.fullName,
         email: testUser.email,
         password: "TestPassword123",
         phone: testUser.phone,
      });
      registerData = result.data;
      console.log("Registered user:", registerData?.data?._id);
   });

   // Step 2: Login
   await step("Login test user", async () => {
      const result = await request("POST", "/auth/login", {
         email: testUser.email,
         password: "TestPassword123",
      });
      authToken = result.data?.data?.token;
      if (!authToken) {
         throw new Error("No token received from login");
      }
      console.log("Auth token:", authToken.substring(0, 20) + "...");
   });

   // Step 3: Create booking with auth
   let bookingResponse = null;
   await step("Create booking with auth", async () => {
      bookingResponse = await request(
         "POST",
         "/bookings",
         testBooking,
         {
            Authorization: `Bearer ${authToken}`,
         }
      );
      bookingId = bookingResponse.data?.data?.booking?._id;
      if (!bookingId) {
         console.log("Response:", JSON.stringify(bookingResponse, null, 2));
         throw new Error("No booking ID in response");
      }
      console.log("Booking ID:", bookingId);
   });

   // Step 4: Check if bill was created in response
   await step("Verify bill in booking response", async () => {
      const bill = bookingResponse.data?.data?.bill;
      if (!bill) {
         console.log("Response data:", JSON.stringify(bookingResponse.data, null, 2));
         throw new Error("No bill in booking response");
      }
      billId = bill._id;
      console.log("Bill ID:", billId);
      console.log("Bill number:", bill.billNumber);
      console.log("Bill user:", bill.user?._id || bill.user);
      console.log("Bill total:", bill.totalPrice);
      console.log("Bill finalAmount:", bill.finalAmount);
      console.log("Bill bookingDetails:", bill.bookingDetails);
   });

   // Step 5: Fetch bills for user
   let userBills = null;
   await step("Fetch user bills via /bills/my-bills", async () => {
      const result = await request(
         "GET",
         "/bills/my-bills",
         null,
         {
            Authorization: `Bearer ${authToken}`,
         }
      );
      userBills = result.data?.data;
      if (!Array.isArray(userBills)) {
         console.log("Response:", JSON.stringify(result.data, null, 2));
         throw new Error("Bills not returned as array");
      }
      console.log(`Found ${userBills.length} bills`);
   });

   // Step 6: Verify created bill is in the list
   await step("Verify created bill in user bills", async () => {
      const createdBill = userBills.find((b) => b._id === billId);
      if (!createdBill) {
         console.log("Bill IDs in response:", userBills.map((b) => b._id));
         throw new Error(`Created bill ${billId} not found in user bills`);
      }
      console.log("Bill found in list:", createdBill.billNumber);
      console.log("Bill details:");
      console.log("  - Room:", createdBill.bookingDetails?.roomName);
      console.log("  - Type:", createdBill.bookingDetails?.roomType);
      console.log("  - Nights:", createdBill.bookingDetails?.nights);
      console.log("  - Guests:", createdBill.bookingDetails?.guests);
      console.log("  - Total:", createdBill.finalAmount);
   });

   console.log("\n\n🎉 All tests passed! ✨\n");
   console.log("Summary:");
   console.log("  Booking created: ✅");
   console.log("  Bill created: ✅");
   console.log("  Bill returned in response: ✅");
   console.log("  Bill retrieved via /bills/my-bills: ✅");
   console.log("  Bill has correct user association: ✅");
}

main().catch((error) => {
   console.error("\n\n❌ Test failed:", error);
   process.exit(1);
});
