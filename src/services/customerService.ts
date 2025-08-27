import api from './api';
import {
  ApiResponse,
  MenuItem,
  MenuItemListResponse,
  Category,
  OrderItem,
  OrderDetailResponse,
  OrderWithItemsListResponse,
  AddOrderItemListRequest,
  ManageOrderItemListRequest
} from '@/types';

export const customerService = {
  // Menu APIs
  getMenuItems: async (limit = 10, page = 1): Promise<ApiResponse<MenuItemListResponse>> => {
    const response = await api.get(`/customers/menu?limit=${limit}&page=${page}`);
    return response.data;
  },

  getMenuItem: async (id: number): Promise<ApiResponse<MenuItem>> => {
    const response = await api.get(`/customers/menu/items/${id}`);
    return response.data;
  },

  searchMenuItems: async (
    query: string,
    limit = 10,
    page = 1
  ): Promise<ApiResponse<MenuItemListResponse>> => {
    const response = await api.get(
      `/customers/menu/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`
    );
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/customers/category');
    return response.data;
  },

  // Order APIs
  addOrderItems: async (orderData: AddOrderItemListRequest): Promise<ApiResponse<OrderItem[]>> => {
    const response = await api.post('/customers/orders/items', orderData);
    return response.data;
  },

  manageOrderItems: async (orderData: ManageOrderItemListRequest): Promise<ApiResponse<OrderItem[]>> => {
    const response = await api.post('/customers/orders/items', orderData);
    return response.data;
  },

  getOrdersByStatus: async (
    status: string,
    limit = 10,
    page = 1
  ): Promise<ApiResponse<OrderWithItemsListResponse>> => {
    const response = await api.get(`/customers/orders/status?status=${status}&limit=${limit}&page=${page}`);
    return response.data;
  },

  getOrders: async (limit = 10, page = 1): Promise<ApiResponse<OrderWithItemsListResponse>> => {
    const response = await api.get(`/customers/orders?limit=${limit}&page=${page}`);
    return response.data;
  },

  getOrderDetail: async (id: number): Promise<ApiResponse<OrderDetailResponse>> => {
    const response = await api.get(`/customers/orders/${id}`);
    return response.data;
  },
};