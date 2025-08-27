// Base API Response Structure
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items?: T[];
  total: number;
  limit: number;
  offset: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  display_order?: number;
  is_active: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  display_order?: number;
  is_active: boolean;
}

// Menu Item Types
export interface MenuItemOption {
  item_id: number;
  option_id: number;
  is_active: boolean;
  option?: MenuOption;
  values?: OptionValue[];
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  kitchen_station: string;
  is_active: boolean;
  is_recommended: boolean;
  display_order: number;
  menu_option: MenuItemOption[];
}

export interface MenuItemListResponse {
  items: MenuItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateMenuItemRequest {
  category_id: number;
  kitchen_station_id: number;
  name: string;
  description?: string;
  price: number;
}

export interface UpdateMenuItemRequest {
  category_id: number;
  name: string;
  description?: string;
  price: number;
}

// Table Types
export interface Table {
  id: number;
  table_number: number;
  qr_code: string;
  seating: number;
}

export interface CreateTableRequest {
  table_number: number;
  seating: number;
}

export interface UpdateTableRequest {
  table_number: number;
  seating: number;
}

// Order Types
export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  menu_item?: MenuItem;
  name: string;
  kitchen_station?: string;
}

export interface Order {
  id: number;
  table_id: number;
  status: string;
  created_at: string;
  closed_at?: string;
  table?: Table;
}

export interface OrderWithItems {
  id: number;
  table_id: number;
  status: string;
  items: OrderItem[];
  total: number;
  created_at: string;
  closed_at?: string;
  table?: Table;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrderWithItemsListResponse {
  orders: OrderWithItems[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateOrderRequest {
  table_id: number;
}

export interface UpdateOrderRequest {
  status: string;
}

// Order Item Types
export interface OrderItemRequest {
  menu_item_id: number;
  quantity: number;
  options?: OrderItemOptionRequest[];
}

export interface OrderItemOptionRequest {
  option_id: number;
  option_val_id: number;
}

export interface AddOrderItemListRequest {
  order_id: number;
  items: OrderItemRequest[];
}

export interface ManageOrderItemListRequest {
  order_id: number;
  items: ManageOrderItemItemRequest[];
}

export interface ManageOrderItemItemRequest {
  order_item_id?: number;
  menu_item_id: number;
  quantity: number;
  options?: OrderItemOptionManageRequest[];
  action?: 'add' | 'update' | 'delete';
}

export interface OrderItemOptionManageRequest {
  option_id: number;
  option_val_id: number;
  action?: 'add' | 'update' | 'delete';
}

// Payment Types
export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  method: string;
  paid_at: string;
  order?: Order;
}

export interface ProcessPaymentRequest {
  order_id: number;
  amount: number;
  method: 'cash' | 'credit_card' | 'wallet';
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  limit: number;
  offset: number;
}

// Menu Option Types
export interface MenuOption {
  id: number;
  name: string;
  type: string;
  is_required: boolean;
}

export interface OptionValue {
  id: number;
  option_id: number;
  name: string;
  is_default: boolean;
  additional_price: number;
  display_order: number;
  option?: MenuOption;
}

export interface OrderItemOption {
  order_item_id: number;
  option_id: number;
  value_id: number;
  additional_price: number;
  option?: MenuOption;
  value?: OptionValue;
}

// Enhanced Order Detail Types
export interface OrderDetailResponse {
  id: number;
  order_number?: number;
  table_id: number;
  table_number?: number;
  status: string;
  payment_status?: string;
  notes?: string;
  special_instructions?: string;
  items: OrderItemDetailResponse[];
  item_count: number;
  subtotal: number;
  discount?: number;
  tax?: number;
  service_charge?: number;
  total: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  table?: Table;
  payment?: Payment;
}

export interface OrderItemDetailResponse {
  id: number;
  order_id: number;
  item_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status?: string;
  kitchen_station?: string;
  kitchen_notes?: string;
  options?: OrderItemOption[];
  created_at: string;
  updated_at: string;
  menu_item?: MenuItem;
}

// Kitchen Types
export interface KitchenStation {
  id: number;
  name: string;
  is_available: boolean;
}

export interface CreateKitchenStationRequest {
  name: string;
  is_available: boolean;
}

export interface UpdateKitchenStationRequest {
  name: string;
  is_available: boolean;
}