export const Role = {
  MANAGER: 'manager',
  CASHIER: 'cashier'
} as const;

export type Role = typeof Role[keyof typeof Role];

export const RoleDisplay = {
  manager: 'Manager',
  cashier: 'Cashier'
} as const;

export const PaymentMethod = {
  QRIS: 'QRIS',
  CASH: 'Cash',
  DEBIT_CARD: 'Debit Card'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  cashierId: string;
  cashier?: User;
  totalAmount: number;
  metadata: OrderMetadata;
  items: OrderItem[];
}

export interface OrderMetadata {
  note?: string;
  takeaway: boolean;
  paymentMethod: PaymentMethod;
  paidAmount?: number;
  changeAmount?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  dailyRevenue: { date: string; amount: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  topProducts: { product: Product; totalSold: number }[];
  recentOrders: Order[];
}