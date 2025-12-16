import { useState, useEffect, useCallback, useRef } from "react";
import { Receipt, X, ArrowLeft, Trash2, CheckCircle, Shield, RefreshCw, DollarSign, Headphones } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { billService } from "@/services/billService";
import qrPaymentImage from "@/assets/Screenshot 2025-12-10 235114.png";
import { rooms } from "@/data/room";
import { usePaymentVerification } from "@/hooks/use-payment-verification";

// QR Code image from assets
const QR_CODE_IMAGE = qrPaymentImage;

interface Bill {
   _id: string;
   billNumber: string;
   customerInfo: {
      fullName: string;
      email: string;
      phone: string;
   };
   roomInfo: {
      roomName: string;
      roomType: string;
      nightlyPrice: number;
   };
   checkIn: string;
   checkOut: string;
   nights: number;
   guests: number;
   totalPrice: number;
   tax: number;
   finalAmount: number;
   paymentMethod: string;
   paymentStatus: "paid" | "unpaid" | "partial";
   status: "active" | "cancelled" | "refunded";
   issuedDate: string;
   bookingDetails?: {
      roomName: string;
      roomType: string;
      nightlyPrice: number;
      nights: number;
      guests: number;
      checkIn: string;
      checkOut: string;
      specialRequests?: string;
   };
}

interface ExtraItem {
   id: string;
   type: 'service' | 'food';
   title: string;
   price: number;
   quantity: number;
   image?: string;
   billId?: string; // Which bill/room this extra applies to
}

const FloatingBills = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [bills, setBills] = useState<Bill[]>([]);
   const [loading, setLoading] = useState(false);
   const [hasNewBill, setHasNewBill] = useState(false);
   const [selectedGroup, setSelectedGroup] = useState<any>(null);
   const [activeTab, setActiveTab] = useState<'bills' | 'payment'>('bills');
   const [extras, setExtras] = useState<ExtraItem[]>([]);
   const [recentlyAdded, setRecentlyAdded] = useState<Record<string, boolean>>({});
   const [selectedBillForExtras, setSelectedBillForExtras] = useState<string>(''); // Bill ID cho dịch vụ/ẩm thực

   // Voucher states
   const [voucherCode, setVoucherCode] = useState<string>('');
   const [appliedVoucher, setAppliedVoucher] = useState<{
      voucherId: string;
      voucherCode: string;
      promotionTitle: string;
      discountAmount: number;
      discountDescription: string;
   } | null>(null);
   const [voucherError, setVoucherError] = useState<string>('');
   const [voucherLoading, setVoucherLoading] = useState(false);

   const { user } = useAuth();
   const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

   // Email verification integration
   // Use a safe access pattern so runtime errors can't occur if the hook returns unexpectedly
   const __paymentVerification = usePaymentVerification();
   const emailVerifying = __paymentVerification?.isChecking ?? false;
   const emailSuccess = __paymentVerification?.success ?? null;
   const emailMessage = __paymentVerification?.message ?? '';

   const startVerification = __paymentVerification?.startVerification ?? (async () => false);
   const resetEmailVerification = __paymentVerification?.reset ?? (() => { });

   // Dispatch event when payment succeeds
   useEffect(() => {
      if (emailSuccess === true) {
         console.log("🎉 Payment successful, dispatching paymentSuccess event");

         // Đánh dấu voucher đã sử dụng nếu có
         if (appliedVoucher?.voucherId) {
            const markVoucherUsed = async () => {
               try {
                  const token = localStorage.getItem('token');
                  if (token) {
                     await fetch(`${API_BASE_URL}/promotions/vouchers/use`, {
                        method: 'POST',
                        headers: {
                           'Authorization': `Bearer ${token}`,
                           'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ voucherId: appliedVoucher.voucherId }),
                     });
                     console.log("✅ Voucher marked as used:", appliedVoucher.voucherCode);
                  }
               } catch (err) {
                  console.error("❌ Failed to mark voucher as used:", err);
               }
            };
            markVoucherUsed();
         }

         window.dispatchEvent(new CustomEvent('paymentSuccess', {
            detail: {
               timestamp: Date.now(),
               message: emailMessage
            }
         }));
         // Tự động đóng modal sau 2 giây khi thanh toán thành công
         setTimeout(() => {
            setIsOpen(false);
            setActiveTab('bills');
            setSelectedGroup(null);
            setAppliedVoucher(null); // Reset voucher sau khi thanh toán
            resetEmailVerification();
         }, 2000);
      } else if (emailSuccess === false) {
         // Tự động đóng modal sau 3 giây khi thanh toán thất bại
         setTimeout(() => {
            setIsOpen(false);
            setActiveTab('bills');
            setSelectedGroup(null);
            resetEmailVerification();
         }, 3000);
      }
   }, [emailSuccess, emailMessage, appliedVoucher, API_BASE_URL]);

   const getExtrasKey = (u?: any) => {
      try { const id = u?._id || u?.id; return id ? `extras_cache_${id}` : null; } catch { return null; }
   };

   const getCachedExtras = (u?: any) => {
      const key = getExtrasKey(u);
      if (!key) return null; // Không có user thì không lấy cache
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
   };

   // Helper functions for queued_extras - per user
   const getQueuedExtrasKey = (u?: any) => {
      try { const id = u?._id || u?.id; return id ? `queued_extras_${id}` : null; } catch { return null; }
   };

   const getQueuedExtras = (): any[] => {
      const key = getQueuedExtrasKey(user);
      if (!key) return [];
      try {
         const raw = localStorage.getItem(key);
         return raw ? JSON.parse(raw) : [];
      } catch { return []; }
   };

   const setQueuedExtras = (items: any[]) => {
      const key = getQueuedExtrasKey(user);
      if (!key) return;
      try {
         if (items.length > 0) {
            localStorage.setItem(key, JSON.stringify(items));
         } else {
            localStorage.removeItem(key);
         }
      } catch (err) {
         console.warn('Could not save queued_extras:', err);
      }
   };

   const clearQueuedExtras = () => {
      const key = getQueuedExtrasKey(user);
      if (!key) return;
      try { localStorage.removeItem(key); } catch { }
   };

   const contentRef = useRef<HTMLDivElement>(null);

   // Hydrate from last cached bill and extras in case network fetch is slow/empty
   useEffect(() => {
      try {
         // Prefer the full cached bills list, then fall back to last_bill
         const deletedRaw = localStorage.getItem('deleted_bills');
         const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

         let loadedBills: any[] = [];

         const cachedBillsRaw = localStorage.getItem("bills_cache");
         if (cachedBillsRaw) {
            const cachedBills = JSON.parse(cachedBillsRaw) as any[];
            const filtered = cachedBills.filter(b => !deletedList.includes(b._id || b.billNumber));
            if (filtered && filtered.length > 0) {
               console.log("💾 Loaded cached bills_cache from localStorage (filtered deleted):", filtered.length, "bills");
               loadedBills = filtered;
            }
         }

         // Only use last_bill if bills_cache is empty
         if (loadedBills.length === 0) {
            const last = localStorage.getItem("last_bill");
            if (last) {
               const bill = JSON.parse(last);
               if (bill && bill.billNumber && !deletedList.includes(bill._id || bill.billNumber)) {
                  console.log("💾 Loaded cached last_bill from localStorage (fallback)");
                  loadedBills = [bill];
               }
            }
         }

         if (loadedBills.length > 0) {
            setBills(loadedBills);
         }

         // Load extras from localStorage (per-user key, with fallback)
         try {
            const cachedExtras = getCachedExtras(user) as ExtraItem[] | null;
            if (Array.isArray(cachedExtras) && cachedExtras.length > 0) {
               console.log("💾 Loaded cached extras from localStorage:", cachedExtras.length, "items");
               setExtras(cachedExtras);
            }
         } catch (err) {
            console.warn("⚠️ Could not load cached extras:", err);
         }
      } catch (err) {
         console.warn("⚠️ Could not load cached bill(s):", err);
      }
   }, []);

   // Save bills to localStorage whenever they change
   useEffect(() => {
      try {
         if (bills.length > 0) {
            localStorage.setItem("bills_cache", JSON.stringify(bills));
            console.log("💾 Saved", bills.length, "bills to localStorage");
         } else {
            localStorage.removeItem("bills_cache");
            console.log("🗑️ Cleared bills cache from localStorage");
         }
      } catch (err) {
         console.warn("⚠️ Could not save bills to localStorage:", err);
      }
   }, [bills]);

   // Save extras to localStorage whenever they change (per-user only)
   useEffect(() => {
      try {
         const key = getExtrasKey(user);
         if (!key) {
            console.log("⚠️ No user logged in, not saving extras to localStorage");
            return;
         }
         if (extras.length > 0) {
            localStorage.setItem(key, JSON.stringify(extras));
            console.log("💾 Saved", extras.length, "extras to localStorage", key);
         } else {
            localStorage.removeItem(key);
            console.log("🗑️ Cleared extras cache from localStorage", key);
         }
      } catch (err) {
         console.warn("⚠️ Could not save extras to localStorage:", err);
      }
   }, [extras, user]);
   // Define fetchBills first so it can be used in useEffect
   const fetchBills = useCallback(async () => {
      setLoading(true);
      try {
         const token = localStorage.getItem("token");
         console.log("🔑 Token found:", token ? "Yes" : "No");
         if (!token) {
            setBills([]);
            setLoading(false);
            console.warn("❌ No auth token found. Bills require login.");
            return;
         }

         const url = `${API_BASE_URL}/bills/my-bills?t=${Date.now()}`;
         console.log("🔄 Fetching bills from:", url, "with token:", token.substring(0, 20) + "...");
         const response = await fetch(url, {
            headers: {
               Authorization: token ? `Bearer ${token}` : undefined as any,
               "Cache-Control": "no-cache",
            },
         });

         console.log("📊 Response status:", response.status, response.statusText);

         if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Bills API returned non-OK:", response.status, response.statusText, errorText);
            // Load from cache if API fails
            try {
               const cached = localStorage.getItem("bills_cache");
               if (cached) {
                  const cachedBills = JSON.parse(cached);
                  console.log("💾 Loading from cache due to API failure:", cachedBills.length, "bills");
                  setBills(cachedBills);
               } else {
                  setBills([]);
               }
            } catch {
               setBills([]);
            }
            setLoading(false);
            return;
         }

         const data = await response.json();
         console.log("📡 Raw API response:", data);

         // Support multiple response shapes
         console.log("\n📋 ============= Parsing Bills Response =============");
         let billsData: any[] = [];
         if (Array.isArray(data)) {
            billsData = data;
            console.log("✅ Response is direct array, found", billsData.length, "bills");
         } else if (Array.isArray(data?.data)) {
            billsData = data.data;
            console.log("✅ Response.data is array, found", billsData.length, "bills");
         } else if (Array.isArray(data?.bills)) {
            billsData = data.bills;
            console.log("✅ Response.bills is array, found", billsData.length, "bills");
         } else if (Array.isArray(data?.result)) {
            billsData = data.result;
            console.log("✅ Response.result is array, found", billsData.length, "bills");
         } else if (data?.success && Array.isArray(data?.data)) {
            billsData = data.data;
            console.log("✅ Response is success wrapper with data array, found", billsData.length, "bills");
         } else {
            console.warn("⚠️ Could not parse bills array from response");
            console.warn("  Response keys:", Object.keys(data));
            console.warn("  Response structure:", JSON.stringify(data, null, 2));
            billsData = [];
         }

         console.log(`📋 Total bills to process: ${billsData.length}`);
         if (billsData.length > 0) {
            billsData.forEach((bill: any, idx: number) => {
               console.log(`  Bill ${idx + 1}:`, {
                  billId: bill._id,
                  billNumber: bill.billNumber,
                  roomName: getRoomCategoryLabel(bill),
                  finalAmount: bill.finalAmount || bill.totalPrice,
               });
            });
         }
         console.log("📋 =============================================\n");

         console.log("📋 Final parsed bills:", billsData.length, "bills");

         // Filter out any bills the user deleted locally so they don't reappear
         try {
            const deleted = localStorage.getItem('deleted_bills');
            const deletedList: string[] = deleted ? JSON.parse(deleted) : [];
            if (deletedList && deletedList.length > 0) {
               const before = billsData.length;
               billsData = billsData.filter((b: any) => !deletedList.includes(b._id) && !deletedList.includes(b.billNumber));
               console.log(`🔕 Filtered out ${before - billsData.length} deleted bill(s) from server results`);
            }
         } catch (err) {
            // ignore
         }

         // Extract extras from bills if they contain extras array
         let serverExtras: ExtraItem[] = [];
         billsData.forEach((bill: any) => {
            if (Array.isArray(bill.extras) && bill.extras.length > 0) {
               console.log(`📦 Bill ${bill.billNumber} has ${bill.extras.length} extras`);
               bill.extras.forEach((extra: any) => {
                  const extraItem: ExtraItem = {
                     id: (extra._id || extra.id) ? (extra._id || extra.id).toString() : `${bill._id}-${extra.title}`,
                     type: extra.type || 'service',
                     title: extra.title,
                     price: Number(extra.price || 0),
                     quantity: Number(extra.quantity || 1),
                     image: extra.image,
                     billId: bill._id, // MUST use _id (MongoDB ObjectId), not billNumber
                  };
                  serverExtras.push(extraItem);
                  console.log(`  ✅ Extracted extra: ${extra.title} (${extra.type})`);
               });
            }
         });

         console.log(`📦 Total extras from server: ${serverExtras.length}`);

         // Merge strategy: Server extras are source of truth
         setExtras(prevExtras => {
            if (serverExtras.length > 0) {
               // Server has extras - this is the authoritative source
               console.log("🔄 Server has", serverExtras.length, "extras - using as primary source");

               // Always use server extras as they're the single source of truth
               const merged = [...serverExtras];

               // Update localStorage cache with server data
               const extrasKey = getExtrasKey(user);
               if (extrasKey) {
                  try {
                     localStorage.setItem(extrasKey, JSON.stringify(merged));
                     console.log("💾 Updated localStorage cache with server extras");
                  } catch { }
               }

               return merged;
            } else {
               // No server extras - could be empty bill or race condition
               // Preserve current local extras since they might be pending save
               console.log("📦 Server returned no extras. Preserving", prevExtras.length, "local extras");
               return prevExtras;
            }
         });

         // Set bills from server (already filtered by deleted_bills)
         // This ensures server data is authoritative but respects local deletions
         console.log("✅ Setting", billsData.length, "bills from server (filtered deleted)");
         setBills(billsData);
      } catch (error) {
         console.error("❌ Error fetching bills:", error);
         // Load from cache if fetch fails
         try {
            const cached = localStorage.getItem("bills_cache");
            if (cached) {
               const cachedBills = JSON.parse(cached);
               console.log("💾 Loading from cache due to error:", cachedBills.length, "bills");
               setBills(cachedBills);
            } else {
               setBills([]);
            }
         } catch {
            setBills([]);
         }
      } finally {
         setLoading(false);
      }
   }, [API_BASE_URL]);

   // Fetch bills from server when component mounts (fetch fresh data after fetchBills is defined)
   useEffect(() => {
      const token = localStorage.getItem("token");
      if (token && user) {
         console.log("🔄 Component mounted with auth, fetching fresh bills from server...");
         // Give a brief delay to ensure state is initialized with cached data
         const timer = setTimeout(() => {
            // Fetch bills from server to get fresh data + extras
            // This will merge with any locally cached extras
            fetchBills();
         }, 500);
         return () => clearTimeout(timer);
      }
   }, [user, fetchBills]);

   useEffect(() => {
      if (isOpen && user) {
         fetchBills();
      }
   }, [isOpen, user, fetchBills]);

   // Sync extras when bills change (re-match billIds)
   // When bills reload from server, they have new _id values
   // But cached extras still have old billId values, so we need to re-match them
   useEffect(() => {
      if (bills.length === 0 || extras.length === 0) {
         return;
      }

      console.log("🔄 Syncing", extras.length, "extras with", bills.length, "bills...");

      // Build a map of bill IDs we have
      const billIdSet = new Set<string>();
      bills.forEach(b => {
         if (b._id) billIdSet.add(b._id);
         if (b.billNumber) billIdSet.add(b.billNumber);
      });

      let needsUpdate = false;

      // Check if any extras have billIds that don't match current bills
      const updatedExtras = extras.map(extra => {
         // If this extra's billId matches a current bill, keep it
         if (extra.billId && billIdSet.has(extra.billId)) {
            return extra;
         }

         // Otherwise, try to find a matching bill by billNumber
         // Look for a bill that might be the same physical bill with a new server _id
         for (const bill of bills) {
            // If this is the only bill or the first bill, assign to it
            if (bills.length === 1 || bills[0]._id === bill._id) {
               if (extra.billId !== bill._id) {
                  console.log(`🔁 Re-matching extra "${extra.title}" from ${extra.billId} to ${bill._id}`);
                  needsUpdate = true;
                  return { ...extra, billId: bill._id };
               }
               break;
            }
         }

         return extra;
      });

      if (needsUpdate) {
         console.log("💾 Updating extras with re-matched billIds");
         setExtras(updatedExtras);
      }
   }, [bills]);

   // Listen for bookingCreated to refresh bills and show green dot
   useEffect(() => {
      const handler = (e: any) => {
         setHasNewBill(true);
         console.log("📦 bookingCreated event received, detail:", e?.detail);

         // If the event includes a bill object (various shapes), extract it and insert immediately
         try {
            let detail = e?.detail;
            if (!detail) detail = {};

            console.log("Step 1 - Initial detail:", detail);

            // Unwrap common wrappers
            if (detail.data) detail = detail.data;
            console.log("Step 2 - After unwrap data:", detail);

            // At this point detail might be: { bill } or { booking, bill } or the bill object itself
            let candidate: any = null;
            if (detail.bill) {
               candidate = detail.bill;
               console.log("Step 3a - Found bill at detail.bill:", candidate);
            } else if (detail?.booking && detail?.booking._id && detail?.user === undefined && detail?.roomInfo === undefined && detail?.finalAmount === undefined) {
               candidate = detail;
               console.log("Step 3b - Found booking structure:", candidate);
            } else {
               candidate = detail;
               console.log("Step 3c - Using detail as candidate:", candidate);
            }

            // If candidate still contains nested shapes, try deeper unwrapping
            if (candidate && candidate.data) candidate = candidate.data;
            if (candidate && candidate.bill) candidate = candidate.bill;

            console.log("Step 4 - Final candidate:", candidate);

            // Now candidate should be a bill-like object
            // Check for bill characteristics: billNumber, roomInfo, customerInfo, or finalAmount
            let isBillLike = candidate && (
               candidate._id ||
               candidate.billNumber ||
               candidate.finalAmount ||
               (candidate.roomInfo && candidate.customerInfo) ||
               (candidate.bookingDetails && candidate.tax)
            );

            console.log("Step 5 - Is bill-like:", isBillLike);

            // If the candidate is actually a booking-like object (from Booking_Home fallback),
            // construct a bill-like object so the modal can immediately display room info.
            if (!isBillLike && candidate && (candidate.booking || candidate.bookingDetails || candidate.roomName || candidate.roomInfo)) {
               try {
                  console.log("ℹ️ Candidate looks like a booking — constructing bill object for immediate display");
                  const booking = candidate.booking || candidate;

                  const generatedId = booking._id ? `temp-${booking._id}` : `temp-${Date.now()}`;
                  const nightly = Number(booking.nightlyPrice || booking.nightlyPriceFormatted || booking.roomPrice || booking.totalPrice || 0) || 0;
                  const nights = Number(booking.nights || booking.duration || 1) || 1;
                  const totalPrice = Number(booking.totalPrice || (nightly * nights)) || 0;
                  const tax = Math.round(totalPrice * 0.08);
                  const finalAmount = totalPrice + tax;

                  const built: any = {
                     _id: generatedId,
                     billNumber: booking.billNumber || `HD-${String(booking._id || generatedId).slice(-6)}`,
                     customerInfo: {
                        fullName: booking.fullName || booking.customerName || (user?.fullName ?? "Khách hàng"),
                        email: booking.email || user?.email || "",
                        phone: booking.phone || user?.phone || "",
                     },
                     roomInfo: {
                        roomName: booking.roomName || booking.room?.name || (booking.roomInfo && booking.roomInfo.roomName) || booking.roomType || "Phòng tiêu chuẩn",
                        roomType: booking.roomType || booking.room?.type || (booking.roomInfo && booking.roomInfo.roomType) || "Standard",
                        nightlyPrice: nightly,
                     },
                     bookingDetails: {
                        roomName: booking.roomName || booking.room?.name || booking.roomType,
                        roomType: booking.roomType || booking.room?.type,
                        nightlyPrice: nightly,
                        nights: nights,
                        guests: booking.guests || booking.adults || 1,
                        checkIn: booking.checkIn || booking.startDate || new Date().toISOString(),
                        checkOut: booking.checkOut || booking.endDate || new Date().toISOString(),
                        specialRequests: booking.specialRequests || booking.note || "",
                     },
                     checkIn: booking.checkIn || booking.startDate,
                     checkOut: booking.checkOut || booking.endDate,
                     nights,
                     guests: booking.guests || booking.adults || 1,
                     totalPrice,
                     tax,
                     discount: booking.discount || 0,
                     finalAmount,
                     paymentMethod: booking.paymentMethod || "deposit",
                     paymentStatus: booking.paymentMethod === "deposit" ? "unpaid" : "paid",
                     status: "active",
                     issuedDate: new Date().toISOString(),
                  };

                  candidate = built;
                  isBillLike = true;
                  console.log("✅ Built bill candidate:", built);
               } catch (err) {
                  console.warn("⚠️ Failed to build bill from booking candidate:", err);
               }
            }

            if (isBillLike) {
               const idKey = candidate._id || candidate.billNumber;
               // Do not re-insert bills the user deleted locally
               try {
                  const rawDeleted = localStorage.getItem('deleted_bills');
                  const deletedList: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
                  if (deletedList.includes(idKey)) {
                     console.log('🔕 Candidate bill was deleted locally, skipping insert:', idKey);
                  } else {
                     console.log("✅ Inserting bill into state:", candidate);
                     setBills((prev) => {
                        const exists = prev.some(b =>
                           (b._id && candidate._id && b._id === candidate._id) ||
                           (b.billNumber && candidate.billNumber && b.billNumber === candidate.billNumber)
                        );
                        if (exists) {
                           console.log("⚠️ Bill already exists, skipping");
                           return prev;
                        }
                        console.log("➕ Adding new bill to state");
                        return [candidate as any, ...prev];
                     });
                  }
               } catch (err) {
                  console.warn('⚠️ Could not check deleted_bills, inserting by default');
                  setBills((prev) => {
                     const exists = prev.some(b =>
                        (b._id && candidate._id && b._id === candidate._id) ||
                        (b.billNumber && candidate.billNumber && b.billNumber === candidate.billNumber)
                     );
                     if (exists) return prev;
                     return [candidate as any, ...prev];
                  });
               }
            } else {
               console.warn("❌ Candidate does not look like a bill:", candidate);
            }
         } catch (err) {
            console.warn('Could not insert returned bill from event:', err);
         }

         // Refresh bills list in background to ensure server state is authoritative
         console.log("🔄 Fetching bills in background...");
         fetchBills();
      };
      window.addEventListener("bookingCreated", handler);
      return () => window.removeEventListener("bookingCreated", handler);
   }, [fetchBills]);

   // Listen for explicit request to open bills modal (e.g., after booking)
   useEffect(() => {
      const openHandler = (e: any) => {
         console.log("📢 openBills event received, detail:", e?.detail);
         setHasNewBill(true);
         setIsOpen(true);
         // If the open event includes booking/bill detail, try to insert it immediately
         try {
            const detail = e?.detail || {};
            if (detail) {
               console.log("📢 openBills detail present, attempting to insert into state:", detail);

               // Attempt to reuse same candidate/build logic as bookingCreated
               let candidate: any = null;
               if (detail.bill) candidate = detail.bill;
               else candidate = detail.raw || detail;

               if (candidate && candidate.data) candidate = candidate.data;
               if (candidate && candidate.bill) candidate = candidate.bill;

               // If candidate looks like booking, build a bill-like object
               const isBillLike = candidate && (
                  candidate._id || candidate.billNumber || candidate.finalAmount || (candidate.roomInfo && candidate.customerInfo) || (candidate.bookingDetails && candidate.tax)
               );

               if (!isBillLike && candidate && (candidate.booking || candidate.bookingDetails || candidate.roomName || candidate.roomInfo)) {
                  try {
                     const booking = candidate.booking || candidate;
                     const generatedId = booking._id ? `temp-${booking._id}` : `temp-${Date.now()}`;
                     const nightly = Number(booking.nightlyPrice || booking.roomPrice || booking.totalPrice || 0) || 0;
                     const nights = Number(booking.nights || 1) || 1;
                     const totalPrice = Number(booking.totalPrice || (nightly * nights)) || 0;
                     const tax = Math.round(totalPrice * 0.08);
                     const finalAmount = totalPrice + tax;
                     const built: any = {
                        _id: generatedId,
                        billNumber: booking.billNumber || `HD-${String(booking._id || generatedId).slice(-6)}`,
                        customerInfo: {
                           fullName: booking.fullName || (user?.fullName ?? "Khách hàng"),
                           email: booking.email || user?.email || "",
                           phone: booking.phone || user?.phone || "",
                        },
                        roomInfo: {
                           roomName: booking.roomName || booking.room?.name || booking.roomType || "Phòng tiêu chuẩn",
                           roomType: booking.roomType || booking.room?.type || "Standard",
                           nightlyPrice: nightly,
                        },
                        bookingDetails: {
                           roomName: booking.roomName || booking.room?.name || booking.roomType,
                           roomType: booking.roomType || booking.room?.type,
                           nightlyPrice: nightly,
                           nights,
                           guests: booking.guests || 1,
                           checkIn: booking.checkIn || booking.startDate || new Date().toISOString(),
                           checkOut: booking.checkOut || booking.endDate || new Date().toISOString(),
                           specialRequests: booking.specialRequests || "",
                        },
                        checkIn: booking.checkIn || booking.startDate,
                        checkOut: booking.checkOut || booking.endDate,
                        nights,
                        guests: booking.guests || 1,
                        totalPrice,
                        tax,
                        discount: booking.discount || 0,
                        finalAmount,
                        paymentMethod: booking.paymentMethod || "deposit",
                        paymentStatus: booking.paymentMethod === "deposit" ? "unpaid" : "paid",
                        status: "active",
                        issuedDate: new Date().toISOString(),
                     };

                     console.log("📢 openBills inserting built bill:", built);
                     try {
                        const idKey = built._id || built.billNumber;
                        const rawDeleted = localStorage.getItem('deleted_bills');
                        const deletedList: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
                        if (deletedList.includes(idKey)) {
                           console.log('🔕 openBills: built bill was deleted locally, skipping insert:', idKey);
                        } else {
                           setBills((prev) => {
                              const exists = prev.some(b =>
                                 (b._id && built._id && b._id === built._id) ||
                                 (b.billNumber && built.billNumber && b.billNumber === built.billNumber)
                              );
                              if (exists) return prev;
                              return [built as any, ...prev];
                           });
                        }
                     } catch (err) {
                        console.warn('⚠️ openBills failed checking deleted_bills, inserting by default');
                        setBills((prev) => [built as any, ...prev]);
                     }
                  } catch (err) {
                     console.warn("⚠️ openBills failed to build bill from detail:", err);
                  }
               }
            }
         } catch (err) {
            console.warn("⚠️ Error processing openBills detail:", err);
         }
         // Fetch bills after modal opens to ensure state is updated
         setTimeout(() => {
            console.log("🔄 Fetching bills after modal opens...");
            fetchBills();
         }, 100);
      };
      window.addEventListener("openBills", openHandler);
      return () => window.removeEventListener("openBills", openHandler);
   }, [fetchBills]);

   // Monitor bills state - when all bills deleted, clear extras
   useEffect(() => {
      if (bills.length === 0 && extras.length > 0) {
         console.log('🗑️ All bills deleted, clearing extras and selectedGroup');
         setExtras([]);
         setSelectedGroup(null);
      }
   }, [bills]);

   // Listen for service/food selection from Service and Food pages
   useEffect(() => {
      const handleServiceSelect = async (e: any) => {
         console.log("🎯 Service selected:", e?.detail);
         const service = e?.detail;
         if (!bills.length) {
            alert("Vui lòng chọn/đặt phòng trước khi thêm dịch vụ.");
            return;
         }
         if (service && service.title && service.price) {
            const priceValue = parseInt(service.price.replace(/[^\d]/g, '')) || 0;
            // Resolve target bill(s): prefer explicit selection from Service page (selectedRooms), otherwise fall back to one target
            const resolveTargetBillId = (): string => {
               if (selectedBillForExtras && !selectedBillForExtras.startsWith('BILL-')) return selectedBillForExtras;
               if (selectedGroup && Array.isArray(selectedGroup.bills) && selectedGroup.bills.length > 0) {
                  const first = selectedGroup.bills[0];
                  if (first._id) return first._id;
               }
               const firstGlobal = bills[0];
               return firstGlobal?._id || '';
            };

            const selectedRooms: string[] = Array.isArray(service.selectedRooms) && service.selectedRooms.length > 0 ? service.selectedRooms : [resolveTargetBillId()];
            // Map incoming selected room identifiers to canonical bill _id when possible
            const targetIds = selectedRooms
               .map(s => {
                  // Prefer matching by _id, then billNumber, then roomId
                  const matched = bills.find(b => (b._id && b._id === s) || (b.billNumber && b.billNumber === s) || (b.roomInfo && (b.roomInfo as any).roomId === s));
                  if (matched) return (matched._id || matched.billNumber);
                  return s;
               })
               .filter(Boolean);

            if (targetIds.length === 0) {
               alert("Không tìm thấy hóa đơn để thêm dịch vụ. Vui lòng đặt phòng trước.");
               return;
            }

            // Debug: warn if selectedRooms included ids that mapped to multiple bills or unmapped ids
            try {
               const unmapped = selectedRooms.filter((s, i) => targetIds[i] !== s);
               if (unmapped.length > 0) console.log('⚠️ Service selectedRooms mapped to bill ids:', { selectedRooms, targetIds, unmapped });
            } catch (err) { /* ignore */ }

            // If user is authenticated, persist each selected room to server and apply returned server extras for each bill
            const token = localStorage.getItem("token");
            if (token) {
               try {
                  for (const targetBillId of targetIds) {
                     if (!targetBillId) continue;

                     // find existing for this bill
                     const existingForBill = extras.find(item => item.title === service.title && item.type === 'service' && item.billId === targetBillId);

                     let serverBill: any = null;
                     if (existingForBill) {
                        serverBill = await billService.updateExtra(targetBillId, existingForBill.id, { quantity: existingForBill.quantity + 1 });
                        console.log('✅ Updated service quantity on server (multi-room):', targetBillId, serverBill);
                     } else {
                        serverBill = await billService.addExtra(targetBillId, {
                           type: 'service',
                           title: service.title,
                           price: priceValue,
                           quantity: 1,
                           image: service.img,
                        });
                        console.log('✅ Added new service to database (multi-room):', targetBillId, serverBill);
                     }

                     try {
                        if (serverBill && serverBill._id) {
                           const serverExtrasForBill: ExtraItem[] = (serverBill.extras || []).map((extra: any) => ({
                              id: (extra._id || extra.id) ? (extra._id || extra.id).toString() : `${serverBill._id}-${extra.title}`,
                              type: extra.type || 'service',
                              title: extra.title,
                              price: Number(extra.price || 0),
                              quantity: Number(extra.quantity || 1),
                              image: extra.image,
                              billId: serverBill._id,
                           }));

                           setExtras(prev => {
                              const others = prev.filter(e => e.billId !== serverBill._id);
                              const merged = [...others, ...serverExtrasForBill];
                              const extrasKey = getExtrasKey(user);
                              if (extrasKey) {
                                 try { localStorage.setItem(extrasKey, JSON.stringify(merged)); } catch { }
                              }
                              return merged;
                           });
                        }
                     } catch (err) {
                        console.warn('Could not apply server extras to state for bill', targetBillId, err);
                     }
                  }

                  // After processing all, sync full list once
                  fetchBills();
                  setIsOpen(true);
                  setActiveTab('bills');
                  setHasNewBill(true);
                  return;
               } catch (err) {
                  console.error('❌ Error adding services to selected rooms:', err);
                  alert('Lỗi: Không thể lưu dịch vụ lên server. ' + (err instanceof Error ? err.message : String(err)));
                  return;
               }
            }

            // Fallback: local-only add for each selected bill (multi-target)
            setExtras(prev => {
               const next = [...prev];
               for (const bid of targetIds) {
                  try {
                     const existing = next.find(item => item.title === service.title && item.type === 'service' && item.billId === bid);
                     if (existing) {
                        existing.quantity = existing.quantity + 1;
                     } else {
                        next.push({
                           id: `service-${Date.now()}-${Math.random()}`,
                           type: 'service',
                           title: service.title,
                           price: priceValue,
                           quantity: 1,
                           image: service.img,
                           billId: bid,
                        } as ExtraItem);
                     }
                  } catch (err) {
                     // ignore per-item parse errors
                  }
               }
               return next;
            });

            try {
               setRecentlyAdded(prev => ({ ...prev, [service.title]: true }));
               setTimeout(() => setRecentlyAdded(prev => { const next = { ...prev }; delete next[service.title]; return next; }), 1800);
            } catch (err) {
               // ignore
            }

            setIsOpen(true);
            setActiveTab('bills');  // Stay on bills tab
            setHasNewBill(true);
         }
      };

      const handleFoodSelect = async (e: any) => {
         console.log("🍽️ Food selected:", e?.detail);
         const food = e?.detail;
         if (!bills.length) {
            alert("Vui lòng chọn/đặt phòng trước khi thêm ẩm thực.");
            return;
         }
         if (food && food.title && food.price) {
            const priceValue = parseInt(food.price.replace(/[^\d]/g, '')) || 0;
            // Resolve target billId: MUST use _id (MongoDB ObjectId), not billNumber
            const resolveTargetBillId = (): string => {
               // Priority: selectedBillForExtras (if it's a valid _id, not billNumber)
               if (selectedBillForExtras && !selectedBillForExtras.startsWith('BILL-')) {
                  return selectedBillForExtras;
               }
               // Then check selectedGroup
               if (selectedGroup && Array.isArray(selectedGroup.bills) && selectedGroup.bills.length > 0) {
                  const first = selectedGroup.bills[0];
                  if (first._id) return first._id;
               }
               // Finally, use first global bill's _id
               const firstGlobal = bills[0];
               return firstGlobal?._id || '';
            };
            // Support multi-room add: prefer explicit selection from Food page (selectedRooms), otherwise fall back to one target
            const selectedRooms: string[] = Array.isArray(food.selectedRooms) && food.selectedRooms.length > 0 ? food.selectedRooms : [resolveTargetBillId()];
            const targetIds = selectedRooms
               .map(s => {
                  const matched = bills.find(b => (b._id && b._id === s) || (b.billNumber && b.billNumber === s) || (b.roomInfo && (b.roomInfo as any).roomId === s));
                  if (matched) return (matched._id || matched.billNumber);
                  return s;
               })
               .filter(Boolean);

            if (targetIds.length === 0) {
               alert("Không tìm thấy hóa đơn để thêm ẩm thực. Vui lòng đặt phòng trước.");
               return;
            }

            // If user is authenticated, persist each selected room to server and apply returned server extras for each bill
            const token = localStorage.getItem("token");
            if (token) {
               try {
                  for (const targetBillId of targetIds) {
                     if (!targetBillId) continue;

                     const existingForBill = extras.find(item => item.title === food.title && item.type === 'food' && item.billId === targetBillId);

                     let serverBill: any = null;
                     if (existingForBill) {
                        serverBill = await billService.updateExtra(targetBillId, existingForBill.id, { quantity: existingForBill.quantity + 1 });
                        console.log('✅ Updated food quantity on server (multi-room):', targetBillId, serverBill);
                     } else {
                        serverBill = await billService.addExtra(targetBillId, {
                           type: 'food',
                           title: food.title,
                           price: priceValue,
                           quantity: 1,
                           image: food.images?.[0] || food.img,
                        });
                        console.log('✅ Added new food to database (multi-room):', targetBillId, serverBill);
                     }

                     try {
                        if (serverBill && serverBill._id) {
                           const serverExtrasForBill: ExtraItem[] = (serverBill.extras || []).map((extra: any) => ({
                              id: (extra._id || extra.id) ? (extra._id || extra.id).toString() : `${serverBill._id}-${extra.title}`,
                              type: extra.type || 'food',
                              title: extra.title,
                              price: Number(extra.price || 0),
                              quantity: Number(extra.quantity || 1),
                              image: extra.image,
                              billId: serverBill._id,
                           }));

                           setExtras(prev => {
                              const others = prev.filter(e => e.billId !== serverBill._id);
                              const merged = [...others, ...serverExtrasForBill];
                              const extrasKey = getExtrasKey(user);
                              if (extrasKey) {
                                 try { localStorage.setItem(extrasKey, JSON.stringify(merged)); } catch { }
                              }
                              return merged;
                           });
                        }
                     } catch (err) {
                        console.warn('Could not apply server extras to state for bill', targetBillId, err);
                     }
                  }

                  // After processing all, sync full list once
                  fetchBills();
                  setIsOpen(true);
                  setActiveTab('bills');
                  setHasNewBill(true);
                  return;
               } catch (err) {
                  console.error('❌ Error adding foods to selected rooms:', err);
                  alert('Lỗi: Không thể lưu ẩm thực lên server. ' + (err instanceof Error ? err.message : String(err)));
                  return;
               }
            }

            // Fallback: local-only add for each selected bill (multi-target)
            setExtras(prev => {
               const next = [...prev];
               for (const bid of targetIds) {
                  try {
                     const existing = next.find(item => item.title === food.title && item.type === 'food' && item.billId === bid);
                     if (existing) {
                        existing.quantity = existing.quantity + 1;
                     } else {
                        next.push({
                           id: `food-${Date.now()}-${Math.random()}`,
                           type: 'food',
                           title: food.title,
                           price: priceValue,
                           quantity: 1,
                           image: food.images?.[0] || food.img,
                           billId: bid,
                        } as ExtraItem);
                     }
                  } catch (err) {
                     // ignore per-item parse errors
                  }
               }
               return next;
            });

            setIsOpen(true);
            setActiveTab('bills');
            setHasNewBill(true);
         }
      };

      window.addEventListener("selectService", handleServiceSelect);
      window.addEventListener("selectFood", handleFoodSelect);

      return () => {
         window.removeEventListener("selectService", handleServiceSelect);
         window.removeEventListener("selectFood", handleFoodSelect);
      };
   }, [bills, selectedBillForExtras]);

   // On mount, consume any queued extras saved by other pages (e.g., Food page)
   useEffect(() => {
      try {
         const queued = getQueuedExtras();
         if (!Array.isArray(queued) || queued.length === 0) return;

         // Add each queued item as a service (mirror handleServiceSelect behaviour)
         setExtras(prev => {
            const next = [...prev];
            queued.forEach(q => {
               try {
                  const priceValue = parseInt((q.price || '').toString().replace(/[^\d]/g, '')) || 0;
                  // Resolve target bill similarly to event handlers
                  const resolveTargetBillId = (): string => {
                     if (selectedBillForExtras) return selectedBillForExtras;
                     if (selectedGroup && Array.isArray(selectedGroup.bills) && selectedGroup.bills.length > 0) {
                        const first = selectedGroup.bills[0];
                        return (first._id || first.billNumber || '');
                     }
                     const firstGlobal = bills[0];
                     return (firstGlobal?._id || firstGlobal?.billNumber || '');
                  };
                  const targetBillId = resolveTargetBillId();

                  const existing = next.find(item => item.title === q.title && item.type === 'service' && item.billId === targetBillId);
                  if (existing) {
                     existing.quantity = existing.quantity + 1;
                  } else {
                     next.push({
                        id: `queued-${Date.now()}-${Math.random()}`,
                        type: 'service',
                        title: q.title,
                        price: priceValue,
                        quantity: 1,
                        image: q.img,
                        billId: targetBillId
                     } as ExtraItem);
                  }
               } catch (err) {
                  // ignore parse errors per item
               }
            });
            return next;
         });

         // Clear the queue after consuming
         clearQueuedExtras();

         // Open modal and switch to bills tab to show the added extras
         setIsOpen(true);
         setActiveTab('bills');
         setHasNewBill(true);
      } catch (err) {
         // ignore
      }
   }, [user]);

   // When a payment succeeds from other flows (e.g., email verification), save the most recent paid bill
   // as `last_bill` (cleared extras) and remove it from the current bills list so it can be restored on next login.
   useEffect(() => {
      const handler = (_ev: any) => {
         try {
            console.log('📌 paymentSuccess event received - saving cleared snapshot of recent bill');

            // Determine candidate ids: prefer selectedGroup, else the first bill
            let idsToSave: string[] = [];
            if (selectedGroup && Array.isArray(selectedGroup.bills) && selectedGroup.bills.length > 0) {
               idsToSave = selectedGroup.bills.map((b: any) => b._id || b.billNumber).filter(Boolean);
            } else if (bills.length > 0) {
               idsToSave = [(bills[0]._id || bills[0].billNumber)];
            }

            if (idsToSave.length === 0) return;

            const idsSet = new Set(idsToSave);
            const candidates = bills.filter(b => idsSet.has(b._id) || idsSet.has(b.billNumber));
            const candidate = candidates[candidates.length - 1] || bills.find(b => idsSet.has(b._id) || idsSet.has(b.billNumber)) || bills[0];

            if (candidate) {
               const saved = { ...candidate, extras: [], savedAt: Date.now() };
               try { const uid = user ? ((user as any)._id || (user as any).id) : null; const lastBillKey = uid ? `last_bill_${uid}` : 'last_bill'; localStorage.setItem(lastBillKey, JSON.stringify(saved)); } catch (err) { console.warn('Could not write last_bill to localStorage', err); }
               console.log('💾 Saved last paid bill to localStorage (event):', saved._id || saved.billNumber);
            }

            // Remove these bills locally (same semantics as polling path)
            setBills(prev => prev.filter(b => !idsSet.has(b._id) && !idsSet.has(b.billNumber)));

            // Mark deleted
            try {
               const rawDeleted = localStorage.getItem('deleted_bills');
               const deletedList: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
               const newDeletedList = [...deletedList, ...idsToSave];
               localStorage.setItem('deleted_bills', JSON.stringify(newDeletedList));
            } catch (err) { /* ignore */ }

            // Clear queued_extras and local extras
            try { clearQueuedExtras(); } catch (err) { /* ignore */ }
            setExtras([]);

         } catch (err) {
            console.warn('Error processing paymentSuccess event:', err);
         }
      };

      window.addEventListener('paymentSuccess', handler);
      return () => window.removeEventListener('paymentSuccess', handler);
   }, [bills, selectedGroup]);


   // Restore the most recent saved bill when the user logs in
   useEffect(() => {
      if (!user) return;
      try {
         const uid = (user as any) ? ((user as any)._id || (user as any).id) : null;
         const lastKey = uid ? `last_bill_${uid}` : 'last_bill';
         const lastRaw = localStorage.getItem(lastKey);
         if (!lastRaw) return;
         const last = JSON.parse(lastRaw);
         if (!last) return;
         const id = last._id || last.billNumber;
         if (!id) return;

         const rawDeleted = localStorage.getItem('deleted_bills');
         const deletedList: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
         if (deletedList.includes(id)) return; // don't restore if explicitly deleted

         const exists = bills.some(b => (b._id || b.billNumber) === id);
         if (!exists) {
            setBills(prev => [last, ...prev]);
            console.log('↩️ Restored last saved bill into bills after login:', id);
         }
      } catch (err) {
         console.warn('Could not restore last_bill on login', err);
      }
   }, [user]);

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("vi-VN", {
         day: "2-digit",
         month: "2-digit",
         year: "numeric",
      });
   };

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
      }).format(amount);
   };

   // Hàm áp dụng voucher
   const handleApplyVoucher = async (totalAmount: number) => {
      if (!voucherCode.trim()) {
         setVoucherError('Vui lòng nhập mã voucher');
         return;
      }

      setVoucherLoading(true);
      setVoucherError('');

      try {
         const token = localStorage.getItem('token');
         if (!token) {
            setVoucherError('Vui lòng đăng nhập để sử dụng voucher');
            setVoucherLoading(false);
            return;
         }

         const response = await fetch(`${API_BASE_URL}/promotions/vouchers/apply`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               voucherCode: voucherCode.trim().toUpperCase(),
               totalAmount,
            }),
         });

         const data = await response.json();

         if (!response.ok) {
            setVoucherError(data.message || 'Không thể áp dụng voucher');
            setVoucherLoading(false);
            return;
         }

         // Áp dụng thành công
         setAppliedVoucher({
            voucherId: data.data.voucherId,
            voucherCode: data.data.voucherCode,
            promotionTitle: data.data.promotionTitle,
            discountAmount: data.data.discountAmount,
            discountDescription: data.data.discountDescription,
         });
         setVoucherCode('');
         setVoucherError('');
      } catch (err) {
         console.error('Error applying voucher:', err);
         setVoucherError('Đã xảy ra lỗi khi áp dụng voucher');
      } finally {
         setVoucherLoading(false);
      }
   };

   // Hàm xóa voucher đã áp dụng
   const handleRemoveVoucher = () => {
      setAppliedVoucher(null);
      setVoucherCode('');
      setVoucherError('');
   };

   // Display name for a bill (prefer room name, fallback to bill number)
   const getBillDisplayLabel = (bill: Bill) => {
      const roomName = bill.roomInfo?.roomName || bill.bookingDetails?.roomName || "";
      const nightlyPrice = bill.roomInfo?.nightlyPrice || bill.bookingDetails?.nightlyPrice || 0;
      const resolved = resolveRoomName(roomName, nightlyPrice);
      return resolved || bill.billNumber || "Phòng";
   };

   // Resolve actual room name from room.ts, handling old generic names like "basic room", "triple room"
   const resolveRoomName = (roomName: string | undefined, _nightlyPrice: number | undefined): string => {
      if (!roomName) return "";

      // Check if roomName exactly matches a room from room.ts
      const exactMatch = rooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());
      if (exactMatch) return exactMatch.name;

      // If roomName is generic, try to find by price range
      const lowerName = roomName.toLowerCase();

      // Map generic names to actual room by price ranges
      if (lowerName.includes('basic') || lowerName.includes('cơ bản')) {
         const matchByPrice = rooms.find(r => {
            const rPrice = parseInt((r.price || '0').replace(/\./g, '')) || 0;
            return rPrice >= 800000 && rPrice <= 1000000;
         });
         if (matchByPrice) return matchByPrice.name;
      }

      if (lowerName.includes('triple') || lowerName.includes('trung cấp') || lowerName.includes('superior')) {
         const matchByPrice = rooms.find(r => {
            const rPrice = parseInt((r.price || '0').replace(/\./g, '')) || 0;
            return rPrice >= 1200000 && rPrice <= 2000000;
         });
         if (matchByPrice) return matchByPrice.name;
      }

      if (lowerName.includes('deluxe') || lowerName.includes('cao cấp') || lowerName.includes('luxury')) {
         const matchByPrice = rooms.find(r => {
            const rPrice = parseInt((r.price || '0').replace(/\./g, '')) || 0;
            return rPrice >= 3000000;
         });
         if (matchByPrice) return matchByPrice.name;
      }

      // Fallback: return original roomName
      return roomName;
   };

   // Get room view from room.ts data
   const getRoomCategoryLabel = (billLike: any) => {
      // Get room name from bill
      const roomName = billLike?.roomInfo?.roomName || billLike?.bookingDetails?.roomName || "";

      if (!roomName) return 'Phòng';

      // Find exact match in rooms data
      const roomData = rooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());

      // Return view if found, otherwise return room name
      if (roomData && roomData.view) {
         return roomData.view;
      }

      // Try to find by partial name match if exact match fails
      const lowerRoomName = roomName.toLowerCase();
      const partialMatch = rooms.find(r => {
         const lowerName = r.name.toLowerCase();
         return lowerName.includes(lowerRoomName) || lowerRoomName.includes(lowerName);
      });

      if (partialMatch && partialMatch.view) {
         return partialMatch.view;
      }

      // If no match found, return the room name itself
      return roomName;
   };

   // Payment polling state
   const [paymentPollingActive, setPaymentPollingActive] = useState(false);
   const [paymentSuccess, setPaymentSuccess] = useState(false);
   const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
   const [countdownSeconds, setCountdownSeconds] = useState(120); // 2 minutes
   const [qrData, setQrData] = useState<any>(null);

   const getStatusColor = (status: string) => {
      switch (status) {
         case "active":
            return "bg-green-100 text-green-800";
         case "cancelled":
            return "bg-red-100 text-red-800";
         case "refunded":
            return "bg-yellow-100 text-yellow-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

   const getPaymentStatusColor = (status: string) => {
      switch (status) {
         case "paid":
            return "bg-green-100 text-green-800";
         case "unpaid":
            return "bg-red-100 text-red-800";
         case "partial":
            return "bg-yellow-100 text-yellow-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

   const getStatusText = (status: string) => {
      switch (status) {
         case "active": return "Hoạt động";
         case "cancelled": return "Đã hủy";
         case "refunded": return "Đã hoàn tiền";
         default: return status;
      }
   };

   const getPaymentStatusText = (status: string) => {
      switch (status) {
         case "paid": return "Đã thanh toán";
         case "unpaid": return "Chưa thanh toán";
         case "partial": return "Thanh toán 1 phần";
         default: return status;
      }
   };

   // Poll bill status while on Payment tab
   useEffect(() => {
      let interval: any = null;
      let isCancelled = false;

      const token = localStorage.getItem("token");
      if (!token) return;

      const getBillIdsToPoll = () => {
         if (selectedGroup && Array.isArray(selectedGroup.bills) && selectedGroup.bills.length > 0) {
            return selectedGroup.bills.map((b: any) => b._id || b.billNumber).filter(Boolean) as string[];
         }
         return bills.map((b: any) => b._id || b.billNumber).filter(Boolean) as string[];
      };

      const pollOnce = async (ids: string[]) => {
         try {
            const base = API_BASE_URL.replace(/\/+$/, "");
            let allPaid = true;
            let anyPaid = false;
            let anyPartial = false;

            for (const id of ids) {
               try {
                  const resp = await fetch(`${base}/bills/${id}/status`, {
                     headers: {
                        Authorization: `Bearer ${token}`,
                        'Cache-Control': 'no-cache'
                     }
                  });
                  if (!resp.ok) {
                     allPaid = false;
                     continue;
                  }
                  const json = await resp.json();
                  const s = (json?.data?.paymentStatus as string) || 'unpaid';
                  if (s === 'paid') {
                     anyPaid = true;
                  } else if (s === 'partial') {
                     anyPartial = true;
                     allPaid = false;
                  } else {
                     allPaid = false;
                  }
               } catch (err) {
                  console.warn('Poll error for', id, err);
                  allPaid = false;
               }
            }
            if (isCancelled) return;

            if (allPaid) {
               setPaymentSuccess(true);
               setPaymentMessage('✅ Thanh toán thành công');
               setPaymentPollingActive(false);

               // Save last paid bill (most recent) to localStorage (clear extras) so it can be restored on login
               try {
                  const idsSetTemp = new Set(ids);
                  const paidBillsTemp = bills.filter(b => idsSetTemp.has(b._id) || idsSetTemp.has(b.billNumber));
                  if (paidBillsTemp && paidBillsTemp.length > 0) {
                     const lastIdTemp = ids[ids.length - 1];
                     let candidateTemp = paidBillsTemp.find(pb => pb._id === lastIdTemp || pb.billNumber === lastIdTemp) || paidBillsTemp[paidBillsTemp.length - 1];
                     if (candidateTemp) {
                        const savedTemp = { ...candidateTemp, extras: [], savedAt: Date.now() };
                        const uidTemp = user ? ((user as any)._id || (user as any).id) : null;
                        const lastBillKeyTemp = uidTemp ? `last_bill_${uidTemp}` : 'last_bill';
                        localStorage.setItem(lastBillKeyTemp, JSON.stringify(savedTemp));
                        console.log('💾 Saved last paid bill to localStorage:', savedTemp._id || savedTemp.billNumber);
                     }
                  }
               } catch (err) {
                  console.warn('Could not save last paid bill to localStorage', err);
               }

               // Tạo Booking từ các Bill đã thanh toán
               try {
                  const token = localStorage.getItem("token");
                  for (const billId of ids) {
                     try {
                        const response = await fetch(`${API_BASE_URL}/bills/${billId}/convert-to-booking`, {
                           method: "POST",
                           headers: {
                              Authorization: `Bearer ${token}`,
                           },
                        });
                        if (response.ok) {
                           console.log(`✅ Created booking for bill ${billId}`);
                        } else {
                           console.warn(`⚠️ Could not create booking for bill ${billId}`);
                        }
                     } catch (err) {
                        console.warn(`⚠️ Error creating booking for bill ${billId}:`, err);
                     }
                  }
               } catch (err) {
                  console.warn('Error converting bills to bookings:', err);
               }

               // Remove paid bills from state
               const idsSet = new Set(ids);
               setBills(prev => prev.filter(b => !idsSet.has(b._id) && !idsSet.has(b.billNumber)));

               // Clear deleted bills from localStorage if needed
               try {
                  const rawDeleted = localStorage.getItem('deleted_bills');
                  const deletedList: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
                  const newDeletedList = [...deletedList, ...ids];
                  localStorage.setItem('deleted_bills', JSON.stringify(newDeletedList));
               } catch (err) {
                  console.warn('Could not update deleted_bills', err);
               }

               // Clear queued_extras after successful payment
               try {
                  clearQueuedExtras();
               } catch (err) {
                  console.warn('Could not clear queued_extras', err);
               }

               setTimeout(() => fetchBills(), 300);
               setTimeout(() => {
                  setIsOpen(false);
                  setActiveTab('bills');
                  setSelectedGroup(null);
                  setExtras([]);
                  setPaymentSuccess(false);
                  setPaymentMessage(null);
               }, 1500);
            } else if (anyPaid) {
               setPaymentMessage('⚠️ Một phần thanh toán đã được xác nhận');
            } else if (anyPartial) {
               setPaymentMessage('❌ Số tiền chuyển không đủ');
            } else {
               setPaymentMessage('⏳ Đang chờ xác nhận từ ngân hàng...');
            }
         } catch (err) {
            console.warn('Polling failed', err);
         }
      };

      if (isOpen && activeTab === 'payment' && paymentPollingActive) {
         const ids = getBillIdsToPoll();
         if (ids.length === 0) return;
         pollOnce(ids);
         interval = setInterval(() => pollOnce(ids), 3000);
      }

      return () => {
         isCancelled = true;
         if (interval) clearInterval(interval);
      };
   }, [isOpen, activeTab, paymentPollingActive, selectedGroup, bills, API_BASE_URL, fetchBills]);

   // Countdown timer - decrements when payment is active
   useEffect(() => {
      let countdownInterval: any = null;

      if (isOpen && activeTab === 'payment' && paymentPollingActive && countdownSeconds > 0) {
         countdownInterval = setInterval(() => {
            setCountdownSeconds(prev => {
               const newVal = prev - 1;
               if (newVal <= 0) {
                  setPaymentMessage('❌ Hết thời gian thanh toán (2 phút)');
                  setPaymentPollingActive(false);
               }
               return newVal;
            });
         }, 1000);
      }

      return () => {
         if (countdownInterval) clearInterval(countdownInterval);
      };
   }, [isOpen, activeTab, paymentPollingActive]);

   // Load QR code image from assets when entering payment tab
   useEffect(() => {
      if (isOpen && activeTab === 'payment') {
         setCountdownSeconds(120); // Reset countdown
         setQrData(QR_CODE_IMAGE); // Use static image from assets
         setPaymentPollingActive(true);
      } else {
         setPaymentPollingActive(false);
      }
   }, [isOpen, activeTab]);

   // Group bills by date (same day bookings grouped together)
   const groupBillsByDate = (billsList: Bill[]) => {
      const groups: { [key: string]: Bill[] } = {};

      billsList.forEach(bill => {
         const date = new Date(bill.issuedDate).toDateString();
         if (!groups[date]) {
            groups[date] = [];
         }
         groups[date].push(bill);
      });

      return Object.entries(groups).map(([date, groupBills]) => ({
         date,
         bills: groupBills,
         totalAmount: groupBills.reduce((sum, b) => sum + (b.finalAmount || 0), 0),
         totalRooms: groupBills.length,
      }));
   };

   // Only show when user is logged in
   if (!user) return null;

   return (
      <>
         {/* Floating Button */}
         <button
            onClick={() => {
               console.log("🔔 Bill icon clicked!");
               console.log("Current state - isOpen:", isOpen, "bills.length:", bills.length, "loading:", loading);
               setIsOpen(true);
               setHasNewBill(false);
               fetchBills();
            }}
            className="fixed bottom-6 right-6 bg-[#2fd680] text-white p-4 rounded-full shadow-lg hover:shadow-2xl hover:bg-[#25a060] transition-all hover:scale-110 z-40"
            title="Hóa đơn của tôi"
         >
            <Receipt className="w-6 h-6" />
            {/* Green dot indicator when a new bill is created */}
            {hasNewBill && (
               <span className="absolute -bottom-1 left-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" aria-label="Có hóa đơn mới" />
            )}
            {bills.length > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {bills.length}
               </span>
            )}
         </button>

         {/* Modal */}
         {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 pt-20">
               <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="border-b">
                     <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                           <h2 className="text-xl font-bold text-gray-900">Quản lý hóa đơn</h2>
                           <p className="text-gray-600 text-sm">Xem và thanh toán hóa đơn của bạn</p>
                        </div>
                        <button
                           onClick={() => {
                              setIsOpen(false);
                              setActiveTab('bills');
                              setSelectedGroup(null);
                           }}
                           className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                           <X className="w-6 h-6" />
                        </button>
                     </div>
                     {/* Tabs */}
                     <div className="flex border-t">
                        <button
                           onClick={() => {
                              setActiveTab('bills');
                              setSelectedGroup(null);
                           }}
                           className={`flex-1 py-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'bills'
                              ? 'border-[#2fd680] text-[#2fd680] bg-teal-50'
                              : 'border-transparent text-gray-600 hover:bg-gray-50'
                              }`}
                        >
                           Hóa đơn của tôi
                        </button>
                        <button
                           onClick={() => setActiveTab('payment')}
                           disabled={bills.length === 0 || (!selectedGroup && extras.length === 0)}
                           className={`flex-1 py-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'payment'
                              ? 'border-[#2fd680] text-[#2fd680] bg-teal-50'
                              : 'border-transparent text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                        >
                           Thanh toán
                        </button>
                     </div>
                  </div>

                  {/* Content */}
                  <div ref={contentRef} className="flex-1 overflow-y-auto p-4">
                     {activeTab === 'bills' && (
                        <>
                           {loading ? (
                              <div className="flex items-center justify-center py-12">
                                 <div className="text-lg text-gray-600">Đang tải...</div>
                              </div>
                           ) : bills.length === 0 ? (
                              <div className="text-center py-12">
                                 <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                 <h3 className="text-xl font-semibold mb-2">Chưa có hóa đơn</h3>
                                 <p className="text-gray-600">
                                    {localStorage.getItem("token")
                                       ? "Bạn chưa đặt phòng nào. Hãy đặt phòng ngay để nhận hóa đơn!"
                                       : "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem hóa đơn."}
                                 </p>
                              </div>
                           ) : (
                              <div className="space-y-4">
                                 {groupBillsByDate(bills).map((group) => (
                                    <div key={group.date} className="border-2 border-[#2fd680] rounded-2xl p-6 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 shadow-md hover:shadow-xl transition-shadow space-y-4">
                                       {/* Group Header */}
                                       <div className="pb-4 border-b-2 border-[#2fd680]">
                                          <h3 className="font-bold text-xl text-[#2fd680]">
                                             Hóa đơn của bạn
                                          </h3>
                                          <p className="text-sm text-[#2fd680] mt-1">
                                             (Đã chọn {group.totalRooms} phòng)
                                          </p>
                                       </div>

                                       {/* Bills in group */}
                                       {group.bills.map((bill) => (
                                          <div
                                             key={bill._id || bill.billNumber}
                                             className="bg-gradient-to-br from-white via-teal-50 to-green-50 rounded-xl border-2 border-[#2fd680] p-5 hover:shadow-lg transition-shadow relative cursor-pointer"
                                             onClick={() => {
                                                const id = bill._id || bill.billNumber;
                                                setSelectedBillForExtras(id);
                                                setSelectedGroup(group);
                                             }}
                                          >
                                             {/* Delete Button */}
                                             <button
                                                onClick={async () => {
                                                   if (!window.confirm(`Bạn có chắc muốn hủy hóa đơn ${bill.billNumber}?\n\nPhòng: ${getRoomCategoryLabel(bill)}\nSố tiền: ${formatCurrency(bill.finalAmount)}`)) return;
                                                   console.log('🗑️ Cancelling bill:', bill.billNumber);
                                                   const billId = bill._id || bill.billNumber;

                                                   try {
                                                      const token = localStorage.getItem('token');
                                                      if (!token) {
                                                         alert('Vui lòng đăng nhập lại');
                                                         return;
                                                      }

                                                      const url = `${API_BASE_URL}/bills/${billId}/cancel`;
                                                      const response = await fetch(url, {
                                                         method: 'DELETE',
                                                         headers: {
                                                            'Authorization': `Bearer ${token}`,
                                                            'Content-Type': 'application/json',
                                                         },
                                                      });

                                                      if (!response.ok) {
                                                         const errorData = await response.json();
                                                         throw new Error(errorData.message || 'Không thể hủy hóa đơn');
                                                      }

                                                      // Successfully cancelled on server, update UI
                                                      const newList = bills.filter((b) => (b._id || b.billNumber) !== billId);
                                                      setBills(newList);

                                                      // Remove extras associated with this bill
                                                      setExtras(prev => prev.filter(extra => extra.billId !== billId));

                                                      // Update cache
                                                      try {
                                                         localStorage.setItem('bills_cache', JSON.stringify(newList));
                                                      } catch (err) {
                                                         // ignore
                                                      }

                                                      // If all bills cancelled, clear extras and reset selectedGroup
                                                      if (newList.length === 0) {
                                                         console.log('🗑️ All bills cancelled, clearing extras and localStorage caches');
                                                         setExtras([]);
                                                         setSelectedGroup(null);
                                                         try {
                                                            localStorage.removeItem('last_bill');
                                                            // remove user-keyed extras cache
                                                            const extrasKey = getExtrasKey(user);
                                                            if (extrasKey) {
                                                               try { localStorage.removeItem(extrasKey); } catch { }
                                                            }
                                                            localStorage.removeItem('bills_cache');
                                                         } catch (err) {
                                                            // ignore
                                                         }
                                                      }

                                                      alert('Đã hủy hóa đơn thành công');
                                                   } catch (err: any) {
                                                      console.error('⚠️ Error cancelling bill:', err);
                                                      alert(err.message || 'Lỗi khi hủy hóa đơn. Vui lòng thử lại.');
                                                   }
                                                }}
                                                className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors z-10"
                                                title="Hủy hóa đơn"
                                             >
                                                <Trash2 className="w-5 h-5" />
                                             </button>

                                             {/* Header */}
                                             <div className="flex justify-between items-start mb-4 pr-10">
                                                <div>
                                                   <h3 className="font-bold text-xl text-[#2fd680]">{bill.roomInfo?.roomName || bill.bookingDetails?.roomName || bill.billNumber}</h3>
                                                   <p className="text-sm text-gray-600 mt-1">
                                                      Đặt phòng ngày: {formatDate(bill.issuedDate)}
                                                   </p>
                                                </div>
                                                <div className="flex gap-2 flex-wrap justify-end">
                                                   <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${getStatusColor(bill.status)}`}>
                                                      {getStatusText(bill.status)}
                                                   </span>
                                                   <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${getPaymentStatusColor(bill.paymentStatus)}`}>
                                                      {getPaymentStatusText(bill.paymentStatus)}
                                                   </span>
                                                </div>
                                             </div>

                                             {/* Info Grid */}
                                             <div className="space-y-2 mb-4 text-sm border-b pb-3">
                                                <p className="flex items-center justify-between">
                                                   <span className="font-semibold text-gray-700">Khách hàng:</span>
                                                   <span className="text-gray-900 font-medium">{bill.customerInfo.fullName}</span>
                                                </p>
                                                <p className="flex items-center justify-between">
                                                   <span className="font-semibold text-gray-700">SĐT:</span>
                                                   <span className="text-gray-900 font-medium">{bill.customerInfo.phone}</span>
                                                </p>
                                                <p className="flex items-center justify-between">
                                                   <span className="font-semibold text-gray-700">Phòng:</span>
                                                   <span className="text-[#2fd680] font-medium">{getRoomCategoryLabel(bill)}</span>
                                                </p>
                                             </div>

                                             {/* Dates and Pricing */}
                                             <div className="space-y-2 text-sm">
                                                <p className="flex items-center justify-between">
                                                   <span className="font-semibold text-gray-700">Ngày ở:</span>
                                                   <span className="text-gray-900 font-medium">
                                                      {formatDate(bill.checkIn || (bill as any).bookingDetails?.checkIn)} - {formatDate(bill.checkOut || (bill as any).bookingDetails?.checkOut)}
                                                   </span>
                                                </p>
                                                <p className="flex items-center justify-between">
                                                   <span className="font-semibold text-gray-700">Số đêm:</span>
                                                   <span className="text-gray-900 font-medium">{bill.nights || (bill as any).bookingDetails?.nights} đêm</span>
                                                </p>
                                                <p className="flex items-center justify-between">
                                                   <span className="font-semibold text-gray-700">Số khách:</span>
                                                   <span className="text-gray-900 font-medium">{bill.guests || (bill as any).bookingDetails?.guests} người</span>
                                                </p>
                                                <p className="flex items-center justify-between border-t pt-2 mt-2">
                                                   <span className="font-semibold text-gray-700">Giá/đêm:</span>
                                                   <span className="text-gray-900 font-medium">{formatCurrency((bill as any).bookingDetails?.nightlyPrice || bill.roomInfo?.nightlyPrice || 0)}</span>
                                                </p>
                                                <p className="flex items-center justify-between">
                                                   <span className="font-semibold text-gray-700">Tiền phòng:</span>
                                                   <span className="text-gray-900 font-medium">{formatCurrency(bill.totalPrice || (((bill as any).bookingDetails?.nightlyPrice || bill.roomInfo?.nightlyPrice || 0) * (bill.nights || (bill as any).bookingDetails?.nights || 1)))}</span>
                                                </p>
                                                <p className="flex items-center justify-between">
                                                   <span className="font-semibold text-gray-700">Thuế VAT (8%):</span>
                                                   <span className="text-gray-900 font-medium">{formatCurrency(bill.tax)}</span>
                                                </p>
                                                {(bill as any).bookingDetails?.specialRequests && (
                                                   <p className="flex items-start justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
                                                      <span className="font-semibold text-gray-700">Ghi chú:</span>
                                                      <strong className="text-gray-900 text-right max-w-[200px] break-words">{(bill as any).bookingDetails.specialRequests}</strong>
                                                   </p>
                                                )}
                                                <p className="flex items-center justify-between border-t pt-3 mt-3">
                                                   <span className="font-bold text-gray-800">Tổng cộng:</span>
                                                   <span className="text-xl font-bold text-red-600">
                                                      {formatCurrency(bill.finalAmount)}
                                                   </span>
                                                </p>
                                             </div>
                                          </div>
                                       ))}

                                       {/* Quick Add Services & Food Section - MOVED HERE */}
                                       <div className="border-t-2 border-[#2fd680] pt-4 mt-4">
                                          <h3 className="font-bold text-xl text-[#2fd680] mb-4">Thêm dịch vụ & ẩm thực</h3>

                                          {/* Bill selection scoped to this group to avoid cross-group mismatch */}
                                          {(() => {
                                             const resolveGroupBillId = (): string => {
                                                const matched = selectedBillForExtras ? group.bills.find(b => (b._id || b.billNumber) === selectedBillForExtras) : undefined;
                                                return (matched?._id || matched?.billNumber) || group.bills[0]?._id || group.bills[0]?.billNumber || '';
                                             };
                                             const groupBillId = resolveGroupBillId();

                                             return (
                                                <>
                                                   {/* Room Selection for Extras */}
                                                   {group.bills.length > 0 && (
                                                      <div className="mb-4 p-3 bg-white rounded-xl border-2 border-[#2fd680]">
                                                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Chọn phòng để thêm dịch vụ/ẩm thực:
                                                         </label>
                                                         <select
                                                            value={groupBillId}
                                                            onChange={(e) => setSelectedBillForExtras(e.target.value)}
                                                            className="w-full p-3 border-2 border-[#2fd680] rounded-lg bg-gradient-to-r from-teal-50 to-green-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2fd680]"
                                                         >
                                                            {group.bills.map((b) => (
                                                               <option key={b._id || b.billNumber} value={b._id || b.billNumber}>
                                                                  {getBillDisplayLabel(b)}
                                                               </option>
                                                            ))}
                                                         </select>
                                                      </div>
                                                   )}

                                                   {/* Services */}
                                                   <div className="mb-6">
                                                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                         <span className="text-[#2fd680]">●</span> Dịch vụ
                                                      </h4>
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                         {[
                                                            { title: "Giặt ủi", price: "50.000 VNĐ / kg", img: "https://cdn.pixabay.com/photo/2021/02/02/12/38/iron-5973837_1280.jpg" },
                                                            { title: "Đưa đón sân bay", price: "1.000.000 VNĐ / lượt", img: "https://cdn.pixabay.com/photo/2018/02/14/15/50/lufthansa-regional-3153209_1280.jpg" },
                                                            { title: "Ăn sáng Buffet", price: "Bao gồm trong giá phòng", img: "https://images.unsplash.com/photo-1722477936580-84aa10762b0b?auto=format&fit=crop&w=800&q=60" },
                                                            { title: "Hồ bơi vô cực", price: "Miễn phí cho khách lưu trú", img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=60" },
                                                            { title: "Nhà hàng & Quầy Bar", price: "Từ 300.000 VNĐ / món", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=60" },
                                                            { title: "Spa & Trị liệu", price: "500.000 VNĐ / liệu trình", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=60" },
                                                            { title: "Phòng Gym & Fitness", price: "Miễn phí cho khách lưu trú", img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=60" },
                                                            { title: "Cho thuê xe máy", price: "120.000 VNĐ / ngày", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=60" },
                                                            { title: "Tour du lịch", price: "Từ 800.000 VNĐ / người", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=60" },
                                                         ].map((service, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#2fd680] transition-colors">
                                                               <div className="flex-1">
                                                                  <p className="font-medium text-gray-800">{service.title}</p>
                                                                  <p className="text-sm text-gray-600">{service.price}</p>
                                                               </div>
                                                               <button
                                                                  onClick={async () => {
                                                                     const targetBillId = resolveGroupBillId();
                                                                     const priceValue = parseInt(service.price.replace(/[^\d]/g, '')) || 0;
                                                                     const newItem: ExtraItem = {
                                                                        id: `service-${Date.now()}-${Math.random()}`,
                                                                        type: 'service',
                                                                        title: service.title,
                                                                        price: priceValue,
                                                                        quantity: 1,
                                                                        image: service.img,
                                                                        billId: targetBillId,
                                                                     };

                                                                     const token = localStorage.getItem('token');
                                                                     if (token && targetBillId) {
                                                                        try {
                                                                           const existingServer = extras.find(item => item.title === service.title && item.type === 'service' && item.billId === targetBillId && /^[0-9a-fA-F]{24}$/.test(item.id));
                                                                           let serverBill: any = null;
                                                                           if (existingServer) {
                                                                              serverBill = await billService.updateExtra(targetBillId, existingServer.id, { quantity: existingServer.quantity + 1 });
                                                                              console.log('✅ Updated service quantity on server (in-bill add):', serverBill);
                                                                           } else {
                                                                              serverBill = await billService.addExtra(targetBillId, {
                                                                                 type: newItem.type,
                                                                                 title: newItem.title,
                                                                                 price: newItem.price,
                                                                                 quantity: newItem.quantity,
                                                                                 image: newItem.image,
                                                                              });
                                                                              console.log('✅ Added new service to database (in-bill add):', serverBill);
                                                                           }

                                                                           // Apply server extras for this bill into local state/cache immediately
                                                                           try {
                                                                              if (serverBill && serverBill._id) {
                                                                                 const serverExtrasForBill: ExtraItem[] = (serverBill.extras || []).map((extra: any) => ({
                                                                                    id: (extra._id || extra.id) ? (extra._id || extra.id).toString() : `${serverBill._id}-${extra.title}`,
                                                                                    type: extra.type || 'service',
                                                                                    title: extra.title,
                                                                                    price: Number(extra.price || 0),
                                                                                    quantity: Number(extra.quantity || 1),
                                                                                    image: extra.image,
                                                                                    billId: serverBill._id,
                                                                                 }));

                                                                                 setExtras(prev => {
                                                                                    const others = prev.filter(e => e.billId !== serverBill._id);
                                                                                    const merged = [...others, ...serverExtrasForBill];
                                                                                    const extrasKey = getExtrasKey(user);
                                                                                    if (extrasKey) {
                                                                                       try { localStorage.setItem(extrasKey, JSON.stringify(merged)); } catch { }
                                                                                    }
                                                                                    return merged;
                                                                                 });
                                                                              }
                                                                           } catch (err) {
                                                                              console.warn('Could not apply server extras to state', err);
                                                                           }

                                                                           // Sync full list
                                                                           fetchBills();
                                                                           setIsOpen(true);
                                                                           setActiveTab('bills');
                                                                           setHasNewBill(true);
                                                                           return;
                                                                        } catch (err) {
                                                                           console.error('❌ In-bill add service failed to save to server:', err);
                                                                           alert('Lỗi: Không thể lưu dịch vụ lên server. ' + (err instanceof Error ? err.message : String(err)));
                                                                           return;
                                                                        }
                                                                     }

                                                                     // Fallback: local-only add (not logged in)
                                                                     setExtras(prev => {
                                                                        const existing = prev.find(item => item.title === service.title && item.type === 'service' && item.billId === targetBillId);
                                                                        if (existing) {
                                                                           return prev.map(item =>
                                                                              item.title === service.title && item.type === 'service' && item.billId === targetBillId
                                                                                 ? { ...item, quantity: item.quantity + 1 }
                                                                                 : item
                                                                           );
                                                                        }
                                                                        return [...prev, newItem];
                                                                     });
                                                                     try {
                                                                        setRecentlyAdded(prev => ({ ...prev, [service.title]: true }));
                                                                        setTimeout(() => setRecentlyAdded(prev => { const next = { ...prev }; delete next[service.title]; return next; }), 1800);
                                                                     } catch (err) {
                                                                        // ignore
                                                                     }
                                                                  }}
                                                                  disabled={!!recentlyAdded[service.title]}
                                                                  className={`ml-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${recentlyAdded[service.title] ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-[#2fd680] text-white hover:bg-[#25a060]'}`}
                                                               >
                                                                  {recentlyAdded[service.title] ? 'Đã thêm' : 'Thêm'}
                                                               </button>
                                                            </div>
                                                         ))}
                                                      </div>
                                                   </div>

                                                   {/* Food */}
                                                   <div>
                                                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                         <span className="text-[#2fd680]">●</span> Ẩm thực
                                                      </h4>
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                         {[
                                                            { title: "Phở bò", price: "95.000 VNĐ", img: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=60" },
                                                            { title: "Gỏi cuốn", price: "75.000 VNĐ", img: "https://plus.unsplash.com/premium_photo-1663850685033-a8557389963e?auto=format&fit=crop&w=600&q=60" },
                                                            { title: "Cơm Gà Hải Nam", price: "110.000 VNĐ", img: "https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=600&q=60" },
                                                            { title: "Sashimi Set", price: "250.000 VNĐ", img: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=60" },
                                                            { title: "Pad Thái", price: "135.000 VNĐ", img: "https://images.unsplash.com/photo-1655091273851-7bdc2e578a88?auto=format&fit=crop&w=600&q=60" },
                                                            { title: "Vịt Quay Bắc Kinh", price: "350.000 VNĐ", img: "https://media.istockphoto.com/id/1557558337/vi/anh/c%E1%BA%AFt-v%E1%BB%8Bt-quay-b%E1%BA%AFc-kinh.jpg?s=612x612" },
                                                            { title: "Steak Ribeye", price: "450.000 VNĐ", img: "https://media.istockphoto.com/id/522134088/vi/anh/steack-v%E1%BB%9Bi-c%C3%A0-chua.jpg?s=612x612" },
                                                            { title: "Mỳ Ý Carbonara", price: "180.000 VNĐ", img: "https://media.istockphoto.com/id/470065924/vi/anh/cabonara-ramen.jpg?s=612x612" },
                                                            { title: "Pizza Parma Ham", price: "220.000 VNĐ", img: "https://media.istockphoto.com/id/1167700422/vi/anh/meat-mix-pizza.jpg?s=612x612" },
                                                            { title: "Salad Caesar", price: "150.000 VNĐ", img: "https://media.istockphoto.com/id/1495924977/vi/anh/m%E1%BB%99t-m%C3%B3n-salad-caesar.jpg?s=612x612" },
                                                            { title: "Cá Hồi Áp Chảo", price: "280.000 VNĐ", img: "https://media.istockphoto.com/id/2211865912/vi/anh/fried-salmon-steak.jpg?s=612x612" },
                                                            { title: "Sườn Cừu Nướng", price: "420.000 VNĐ", img: "https://media.istockphoto.com/id/1080892544/vi/anh/than-n%C6%B0%E1%BB%9Bng-s%C6%B0%E1%BB%9Dn-c%E1%BB%ABu.jpg?s=612x612" },
                                                            { title: "Heineken", price: "55.000 VNĐ", img: "https://media.istockphoto.com/id/458411525/vi/anh/bia-heineken.jpg?s=612x612" },
                                                            { title: "Tiger Crystal", price: "55.000 VNĐ", img: "https://m.media-amazon.com/images/I/71UFITN4MBL._AC_SL1200_.jpg" },
                                                            { title: "Corona Extra", price: "70.000 VNĐ", img: "https://media.istockphoto.com/id/533717776/vi/anh/chai-bia-corona-extra.jpg?s=612x612" },
                                                            { title: "Mojito Chanh Bạc Hà", price: "120.000 VNĐ", img: "https://media.gettyimages.com/id/1253999472/photo/mojito-cocktail.jpg?s=612x612" },
                                                            { title: "Margarita", price: "140.000 VNĐ", img: "https://media.gettyimages.com/id/1646896493/photo/margarita-classic-style.jpg?s=612x612" },
                                                            { title: "Espresso Martini", price: "160.000 VNĐ", img: "https://media.gettyimages.com/id/1455558757/photo/espresso-martini-cocktails.jpg?s=612x612" },
                                                         ].map((food, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#2fd680] transition-colors">
                                                               <div className="flex-1">
                                                                  <p className="font-medium text-gray-800">{food.title}</p>
                                                                  <p className="text-sm text-gray-600">{food.price}</p>
                                                               </div>
                                                               <button
                                                                  onClick={async () => {
                                                                     const targetBillId = resolveGroupBillId();
                                                                     const priceValue = parseInt(food.price.replace(/[^\d]/g, '')) || 0;
                                                                     const newItem: ExtraItem = {
                                                                        id: `food-${Date.now()}-${Math.random()}`,
                                                                        type: 'food',
                                                                        title: food.title,
                                                                        price: priceValue,
                                                                        quantity: 1,
                                                                        image: food.img,
                                                                        billId: targetBillId,
                                                                     };

                                                                     const token = localStorage.getItem('token');
                                                                     if (token && targetBillId) {
                                                                        try {
                                                                           const existingServer = extras.find(item => item.title === food.title && item.type === 'food' && item.billId === targetBillId && /^[0-9a-fA-F]{24}$/.test(item.id));
                                                                           let serverBill: any = null;
                                                                           if (existingServer) {
                                                                              serverBill = await billService.updateExtra(targetBillId, existingServer.id, { quantity: existingServer.quantity + 1 });
                                                                              console.log('✅ Updated food quantity on server (in-bill add):', serverBill);
                                                                           } else {
                                                                              serverBill = await billService.addExtra(targetBillId, {
                                                                                 type: newItem.type,
                                                                                 title: newItem.title,
                                                                                 price: newItem.price,
                                                                                 quantity: newItem.quantity,
                                                                                 image: newItem.image,
                                                                              });
                                                                              console.log('✅ Added new food to database (in-bill add):', serverBill);
                                                                           }

                                                                           // Apply server extras for this bill into local state/cache immediately
                                                                           try {
                                                                              if (serverBill && serverBill._id) {
                                                                                 const serverExtrasForBill: ExtraItem[] = (serverBill.extras || []).map((extra: any) => ({
                                                                                    id: (extra._id || extra.id) ? (extra._id || extra.id).toString() : `${serverBill._id}-${extra.title}`,
                                                                                    type: extra.type || 'food',
                                                                                    title: extra.title,
                                                                                    price: Number(extra.price || 0),
                                                                                    quantity: Number(extra.quantity || 1),
                                                                                    image: extra.image,
                                                                                    billId: serverBill._id,
                                                                                 }));

                                                                                 setExtras(prev => {
                                                                                    const others = prev.filter(e => e.billId !== serverBill._id);
                                                                                    const merged = [...others, ...serverExtrasForBill];
                                                                                    const extrasKey = getExtrasKey(user);
                                                                                    if (extrasKey) {
                                                                                       try { localStorage.setItem(extrasKey, JSON.stringify(merged)); } catch { }
                                                                                    }
                                                                                    return merged;
                                                                                 });
                                                                              }
                                                                           } catch (err) {
                                                                              console.warn('Could not apply server extras to state', err);
                                                                           }

                                                                           // Sync full list
                                                                           fetchBills();
                                                                           setIsOpen(true);
                                                                           setActiveTab('bills');
                                                                           setHasNewBill(true);
                                                                           return;
                                                                        } catch (err) {
                                                                           console.error('❌ In-bill add food failed to save to server:', err);
                                                                           alert('Lỗi: Không thể lưu ẩm thực lên server. ' + (err instanceof Error ? err.message : String(err)));
                                                                           return;
                                                                        }
                                                                     }

                                                                     // Fallback: local-only add (not logged in)
                                                                     setExtras(prev => {
                                                                        const exist = prev.find(item => item.title === food.title && item.type === 'food' && item.billId === targetBillId);
                                                                        if (exist) {
                                                                           return prev.map(item =>
                                                                              item.title === food.title && item.type === 'food' && item.billId === targetBillId
                                                                                 ? { ...item, quantity: item.quantity + 1 }
                                                                                 : item
                                                                           );
                                                                        }
                                                                        return [...prev, newItem];
                                                                     });
                                                                     try {
                                                                        setRecentlyAdded(prev => ({ ...prev, [food.title]: true }));
                                                                        setTimeout(() => setRecentlyAdded(prev => { const next = { ...prev }; delete next[food.title]; return next; }), 1800);
                                                                     } catch (err) {
                                                                        // ignore
                                                                     }
                                                                  }}
                                                                  disabled={!!recentlyAdded[food.title]}
                                                                  className={`ml-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${recentlyAdded[food.title] ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-[#2fd680] text-white hover:bg-[#25a060]'}`}
                                                               >
                                                                  {recentlyAdded[food.title] ? 'Đã thêm' : 'Thêm'}
                                                               </button>
                                                            </div>
                                                         ))}
                                                      </div>
                                                   </div>
                                                </>
                                             );
                                          })()}
                                       </div>

                                       {/* Extras Section - Services & Food (grouped per room/bill) */}
                                       {(() => {
                                          const sections = group.bills.map((b) => {
                                             const billId = b._id || b.billNumber;
                                             const filteredExtras = extras.filter(e => e.billId === billId);
                                             if (filteredExtras.length === 0) return null;

                                             return (
                                                <div key={`extras-${billId}`} className="mb-4">
                                                   <h5 className="font-semibold text-gray-500 mb-2">
                                                      PHÒNG: {getBillDisplayLabel(b as Bill)}
                                                   </h5>

                                                   {/* Services Section */}
                                                   {filteredExtras.filter(item => item.type === 'service').length > 0 && (
                                                      <div className="mb-6">
                                                         <h5 className="font-semibold text-gray-700 mb-3">Dịch vụ</h5>
                                                         <div className="space-y-3">
                                                            {filteredExtras.filter(item => item.type === 'service').map((item) => (
                                                               <div
                                                                  key={item.id}
                                                                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow relative"
                                                               >
                                                                  {/* Delete Button */}
                                                                  <button
                                                                     onClick={async () => {
                                                                        if (window.confirm(`Bạn có chắc muốn xóa "${item.title}"?`)) {
                                                                           try {
                                                                              // Remove from server
                                                                              const token = localStorage.getItem('token');
                                                                              if (token && item.billId) {
                                                                                 const response = await fetch(
                                                                                    `${API_BASE_URL}/bills/${item.billId}/extras/${item.id}`,
                                                                                    {
                                                                                       method: 'DELETE',
                                                                                       headers: {
                                                                                          'Authorization': `Bearer ${token}`,
                                                                                          'Content-Type': 'application/json',
                                                                                       },
                                                                                    }
                                                                                 );
                                                                                 if (!response.ok) {
                                                                                    console.warn('Could not delete extra from server');
                                                                                 } else {
                                                                                    // Refresh bills after successful deletion
                                                                                    fetchBills();
                                                                                 }
                                                                              }
                                                                           } catch (err) {
                                                                              console.warn('Error deleting extra:', err);
                                                                           }

                                                                           // Remove from local state
                                                                           setExtras(prev => prev.filter(e => e.id !== item.id));

                                                                           // Also remove from queued_extras to prevent re-adding on reload (per-user)
                                                                           try {
                                                                              const queued = getQueuedExtras();
                                                                              if (queued.length > 0) {
                                                                                 const filtered = queued.filter((q: any) => !(q.id === item.id && q.billId === item.billId));
                                                                                 setQueuedExtras(filtered);
                                                                              }
                                                                           } catch (err) {
                                                                              // ignore
                                                                           }
                                                                        }
                                                                     }}
                                                                     className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors z-10"
                                                                     title="Xóa"
                                                                  >
                                                                     <Trash2 className="w-5 h-5" />
                                                                  </button>

                                                                  {/* Header */}
                                                                  <div className="flex justify-between items-start mb-3 pr-10">
                                                                     <div>
                                                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                                                     </div>
                                                                  </div>

                                                                  {/* Info */}
                                                                  <div className="border-t pt-3 space-y-2 text-sm">
                                                                     <div className="flex justify-between">
                                                                        <span className="text-gray-600">Đơn giá:</span>
                                                                        <span className="font-medium">{formatCurrency(item.price)}</span>
                                                                     </div>
                                                                     <div className="flex justify-between items-center">
                                                                        <span className="text-gray-600">Số lượng:</span>
                                                                        <div className="flex items-center gap-3">
                                                                           <button
                                                                              onClick={() => {
                                                                                 if (item.quantity > 1) {
                                                                                    setExtras(prev => prev.map(e =>
                                                                                       e.id === item.id ? { ...e, quantity: e.quantity - 1 } : e
                                                                                    ));
                                                                                 }
                                                                              }}
                                                                              className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-sm"
                                                                           >
                                                                              −
                                                                           </button>
                                                                           <span className="font-bold">{item.quantity}</span>
                                                                           <button
                                                                              onClick={() => {
                                                                                 setExtras(prev => prev.map(e =>
                                                                                    e.id === item.id ? { ...e, quantity: e.quantity + 1 } : e
                                                                                 ));
                                                                              }}
                                                                              className="w-7 h-7 rounded bg-[#2fd680] hover:bg-[#25a060] text-white flex items-center justify-center font-bold text-sm"
                                                                           >
                                                                              +
                                                                           </button>
                                                                        </div>
                                                                     </div>
                                                                     <div className="flex justify-between items-center pt-2 border-t">
                                                                        <span className="font-semibold">Thành tiền:</span>
                                                                        <span className="text-lg font-bold text-gray-800">
                                                                           {formatCurrency(item.price * item.quantity)}
                                                                        </span>
                                                                     </div>
                                                                  </div>
                                                               </div>
                                                            ))}
                                                         </div>
                                                      </div>
                                                   )}

                                                   {/* Food Section */}
                                                   {filteredExtras.filter(item => item.type === 'food').length > 0 && (
                                                      <div>
                                                         <h5 className="font-semibold text-gray-700 mb-3">Ẩm thực</h5>
                                                         <div className="space-y-3">
                                                            {filteredExtras.filter(item => item.type === 'food').map((item) => (
                                                               <div
                                                                  key={item.id}
                                                                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow relative"
                                                               >
                                                                  {/* Delete Button */}
                                                                  <button
                                                                     onClick={async () => {
                                                                        if (window.confirm(`Bạn có chắc muốn xóa "${item.title}"?`)) {
                                                                           try {
                                                                              // Remove from server
                                                                              const token = localStorage.getItem('token');
                                                                              if (token && item.billId) {
                                                                                 const response = await fetch(
                                                                                    `${API_BASE_URL}/bills/${item.billId}/extras/${item.id}`,
                                                                                    {
                                                                                       method: 'DELETE',
                                                                                       headers: {
                                                                                          'Authorization': `Bearer ${token}`,
                                                                                          'Content-Type': 'application/json',
                                                                                       },
                                                                                    }
                                                                                 );
                                                                                 if (!response.ok) {
                                                                                    console.warn('Could not delete extra from server');
                                                                                 } else {
                                                                                    // Refresh bills after successful deletion
                                                                                    fetchBills();
                                                                                 }
                                                                              }
                                                                           } catch (err) {
                                                                              console.warn('Error deleting extra:', err);
                                                                           }

                                                                           // Remove from local state
                                                                           setExtras(prev => prev.filter(e => e.id !== item.id));

                                                                           // Also remove from queued_extras to prevent re-adding on reload (per-user)
                                                                           try {
                                                                              const queued = getQueuedExtras();
                                                                              if (queued.length > 0) {
                                                                                 const filtered = queued.filter((q: any) => !(q.id === item.id && q.billId === item.billId));
                                                                                 setQueuedExtras(filtered);
                                                                              }
                                                                           } catch (err) {
                                                                              // ignore
                                                                           }
                                                                        }
                                                                     }}
                                                                     className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors z-10"
                                                                     title="Xóa"
                                                                  >
                                                                     <Trash2 className="w-5 h-5" />
                                                                  </button>

                                                                  {/* Header */}
                                                                  <div className="flex justify-between items-start mb-3 pr-10">
                                                                     <div>
                                                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                                                     </div>
                                                                  </div>

                                                                  {/* Info */}
                                                                  <div className="border-t pt-3 space-y-2 text-sm">
                                                                     <div className="flex justify-between">
                                                                        <span className="text-gray-600">Đơn giá:</span>
                                                                        <span className="font-medium">{formatCurrency(item.price)}</span>
                                                                     </div>
                                                                     <div className="flex justify-between items-center">
                                                                        <span className="text-gray-600">Số lượng:</span>
                                                                        <div className="flex items-center gap-3">
                                                                           <button
                                                                              onClick={() => {
                                                                                 if (item.quantity > 1) {
                                                                                    setExtras(prev => prev.map(e =>
                                                                                       e.id === item.id ? { ...e, quantity: e.quantity - 1 } : e
                                                                                    ));
                                                                                 }
                                                                              }}
                                                                              className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-sm"
                                                                           >
                                                                              −
                                                                           </button>
                                                                           <span className="font-bold">{item.quantity}</span>
                                                                           <button
                                                                              onClick={() => {
                                                                                 setExtras(prev => prev.map(e =>
                                                                                    e.id === item.id ? { ...e, quantity: e.quantity + 1 } : e
                                                                                 ));
                                                                              }}
                                                                              className="w-7 h-7 rounded bg-[#2fd680] hover:bg-[#25a060] text-white flex items-center justify-center font-bold text-sm"
                                                                           >
                                                                              +
                                                                           </button>
                                                                        </div>
                                                                     </div>
                                                                     <div className="flex justify-between items-center pt-2 border-t">
                                                                        <span className="font-semibold">Thành tiền:</span>
                                                                        <span className="text-lg font-bold text-gray-800">
                                                                           {formatCurrency(item.price * item.quantity)}
                                                                        </span>
                                                                     </div>
                                                                  </div>
                                                               </div>
                                                            ))}
                                                         </div>
                                                      </div>
                                                   )}
                                                </div>
                                             );
                                          });

                                          const rendered = sections.filter(Boolean);
                                          return rendered.length > 0 ? (
                                             <div className="border-t-2 border-[#2fd680] pt-4 mt-4">
                                                <h4 className="font-bold text-lg text-[#2fd680] mb-4">Dịch vụ & ẩm thực đã chọn</h4>
                                                {rendered}
                                             </div>
                                          ) : null;
                                       })()}

                                       {/* Total Payment and Pay Now Button */}
                                       <div className="mt-4 pt-5 border-t-2 border-[#2fd680] bg-white rounded-xl p-5 shadow-inner">
                                          {(() => {
                                             const extrasTotal = extras.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                             const grandTotal = group.totalAmount + extrasTotal;
                                             const discountAmount = appliedVoucher?.discountAmount || 0;
                                             const finalTotal = grandTotal - discountAmount;
                                             const serviceCount = extras.filter(item => item.type === 'service').length;
                                             const foodCount = extras.filter(item => item.type === 'food').length;
                                             return (
                                                <>
                                                   {extrasTotal > 0 && (
                                                      <div className="mb-3 pb-3 border-b space-y-2">
                                                         <div className="flex justify-between text-gray-700">
                                                            <span>Tiền phòng ({group.totalRooms} phòng):</span>
                                                            <span className="font-semibold">{formatCurrency(group.totalAmount)}</span>
                                                         </div>
                                                         {serviceCount > 0 && (
                                                            <div className="flex justify-between text-gray-700">
                                                               <span>Dịch vụ ({serviceCount} dịch vụ):</span>
                                                               <span className="font-semibold">{formatCurrency(extras.filter(item => item.type === 'service').reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                                                            </div>
                                                         )}
                                                         {foodCount > 0 && (
                                                            <div className="flex justify-between text-gray-700">
                                                               <span>Ẩm thực ({foodCount} món):</span>
                                                               <span className="font-semibold">{formatCurrency(extras.filter(item => item.type === 'food').reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                                                            </div>
                                                         )}
                                                      </div>
                                                   )}

                                                   {/* Voucher Input Section */}
                                                   <div className="mb-4 pb-4 border-b border-gray-200">
                                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                         Mã ưu đãi / Voucher
                                                      </label>
                                                      {appliedVoucher ? (
                                                         <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                            <div className="flex items-center justify-between">
                                                               <div>
                                                                  <p className="font-semibold text-green-700">{appliedVoucher.voucherCode}</p>
                                                                  <p className="text-sm text-green-600">{appliedVoucher.promotionTitle}</p>
                                                                  <p className="text-sm text-green-600">Giảm: {formatCurrency(appliedVoucher.discountAmount)}</p>
                                                               </div>
                                                               <button
                                                                  onClick={handleRemoveVoucher}
                                                                  className="text-red-500 hover:text-red-700 p-1"
                                                                  title="Xóa voucher"
                                                               >
                                                                  <X className="w-5 h-5" />
                                                               </button>
                                                            </div>
                                                         </div>
                                                      ) : (
                                                         <div className="flex gap-2">
                                                            <input
                                                               type="text"
                                                               value={voucherCode}
                                                               onChange={(e) => {
                                                                  setVoucherCode(e.target.value.toUpperCase());
                                                                  setVoucherError('');
                                                               }}
                                                               placeholder="Nhập mã voucher..."
                                                               className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2fd680] focus:border-transparent uppercase"
                                                            />
                                                            <button
                                                               onClick={() => handleApplyVoucher(grandTotal)}
                                                               disabled={voucherLoading || !voucherCode.trim()}
                                                               className="px-4 py-2 bg-[#2fd680] text-white font-semibold rounded-lg hover:bg-[#25b56c] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                               {voucherLoading ? '...' : 'Áp dụng'}
                                                            </button>
                                                         </div>
                                                      )}
                                                      {voucherError && (
                                                         <p className="mt-2 text-sm text-red-500">{voucherError}</p>
                                                      )}
                                                   </div>

                                                   {/* Display discount if voucher applied */}
                                                   {appliedVoucher && (
                                                      <div className="mb-3 pb-3 border-b space-y-2">
                                                         <div className="flex justify-between text-gray-700">
                                                            <span>Tạm tính:</span>
                                                            <span className="font-semibold">{formatCurrency(grandTotal)}</span>
                                                         </div>
                                                         <div className="flex justify-between text-green-600">
                                                            <span>Giảm giá ({appliedVoucher.discountDescription}):</span>
                                                            <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                                                         </div>
                                                      </div>
                                                   )}

                                                   <div className="flex justify-between items-center mb-4">
                                                      <span className="text-xl font-bold text-gray-800">Tổng thanh toán:</span>
                                                      <span className="text-4xl font-bold text-[#2fd680]">
                                                         {formatCurrency(finalTotal)}
                                                      </span>
                                                   </div>
                                                   <button
                                                      onClick={async () => {
                                                         setSelectedGroup(group);
                                                         setActiveTab('payment');
                                                         // Scroll to top of content when switching to payment tab
                                                         setTimeout(() => {
                                                            if (contentRef.current) {
                                                               contentRef.current.scrollTop = 0;
                                                            }
                                                         }, 50);

                                                         // Bắt đầu xác thực email ngay lập tức
                                                         const userEmail = user?.email || "trongluffy22@gmail.com";
                                                         console.log("🔐 Bắt đầu xác thực thanh toán qua email:", userEmail);

                                                         // Thu thập bill IDs từ group hiện tại
                                                         const billIdsToUpdate = group.bills.map((b: Bill) => b._id).filter(Boolean);
                                                         console.log("📋 Bill IDs to update:", billIdsToUpdate);

                                                         resetEmailVerification();
                                                         setTimeout(() => {
                                                            startVerification(userEmail, 120, billIdsToUpdate);
                                                         }, 500);
                                                      }}
                                                      className="w-full bg-[#2fd680] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#25a060] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
                                                   >
                                                      Thanh toán ngay
                                                   </button>
                                                </>
                                             );
                                          })()}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </>
                     )}

                     {/* Payment Tab Content */}
                     {activeTab === 'payment' && (selectedGroup || extras.length > 0) && (
                        <div className="space-y-4">
                           {/* Payment Header - Ẩn khi đang xác thực hoặc có kết quả */}
                           {!emailVerifying && emailSuccess === null && (
                              <div className="text-center mb-6">
                                 <p className="text-2xl font-bold text-gray-800 mb-2">Thanh toán</p>
                                 <p className="text-sm text-gray-600">Quét mã QR hoặc chuyển khoản để thanh toán</p>
                              </div>
                           )}

                           {/* Thông báo kết quả thanh toán - Hiển thị toàn màn hình */}
                           {emailSuccess !== null && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
                                 <div className={`p-8 rounded-2xl shadow-2xl transform animate-bounce ${emailSuccess
                                    ? 'bg-green-50 border-4 border-green-400'
                                    : 'bg-red-50 border-4 border-red-400'
                                    }`}>
                                    <div className="flex flex-col items-center gap-4">
                                       {emailSuccess ? (
                                          <CheckCircle className="w-20 h-20 text-green-500" />
                                       ) : (
                                          <X className="w-20 h-20 text-red-500" />
                                       )}
                                       <span className={`font-bold text-2xl ${emailSuccess ? 'text-green-700' : 'text-red-700'}`}>
                                          {emailSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
                                       </span>
                                       <p className={`text-base ${emailSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                          {emailSuccess ? "Cảm ơn bạn đã sử dụng dịch vụ" : "Vui lòng thử lại sau"}
                                       </p>
                                       <p className="text-sm text-gray-500 mt-2">
                                          {emailSuccess ? "Tự động đóng sau 2 giây..." : "Tự động đóng sau 3 giây..."}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {paymentMessage && !emailVerifying && emailSuccess === null && (
                              <div className={`mb-4 p-4 rounded-lg border-2 text-center font-medium ${paymentSuccess
                                 ? 'bg-green-50 border-green-300 text-green-700'
                                 : paymentMessage.includes('❌')
                                    ? 'bg-red-50 border-red-300 text-red-700'
                                    : 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                 }`}>
                                 {paymentMessage}
                              </div>
                           )}

                           {/* Payment Summary */}
                           {(() => {
                              // const roomTotal = selectedGroup ? selectedGroup.totalAmount : 0;
                              // const extrasTotal = extras.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                              // const grandTotal = roomTotal + extrasTotal;
                              // The actual transfer amount is determined by the backend and reflected in qrData.amount
                              // (includes bill finalAmount + any extras charged to bill)

                              return (
                                 <>
                                    {/* Breakdown removed: showing QR, extras and policies only */}

                                    {/* QR Code Section */}
                                    <div className="bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 rounded-2xl p-4 text-center border-2 border-[#2fd680]">
                                       <h4 className="font-bold text-lg mb-3 text-[#2fd680]">
                                          Quét mã QR để thanh toán
                                       </h4>

                                       {/* Countdown Timer */}
                                       <div className="flex justify-center mb-6">
                                          <div className={`px-6 py-3 rounded-xl font-bold text-2xl flex items-center gap-2 transition-all ${countdownSeconds <= 60
                                             ? 'bg-red-500 text-white shadow-lg shadow-red-300 animate-pulse'
                                             : countdownSeconds <= 120
                                                ? 'bg-orange-400 text-white shadow-lg shadow-orange-300'
                                                : 'bg-green-500 text-white shadow-lg shadow-green-300'
                                             }`}>
                                             <span>⏱️</span>
                                             <span>{Math.floor(countdownSeconds / 60)}:{String(countdownSeconds % 60).padStart(2, '0')}</span>
                                          </div>
                                       </div>

                                       {/* QR Code Display */}
                                       <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl border-2 border-[#2fd680] mb-4">
                                          {qrData ? (
                                             <img
                                                src={qrData}
                                                alt="VietQR Code"
                                                className="w-56 h-56 object-contain rounded-xl"
                                             />
                                          ) : (
                                             <div className="w-56 h-56 flex items-center justify-center bg-gray-100">
                                                <span className="text-gray-500">Đang tải QR...</span>
                                             </div>
                                          )}
                                       </div>

                                       <p className="text-base text-gray-700 mt-3 font-medium">
                                          Sử dụng ứng dụng ngân hàng để quét mã QR
                                       </p>

                                       {/* Bank Account Info */}
                                       <div className="mt-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 shadow-md border-2 border-[#2fd680]">
                                          <h5 className="font-bold text-[#2fd680] mb-3 text-center">Thông Tin Chuyển Khoản</h5>
                                          <div className="space-y-3 text-sm">
                                             {/* Account Holder */}
                                             <p className="flex items-center justify-between border-b pb-2">
                                                <span className="font-semibold text-gray-700">Chủ tài khoản:</span>
                                                <strong className="text-[#2fd680] text-right">HOTEL BOOKING</strong>
                                             </p>

                                             {/* Account Number */}
                                             <p className="flex items-center justify-between border-b pb-2">
                                                <span className="font-semibold text-gray-700">Số tài khoản:</span>
                                                <strong className="text-[#2fd680] font-mono text-right">983917976143</strong>
                                             </p>

                                             {/* Amount */}
                                             <p className="flex items-center justify-between border-b pb-2">
                                                <span className="font-semibold text-gray-700">Số tiền:</span>
                                                <strong className="text-red-600 font-bold text-right">
                                                   {(() => {
                                                      // Calculate total from all bills in selectedGroup or all bills
                                                      const billsToSum = selectedGroup?.bills || bills;
                                                      const billsTotal = billsToSum.reduce((sum: number, b: any) => sum + (b.finalAmount || 0), 0);
                                                      const extrasTotal = extras.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                                      const totalAmount = billsTotal + extrasTotal;
                                                      const discountAmount = appliedVoucher?.discountAmount || 0;
                                                      const finalTotal = totalAmount - discountAmount;
                                                      return finalTotal.toLocaleString('vi-VN');
                                                   })()} ₫
                                                </strong>
                                             </p>

                                             {/* Voucher Discount - only show if applied */}
                                             {appliedVoucher && (
                                                <p className="flex items-center justify-between border-b pb-2 bg-green-50 -mx-2 px-2 rounded">
                                                   <span className="font-semibold text-green-700">Giảm giá ({appliedVoucher.voucherCode}):</span>
                                                   <strong className="text-green-600 font-bold text-right">
                                                      -{appliedVoucher.discountAmount.toLocaleString('vi-VN')} ₫
                                                   </strong>
                                                </p>
                                             )}

                                             {/* Transfer Content */}
                                             <p className="flex items-start justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
                                                <span className="font-semibold text-gray-700">Nội dung:</span>
                                                <strong className="text-[#2fd680] font-mono text-right max-w-[200px] break-words">
                                                   Chuyển tiền đặt phòng tại HotelHub
                                                </strong>
                                             </p>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Policies Section */}
                                    <div className="grid md:grid-cols-2 gap-3">
                                       {/* Privacy Policy */}
                                       <div className="border-2 border-[#2fd680] rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-br from-white to-teal-50">
                                          <h4 className="font-bold text-[#2fd680] mb-3 text-lg flex items-center gap-2">
                                             <Shield className="w-5 h-5" />
                                             Chính sách bảo mật
                                          </h4>
                                          <div className="text-sm text-gray-700 space-y-2">
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span>Thông tin thanh toán được mã hóa <strong>SSL 256-bit</strong></span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span><strong>Không lưu</strong> thông tin thẻ thanh toán</span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span>Tuân thủ tiêu chuẩn <strong>PCI DSS</strong></span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span>Dữ liệu cá nhân được <strong>bảo vệ tối đa</strong></span>
                                             </p>
                                          </div>
                                       </div>

                                       {/* Refund Policy */}
                                       <div className="border-2 border-[#2fd680] rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-br from-white to-teal-50">
                                          <h4 className="font-bold text-[#2fd680] mb-3 text-lg flex items-center gap-2">
                                             <DollarSign className="w-5 h-5" />
                                             Chính sách hoàn trả
                                          </h4>
                                          <div className="text-sm text-gray-700 space-y-2">
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span><strong>Hủy trước 7 ngày:</strong> Hoàn <strong className="text-green-600">100%</strong></span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span><strong>Hủy trước 3-6 ngày:</strong> Hoàn <strong className="text-green-600">50%</strong></span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span><strong>Hủy trước 1-2 ngày:</strong> Hoàn <strong className="text-orange-600">25%</strong></span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span><strong>Hủy trong ngày:</strong> <strong className="text-red-600">Không hoàn</strong></span>
                                             </p>
                                             <p className="text-[#2fd680] font-medium mt-2 bg-yellow-50 px-2 py-1 rounded text-center">
                                                Xử lý trong <strong> 2 - 3 </strong>  ngày làm việc
                                             </p>
                                          </div>
                                       </div>

                                       {/* Exchange Policy */}
                                       <div className="border-2 border-[#2fd680] rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-br from-white to-emerald-50">
                                          <h4 className="font-bold text-[#2fd680] mb-3 text-lg flex items-center gap-2">
                                             <RefreshCw className="w-5 h-5" />
                                             Chính sách đổi trả
                                          </h4>
                                          <div className="text-sm text-gray-700 space-y-2">
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span><strong>Đổi phòng miễn phí</strong> (thông báo trước <strong>24h</strong>)</span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span>Nâng hạng phòng với <strong>phí chênh lệch</strong></span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span><strong>Đổi ngày</strong> tùy vào phòng trống</span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span><strong>Liên hệ hotline</strong> để hỗ trợ nhanh</span>
                                             </p>
                                          </div>
                                       </div>

                                       {/* Support */}
                                       <div className="border-2 border-[#2fd680] rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-br from-white to-emerald-50">
                                          <h4 className="font-bold text-[#2fd680] mb-3 text-lg flex items-center gap-2">
                                             <Headphones className="w-5 h-5" />
                                             Hỗ trợ thanh toán
                                          </h4>
                                          <div className="text-sm text-gray-700 space-y-2">
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span>Hotline: <strong className="text-[#2fd680]">1900-xxxx</strong> <span className="text-gray-500 text-xs">(24/7)</span></span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span>Email: <strong className="text-[#2fd680]">support@hotelhub.vn</strong></span>
                                             </p>
                                             <p className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#2fd680] flex-shrink-0 mt-0.5" />
                                                <span>Zalo/Viber: <strong className="text-[#2fd680]">0901-234-567</strong></span>
                                             </p>
                                             <p className="text-[#2fd680] font-medium mt-2 bg-yellow-50 px-2 py-1 rounded text-center">
                                                Phản hồi trong <strong> 1 - 2 </strong> phút
                                             </p>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Confirmation Button */}
                                    <div className="space-y-3">
                                       <button
                                          onClick={() => setActiveTab('bills')}
                                          className="flex items-center gap-2 text-[#2fd680] hover:text-[#25a060] font-medium transition-colors py-2"
                                       >
                                          <ArrowLeft className="w-5 h-5" />
                                          Quay lại hóa đơn
                                       </button>
                                    </div>

                                    <div className="bg-white pt-4 border-t space-y-3">
                                       <button
                                          onClick={async () => {
                                             try {
                                                console.log('✅ User clicked Đã thanh toán');
                                                const token = localStorage.getItem('token');
                                                if (!token) {
                                                   setPaymentMessage('❌ Bạn cần đăng nhập để xác nhận');
                                                   return;
                                                }

                                                const getIds = () => {
                                                   if (selectedGroup && Array.isArray(selectedGroup.bills) && selectedGroup.bills.length > 0) {
                                                      return selectedGroup.bills.map((b: any) => b._id || b.billNumber).filter(Boolean) as string[];
                                                   }
                                                   return bills.map((b: any) => b._id || b.billNumber).filter(Boolean) as string[];
                                                };

                                                const ids = getIds();
                                                if (ids.length === 0) {
                                                   setPaymentMessage('❌ Không tìm thấy hóa đơn');
                                                   return;
                                                }

                                                setPaymentMessage('⏳ Đang gửi yêu cầu xác nhận...');
                                                let confirmedCount = 0;
                                                for (const id of ids) {
                                                   try {
                                                      const resp = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/bills/${id}/confirm-by-user`, {
                                                         method: 'POST',
                                                         headers: {
                                                            Authorization: `Bearer ${token}`,
                                                            'Content-Type': 'application/json'
                                                         },
                                                         body: JSON.stringify({ note: 'User confirmed' })
                                                      });
                                                      if (resp.ok) {
                                                         confirmedCount++;
                                                         const json = await resp.json();
                                                         const bill = json?.data || json;
                                                         try {
                                                            const roomId = bill?.roomInfo?.roomId || bill?.booking?.room;
                                                            if (roomId) window.dispatchEvent(new CustomEvent('roomUpdated', { detail: { roomId } }));
                                                         } catch (e) { }
                                                      }
                                                   } catch (err) {
                                                      console.warn('Confirm error:', err);
                                                   }
                                                }

                                                if (confirmedCount > 0) {
                                                   setPaymentMessage('⏳ Đã gửi xác nhận. Đang chờ ngân hàng...');
                                                   setPaymentPollingActive(true);
                                                   setTimeout(() => fetchBills(), 500);
                                                } else {
                                                   setPaymentMessage('❌ Không thể gửi xác nhận');
                                                }
                                             } catch (err) {
                                                console.error(err);
                                                setPaymentMessage('❌ Lỗi khi xác nhận');
                                             }
                                          }}
                                          disabled={paymentPollingActive}
                                          className="w-full bg-[#2fd680] text-white py-3 px-6 rounded-xl font-bold text-base hover:bg-[#25a060] disabled:bg-gray-400 transition-all duration-300 shadow-lg hover:shadow-2xl"
                                       >
                                          {paymentPollingActive ? '⏳ Đang xác nhận...' : 'Đã thanh toán'}
                                       </button>
                                    </div>
                                 </>
                              );
                           })()}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

      </>
   );
};

export default FloatingBills;
