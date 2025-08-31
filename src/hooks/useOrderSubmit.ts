// src/hooks/useOrderSubmit.ts
import { useState, useCallback } from "react";
import { customerService } from "@/services/customerService";
import { CartItem, ManageOrderItemListRequest } from "@/types";
import { message } from "antd";

export const useOrderSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // แปลง CartItem เป็น API request format
  const buildOrderRequest = useCallback((
    orderId: number, 
    cartItems: CartItem[]
  ): ManageOrderItemListRequest => {
    const items = cartItems.map(item => ({
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      action: 'add' as const,
      options: item.selectedOptions?.map(opt => ({
        option_id: opt.optionId,
        option_val_id: opt.valueId,
        action: 'add' as const,
      })) || [],
    }));

    return {
      order_id: orderId,
      items,
    };
  }, []);

  // ส่งออเดอร์
  const submitOrder = useCallback(async (
    orderId: number,
    cartItems: CartItem[]
  ) => {
    if (!orderId || cartItems.length === 0) {
      message.warning("ข้อมูลออเดอร์ไม่ครบถ้วน");
      return { success: false, data: null };
    }

    setIsSubmitting(true);
    
    try {
      const request = buildOrderRequest(orderId, cartItems);
      console.log("Submitting order:", request);

      const response = await customerService.manageOrderItems(request);
      
      message.success("สั่งอาหารสำเร็จ!");
      
      return { 
        success: true, 
        data: response.data,
        orderId: orderId 
      };
      
    } catch (error: any) {
      console.error("Failed to submit order:", error);
      message.error(error.message || "เกิดข้อผิดพลาดในการส่งออเดอร์");
      
      return { 
        success: false, 
        data: null, 
        error 
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [buildOrderRequest]);

  return {
    isSubmitting,
    submitOrder,
  };
};