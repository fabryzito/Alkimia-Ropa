"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/AdminLayout"
import { saleService } from "../../services/saleService"
import { productService } from "../../services/productService"
import { categoryService } from "../../services/categoryService"
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
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material"

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" })
  const [categoryFilter, setCategoryFilter] = useState("")
  const [topProducts, setTopProducts] = useState([])
  const [salesByCategory, setSalesByCategory] = useState([])

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setLoading(true)

    const [salesStats, salesResult, productsResult, categoriesResult] = await Promise.all([
      saleService.getStatistics(),
      saleService.getAll(),
      productService.getAll(),
      categoryService.getAll(),
    ])

    if (salesStats.success && salesResult.success && productsResult.success && categoriesResult.success) {
      setStats(salesStats.data)
      setSales(salesResult.data)
      setProducts(productsResult.data)
      setCategories(categoriesResult.data)

      // Calculate top selling products
      calculateTopProducts(salesResult.data)

      // Calculate sales by category
      calculateSalesByCategory(salesResult.data, productsResult.data, categoriesResult.data)
    }

    setLoading(false)
  }

  const calculateTopProducts = (salesData) => {
    const productSales = {}

    salesData.forEach((sale) => {
      sale.products.forEach((product) => {
        if (!productSales[product.productId]) {
          productSales[product.productId] = {
            id: product.productId,
            name: product.productName,
            quantity: 0,
            revenue: 0,
          }
        }
        productSales[product.productId].quantity += product.quantity
        productSales[product.productId].revenue += product.price * product.quantity
      })
    })

    const sorted = Object.values(productSales).sort((a, b) => b.quantity - a.quantity)
    setTopProducts(sorted.slice(0, 10))
  }

  const calculateSalesByCategory = (salesData, productsData, categoriesData) => {
    const categorySales = {}

    categoriesData.forEach((cat) => {
      categorySales[cat.id] = {
        id: cat.id,
        name: cat.name,
        quantity: 0,
        revenue: 0,
      }
    })

    salesData.forEach((sale) => {
      sale.products.forEach((product) => {
        const productData = productsData.find((p) => p.id === product.productId)
        if (productData && categorySales[productData.category]) {
          categorySales[productData.category].quantity += product.quantity
          categorySales[productData.category].revenue += product.price * product.quantity
        }
      })
    })

    const sorted = Object.values(categorySales).sort((a, b) => b.revenue - a.revenue)
    setSalesByCategory(sorted)
  }

  const handleFilterByDate = async () => {
    if (dateFilter.start && dateFilter.end) {
      const result = await saleService.getByDateRange(dateFilter.start, dateFilter.end)
      if (result.success) {
        setSales(result.data)
        calculateTopProducts(result.data)
        calculateSalesByCategory(result.data, products, categories)
      }
    } else {
      loadReportData()
    }
  }

  const handleFilterByCategory = () => {
    if (categoryFilter) {
      const filtered = topProducts.filter((product) => {
        const productData = products.find((p) => p.id === product.id)
        return productData && productData.category === Number.parseInt(categoryFilter)
      })
      setTopProducts(filtered)
    } else {
      calculateTopProducts(sales)
    }
  }

  const handleClearFilters = () => {
    setDateFilter({ start: "", end: "" })
    setCategoryFilter("")
    loadReportData()
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
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600">Análisis detallado de ventas y productos</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <Typography variant="h6" className="font-bold mb-4">
              Filtros
            </Typography>
            <div className="flex gap-4 flex-wrap">
              <TextField
                label="Fecha Inicio"
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Fecha Fin"
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" onClick={handleFilterByDate}>
                Filtrar por Fecha
              </Button>

              <FormControl style={{ minWidth: 200 }}>
                <InputLabel>Categoría</InputLabel>
                <Select value={categoryFilter} label="Categoría" onChange={(e) => setCategoryFilter(e.target.value)}>
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleFilterByCategory}>
                Filtrar por Categoría
              </Button>

              <Button variant="outlined" onClick={handleClearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
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
            <Card>
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
            <Card>
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

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom>
                      Productos Vendidos
                    </Typography>
                    <Typography variant="h4" className="font-bold text-purple-600">
                      {sales.reduce((sum, sale) => sum + sale.products.reduce((s, p) => s + p.quantity, 0), 0)}
                    </Typography>
                  </div>
                  <InventoryIcon className="text-purple-500" style={{ fontSize: 48 }} />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Selling Products */}
        <Card>
          <CardContent>
            <Typography variant="h6" className="font-bold mb-4">
              Productos Más Vendidos
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-semibold">Posición</TableCell>
                    <TableCell className="font-semibold">Producto</TableCell>
                    <TableCell className="font-semibold">Unidades Vendidas</TableCell>
                    <TableCell className="font-semibold">Ingresos Generados</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.quantity} unidades</TableCell>
                      <TableCell className="font-bold text-green-600">${product.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardContent>
            <Typography variant="h6" className="font-bold mb-4">
              Ventas por Categoría
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-semibold">Categoría</TableCell>
                    <TableCell className="font-semibold">Productos Vendidos</TableCell>
                    <TableCell className="font-semibold">Ingresos</TableCell>
                    <TableCell className="font-semibold">Porcentaje del Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesByCategory.map((category) => {
                    const percentage = stats?.totalRevenue > 0 ? (category.revenue / stats.totalRevenue) * 100 : 0
                    return (
                      <TableRow key={category.id} hover>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.quantity} unidades</TableCell>
                        <TableCell className="font-bold text-green-600">${category.revenue.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold">{percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
