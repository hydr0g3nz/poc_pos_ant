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
  kitchen_station_id: number;
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
  is_available: boolean;
  seating: number;
  current_order: OrderTableDetails | null;
}

export interface OrderTableDetails {
  order_id: number;
  order_number: number;
  status: string;
  qr_code: string;
  created_at: string;
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
  action?: "add" | "update" | "delete";
}

export interface OrderItemOptionManageRequest {
  option_id: number;
  option_val_id: number;
  action?: "add" | "update" | "delete";
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
  method: "cash" | "credit_card" | "wallet";
}

export interface PaymentListResponse {
  payments: Payment[];
  total: number;
  limit: number;
  offset: number;
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
  qr_code: string;
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

export interface OptionValue {
  id: number;
  optionId: number;
  name: string;
  isDefault: boolean;
  additionalPrice: string; // เปลี่ยนเป็น string ตาม API
}

export interface MenuOption {
  id: number;
  name: string;
  type: "single" | "multiple";
  isRequired: boolean;
  optionValues: OptionValue[];
}

export interface MenuItemOption {
  id: number;
  optionId: number;
  is_active: boolean;
  option?: MenuOption;
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
  menu_option: MenuItemOption[]; // แก้ไขให้ตรงกับ API
}

// เพิ่ม interface สำหรับการเลือก option
export interface SelectedOption {
  optionId: number;
  valueId: number;
  additionalPrice: number;
}

// src/types/index.ts - แก้ไข CartItem
export interface CartItem {
  id: number;
  menu_item_id: number;
  name: string;
  price: number; // ราคาต่อหน่วยรวม options แล้ว
  quantity: number;
  selectedOptions?: SelectedOption[];
  optionsText?: string; // เก็บข้อความ options ไว้
  notes?: string;
}

// เพิ่มใน src/types/index.ts

export interface CreateOptionRequest {
  name: string;
  type: "single" | "multiple";
  isRequired: boolean;
  values: CreateOptionValueRequest[];
}

export interface UpdateOptionRequest {
  name: string;
  type: "single" | "multiple";
  isRequired: boolean;
}

export interface CreateOptionValueRequest {
  name: string;
  additionalPrice: string;
  isDefault: boolean;
  display_order?: number;
}

export interface UpdateOptionValueRequest {
  id?: number;
  name: string;
  additionalPrice: string;
  isDefault: boolean;
  display_order?: number;
}
// เพิ่มใน src/types/index.ts

export interface OptionValue {
  id: number;
  option_id: number;
  name: string;
  is_default: boolean;
  additional_price: number;
  display_order: number;
}

export interface OptionWithValues {
  id: number;
  name: string;
  type: "single" | "multiple";
  is_required: boolean;
  values: OptionValue[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateOptionWithValuesRequest {
  name: string;
  type: "single" | "multiple";
  is_required: boolean;
  values: CreateOptionValueRequest[];
}

export interface CreateOptionValueRequest {
  name: string;
  additional_price: string;
  is_default: boolean;
  display_order?: number;
}

export interface UpdateOptionWithValuesRequest {
  name: string;
  type: "single" | "multiple";
  is_required: boolean;
  values: UpdateOptionValueRequest2[];
}

export interface UpdateOptionValueRequest2 {
  id?: number;
  name: string;
  additional_price: number;
  is_default: boolean;
  display_order?: number;
  action?: "add" | "update" | "delete";
}

export interface MenuItemWithOptions {
  id: number;
  category_id: number;
  kitchen_station_id: number;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  is_recommended: boolean;
  display_order: number;
  category: string;
  kitchen_station: string;
  available_options: MenuItemOptionDetail[];
  created_at: string;
  updated_at: string;
}

export interface MenuItemOptionDetail {
  option_id: number;
  option_name: string;
  option_type: string;
  is_required: boolean;
  is_active: boolean;
  values: OptionValue[];
}

export interface CreateMenuItemWithOptionsRequest {
  category_id: number;
  kitchen_station_id: number;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  is_recommended: boolean;
  display_order?: number;
  assigned_options?: AssignMenuItemOptionRequest[];
}

export interface UpdateMenuItemWithOptionsRequest {
  category_id: number;
  kitchen_station_id: number;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  is_recommended: boolean;
  display_order?: number;
  assigned_options?: AssignMenuItemOptionRequest[];
}

export interface AssignMenuItemOptionRequest {
  option_id: number;
  is_active: boolean;
}

export interface MenuItemWithOptionsListResponse {
  items: MenuItemWithOptions[];
  total: number;
  limit: number;
  offset: number;
}

export interface BulkAssignOptionsRequest {
  menu_item_ids: number[];
  option_ids: number[];
  is_active: boolean;
}

// เพิ่มใน src/types/index.ts

export interface OrderTotalResponse {
  order_id: number;
  items: OrderItem[];
  total: number;
  item_count: number;
}

export interface ProcessPaymentRequest {
  order_id: number;
  amount: number;
  method: "cash" | "credit_card" | "wallet";
}

export interface OrderTotal {
  order_id: number;
  subtotal: number;
  discount: number;
  tax: number;
  service_charge: number;
  total: number;
  items: OrderItemWithTotal[];
}

export interface OrderItemWithTotal {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  options_total: number;
  subtotal: number;
}

// เพิ่มใน src/types/index.ts

export interface AddOrderItemRequest {
  order_id: number;
  item_id: number;
  quantity: number;
}

export interface UpdateOrderItemRequest {
  quantity: number;
}

export interface EditOrderItem {
  id?: number;
  menu_item_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  options?: SelectedOrderOption[];
  isNew?: boolean;
  isModified?: boolean;
  toDelete?: boolean;
}

export interface SelectedOrderOption {
  option_id: number;
  option_name: string;
  value_id: number;
  value_name: string;
  additional_price: number;
}

export interface MenuItemOption {
  item_id: number;
  option_id: number;
  is_active: boolean;
  option?: MenuOption;
  values?: OptionValue[];
}

// src/types/index.ts - เพิ่ม interface
export interface TableWithStatus extends Table {
  has_open_order: boolean;
  open_order?: Order;
  customer_count?: number;
}

export interface TableStatusResponse {
  has_open_order: boolean;
  order?: Order;
}
