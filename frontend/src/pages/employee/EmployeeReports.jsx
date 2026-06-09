"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../../components/layout/AdminLayout"
import { saleService } from "../../services/saleService"
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
  Paper,
} from "@mui/material"
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material"

export default function EmployeeReports() {
  const navigate = useNavigate()
  const [reports, setReports] = useState(null)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    const result = await saleService.getAll()

    if (result.success) {
      const salesData = result.data
      setSales(salesData)

      const totalSales = salesData.length
      const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0)
      const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

      setReports({
        totalSales,
        totalRevenue,
        averageSale,
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
        <h1 className="text-3xl font-bold text-gray-900">Reportes de Ventas</h1>

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Total Ventas
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {reports?.totalSales || 0}
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
                      ${reports?.totalRevenue.toFixed(2) || 0}
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
                      Venta Promedio
                    </Typography>
                    <Typography variant="h4" className="font-bold text-purple-600">
                      ${reports?.averageSale.toFixed(2) || 0}
                    </Typography>
                  </div>
                  <TrendingUpIcon className="text-orange-500" style={{ fontSize: 48 }} />
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
                      Detalle Ventas
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      Tabla
                    </Typography>
                  </div>
                  <BarChartIcon className="text-purple-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sales Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" className="font-bold mb-4">
              Detalle de Ventas
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-100">
                    <TableCell>
                      <strong>ID Venta</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Cliente</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Fecha</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales && sales.length > 0 ? (
                    sales.map((sale) => (
                      <TableRow key={sale._id || sale.id} hover>
                        <TableCell>{(sale._id || sale.id).substring(0, 8)}</TableCell>
                        <TableCell align="right">${sale.total?.toFixed(2) || 0}</TableCell>
                        <TableCell>{sale.userName || "N/A"}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" className="py-8">
                        <Typography color="textSecondary">No hay ventas disponibles</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
