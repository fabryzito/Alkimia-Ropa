"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/AdminLayout"
import Modal from "../../components/common/Modal"
import { saleService } from "../../services/saleService"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Chip,
  TextField,
  Button,
} from "@mui/material"
import { Visibility as VisibilityIcon } from "@mui/icons-material"

export default function EmployeeSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingSale, setViewingSale] = useState(null)
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" })

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    setLoading(true)
    const result = await saleService.getAll()
    if (result.success) {
      setSales(result.data.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }
    setLoading(false)
  }

  const handleViewSale = (sale) => {
    setViewingSale(sale)
    setIsViewModalOpen(true)
  }

  const handleFilterByDate = async () => {
    if (dateFilter.start && dateFilter.end) {
      const result = await saleService.getByDateRange(dateFilter.start, dateFilter.end)
      if (result.success) {
        setSales(result.data)
      }
    } else {
      loadSales()
    }
  }

  const getStatusColor = (status) => {
    return status === "completed" ? "success" : "warning"
  }

  const getStatusLabel = (status) => {
    return status === "completed" ? "Completado" : "Pendiente"
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      credit_card: "Tarjeta de Crédito",
      debit_card: "Tarjeta de Débito",
      cash: "Efectivo",
      transfer: "Transferencia",
    }
    return methods[method] || method
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Consulta de Ventas</h1>

        <div className="flex gap-4 items-end">
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
            Filtrar
          </Button>
          <Button variant="outlined" onClick={loadSales}>
            Limpiar
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">ID</TableCell>
                  <TableCell className="font-semibold">Cliente</TableCell>
                  <TableCell className="font-semibold">Fecha</TableCell>
                  <TableCell className="font-semibold">Productos</TableCell>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">Método de Pago</TableCell>
                  <TableCell className="font-semibold">Estado</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} hover>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell className="font-medium">{sale.userName}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{sale.products.reduce((sum, p) => sum + p.quantity, 0)} items</TableCell>
                    <TableCell className="font-bold text-purple-600">${sale.total.toFixed(2)}</TableCell>
                    <TableCell>{getPaymentMethodLabel(sale.paymentMethod)}</TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(sale.status)} color={getStatusColor(sale.status)} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="info" size="small" onClick={() => handleViewSale(sale)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles de la Venta">
          {viewingSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID de Venta</p>
                  <p className="font-semibold">#{viewingSale.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-semibold">{viewingSale.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-semibold">{viewingSale.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método de Pago</p>
                  <p className="font-semibold">{getPaymentMethodLabel(viewingSale.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <Chip
                    label={getStatusLabel(viewingSale.status)}
                    color={getStatusColor(viewingSale.status)}
                    size="small"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-xl text-purple-600">${viewingSale.total.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Productos</p>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell>Producto</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Precio</TableCell>
                        <TableCell>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewingSale.products.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">
                            ${(product.price * product.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  )
}
