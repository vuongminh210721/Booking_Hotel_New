import { useState, useCallback, useRef } from "react";

interface PaymentVerificationState {
  isChecking: boolean;
  success: boolean | null;
  message: string;
  remainingTime: number;
}

interface UsePaymentVerificationReturn extends PaymentVerificationState {
  startVerification: (
    userEmail: string,
    timeoutSeconds?: number,
    billIds?: string[]
  ) => Promise<boolean>;
  reset: () => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function usePaymentVerification(): UsePaymentVerificationReturn {
  const [state, setState] = useState<PaymentVerificationState>({
    isChecking: false,
    success: null,
    message: "",
    remainingTime: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState({
      isChecking: false,
      success: null,
      message: "",
      remainingTime: 0,
    });
  }, []);

  const startVerification = useCallback(
    async (
      userEmail: string,
      timeoutSeconds: number = 120,
      billIds?: string[]
    ): Promise<boolean> => {
      reset();

      setState((prev) => ({
        ...prev,
        isChecking: true,
        message: "Đang chờ email xác nhận thanh toán...",
        remainingTime: timeoutSeconds,
      }));

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newTime = prev.remainingTime - 1;
          if (newTime <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
          return { ...prev, remainingTime: Math.max(0, newTime) };
        });
      }, 1000);

      try {
        const requestBody: any = {
          userEmail,
          timeoutSeconds,
        };

        // Gửi billIds nếu có
        if (billIds && billIds.length > 0) {
          requestBody.billIds = billIds;
        }

        const response = await fetch(`${API_BASE_URL}/payments/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setState({
          isChecking: false,
          success: data.success,
          message: data.message,
          remainingTime: 0,
        });

        return data.success;
      } catch (error) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setState({
          isChecking: false,
          success: false,
          message: "Lỗi kết nối đến server. Vui lòng thử lại.",
          remainingTime: 0,
        });

        return false;
      }
    },
    [reset]
  );

  return {
    ...state,
    startVerification,
    reset,
  };
}
