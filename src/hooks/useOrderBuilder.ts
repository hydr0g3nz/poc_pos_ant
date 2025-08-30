// src/hooks/useOrderBuilder.ts
import { useState, useCallback, useMemo } from "react";
import {
  ManageOrderItemListRequest,
  ManageOrderItemItemRequest,
  OrderItemOptionManageRequest,
  CartItem,
  SelectedOption,
} from "@/types";

export interface OrderBuilderItem {
  orderItemId?: number; // สำหรับ update/delete
  menuItemId: number;
  menuItemName?: string; // เพิ่มเพื่อ display
  quantity: number;
  unitPrice?: number; // เพิ่มเพื่อคำนวณ
  action: "add" | "update" | "delete";
  selectedOptions?: SelectedOption[];
}

export const useOrderBuilder = (initialOrderId?: number) => {
  const [orderId, setOrderId] = useState<number>(initialOrderId || 0);
  const [items, setItems] = useState<OrderBuilderItem[]>([]);

  // เพิ่มรายการใหม่
  const addItem = useCallback(
    (
      menuItemId: number,
      quantity: number = 1,
      selectedOptions: SelectedOption[] = [],
      menuItemName?: string,
      unitPrice?: number
    ) => {
      const newItem: OrderBuilderItem = {
        menuItemId,
        menuItemName,
        quantity,
        unitPrice,
        action: "add",
        selectedOptions: [...selectedOptions],
      };

      setItems((prev) => [...prev, newItem]);
    },
    []
  );

  // เพิ่มหลายรายการจาก Cart
  const addItemsFromCart = useCallback((cartItems: CartItem[]) => {
    const newItems: OrderBuilderItem[] = cartItems.map((item) => ({
      menuItemId: item.menu_item_id, // สมมติว่า CartItem.id คือ menu_item_id
      menuItemName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      action: "add" as const,
      selectedOptions: item.selectedOptions || [],
    }));

    setItems((prev) => [...prev, ...newItems]);
  }, []);

  // อัพเดทรายการที่มีอยู่
  const updateItem = useCallback(
    (
      index: number,
      updates: Partial<Pick<OrderBuilderItem, "quantity" | "selectedOptions">>
    ) => {
      setItems((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;

          return {
            ...item,
            ...updates,
            action: item.orderItemId ? "update" : "add", // ถ้ามี orderItemId แล้วให้เป็น update
          };
        })
      );
    },
    []
  );

  // อัพเดทรายการโดยใช้ orderItemId
  const updateItemById = useCallback(
    (
      orderItemId: number,
      updates: Partial<Pick<OrderBuilderItem, "quantity" | "selectedOptions">>
    ) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.orderItemId !== orderItemId) return item;

          return {
            ...item,
            ...updates,
            action: "update",
          };
        })
      );
    },
    []
  );

  // ลบรายการ (mark for deletion)
  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      const item = prev[index];
      if (!item) return prev;

      // ถ้ายังไม่ได้ส่งไป server (ไม่มี orderItemId) ให้ลบออกจาก array เลย
      if (!item.orderItemId) {
        return prev.filter((_, i) => i !== index);
      }

      // ถ้าส่งไป server แล้ว ให้ mark เป็น delete
      return prev.map((item, i) =>
        i === index ? { ...item, action: "delete" as const } : item
      );
    });
  }, []);

  // ลบรายการโดยใช้ orderItemId
  const removeItemById = useCallback((orderItemId: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.orderItemId === orderItemId
          ? { ...item, action: "delete" as const }
          : item
      )
    );
  }, []);

  // ล้างรายการทั้งหมด
  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  // ล้างเฉพาะรายการที่เป็น add (ยังไม่ส่ง server)
  const clearNewItems = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.orderItemId));
  }, []);

  // สร้าง request object
  const buildRequest = useCallback((): ManageOrderItemListRequest => {
    const requestItems: ManageOrderItemItemRequest[] = items
      .filter((item) => item.action) // กรองเฉพาะที่มี action
      .map((item) => ({
        order_item_id: item.orderItemId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        action: item.action,
        options:
          item.selectedOptions?.map((opt) => ({
            option_id: opt.optionId,
            option_val_id: opt.valueId,
            action: item.action, // ใช้ action เดียวกัน
          })) || [],
      }));

    return {
      order_id: orderId,
      items: requestItems,
    };
  }, [orderId, items]);

  // คำนวณสรุป
  const summary = useMemo(() => {
    const activeItems = items.filter((item) => item.action !== "delete");
    const totalQuantity = activeItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // คำนวณราคารวม (ถ้ามีข้อมูลราคา)
    const totalPrice = activeItems.reduce((sum, item) => {
      const basePrice = (item.unitPrice || 0) * item.quantity;
      const optionsPrice = (item.selectedOptions || []).reduce(
        (optSum, opt) => optSum + opt.additionalPrice * item.quantity,
        0
      );
      return sum + basePrice + optionsPrice;
    }, 0);

    const itemsByAction = {
      add: items.filter((item) => item.action === "add").length,
      update: items.filter((item) => item.action === "update").length,
      delete: items.filter((item) => item.action === "delete").length,
    };

    return {
      totalItems: activeItems.length,
      totalQuantity,
      totalPrice,
      itemsByAction,
      hasChanges: items.length > 0,
      isEmpty: activeItems.length === 0,
    };
  }, [items]);

  // ตรวจสอบความถูกต้อง
  const validate = useCallback(() => {
    const errors: string[] = [];

    if (orderId <= 0) {
      errors.push("กรุณาระบุ Order ID");
    }

    if (items.length === 0) {
      errors.push("ไม่มีรายการที่จะดำเนินการ");
    }

    const invalidItems = items.filter(
      (item) => !item.menuItemId || item.quantity <= 0
    );
    if (invalidItems.length > 0) {
      errors.push("มีรายการที่ข้อมูลไม่ครบถ้วน");
      console.log("Invalid items:", invalidItems);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [orderId, items]);

  // Reset เฉพาะ items ที่ส่งสำเร็จแล้ว
  const markItemsAsSent = useCallback(
    (sentItems: { order_item_id: number }[]) => {
      setItems((prev) => {
        const sentIds = new Set(sentItems.map((item) => item.order_item_id));

        return prev
          .filter((item) => {
            // ลบรายการที่เป็น add หรือ delete ที่ส่งสำเร็จแล้ว
            if (
              (item.action === "add" || item.action === "delete") &&
              sentIds.has(item.orderItemId || 0)
            ) {
              return false;
            }
            return true;
          })
          .map((item) => {
            // รายการ update ที่ส่งสำเร็จแล้วให้เปลี่ยนสถานะ
            if (
              item.action === "update" &&
              sentIds.has(item.orderItemId || 0)
            ) {
              return { ...item, action: undefined as any }; // ลบ action
            }
            return item;
          });
      });
    },
    []
  );

  return {
    // State
    orderId,
    items,
    summary,

    // Actions
    setOrderId,
    addItem,
    addItemsFromCart,
    updateItem,
    updateItemById,
    removeItem,
    removeItemById,
    clearItems,
    clearNewItems,

    // Utilities
    buildRequest,
    validate,
    markItemsAsSent,

    // Computed
    hasChanges: summary.hasChanges,
    isEmpty: summary.isEmpty,
  };
};
