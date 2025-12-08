export interface Product {
  id: string;
  user_id: string; // Added for Supabase RLS
  name: string;
  sku: string;
  stock: number;
  price: number;
  imageUrl: string;
}

export interface Customer {
  id: string;
  user_id: string; // Added for Supabase RLS
  name: string;
  debt: number;
  imageUrl: string;
}

export enum TransactionType {
  SALE = 'Venta',
  EXPENSE = 'Gasto'
}

export interface Transaction {
  id: string;
  user_id: string; // Added for Supabase RLS
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO String
  customerId?: string; // Optional, can be null
}

export interface UserPermissions {
  inventory: boolean;
  sales: boolean;
  customers: boolean;
  reports: boolean;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  pin: string; // Stored in profiles table
  role: 'admin' | 'employee'; // Stored in profiles table
  permissions: UserPermissions; // Stored in profiles table as JSONB
}

export interface Stats {
  sales: number;
  expenses: number;
  balance: number;
  salesGrowth: number;
  expensesGrowth: number;
  balanceGrowth: number;
}