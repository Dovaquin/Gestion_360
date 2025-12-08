
export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  imageUrl: string;
}

export interface Customer {
  id: string;
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
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO String
  customerId?: string;
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
  pin: string;
  role: 'admin' | 'employee';
  permissions: UserPermissions;
}

export interface Stats {
  sales: number;
  expenses: number;
  balance: number;
  salesGrowth: number;
  expensesGrowth: number;
  balanceGrowth: number;
}
