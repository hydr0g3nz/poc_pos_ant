// src/services/menuOptionsService.ts
import api from "./api";
import {
  ApiResponse,
  OptionWithValues,
  CreateOptionWithValuesRequest,
  UpdateOptionWithValuesRequest,
  MenuItemWithOptions,
  CreateMenuItemWithOptionsRequest,
  UpdateMenuItemWithOptionsRequest,
  MenuItemWithOptionsListResponse,
  BulkAssignOptionsRequest,
} from "@/types";

export const menuOptionsService = {
  // Options with Values Management
  getOptionsWithValues: async (): Promise<ApiResponse<OptionWithValues[]>> => {
    const response = await api.get("/menu-with-options/options");
    return response.data;
  },

  getOptionWithValues: async (
    id: number
  ): Promise<ApiResponse<OptionWithValues>> => {
    const response = await api.get(`/menu-with-options/options/${id}`);
    return response.data;
  },

  createOptionWithValues: async (
    data: CreateOptionWithValuesRequest
  ): Promise<ApiResponse<OptionWithValues>> => {
    const response = await api.post("/menu-with-options/options", data);
    return response.data;
  },

  updateOptionWithValues: async (
    id: number,
    data: UpdateOptionWithValuesRequest
  ): Promise<ApiResponse<OptionWithValues>> => {
    const response = await api.put(`/menu-with-options/options/${id}`, data);
    return response.data;
  },

  deleteOptionWithValues: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/menu-with-options/options/${id}`);
    return response.data;
  },

  // Menu Items with Options Management
  getMenuItemsWithOptions: async (params?: {
    category_id?: number;
    is_active?: boolean;
    is_recommended?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<MenuItemWithOptionsListResponse>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await api.get(
      `/menu-with-options/items?${queryParams.toString()}`
    );
    return response.data;
  },

  getMenuItemWithOptions: async (
    id: number
  ): Promise<ApiResponse<MenuItemWithOptions>> => {
    const response = await api.get(`/menu-with-options/items/${id}`);
    return response.data;
  },

  createMenuItemWithOptions: async (
    data: CreateMenuItemWithOptionsRequest
  ): Promise<ApiResponse<MenuItemWithOptions>> => {
    const response = await api.post("/menu-with-options/items", data);
    return response.data;
  },

  updateMenuItemWithOptions: async (
    id: number,
    data: UpdateMenuItemWithOptionsRequest
  ): Promise<ApiResponse<MenuItemWithOptions>> => {
    const response = await api.put(`/menu-with-options/items/${id}`, data);
    return response.data;
  },

  bulkAssignOptions: async (
    data: BulkAssignOptionsRequest
  ): Promise<ApiResponse<void>> => {
    const response = await api.post(
      "/menu-with-options/items/bulk-assign",
      data
    );
    return response.data;
  },
};
