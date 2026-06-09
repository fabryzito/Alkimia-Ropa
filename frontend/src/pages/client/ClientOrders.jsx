"use client"

import { useState, useEffect } from "react"
import ClientLayout from "../../components/layout/ClientLayout"
import { useAuthStore } from "../../store/authStore"
import { saleService } from "../../services/saleService"
import {
  Typography,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { ExpandMore as ExpandMoreIcon, Receipt as ReceiptIcon } from "@mui/icons-material"

export default function ClientOrders() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [user])

  useEffect(() => {
    if (!orders.length) return

    const interval = setInterval(() => {
      loadOrders()
    }, 5000) // Poll every 5 seconds

    return () => {
      clearInterval(interval)
    }
  }, [orders.length])

  const loadOrders = async () => {
    if (!user) {
      return
    }
    setLoading(true)
    const result = await saleService.getByUser(user.id)
    if (result.success) {
      // Sort by date descending
      const sortedOrders = result.data.sort((a, b) => new Date(b.date) - new Date(a.date))
      setOrders(sortedOrders)
    }
    setLoading(false)
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

  const getOrderStatusColor = (orderStatus) => {
    const colors = {
      "En preparación": "warning",
      "En envío": "info",
      Preparado: "info",
      Entregado: "success",
    }
    return colors[orderStatus] || "default"
  }

  const getDeliveryMethodLabel = (method) => {
    return method === "home_delivery" ? "Envío a Domicilio" : "Retiro en Local"
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      </ClientLayout>
    )
  }

  if (orders.length === 0) {
    return (
      <ClientLayout>
        <div className="text-center py-16">
          <ReceiptIcon style={{ fontSize: 80 }} className="text-gray-400 mb-4" />
          <Typography variant="h5" className="mb-2">
            No tienes pedidos aún
          </Typography>
          <Typography color="textSecondary">Tus compras aparecerán aquí</Typography>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Accordion key={order.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className="flex justify-between items-center w-full pr-4">
                  <div>
                    <Typography className="font-semibold">Pedido #{order.id}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {order.date}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-4">
                    <Chip label={order.orderStatus} color={getOrderStatusColor(order.orderStatus)} size="small" />
                    <Typography className="font-bold text-purple-600">${order.total.toFixed(2)}</Typography>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Método de Pago
                      </Typography>
                      {/* Updated to use getPaymentMethodLabel */}
                      <Typography className="font-semibold">{getPaymentMethodLabel(order.paymentMethod)}</Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Total de Productos
                      </Typography>
                      <Typography className="font-semibold">
                        {order.products.reduce((sum, p) => sum + p.quantity, 0)} unidades
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Método de Entrega
                      </Typography>
                      <Typography className="font-semibold">{getDeliveryMethodLabel(order.deliveryMethod)}</Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Cargo de Envío
                      </Typography>
                      <Typography className="font-semibold">
                        {order.shippingCost > 0 ? `$${order.shippingCost.toFixed(2)}` : "Gratis"}
                      </Typography>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Typography variant="body2" color="textSecondary" className="mb-2">
                        Dirección de Entrega
                      </Typography>
                      <Typography className="font-semibold">{order.deliveryAddress.street}</Typography>
                      <Typography className="text-sm">
                        {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                      </Typography>
                      <Typography className="text-sm">{order.deliveryAddress.country}</Typography>
                      {order.deliveryAddress.notes && (
                        <Typography className="text-sm text-gray-600 mt-2">
                          Notas: {order.deliveryAddress.notes}
                        </Typography>
                      )}
                    </div>
                  )}

                  <Table size="small">
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell>Producto</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Precio Unit.</TableCell>
                        <TableCell>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.products.map((product, index) => (
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
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </ClientLayout>
  )
}
