import { useEffect, useState } from "react";

export default function PaymentQR() {
   const [qr, setQr] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      const loadQR = async () => {
         try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/webhooks/create-qrcode", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  amount: 200000,
                  memo: "Thanh toan don 123",
               }),
            });

            if (!res.ok) {
               throw new Error(`HTTP ${res.status}`);
            }

            // Response is now image/png, convert to blob URL
            const blob = await res.blob();
            const imageUrl = URL.createObjectURL(blob);
            setQr(imageUrl);
         } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load QR");
            console.error("QR load error:", err);
         } finally {
            setLoading(false);
         }
      };

      loadQR();
   }, []);

   return (
      <div style={{ textAlign: "center" }}>
         <h3>QR Thanh toán</h3>
         {loading && <p>Đang tạo QR...</p>}
         {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}
         {qr && !loading && (
            <img src={qr} width="260" alt="QR thanh toán" />
         )}
      </div>
   );
}
