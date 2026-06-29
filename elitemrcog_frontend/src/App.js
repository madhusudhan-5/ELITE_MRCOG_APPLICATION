import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SessionManager from './components/common/SessionManager';
import './App.css';

// Pages & Layouts
import LandingPage from './pages/LandingPage/LandingPage';
import AboutUsPage from './pages/AboutUsPage/AboutUsPage';
import AuthLayout from './layouts/AuthLayout/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';
import DashboardHome from './pages/Dashboard/DashboardHome';
import ReadingLibrary from './pages/Dashboard/ReadingLibrary';
import VideoLibrary from './pages/Dashboard/VideoLibrary';
import ModuleDetail from './pages/Dashboard/ModuleDetail';
import VideoModuleDetail from './pages/Dashboard/VideoModuleDetail';
import Profile from './pages/Dashboard/Profile';
import SubscriptionPage from './pages/Dashboard/SubscriptionPage';
import CartPage from './pages/Dashboard/CartPage';
import CheckoutPage from './pages/Dashboard/CheckoutPage';
import MySubscriptionsPage from './pages/Dashboard/MySubscriptionsPage';
import { CartProvider } from './context/CartContext';

// Admin Pages
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import AdminDashboardHome from './pages/Admin/AdminDashboardHome';
import ManageCourses from './pages/Admin/ManageCourses';
import ManagePayments from './pages/Admin/ManagePayments';
import ManageReadingLibrary from './pages/Admin/ManageReadingLibrary';
import ManageVideoLibrary from './pages/Admin/ManageVideoLibrary';
import ManageSubscriptions from './pages/Admin/ManageSubscriptions';

// Super Admin Pages
import SuperAdminLayout from './layouts/SuperAdminLayout/SuperAdminLayout';
import SuperAdminDashboardHome from './pages/SuperAdmin/SuperAdminDashboardHome';
import ManageUsers from './pages/SuperAdmin/ManageUsers';
import SystemSettings from './pages/SuperAdmin/SystemSettings';

// Minimal Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // If allowedRoles is provided, check if the user's role is in the list
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // User is logged in but doesn't have the correct role.
      // Send them back to their appropriate dashboard if possible.
      if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
      if (user.role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <CartProvider>
        <SessionManager>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
          </Route>

          {/* Protected Dashboard Routes (Student) */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="reading" element={<ReadingLibrary />} />
            <Route path="video" element={<VideoLibrary />} />
            <Route path="modules/:id" element={<ModuleDetail />} />
            <Route path="video-modules/:id" element={<VideoModuleDetail />} />
            <Route path="mock-exam" element={<div>Mock Exam (WIP)</div>} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="my-subscriptions" element={<MySubscriptionsPage />} />
            <Route path="help" element={<div>Help Center (WIP)</div>} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboardHome />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="reading-library" element={<ManageReadingLibrary />} />
            <Route path="video-library" element={<ManageVideoLibrary />} />
            <Route path="subscriptions" element={<ManageSubscriptions />} />
            <Route path="payments" element={<ManagePayments />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SuperAdminDashboardHome />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
          
        </Routes>
        </SessionManager>
      </CartProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
