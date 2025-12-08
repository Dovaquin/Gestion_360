import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Product, Customer, Transaction, TransactionType, User } from '../types';
import { useSessionContext } from './SessionContext'; // Import useSessionContext
import { supabase } from '../integrations/supabase/client'; // Import supabase client

interface StoreContextType {
  users: User[];
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  
  // Data Actions
  addProduct: (product: Omit<Product, 'id' | 'user_id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'user_id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>; // Added updateCustomer
  deleteCustomer: (id: string) => Promise<void>; // Added deleteCustomer
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>; // Added updateTransaction
  deleteTransaction: (id: string) => Promise<void>; // Added deleteTransaction
  
  // User Management Actions (for profiles table)
  addUser: (user: Omit<User, 'id'> & { email: string, password?: string }) => Promise<void>; // For creating new auth users + profile
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const { supabaseUser, isAuthenticated, isLoading, fetchAppUserProfile } = useSessionContext();

  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const currentUserId = supabaseUser?.id;

  // --- Fetch Data from Supabase ---
  const fetchProducts = useCallback(async () => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', currentUserId);
    if (error) console.error('Error fetching products:', error);
    else setProducts(data.map(p => ({
      id: p.id,
      user_id: p.user_id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      price: parseFloat(p.price), // Convert numeric to float
      imageUrl: p.image_url,
    })));
  }, [currentUserId]);

  const fetchCustomers = useCallback(async () => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', currentUserId);
    if (error) console.error('Error fetching customers:', error);
    else setCustomers(data.map(c => ({
      id: c.id,
      user_id: c.user_id,
      name: c.name,
      debt: parseFloat(c.debt), // Convert numeric to float
      imageUrl: c.image_url,
    })));
  }, [currentUserId]);

  const fetchTransactions = useCallback(async () => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', currentUserId);
    if (error) console.error('Error fetching transactions:', error);
    else setTransactions(data.map(t => ({
      id: t.id,
      user_id: t.user_id,
      type: t.type as TransactionType,
      description: t.description,
      amount: parseFloat(t.amount), // Convert numeric to float
      date: t.date,
      customerId: t.customer_id,
    })));
  }, [currentUserId]);

  const fetchUsers = useCallback(async () => {
    if (!currentUserId) return; // Only fetch users if an admin is logged in
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, pin, role, permissions');

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      setUsers([]);
      return;
    }

    setUsers(profiles.map(profile => ({
      id: profile.id,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      avatarUrl: profile.avatar_url || 'https://i.pravatar.cc/150',
      pin: profile.pin || '',
      role: profile.role as 'admin' | 'employee',
      permissions: profile.permissions as UserPermissions,
    })));
  }, [currentUserId]);


  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      fetchProducts();
      fetchCustomers();
      fetchTransactions();
      fetchUsers(); // Fetch all users if authenticated
    } else {
      // Clear data if not authenticated
      setProducts([]);
      setCustomers([]);
      setTransactions([]);
      setUsers([]);
    }
  }, [isAuthenticated, currentUserId, fetchProducts, fetchCustomers, fetchTransactions, fetchUsers]);

  // --- Data Actions (Supabase Integration) ---

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'user_id'>) => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('products')
      .insert({ 
        ...product, 
        user_id: currentUserId,
        image_url: product.imageUrl,
        price: product.price,
      })
      .select()
      .single();
    if (error) console.error('Error adding product:', error);
    else setProducts(prev => [...prev, { ...data, imageUrl: data.image_url, price: parseFloat(data.price) }]);
  }, [currentUserId]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('products')
      .update({ 
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        stock: updatedProduct.stock,
        price: updatedProduct.price,
        image_url: updatedProduct.imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedProduct.id)
      .eq('user_id', currentUserId)
      .select()
      .single();
    if (error) console.error('Error updating product:', error);
    else setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...data, imageUrl: data.image_url, price: parseFloat(data.price) } : p));
  }, [currentUserId]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!currentUserId) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUserId);
    if (error) console.error('Error deleting product:', error);
    else setProducts(prev => prev.filter(p => p.id !== id));
  }, [currentUserId]);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'user_id'>) => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('customers')
      .insert({ 
        ...customer, 
        user_id: currentUserId,
        image_url: customer.imageUrl,
        debt: customer.debt,
      })
      .select()
      .single();
    if (error) console.error('Error adding customer:', error);
    else setCustomers(prev => [...prev, { ...data, imageUrl: data.image_url, debt: parseFloat(data.debt) }]);
  }, [currentUserId]);

  const updateCustomer = useCallback(async (updatedCustomer: Customer) => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('customers')
      .update({
        name: updatedCustomer.name,
        debt: updatedCustomer.debt,
        image_url: updatedCustomer.imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedCustomer.id)
      .eq('user_id', currentUserId)
      .select()
      .single();
    if (error) console.error('Error updating customer:', error);
    else setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? { ...data, imageUrl: data.image_url, debt: parseFloat(data.debt) } : c));
  }, [currentUserId]);

  const deleteCustomer = useCallback(async (id: string) => {
    if (!currentUserId) return;
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUserId);
    if (error) console.error('Error deleting customer:', error);
    else setCustomers(prev => prev.filter(c => c.id !== id));
  }, [currentUserId]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('transactions')
      .insert({ 
        ...transaction, 
        user_id: currentUserId,
        customer_id: transaction.customerId,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
      })
      .select()
      .single();
    if (error) console.error('Error adding transaction:', error);
    else setTransactions(prev => [...prev, { ...data, amount: parseFloat(data.amount) }]);
  }, [currentUserId]);

  const updateTransaction = useCallback(async (updatedTransaction: Transaction) => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('transactions')
      .update({
        type: updatedTransaction.type,
        description: updatedTransaction.description,
        amount: updatedTransaction.amount,
        date: updatedTransaction.date,
        customer_id: updatedTransaction.customerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedTransaction.id)
      .eq('user_id', currentUserId)
      .select()
      .single();
    if (error) console.error('Error updating transaction:', error);
    else setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? { ...data, amount: parseFloat(data.amount) } : t));
  }, [currentUserId]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!currentUserId) return;
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUserId);
    if (error) console.error('Error deleting transaction:', error);
    else setTransactions(prev => prev.filter(t => t.id !== id));
  }, [currentUserId]);

  // --- User Management Actions (for profiles table) ---
  // Note: Creating a new user (auth.users) is typically done via the Auth UI or admin functions.
  // This `addUser` function is a placeholder if you need to manually create a user and their profile.
  const addUser = useCallback(async (newUser: Omit<User, 'id'> & { email: string, password?: string }) => {
    if (!currentUserId) return; // Only admin can add users
    // This would typically involve supabase.auth.signUp or supabase.auth.admin.createUser
    // For now, we'll simulate adding to the local list and assume profile creation is handled by trigger
    console.warn("addUser in StoreContext is a placeholder. For real user creation, use Supabase Auth methods.");
    // Example if you were to create a user via admin:
    // const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    //   email: newUser.email,
    //   password: newUser.password,
    //   user_metadata: { first_name: newUser.name.split(' ')[0], last_name: newUser.name.split(' ').slice(1).join(' '), avatar_url: newUser.avatarUrl },
    // });
    // if (authUser) {
    //   // Profile will be created by trigger
    //   fetchUsers(); // Refresh user list
    // }
  }, [currentUserId, fetchUsers]);

  const updateUser = useCallback(async (updatedUser: User) => {
    if (!currentUserId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ 
        first_name: updatedUser.name.split(' ')[0] || '',
        last_name: updatedUser.name.split(' ').slice(1).join(' ') || '',
        pin: updatedUser.pin,
        role: updatedUser.role,
        permissions: updatedUser.permissions,
        avatar_url: updatedUser.avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedUser.id);

    if (error) {
      console.error('Error updating user profile:', error);
    } else {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (currentUserId === updatedUser.id) {
        fetchAppUserProfile(updatedUser.id); // Refresh current user's profile in session context
      }
    }
  }, [currentUserId, fetchAppUserProfile]);

  const deleteUser = useCallback(async (id: string) => {
    if (!currentUserId) return;
    // This would typically involve supabase.auth.admin.deleteUser(id)
    // which would cascade delete the profile.
    console.warn("deleteUser in StoreContext is a placeholder. For real user deletion, use Supabase Auth admin methods.");
    // const { error } = await supabase.auth.admin.deleteUser(id);
    // if (error) console.error('Error deleting user:', error);
    // else fetchUsers(); // Refresh user list
  }, [currentUserId, fetchUsers]);


  const value = useMemo(() => ({
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
  }), [
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