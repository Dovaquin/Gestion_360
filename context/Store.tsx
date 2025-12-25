
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Product, Customer, Transaction, TransactionType, User } from '../types';

interface StoreContextType {
  user: User | null; // Currently logged in user
  users: User[]; // All registered users
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  
  // Data Actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  // User Management Actions
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  // Auth Actions
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Taza de Cerámica Artesanal', sku: 'SKU001', stock: 25, price: 1500, imageUrl: 'https://picsum.photos/200/200?random=1' },
  { id: '2', name: 'Cuaderno de Cuero', sku: 'SKU002', stock: 10, price: 850, imageUrl: 'https://picsum.photos/200/200?random=2' },
  { id: '3', name: 'Botella de Acero Inoxidable', sku: 'SKU003', stock: 50, price: 2300, imageUrl: 'https://picsum.photos/200/200?random=3' },
  { id: '4', name: 'Vela Aromática de Vainilla', sku: 'SKU004', stock: 32, price: 950, imageUrl: 'https://picsum.photos/200/200?random=4' }
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Alejandro Martínez', debt: 150000, imageUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sofía Rodríguez', debt: 5400.50, imageUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Valentina Gómez', debt: 25800, imageUrl: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Mateo Fernández', debt: 1250, imageUrl: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Lucas Díaz', debt: 89300, imageUrl: 'https://i.pravatar.cc/150?u=5' }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: TransactionType.SALE, description: 'Venta inicial', amount: 50000, date: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: 't2', type: TransactionType.SALE, description: 'Venta grande', amount: 120000, date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 't3', type: TransactionType.EXPENSE, description: 'Reposición', amount: 30000, date: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 't4', type: TransactionType.SALE, description: 'Venta tarde', amount: 80000, date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 't5', type: TransactionType.SALE, description: 'Venta mañana', amount: 45000, date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 't6', type: TransactionType.EXPENSE, description: 'Alquiler', amount: 150000, date: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 't7', type: TransactionType.SALE, description: 'Venta actual', amount: 200000, date: new Date().toISOString() },
];

const INITIAL_USERS: User[] = [
  {
    id: 'admin',
    name: 'Administrador',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    pin: '1234',
    role: 'admin',
    permissions: { inventory: true, sales: true, customers: true, reports: true }
  },
  {
    id: 'emp1',
    name: 'Empleado Demo',
    avatarUrl: 'https://i.pravatar.cc/150?u=emp1',
    pin: '0000',
    role: 'employee',
    permissions: { inventory: true, sales: true, customers: false, reports: false }
  }
];

// Helper to get from local storage
const getSaved = <T,>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing saved data", e);
    }
  }
  return initial;
};

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  // State initialization with persistence check
  const [users, setUsers] = useState<User[]>(() => getSaved('app_users', INITIAL_USERS));
  const [products, setProducts] = useState<Product[]>(() => getSaved('app_products', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState<Customer[]>(() => getSaved('app_customers', INITIAL_CUSTOMERS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getSaved('app_transactions', INITIAL_TRANSACTIONS));
  
  // Auth state (not persisted to force login on refresh)
  const [user, setUser] = useState<User | null>(null); // Current Logged In User
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Persistence Effects
  useEffect(() => localStorage.setItem('app_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('app_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('app_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('app_transactions', JSON.stringify(transactions)), [transactions]);

  // --- Actions ---

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  }, []);

  const updateCustomer = useCallback((updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  }, []);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // User Management
  const addUser = useCallback((newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If updating current user, update session too
    if (user && user.id === updatedUser.id) {
        setUser(updatedUser);
    }
  }, [user]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  // Auth
  const login = useCallback((pin: string) => {
    const foundUser = users.find(u => u.pin === pin);
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    users,
    products,
    customers,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addUser,
    updateUser,
    deleteUser,
    isAuthenticated,
    login,
    logout
  }), [
    user, 
    users,
    products, 
    customers, 
    transactions, 
    isAuthenticated,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addUser,
    updateUser,
    deleteUser,
    login,
    logout
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
