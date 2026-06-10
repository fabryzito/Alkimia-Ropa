"use client";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsPage from "./pages/admin/ProductsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import ProvidersPage from "./pages/admin/ProvidersPage";
import UsersPage from "./pages/admin/UsersPage";
import SalesPage from "./pages/admin/SalesPage";
import ReportsPage from "./pages/admin/ReportsPage";

import ClientMarketplace from "./pages/client/ClientMarketplace";
import ClientCart from "./pages/client/ClientCart";
import ClientOrders from "./pages/client/ClientOrders";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeSales from "./pages/employee/EmployeeSales";
import EmployeeReports from "./pages/employee/EmployeeReports";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "employee") return <Navigate to="/employee" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { loading, initializeAuth } = useAuthStore();
  const { initializeCart } = useCartStore();

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      initializeCart();
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClientMarketplace />} />
        <Route path="/cart" element={<ClientCart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["admin"]}><ProductsPage /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><CategoriesPage /></ProtectedRoute>} />
        <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={["admin"]}><ProvidersPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />
        <Route path="/admin/sales" element={<ProtectedRoute allowedRoles={["admin"]}><SalesPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><ReportsPage /></ProtectedRoute>} />

        <Route path="/employee" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/sales" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeSales /></ProtectedRoute>} />
        <Route path="/employee/reports" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeReports /></ProtectedRoute>} />

        <Route path="/orders" element={<ProtectedRoute allowedRoles={["client"]}><ClientOrders /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;