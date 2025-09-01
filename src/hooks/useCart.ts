// src/hooks/useCart.ts
import { useState, useEffect, useCallback } from 'react';
import { CartItem, MenuItem, SelectedOption } from '@/types';
import { MenuUtils } from '@/utils/utils';
import { message } from 'antd';

const CART_STORAGE_KEY = 'restaurant-cart';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  // โหลดตะกร้าจาก localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // บันทึกตะกร้าไป localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // เพิ่มรายการเข้าตะกร้า
// src/hooks/useCart.ts - แก้ไขส่วน addItem
const addItem = useCallback((
  menuItem: MenuItem,
  selectedOptions: SelectedOption[] = [],
  quantity: number = 1,
  notes?: string
) => {
  const optionsPrice = MenuUtils.calculateOptionsPrice(selectedOptions);
  const unitPrice = menuItem.price + optionsPrice;
  const itemKey = MenuUtils.generateCartItemKey(menuItem.id, selectedOptions);
  
  // สร้างข้อความอธิบาย options
  const optionsText = MenuUtils.getOptionsDescription(menuItem, selectedOptions);
  
  setItems(prev => {
    const existingIndex = prev.findIndex(item => 
      MenuUtils.generateCartItemKey(item.menu_item_id, item.selectedOptions || []) === itemKey
    );

    if (existingIndex >= 0) {
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
      return updated;
    } else {
      const newItem: CartItem = {
        id: Date.now(),
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: unitPrice,
        quantity,
        selectedOptions: [...selectedOptions],
        optionsText, // เก็บข้อความไว้
        notes,
      };
      return [...prev, newItem];
    }
  });

  message.success(`เพิ่ม ${menuItem.name} ลงตะกร้าแล้ว`);
}, []);

  // อัพเดทจำนวน
  const updateQuantity = useCallback((index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQuantity };
      return updated;
    });
  }, []);

  // ลบรายการ
  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    message.info('ลบรายการออกจากตะกร้าแล้ว');
  }, []);

  // ล้างตะกร้า
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    message.success('ล้างตะกร้าแล้ว');
  }, []);

  // คำนวณสรุป
  const summary = useCallback(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      itemCount: items.length,
      totalQuantity,
      totalPrice,
      formattedPrice: `฿${totalPrice.toLocaleString()}`,
      isEmpty: items.length === 0,
    };
  }, [items]);

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    summary: summary(),
  };
};