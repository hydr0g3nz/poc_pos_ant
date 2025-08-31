// src/hooks/useMenuData.ts
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { customerService } from '@/services/customerService';
import { adminService } from '@/services/adminService';
import { MenuItem, MenuItemListResponse, Category } from '@/types';
import { message } from 'antd';

interface UseMenuDataOptions {
  isAdmin?: boolean;
  limit?: number;
}

export const useMenuData = ({ isAdmin = false, limit = 12 }: UseMenuDataOptions = {}) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());

  const service = customerService;

  // Load menu items
  const { data: menuData, isLoading, mutate } = useSWR(
    ['menu-items', searchQuery, selectedCategory, page, limit],
    async () => {
      if (searchQuery) {
        return await service.searchMenuItems(searchQuery, limit, page);
      }
    //   if (selectedCategory) {
    //     return await service.getMenuItemsByCategory(selectedCategory, limit, page);
    //   }
      return await service.getMenuItems(limit, page);
    }
  );

  // Load categories
  const { data: categoriesData } = useSWR(
    'categories',
    () => service.getCategories()
  );

  // Load single menu item with full details
  const loadMenuItemDetails = useCallback(async (id: number): Promise<MenuItem | null> => {
    setLoadingDetails(prev => new Set(prev.add(id)));
    
    try {
      const response = await service.getMenuItem(id);
      return response.data;
    } catch (error) {
      message.error('ไม่สามารถโหลดรายละเอียดเมนูได้');
      return null;
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [service]);

  // Search and filter functions
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const filterByCategory = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setPage(1);
  }, []);

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    // Data
    menuItems: menuData?.data?.items || [],
    categories: categoriesData?.data || [],
    total: menuData?.data?.total || 0,
    
    // Loading states
    isLoading,
    isLoadingDetails: (id: number) => loadingDetails.has(id),
    
    // Current state
    page,
    searchQuery,
    selectedCategory,
    
    // Actions
    search,
    filterByCategory,
    clearFilters,
    changePage,
    loadMenuItemDetails,
    refresh: mutate,
  };
};