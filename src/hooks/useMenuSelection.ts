// src/hooks/useMenuSelection.ts
import { useState, useCallback } from "react";
import { MenuItem, SelectedOption } from "@/types";
import { customerService } from "@/services/customerService";
import { adminService } from "@/services/adminService";
import { MenuUtils } from "@/utils/utils";
import { message } from "antd";

export const useMenuSelection = (isAdmin = false) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // โหลดรายละเอียดเมนู
  const loadMenuItem = useCallback(
    async (id: number): Promise<MenuItem | null> => {
      setIsLoading(true);
      try {
        // const service = isAdmin ? adminService : customerService;
        // const response = await service.getMenuItem(id);
        const response = await customerService.getMenuItem(id);
        return response.data;
      } catch (error) {
        message.error("ไม่สามารถโหลดรายละเอียดเมนูได้");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin]
  );

  // เลือกเมนู
  const selectMenuItem = useCallback(
    async (item: MenuItem) => {
      let detailItem = item;

      // โหลดรายละเอียดเพิ่มเติมถ้าจำเป็น

      const loaded = await loadMenuItem(item.id);
      if (!loaded) return null;
      detailItem = loaded;

      setSelectedItem(detailItem);
      setQuantity(1);

      // ตั้งค่าตัวเลือกเริ่มต้น
      const defaultOptions = MenuUtils.getDefaultOptions(detailItem);
      setSelectedOptions(defaultOptions);

      return detailItem;
    },
    [loadMenuItem]
  );

  // จัดการการเปลี่ยนตัวเลือก
  const handleOptionChange = useCallback(
    (
      optionId: number,
      valueId: number,
      additionalPrice: number,
      type: "single" | "multiple"
    ) => {
      setSelectedOptions((prev) => {
        if (type === "single") {
          // ลบตัวเลือกเดิมของ option นี้ออกก่อน แล้วเพิ่มใหม่
          const filtered = prev.filter((opt) => opt.optionId !== optionId);
          return [...filtered, { optionId, valueId, additionalPrice }];
        } else {
          // สำหรับ multiple choice
          const existingIndex = prev.findIndex(
            (opt) => opt.optionId === optionId && opt.valueId === valueId
          );

          if (existingIndex >= 0) {
            // ลบถ้ามีอยู่แล้ว (uncheck)
            return prev.filter((_, index) => index !== existingIndex);
          } else {
            // เพิ่มใหม่ (check)
            return [...prev, { optionId, valueId, additionalPrice }];
          }
        }
      });
    },
    []
  );

  // ตั้งค่าจำนวน
  const setItemQuantity = useCallback((newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  }, []);

  // คำนวณราคารวม
  const calculateTotalPrice = useCallback((): number => {
    if (!selectedItem) return 0;
    return MenuUtils.calculateTotalPrice(
      selectedItem,
      selectedOptions,
      quantity
    );
  }, [selectedItem, selectedOptions, quantity]);

  // ตรวจสอบความถูกต้อง
  const validateSelection = useCallback((): {
    isValid: boolean;
    errors: string[];
  } => {
    if (!selectedItem) {
      return { isValid: false, errors: ["ไม่ได้เลือกเมนู"] };
    }

    return MenuUtils.validateOptions(selectedItem, selectedOptions);
  }, [selectedItem, selectedOptions]);

  // ล้างการเลือก
  const clearSelection = useCallback(() => {
    setSelectedItem(null);
    setSelectedOptions([]);
    setQuantity(1);
  }, []);

  // สร้างข้อความอธิบายตัวเลือก
  const getSelectionSummary = useCallback(() => {
    if (!selectedItem) return "";
    return MenuUtils.getOptionsDescription(selectedItem, selectedOptions);
  }, [selectedItem, selectedOptions]);

  return {
    // State
    selectedItem,
    selectedOptions,
    quantity,
    isLoading,

    // Actions
    selectMenuItem,
    handleOptionChange,
    setItemQuantity,
    clearSelection,

    // Computed
    totalPrice: calculateTotalPrice(),
    selectionSummary: getSelectionSummary(),
    validation: validateSelection(),

    // Utils
    hasOptions: selectedItem ? MenuUtils.hasOptions(selectedItem) : false,
    hasRequiredOptions: selectedItem
      ? MenuUtils.hasRequiredOptions(selectedItem)
      : false,
  };
};
