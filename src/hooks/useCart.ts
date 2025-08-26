// hooks/useCart.ts - อัพเดทใหม่
import { useState, useEffect } from 'react';
import { CartItem } from '@/types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  useEffect(() => {
    localStorage.setItem('restaurant-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const pricePerUnit = item.total_price / item.quantity;
          return {
            ...item,
            quantity,
            total_price: pricePerUnit * quantity
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('restaurant-cart');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };
};