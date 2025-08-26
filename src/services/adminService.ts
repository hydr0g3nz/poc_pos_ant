import api from './api';
import { ApiResponse, MenuItem, Category, Order, Table } from '@/types';

export const adminService = {
  // Category APIs
  createCategory: async (data: { name: string }): Promise<ApiResponse<Category>> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories');
    return response.data;
  },

  updateCategory: async (id: number, data: { name: string }): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Menu Item APIs
  createMenuItem: async (data: any): Promise<ApiResponse<MenuItem>> => {
    const response = await api.post('/menu-items', data);
    return response.data;
  },

  getMenuItems: async (limit = 10, offset = 0): Promise<ApiResponse<any>> => {
    const response = await api.get(`/menu-items?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getMenuItem: async (id: number): Promise<ApiResponse<MenuItem>> => {
    const response = await api.get(`/menu-items/${id}`);
    return response.data;
  },

  updateMenuItem: async (id: number, data: any): Promise<ApiResponse<MenuItem>> => {
    const response = await api.put(`/menu-items/${id}`, data);
    return response.data;
  },

  deleteMenuItem: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/menu-items/${id}`);
    return response.data;
  },

  // Order APIs
  getOrders: async (limit = 10, offset = 0): Promise<ApiResponse<any>> => {
    const response = await api.get(`/orders?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getOrderWithItems: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}/items`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<ApiResponse<Order>> => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },

  printOrderReceipt: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.get(`/orders/${id}/print/receipt`);
    return response.data;
  },

  printOrderQRCode: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.get(`/orders/${id}/print/qrcode`);
    return response.data;
  },

  // Table APIs
  getTables: async (): Promise<ApiResponse<Table[]>> => {
    const response = await api.get('/tables');
    return response.data;
  },

  createTable: async (data: { table_number: number; seating: number }): Promise<ApiResponse<Table>> => {
    const response = await api.post('/tables', data);
    return response.data;
  },

  updateTable: async (id: number, data: { table_number: number; seating: number }): Promise<ApiResponse<Table>> => {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  deleteTable: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },
};