// src/hooks/useMenuModal.ts
import { useState, useCallback } from 'react';
import { MenuItem } from '@/types';

export const useMenuModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);

  const openModal = useCallback((item: MenuItem) => {
    setCurrentItem(item);
    setIsVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsVisible(false);
    setCurrentItem(null);
  }, []);

  return {
    isVisible,
    currentItem,
    openModal,
    closeModal,
  };
};