"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../components/layout/AdminLayout"
import { saleService } from "../../services/saleService"
import { productService } from "../../services/productService"
import { Card, CardContent, Typography, Grid, CircularProgress } from "@mui/material"
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material"

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const [salesStats, productsResult] = await Promise.all([saleService.getStatistics(), productService.getAll()])

    if (salesStats.success && productsResult.success) {
      setStats({
        ...salesStats.data,
        totalProducts: productsResult.data.length,
        lowStockProducts: productsResult.data.filter((p) => p.stock < 10).length,
      })
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
        <h1 className="text-3xl font-bold text-gray-900">Panel de Empleado</h1>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/employee/sales")}
            >
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Total Ventas
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats?.totalSales || 0}
                    </Typography>
                  </div>
                  <ShoppingCartIcon className="text-purple-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Ingresos Totales
                    </Typography>
                    <Typography variant="h4" className="font-bold text-green-600">
                      ${stats?.totalRevenue.toFixed(2) || 0}
                    </Typography>
                  </div>
                  <AttachMoneyIcon className="text-green-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Productos Totales
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats?.totalProducts || 0}
                    </Typography>
                  </div>
                  <InventoryIcon className="text-purple-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Venta Promedio
                    </Typography>
                    <Typography variant="h4" className="font-bold text-purple-600">
                      ${stats?.averageSale.toFixed(2) || 0}
                    </Typography>
                  </div>
                  <TrendingUpIcon className="text-orange-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" className="font-bold mb-4">
              Acceso Rápido
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
                onClick={() => navigate("/employee/sales")}
              >
                <CardContent>
                  <Typography variant="h6" className="font-semibold text-purple-700">
                    Ver Ventas
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Consultar todas las ventas realizadas
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
