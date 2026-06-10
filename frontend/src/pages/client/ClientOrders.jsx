"use client";

import { useState, useEffect } from "react";
import ClientLayout from "../../components/layout/ClientLayout";
import { useAuthStore } from "../../store/authStore";
import { saleService } from "../../services/saleService";
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
  Alert,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Receipt as ReceiptIcon } from "@mui/icons-material";

export default function ClientOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [user]);

  useEffect(() => {
    if (!orders.length) return;

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [orders.length]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);

    const result = await saleService.getByUser(user.id);

    if (result.success) {
      const sortedOrders = result.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(sortedOrders);
    }

    setLoading(false);
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      credit_card: "Tarjeta de crédito",
      debit_card: "Tarjeta de débito",
      cash: "Efectivo",
      transfer: "Transferencia",
    };

    return methods[method] || method;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: "success",
      pending: "warning",
      cancelled: "error",
    };

    return colors[status] || "default";
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      paid: "Pagado",
      pending: "Pago pendiente",
      cancelled: "Pago cancelado",
    };

    return labels[status] || "Pago pendiente";
  };

  const getOrderStatusColor = (orderStatus) => {
    const colors = {
      "En preparación": "warning",
      "En envío": "info",
      Preparado: "info",
      Entregado: "success",
    };

    return colors[orderStatus] || "default";
  };

  const getDeliveryMethodLabel = (method) => {
    return method === "home_delivery" ? "Envío a domicilio" : "Retiro en local";
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      </ClientLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <ClientLayout>
        <div className="py-16 text-center">
          <ReceiptIcon style={{ fontSize: 80 }} className="mb-4 text-gray-400" />
          <Typography variant="h5" className="mb-2">
            No tenés pedidos aún
          </Typography>
          <Typography color="textSecondary">Tus compras aparecerán aquí</Typography>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis pedidos</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Accordion key={order.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className="flex w-full flex-col gap-3 pr-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Typography className="font-semibold">Pedido #{String(order.id).slice(-8)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {order.date}
                    </Typography>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <Chip label={order.orderStatus} color={getOrderStatusColor(order.orderStatus)} size="small" />
                    <Chip
                      label={getPaymentStatusLabel(order.paymentStatus)}
                      color={getPaymentStatusColor(order.paymentStatus)}
                      size="small"
                    />
                    <Typography className="font-bold text-purple-600">${order.total.toFixed(2)}</Typography>
                  </div>
                </div>
              </AccordionSummary>

              <AccordionDetails>
                <div className="space-y-4">
                  {order.paymentMethod === "transfer" && order.paymentStatus !== "paid" && (
                    <Alert severity="warning">
                      Tu pago por transferencia está pendiente de confirmación. Si ya transferiste, enviá el
                      comprobante por WhatsApp.
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Método de pago
                      </Typography>
                      <Typography className="font-semibold">{getPaymentMethodLabel(order.paymentMethod)}</Typography>
                    </div>

                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Estado de pago
                      </Typography>
                      <Chip
                        label={getPaymentStatusLabel(order.paymentStatus)}
                        color={getPaymentStatusColor(order.paymentStatus)}
                        size="small"
                      />
                    </div>

                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Total de productos
                      </Typography>
                      <Typography className="font-semibold">
                        {order.products.reduce((sum, p) => sum + p.quantity, 0)} unidades
                      </Typography>
                    </div>

                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Método de entrega
                      </Typography>
                      <Typography className="font-semibold">{getDeliveryMethodLabel(order.deliveryMethod)}</Typography>
                    </div>

                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Envío
                      </Typography>
                      <Typography className="font-semibold">
                        {order.deliveryMethod === "home_delivery" ? "A cargo del cliente" : "Gratis"}
                      </Typography>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <Typography variant="body2" color="textSecondary" className="mb-2">
                        Dirección de entrega
                      </Typography>
                      <Typography className="font-semibold">{order.deliveryAddress.street}</Typography>
                      <Typography className="text-sm">
                        {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                      </Typography>
                      <Typography className="text-sm">{order.deliveryAddress.country}</Typography>
                      {order.deliveryAddress.notes && (
                        <Typography className="mt-2 text-sm text-gray-600">
                          Notas: {order.deliveryAddress.notes}
                        </Typography>
                      )}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <Table size="small">
                      <TableHead>
                        <TableRow className="bg-gray-50">
                          <TableCell>Producto</TableCell>
                          <TableCell>Cantidad</TableCell>
                          <TableCell>Precio unit.</TableCell>
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
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}