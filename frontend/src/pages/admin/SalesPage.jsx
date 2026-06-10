"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Modal from "../../components/common/Modal";
import { saleService } from "../../services/saleService";
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
  Alert,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [updateStatuses, setUpdateStatuses] = useState({});
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    loadSales();
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000);
  };

  const loadSales = async () => {
    setLoading(true);

    const result = await saleService.getAll();

    if (result.success) {
      setSales(result.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }

    setLoading(false);
  };

  const handleViewSale = (sale) => {
    setViewingSale(sale);
    setIsViewModalOpen(true);
  };

  const handleUpdateOrderStatus = async (id) => {
    const newStatus = updateStatuses[id];
    if (!newStatus) return;

    const result = await saleService.updateOrderStatus(id, newStatus);

    if (result.success) {
      setUpdateStatuses({ ...updateStatuses, [id]: null });
      showAlert("Estado del pedido actualizado", "success");
      loadSales();

      if (viewingSale && viewingSale.id === id) {
        setViewingSale({ ...viewingSale, orderStatus: newStatus });
      }
    } else {
      showAlert(result.error || "Error al actualizar el estado", "error");
    }
  };

  const handleMarkAsPaid = async (id) => {
    const result = await saleService.updatePaymentStatus(id, "paid");

    if (result.success) {
      showAlert("Pago marcado como pagado", "success");
      loadSales();

      if (viewingSale && viewingSale.id === id) {
        setViewingSale({ ...viewingSale, paymentStatus: "paid", status: "completed" });
      }
    } else {
      showAlert(result.error || "Error al actualizar el pago", "error");
    }
  };

  const handleFilterByDate = async () => {
    if (dateFilter.start && dateFilter.end) {
      setLoading(true);

      const result = await saleService.getByDateRange(dateFilter.start, dateFilter.end);

      if (result.success) {
        setSales(result.data);
      }

      setLoading(false);
    } else {
      loadSales();
    }
  };

  const handleClearFilters = () => {
    setDateFilter({ start: "", end: "" });
    loadSales();
  };

  const getValidOrderStatuses = (deliveryMethod) => {
    if (deliveryMethod === "home_delivery") {
      return ["En preparación", "En envío", "Entregado"];
    }

    if (deliveryMethod === "local_pickup") {
      return ["En preparación", "Preparado", "Entregado"];
    }

    return [];
  };

  const getOrderStatusColor = (orderStatus) => {
    switch (orderStatus) {
      case "En preparación":
        return "warning";
      case "En envío":
      case "Preparado":
        return "info";
      case "Entregado":
        return "success";
      default:
        return "default";
    }
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
      pending: "Pendiente",
      cancelled: "Cancelado",
    };

    return labels[status] || "Pendiente";
  };

  const getDeliveryMethodLabel = (method) => {
    return method === "home_delivery" ? "Envío a domicilio" : "Retiro en local";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de ventas</h1>
        </div>

        {alert.show && (
          <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <TextField
            label="Fecha inicio"
            type="date"
            value={dateFilter.start}
            onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Fecha fin"
            type="date"
            value={dateFilter.end}
            onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <Button variant="contained" onClick={handleFilterByDate}>
            Filtrar
          </Button>

          <Button variant="outlined" onClick={handleClearFilters}>
            Limpiar
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <CircularProgress />
          </div>
        ) : (
          <TableContainer component={Paper} className="overflow-x-auto">
            <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">ID</TableCell>
                  <TableCell className="font-semibold">Cliente</TableCell>
                  <TableCell className="font-semibold">Email</TableCell>
                  <TableCell className="font-semibold">Fecha</TableCell>
                  <TableCell className="font-semibold">Entrega</TableCell>
                  <TableCell className="font-semibold">Pago</TableCell>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">Estado pedido</TableCell>
                  <TableCell className="font-semibold">Cambiar estado</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} hover>
                    <TableCell>{String(sale.id).slice(-8)}</TableCell>
                    <TableCell className="font-medium">{sale.userName}</TableCell>
                    <TableCell>{sale.userEmail}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{getDeliveryMethodLabel(sale.deliveryMethod)}</TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip
                            label={getPaymentStatusLabel(sale.paymentStatus)}
                            color={getPaymentStatusColor(sale.paymentStatus)}
                            size="small"
                          />
                          {sale.paymentStatus !== "paid" && (
                            <Button size="small" variant="outlined" onClick={() => handleMarkAsPaid(sale.id)}>
                              Marcar pagado
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-purple-600">${sale.total.toFixed(2)}</TableCell>

                    <TableCell>
                      <Chip
                        label={sale.orderStatus || "Sin estado"}
                        color={getOrderStatusColor(sale.orderStatus)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FormControl size="small" style={{ minWidth: 140 }}>
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
                          onClick={() => handleUpdateOrderStatus(sale.id)}
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

        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles de la venta">
          {viewingSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">ID de venta</p>
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
                  <p className="text-sm text-gray-500">Método de entrega</p>
                  <p className="font-semibold">{getDeliveryMethodLabel(viewingSale.deliveryMethod)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Método de pago</p>
                  <p className="font-semibold">{getPaymentMethodLabel(viewingSale.paymentMethod)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Estado de pago</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Chip
                      label={getPaymentStatusLabel(viewingSale.paymentStatus)}
                      color={getPaymentStatusColor(viewingSale.paymentStatus)}
                      size="small"
                    />
                    {viewingSale.paymentStatus !== "paid" && (
                      <Button size="small" variant="outlined" onClick={() => handleMarkAsPaid(viewingSale.id)}>
                        Marcar pagado
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Estado del pedido</p>
                  <Chip
                    label={viewingSale.orderStatus || "Sin estado"}
                    color={getOrderStatusColor(viewingSale.orderStatus)}
                    size="small"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-purple-600">${viewingSale.total.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Envío</p>
                  <p className="font-semibold">
                    {viewingSale.deliveryMethod === "home_delivery" ? "A cargo del cliente" : "Gratis"}
                  </p>
                </div>
              </div>

              {viewingSale.deliveryAddress && (
                <div className="border-t pt-4">
                  <p className="mb-2 text-sm text-gray-500">Dirección de entrega</p>
                  <div className="rounded bg-gray-50 p-3 text-sm">
                    <p>{viewingSale.deliveryAddress.street}</p>
                    <p>
                      {viewingSale.deliveryAddress.city}, {viewingSale.deliveryAddress.postalCode}
                    </p>
                    <p>{viewingSale.deliveryAddress.country}</p>
                    {viewingSale.deliveryAddress.notes && <p>Notas: {viewingSale.deliveryAddress.notes}</p>}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm text-gray-500">Productos</p>
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
  );
}