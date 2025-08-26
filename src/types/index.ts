export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
  category?: Category;
}

export interface Table {
  id: number;
  table_number: number;
  qr_code: string;
  seating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  menu_item?: MenuItem;
}

export interface Order {
  id: number;
  table_id: number;
  status: 'open' | 'closed';
  notes?: string;
  items?: OrderItem[];
  total?: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  table?: Table;
}

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