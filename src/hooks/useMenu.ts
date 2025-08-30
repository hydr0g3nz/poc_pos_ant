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
  autoLoad?: boolean;
}

export const useMenu = ({ isAdmin = false, limit = 10, autoLoad = true }: UseMenuOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);

  // Load menu items
  const { data: menuItems, isLoading, mutate } = useSWR(
    autoLoad ? [
      'menu-items',
      searchQuery,
      selectedCategory,
      currentPage,
      limit,
      isAdmin
    ] : null,
    async () => {
      const service = isAdmin ? adminService : customerService;
      
      if (searchQuery) {
        return await service.searchMenuItems(searchQuery, limit, currentPage);
      }
      
      return await service.getMenuItems(limit, currentPage);
    }
  );

  // Load categories
  const { data: categories } = useSWR(
    'categories',
    () => isAdmin ? adminService.getCategories() : customerService.getCategories()
  );

  // Load single menu item with details
  const loadMenuItem = useCallback(async (id: number): Promise<MenuItem | null> => {
    setLoadingItem(true);
    try {
      const service = isAdmin ? adminService : customerService;
      const response = await service.getMenuItem(id);
      return response.data;
    } catch (error) {
      message.error('ไม่สามารถโหลดรายละเอียดเมนูได้');
      return null;
    } finally {
      setLoadingItem(false);
    }
  }, [isAdmin]);

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
    menuItems: menuItems?.data,
    categories: categories?.data,
    
    // Loading states
    isLoading,
    loadingItem,
    
    // Current state
    currentPage,
    searchQuery,
    selectedCategory,
    
    // Actions
    search,
    filterByCategory,
    clearFilters,
    changePage,
    loadMenuItem,
    refetch: mutate,
  };
};