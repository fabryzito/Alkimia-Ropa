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
  Button,
  IconButton,
  CircularProgress,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material"
import { Visibility as VisibilityIcon } from "@mui/icons-material"

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingSale, setViewingSale] = useState(null)
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" })
  const [updateStatuses, setUpdateStatuses] = useState({})

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

  const handleUpdateStatus = async (id, status) => {
    const result = await saleService.updateStatus(id, status)
    if (result.success) {
      loadSales()
    }
  }

  const handleUpdateOrderStatus = async (id, deliveryMethod) => {
    const newStatus = updateStatuses[id]
    if (!newStatus) return

    const result = await saleService.updateOrderStatus(id, newStatus)
    if (result.success) {
      setUpdateStatuses({ ...updateStatuses, [id]: null })
      loadSales()
      if (viewingSale && viewingSale.id === id) {
        setViewingSale({ ...viewingSale, orderStatus: newStatus })
      }
    }
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

  const getValidOrderStatuses = (deliveryMethod) => {
    if (deliveryMethod === "home_delivery") {
      return ["En preparación", "En envío", "Entregado"]
    } else if (deliveryMethod === "local_pickup") {
      return ["En preparación", "Preparado", "Entregado"]
    }
    return []
  }

  const getStatusColor = (status) => {
    return status === "completed" ? "success" : "warning"
  }

  const getStatusLabel = (status) => {
    return status === "completed" ? "Completado" : "Pendiente"
  }

  const getOrderStatusColor = (orderStatus) => {
    switch (orderStatus) {
      case "En preparación":
        return "warning"
      case "En envío":
      case "Preparado":
        return "info"
      case "Entregado":
        return "success"
      default:
        return "default"
    }
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

  const getDeliveryMethodLabel = (method) => {
    return method === "home_delivery" ? "Envío a Domicilio" : "Retiro en Local"
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
        </div>

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
                  <TableCell className="font-semibold">Email</TableCell>
                  <TableCell className="font-semibold">Fecha</TableCell>
                  <TableCell className="font-semibold">Tipo Entrega</TableCell>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">Estado Pedido</TableCell>
                  <TableCell className="font-semibold">Cambiar Estado</TableCell>
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
                    <TableCell>{sale.userEmail}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{getDeliveryMethodLabel(sale.deliveryMethod)}</TableCell>
                    <TableCell className="font-bold text-purple600">${sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={sale.orderStatus || "Sin estado"}
                        color={getOrderStatusColor(sale.orderStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <FormControl size="small" style={{ minWidth: 120 }}>
                          <Select
                            value={updateStatuses[sale.id] || ""}
                            onChange={(e) => setUpdateStatuses({ ...updateStatuses, [sale.id]: e.target.value })}
                            displayEmpty
                          >
                            <MenuItem value="">Seleccionar</MenuItem>
                            {getValidOrderStatuses(sale.deliveryMethod).map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleUpdateOrderStatus(sale.id, sale.deliveryMethod)}
                          disabled={!updateStatuses[sale.id]}
                        >
                          Actualizar
                        </Button>
                      </div>
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
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{viewingSale.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-semibold">{viewingSale.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método de Entrega</p>
                  <p className="font-semibold">{getDeliveryMethodLabel(viewingSale.deliveryMethod)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado del Pedido</p>
                  <Chip
                    label={viewingSale.orderStatus || "Sin estado"}
                    color={getOrderStatusColor(viewingSale.orderStatus)}
                    size="small"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-xl text-purple-600">${viewingSale.total.toFixed(2)}</p>
                </div>
                {viewingSale.shippingCost > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Cargo de Envío</p>
                    <p className="font-semibold text-green-600">${viewingSale.shippingCost.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {viewingSale.deliveryAddress && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Dirección de Entrega</p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p>{viewingSale.deliveryAddress.street}</p>
                    <p>
                      {viewingSale.deliveryAddress.city}, {viewingSale.deliveryAddress.postalCode}
                    </p>
                    <p>{viewingSale.deliveryAddress.country}</p>
                  </div>
                </div>
              )}

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
