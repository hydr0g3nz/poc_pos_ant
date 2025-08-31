// src/hooks/useMenu.ts
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { customerService } from '@/services/customerService';
import { adminService } from '@/services/adminService';
import { MenuItem, MenuItemListResponse } from '@/types';
import { message } from 'antd';

interface UseMenuOptions {
  isAdmin?: boolean;
  limit?: number;
}

export const useMenu = ({ isAdmin = false, limit = 12 }: UseMenuOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // สร้าง cache key ที่ถูกต้อง
  const menuCacheKey = [
    'menu-items',
    searchQuery,
    selectedCategory,
    currentPage,
    limit,
    isAdmin
  ];

  // Load menu items
  const { data: menuResponse, isLoading, mutate } = useSWR(
    menuCacheKey,
    async () => {
      const service = isAdmin ? adminService : customerService;
      
      if (searchQuery) {
        return await service.searchMenuItems(searchQuery, limit, currentPage);
      }
      
      // if (selectedCategory) {
      //   return await service.getMenuItemsByCategory(selectedCategory, limit, (currentPage - 1) * limit);
      // }
      
      return await service.getMenuItems(limit, (currentPage - 1) * limit);
    }
  );

  // Load categories
  const { data: categoriesResponse } = useSWR(
    'menu-categories',
    () => isAdmin ? adminService.getCategories() : customerService.getCategories()
  );

  // Search functions
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const filterByCategory = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setCurrentPage(1);
  }, []);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    // Data
    menuItems: menuResponse?.data,
    categories: categoriesResponse?.data,
    
    // Loading states
    isLoading,
    
    // Current state
    currentPage,
    searchQuery,
    selectedCategory,
    
    // Actions
    search,
    filterByCategory,
    clearFilters,
    changePage,
    refetch: mutate,
  };
};