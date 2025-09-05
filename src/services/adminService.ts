import api from './api';
import {
  ApiResponse,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  MenuItem,
  MenuItemListResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  Order,
  OrderListResponse,
  OrderWithItemsListResponse,
  Table,
  CreateTableRequest,
  UpdateTableRequest,
  PaymentListResponse,
  MenuOption,
  CreateOptionRequest,
  UpdateOptionRequest,
  MenuItemOption,
  CreateKitchenStationRequest,
  UpdateKitchenStationRequest,
  KitchenStation
} from '@/types';

export const adminService = {
  // Category APIs
  createCategory: async (data: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  getCategories: async (on_active?: boolean): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories?only_active=' + (on_active ? 'true' : 'false'));
    return response.data;
  },

  getCategory: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getCategoryByName: async (name: string): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/categories/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Menu Item APIs
  createMenuItem: async (data: CreateMenuItemRequest): Promise<ApiResponse<MenuItem>> => {
    const response = await api.post('/menu-items', data);
    return response.data;
  },

  getMenuItems: async (limit = 10, offset = 0): Promise<ApiResponse<MenuItemListResponse>> => {
    const response = await api.get(`/menu-items?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getMenuItem: async (id: number): Promise<ApiResponse<MenuItem>> => {
    const response = await api.get(`/menu-items/${id}`);
    return response.data;
  },

  getMenuItemsByCategory: async (
    categoryId: number,
    limit = 10,
    offset = 0
  ): Promise<ApiResponse<MenuItemListResponse>> => {
    const response = await api.get(`/menu-items/category/${categoryId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  searchMenuItems: async (
    query: string,
    limit = 10,
    offset = 0
  ): Promise<ApiResponse<MenuItemListResponse>> => {
    const response = await api.get(`/menu-items/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
    return response.data;
  },

  updateMenuItem: async (id: number, data: UpdateMenuItemRequest): Promise<ApiResponse<MenuItem>> => {
    const response = await api.put(`/menu-items/${id}`, data);
    return response.data;
  },

  deleteMenuItem: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/menu-items/${id}`);
    return response.data;
  },

  // Order APIs
  getOrders: async (limit = 10, offset = 0): Promise<ApiResponse<OrderListResponse>> => {
    const response = await api.get(`/orders?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getOrdersWithItems: async (limit = 10, offset = 0): Promise<ApiResponse<OrderWithItemsListResponse>> => {
    const response = await api.get(`/orders/items?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getOrder: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getOrderWithItems: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}/items`);
    return response.data;
  },

  updateOrderStatus: async (id: number, data: { status: string }): Promise<ApiResponse<Order>> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  closeOrder: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.put(`/orders/${id}/close`);
    return response.data;
  },

  getOrdersByStatus: async (
    status: string,
    limit = 10,
    offset = 0
  ): Promise<ApiResponse<OrderListResponse>> => {
    const response = await api.get(`/orders/search?status=${status}&limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getOrdersByDateRange: async (
    startDate: string,
    endDate: string,
    limit = 10,
    offset = 0
  ): Promise<ApiResponse<OrderListResponse>> => {
    const response = await api.get(
      `/orders/date-range?start_date=${startDate}&end_date=${endDate}&limit=${limit}&offset=${offset}`
    );
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

  createTable: async (data: CreateTableRequest): Promise<ApiResponse<Table>> => {
    const response = await api.post('/tables', data);
    return response.data;
  },

  getTable: async (id: number): Promise<ApiResponse<Table>> => {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  getTableByNumber: async (number: number): Promise<ApiResponse<Table>> => {
    const response = await api.get(`/tables/number/${number}`);
    return response.data;
  },

  getTableByQRCode: async (qrCode: string): Promise<ApiResponse<Table>> => {
    const response = await api.get(`/tables/qr?qr_code=${encodeURIComponent(qrCode)}`);
    return response.data;
  },

  updateTable: async (id: number, data: UpdateTableRequest): Promise<ApiResponse<Table>> => {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  deleteTable: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },

  // Payment APIs
  getPayments: async (limit = 10, offset = 0): Promise<ApiResponse<PaymentListResponse>> => {
    const response = await api.get(`/payments?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getPaymentsByMethod: async (
    method: string,
    limit = 10,
    offset = 0
  ): Promise<ApiResponse<PaymentListResponse>> => {
    const response = await api.get(`/payments/search?method=${method}&limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getPaymentsByDateRange: async (
    startDate: string,
    endDate: string,
    limit = 10,
    offset = 0
  ): Promise<ApiResponse<PaymentListResponse>> => {
    const response = await api.get(
      `/payments/date-range?start_date=${startDate}&end_date=${endDate}&limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  getOptions: async (): Promise<ApiResponse<MenuOption[]>> => {
    const response = await api.get('/options');
    return response.data;
  },

  createOption: async (data: CreateOptionRequest): Promise<ApiResponse<MenuOption>> => {
    const response = await api.post('/options', data);
    return response.data;
  },

  updateOption: async (id: number, data: UpdateOptionRequest): Promise<ApiResponse<MenuOption>> => {
    const response = await api.put(`/options/${id}`, data);
    return response.data;
  },

  deleteOption: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/options/${id}`);
    return response.data;
  },

  // Menu Item Options APIs
  updateMenuItemOptions: async (menuItemId: number, data: { option_ids: number[] }): Promise<ApiResponse<void>> => {
    const response = await api.put(`/menu-items/${menuItemId}/options`, data);
    return response.data;
  },

  getMenuItemOptions: async (menuItemId: number): Promise<ApiResponse<MenuItemOption[]>> => {
    const response = await api.get(`/menu-items/${menuItemId}/options`);
    return response.data;
  },
// Kitchen Station APIs
  getKitchenStations: async (onlyAvailable?: boolean): Promise<ApiResponse<KitchenStation[]>> => {
    const response = await api.get('/kitchen?only_available=' + (onlyAvailable ? 'true' : 'false'));
    return response.data;
  },

  createKitchenStation: async (data: CreateKitchenStationRequest): Promise<ApiResponse<KitchenStation>> => {
    const response = await api.post('/kitchen', data);
    return response.data;
  },

  // getKitchenStation: async (id: number): Promise<ApiResponse<KitchenStation>> => {
  //   const response = await api.get(`/kitchen/${id}`);
  //   return response.data;
  // },

  updateKitchenStation: async (id: number, data: UpdateKitchenStationRequest): Promise<ApiResponse<KitchenStation>> => {
    const response = await api.put(`/kitchen/${id}`, data);
    return response.data;
  },

  deleteKitchenStation: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/kitchen/${id}`);
    return response.data;
  },
  
};