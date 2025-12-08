import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/Store';
import { SessionContextProvider, useSessionContext } from './context/SessionContext'; // Import SessionContext
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import NewCustomer from './pages/NewCustomer';
import CustomerDetails from './pages/CustomerDetails';
import NewTransaction from './pages/NewTransaction';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import NewProduct from './pages/NewProduct';
import ProductDetails from './pages/ProductDetails';
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';

// Protected Route Component
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useSessionContext();
  const location = useLocation();

  if (isLoading) {
    // Optionally render a loading spinner or placeholder
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark text-white">
        Cargando...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login, preserving the attempted path
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useSessionContext();
  const location = useLocation();

  useEffect(() => {
    // Redirect authenticated users from login page to dashboard
    if (isAuthenticated && location.pathname === '/') {
      // Use a timeout to ensure the session context is fully updated before navigating
      const timer = setTimeout(() => {
        window.location.href = '/#/dashboard'; // Force a full page reload for hash router
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, location.pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/inventory/new" element={<ProtectedRoute><NewProduct /></ProtectedRoute>} />
        <Route path="/inventory/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/customers/new" element={<ProtectedRoute><NewCustomer /></ProtectedRoute>} />
        <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
        <Route path="/transaction/new" element={<ProtectedRoute><NewTransaction /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        
        {/* User Management Routes */}
        <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
        <Route path="/users/new" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <SessionContextProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SessionContextProvider>
    </StoreProvider>
  );
};

export default App;