import { useState, useCallback } from "react";

interface PaymentCheckResult {
  success: boolean;
  error?: string;
}

interface UsePaymentEmailCheckOptions {
  timeoutMs?: number;
  intervalMs?: number;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export function usePaymentEmailCheck(options?: UsePaymentEmailCheckOptions) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentCheckResult | null>(null);
  const [countdown, setCountdown] = useState(0);

  const timeoutMs = options?.timeoutMs ?? 60_000;
  const intervalMs = options?.intervalMs ?? 5_000;

  const checkPayment = useCallback(
    async (userEmail: string) => {
      if (!userEmail) {
        setResult({ success: false, error: "Email is required" });
        return;
      }

      setLoading(true);
      setResult(null);
      setCountdown(Math.floor(timeoutMs / 1000));

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      try {
        const response = await fetch(
          "http://localhost:5000/api/payments/email-check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail,
              timeoutMs,
              intervalMs,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PaymentCheckResult = await response.json();
        setResult(data);
        clearInterval(countdownInterval);

        // Callbacks
        if (data.success) {
          options?.onSuccess?.();
        } else {
          options?.onFailure?.();
        }
      } catch (error) {
        console.error("Payment check error:", error);
        const errorResult = {
          success: false,
          error: error instanceof Error ? error.message : "Network error",
        };
        setResult(errorResult);
        clearInterval(countdownInterval);
        options?.onFailure?.();
      } finally {
        setLoading(false);
      }
    },
    [timeoutMs, intervalMs, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setResult(null);
    setCountdown(0);
  }, []);

  return {
    checkPayment,
    loading,
    result,
    countdown,
    reset,
  };
}
