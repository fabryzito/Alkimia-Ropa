"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../components/layout/AdminLayout"
import { saleService } from "../../services/saleService"
import { productService } from "../../services/productService"
import { userService } from "../../services/userService"
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material"
import {
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
} from "@mui/icons-material"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [usersResult, setUsersResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)

    const [salesStats, salesResult, productsResult, usersResult] = await Promise.all([
      saleService.getStatistics(),
      saleService.getAll(),
      productService.getAll(),
      userService.getAll(),
    ])

    setUsersResult(usersResult)

    if (salesStats.success && salesResult.success && productsResult.success && usersResult.success) {
      setStats({
        ...salesStats.data,
        totalProducts: productsResult.data.length,
        totalUsers: usersResult.data.length,
        lowStockProducts: productsResult.data.filter((p) => p.stock < 10).length,
      })

      // Get 5 most recent sales
      setRecentSales(salesResult.data.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5))

      // Get products with low stock
      setLowStockProducts(
        productsResult.data
          .filter((p) => p.stock < 10)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5),
      )
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Resumen general del sistema</p>
        </div>

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/sales")}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Total Ventas
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats?.totalSales || 0}
                    </Typography>
                    <Typography variant="body2" className="text-green-600">
                      {stats?.completedSales || 0} completadas
                    </Typography>
                  </div>
                  <ShoppingCartIcon className="text-purple-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/admin/reports")}
            >
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Ingresos Totales
                    </Typography>
                    <Typography variant="h4" className="font-bold text-green-600">
                      ${stats?.totalRevenue.toFixed(2) || 0}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Promedio: ${stats?.averageSale.toFixed(2) || 0}
                    </Typography>
                  </div>
                  <AttachMoneyIcon className="text-green-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/admin/products")}
            >
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Productos
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats?.totalProducts || 0}
                    </Typography>
                    <Typography variant="body2" className="text-orange-600">
                      {stats?.lowStockProducts || 0} con stock bajo
                    </Typography>
                  </div>
                  <InventoryIcon className="text-purple-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/users")}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Usuarios
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats?.totalUsers || 0}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Clientes: {usersResult?.data?.filter((u) => u.role === "client").length || 0}
                    </Typography>
                  </div>
                  <PeopleIcon className="text-indigo-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Sales and Low Stock */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6" className="font-bold">
                    Ventas Recientes
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-purple-600 cursor-pointer hover:underline"
                    onClick={() => navigate("/admin/sales")}
                  >
                    Ver todas
                  </Typography>
                </div>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell>ID</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentSales.map((sale) => (
                        <TableRow key={sale.id} hover>
                          <TableCell>#{sale.id}</TableCell>
                          <TableCell>{sale.clientName}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell className="font-semibold text-purple-600">${sale.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={sale.status === "completed" ? "Completado" : "Pendiente"}
                              color={sale.status === "completed" ? "success" : "warning"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <WarningIcon className="text-orange-500" />
                    <Typography variant="h6" className="font-bold">
                      Productos con Stock Bajo
                    </Typography>
                  </div>
                  <Typography
                    variant="body2"
                    className="text-purple-600 cursor-pointer hover:underline"
                    onClick={() => navigate("/admin/products")}
                  >
                    Ver todos
                  </Typography>
                </div>
                <div className="space-y-3">
                  {lowStockProducts.length === 0 ? (
                    <Typography color="textSecondary" className="text-center py-4">
                      No hay productos con stock bajo
                    </Typography>
                  ) : (
                    lowStockProducts.map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <Typography className="font-semibold">{product.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {product.categoryName}
                          </Typography>
                        </div>
                        <Chip
                          label={`${product.stock} unidades`}
                          color={product.stock === 0 ? "error" : "warning"}
                          size="small"
                        />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" className="font-bold mb-4">
              Acceso Rápido
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  className="bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
                  onClick={() => navigate("/admin/products")}
                >
                  <CardContent>
                    <Typography variant="h6" className="font-semibold text-purple-700">
                      Gestionar Productos
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Agregar, editar o eliminar productos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  className="bg-green-50 hover:bg-green-100 cursor-pointer transition-colors"
                  onClick={() => navigate("/admin/sales")}
                >
                  <CardContent>
                    <Typography variant="h6" className="font-semibold text-green-700">
                      Ver Ventas
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Consultar y gestionar ventas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  className="bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors"
                  onClick={() => navigate("/admin/reports")}
                >
                  <CardContent>
                    <Typography variant="h6" className="font-semibold text-orange-700">
                      Ver Reportes
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Análisis y estadísticas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
