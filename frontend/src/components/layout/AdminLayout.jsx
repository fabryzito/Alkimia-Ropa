"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Truck,
  Users,
  ShoppingCart,
  BarChart3,
  LogOut,
  Menu,
  X,
  Book,
} from "lucide-react"

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getMenuItems = () => {
    const allItems = [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/admin/products", icon: Package, label: "Productos" },
      { path: "/admin/categories", icon: FolderTree, label: "Categorías" },
      { path: "/admin/providers", icon: Truck, label: "Proveedores" },
      { path: "/admin/users", icon: Users, label: "Usuarios" },
      { path: "/admin/sales", icon: ShoppingCart, label: "Ventas" },
      { path: "/admin/reports", icon: BarChart3, label: "Reportes" },
    ]

    if (user?.role === "employee") {
      return [
        { path: "/employee", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/employee/sales", icon: ShoppingCart, label: "Ventas" },
        { path: "/employee/reports", icon: BarChart3, label: "Reportes" },
      ]
    }

    return allItems
  }

  const menuItems = getMenuItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Alkimia</h1>
              <p className="text-xs text-gray-500">{user?.role === "admin" ? "Panel Admin" : "Panel Empleado"}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive ? " bg-purple-50 text-purple-600" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                <span className="text-sm font-semibold text-gray-700">{user?.name?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
              </h2>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default AdminLayout
