import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ProductManagement from './pages/manager/ProductManagement';
import UserManagement from './pages/manager/UserManagement';
import CashierDashboard from './pages/cashier/CashierDashboard';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useScrollToTop } from './hooks/useScrollToTop';
import AlertContainer from './components/ui/Alert';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';
import { Role } from './types';
import type { ReactNode } from 'react';
import './App.css';
import './styles/coral-theme.css';

const ScrollToTopWrapper = () => {
  useScrollToTop();
  return null;
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Memverifikasi akun..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Mengarahkan ke dashboard..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === Role.MANAGER) {
    return <Navigate to="/manager/dashboard" replace />;
  } else if (user?.role === Role.CASHIER) {
    return <Navigate to="/cashier/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTopWrapper />
          <AlertContainer />
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/system" element={<RoleBasedRedirect />} />
          
          <Route 
            path="/manager/dashboard" 
            element={
              <ProtectedRoute requiredRole={Role.MANAGER}>
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager/products" 
            element={
              <ProtectedRoute requiredRole={Role.MANAGER}>
                <ErrorBoundary fallback={<LoadingScreen message="Terjadi kesalahan loading produk..." />}>
                  <ProductManagement />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager/users" 
            element={
              <ProtectedRoute requiredRole={Role.MANAGER}>
                <ErrorBoundary fallback={<LoadingScreen message="Terjadi kesalahan loading users..." />}>
                  <UserManagement />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cashier/dashboard" 
            element={
              <ProtectedRoute requiredRole={Role.CASHIER}>
                <ErrorBoundary fallback={<LoadingScreen message="Terjadi kesalahan loading kasir..." />}>
                  <CashierDashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
