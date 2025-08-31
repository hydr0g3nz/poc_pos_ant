// src/hooks/useCartDrawer.ts
import { useState, useCallback } from 'react';

export const useCartDrawer = () => {
  const [isVisible, setIsVisible] = useState(false);

  const openDrawer = useCallback(() => {
    setIsVisible(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  return {
    isVisible,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
};