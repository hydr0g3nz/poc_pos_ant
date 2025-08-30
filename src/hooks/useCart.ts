// src/hooks/useCart.ts (แทนที่ไฟล์เดิม)
import { useState, useEffect, useCallback } from 'react';
import { CartItem, MenuItem, SelectedOption } from '@/types';
import { MenuUtils } from '@/utils/utils';
import { message } from 'antd';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage');
        localStorage.removeItem('restaurant-cart');
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('restaurant-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = useCallback((
    menuItem: MenuItem,
    selectedOptions: SelectedOption[] = [],
    quantity: number = 1,
    notes?: string
  ) => {
    const itemKey = MenuUtils.generateCartItemKey(menuItem.id, selectedOptions);
    const unitPrice = menuItem.price + MenuUtils.calculateOptionsPrice(selectedOptions);
    
    const cartItem: CartItem = {
      id: Date.now(), // temporary ID
      name: menuItem.name,
      price: unitPrice,
      quantity,
      selectedOptions,
      notes,
    };

    setCartItems(prev => {
      // ตรวจสอบว่ามี item เดียวกัน (รวม options) อยู่แล้วหรือไม่
      const existingIndex = prev.findIndex(item => 
        MenuUtils.generateCartItemKey(menuItem.id, item.selectedOptions || []) === itemKey
      );

      if (existingIndex >= 0) {
        // อัพเดทจำนวน
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity
        };
        return newItems;
      } else {
        // เพิ่ม item ใหม่
        return [...prev, cartItem];
      }
    });

    message.success(`เพิ่ม ${menuItem.name} ลงในตะกร้าแล้ว`);
  }, []);

  const updateItemQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    setCartItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], quantity };
      return newItems;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
    message.info('ลบรายการออกจากตะกร้าแล้ว');
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('restaurant-cart');
    message.success('ล้างตะกร้าแล้ว');
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getCartSummary = useCallback(() => {
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    
    return {
      itemCount: totalItems,
      totalPrice,
      formattedPrice: `฿${totalPrice.toLocaleString()}`,
      isEmpty: cartItems.length === 0
    };
  }, [cartItems, getTotalItems, getTotalPrice]);

  return {
    cartItems,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getCartSummary,
  };
};