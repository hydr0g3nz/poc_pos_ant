// src/hooks/useOrderSubmit.ts
import { useState, useCallback } from "react";
import { customerService } from "@/services/customerService";
import { ManageOrderItemListRequest } from "@/types";
import { message } from "antd";

export const useOrderSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const submitOrder = useCallback(
    async (request: ManageOrderItemListRequest) => {
      if (!request.order_id || request.items.length === 0) {
        message.warning("ข้อมูลออเดอร์ไม่ครบถ้วน");
        return { success: false, data: null };
      }

      setIsSubmitting(true);
      try {
        console.log("Submitting order request:", request);

        const response = await customerService.manageOrderItems(request);
        setLastResponse(response);

        message.success("ดำเนินการสำเร็จ!");
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error("Failed to submit order:", error);
        message.error(error.message || "เกิดข้อผิดพลาดในการส่งออเดอร์");
        return { success: false, data: null, error };
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    isSubmitting,
    lastResponse,
    submitOrder,
  };
};
