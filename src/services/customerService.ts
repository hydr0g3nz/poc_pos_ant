import api from './api';
import { ApiResponse, MenuItem, Category, Order, OrderItem } from '@/types';

export const customerService = {
  // Menu APIs
  getMenuItems: async (limit = 10, page = 1): Promise<ApiResponse<any>> => {
    const response = await api.get(`/customers/menu?limit=${limit}&page=${page}`);
    return response.data;
  },

  getMenuItem: async (id: number): Promise<ApiResponse<MenuItem>> => {
    const response = await api.get(`/customers/menu/items/${id}`);
    return response.data;
  },

  searchMenuItems: async (query: string, limit = 10, page = 1): Promise<ApiResponse<any>> => {
    const response = await api.get(`/customers/menu/search?q=${query}&limit=${limit}&page=${page}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/customers/category');
    return response.data;
  },

  // Order APIs
  manageOrderItems: async (orderData: any): Promise<ApiResponse<OrderItem[]>> => {
    const response = await api.post('/customers/orders/items', orderData);
    return response.data;
  },

  getOrdersByStatus: async (status: string, limit = 10, page = 1): Promise<ApiResponse<any>> => {
    const response = await api.get(`/customers/orders/status?status=${status}&limit=${limit}&page=${page}`);
    return response.data;
  },

  getOrders: async (limit = 10, page = 1): Promise<ApiResponse<any>> => {
    const response = await api.get(`/customers/orders?limit=${limit}&page=${page}`);
    return response.data;
  },

  getOrderDetail: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/customers/orders/${id}`);
    return response.data;
  },
};