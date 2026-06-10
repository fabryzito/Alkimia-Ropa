"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Modal from "../../components/common/Modal";
import { saleService } from "../../services/saleService";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { Delete as DeleteIcon, Visibility as VisibilityIcon } from "@mui/icons-material";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, sale: null });
  const [viewingSale, setViewingSale] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [updateStatuses, setUpdateStatuses] = useState({});
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    loadSales();
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3500);
  };

  const loadSales = async () => {
    setLoading(true);
    const result = await saleService.getAll();

    if (result.success) {
      setSales((result.data || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      showAlert(result.error || "Error al cargar ventas", "error");
    }

    setLoading(false);
  };

  const handleUpdateOrderStatus = async (id) => {
    const newStatus = updateStatuses[id];
    if (!newStatus) {
      showAlert("Seleccioná un estado del pedido", "warning");
      return;
    }

    const result = await saleService.updateOrderStatus(id, newStatus);

    if (result.success) {
      setUpdateStatuses((prev) => ({ ...prev, [id]: "" }));
      showAlert("Estado del pedido actualizado", "success");
      await loadSales();
    } else {
      showAlert(result.error || "Error al actualizar el estado", "error");
    }
  };

  const handleMarkAsPaid = async (id) => {
    const result = await saleService.updatePaymentStatus(id, "paid");

    if (result.success) {
      showAlert("Pago marcado como pagado", "success");
      await loadSales();
    } else {
      showAlert(result.error || "Error al marcar como pagado", "error");
    }
  };

  const handleDeleteSale = async () => {
    if (!deleteModal.sale) return;

    const result = await saleService.delete(deleteModal.sale.id);

    if (result.success) {
      showAlert("Venta eliminada y stock restaurado", "success");
      setDeleteModal({ open: false, sale: null });
      await loadSales();
    } else {
      showAlert(result.error || "Error al eliminar venta", "error");
    }
  };

  const handleFilterByDate = async () => {
    if (!dateFilter.start || !dateFilter.end) {
      loadSales();
      return;
    }

    setLoading(true);
    const result = await saleService.getByDateRange(dateFilter.start, dateFilter.end);

    if (result.success) {
      setSales(result.data || []);
    } else {
      showAlert(result.error || "Error al filtrar ventas", "error");
    }

    setLoading(false);
  };

  const getValidOrderStatuses = (deliveryMethod) => {
    if (deliveryMethod === "home_delivery") return ["En preparación", "En envío", "Entregado"];
    if (deliveryMethod === "local_pickup") return ["En preparación", "Preparado", "Entregado"];
    return ["En preparación", "Entregado"];
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      "En preparación": "warning",
      "En envío": "info",
      Preparado: "info",
      Entregado: "success",
      Completado: "success",
    };
    return colors[status] || "default";
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
    const colors = { paid: "success", pending: "warning", cancelled: "error" };
    return colors[status] || "warning";
  };

  const getPaymentStatusLabel = (status) => {
    const labels = { paid: "Pagado", pending: "Pendiente", cancelled: "Cancelado" };
    return labels[status] || "Pendiente";
  };

  const getDeliveryMethodLabel = (method) => {
    return method === "home_delivery" ? "Envío a domicilio" : "Retiro en local";
  };

  const getSaleChannelLabel = (channel) => {
    return channel === "local" ? "Local" : "Online";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de ventas</h1>

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
          <Button
            variant="outlined"
            onClick={() => {
              setDateFilter({ start: "", end: "" });
              loadSales();
            }}
          >
            Limpiar
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <CircularProgress />
          </div>
        ) : (
          <TableContainer component={Paper} className="overflow-x-auto">
            <Table sx={{ minWidth: 1250 }}>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell>ID</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Canal</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Entrega</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado pedido</TableCell>
                  <TableCell>Cambiar estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No hay ventas para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id} hover>
                      <TableCell>{String(sale.id).slice(-8)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{sale.userName || sale.customerName || "Cliente"}</div>
                        <div className="text-xs text-gray-500">{sale.userEmail || sale.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <Chip label={getSaleChannelLabel(sale.saleChannel)} size="small" />
                      </TableCell>
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
                      <TableCell className="font-bold text-purple-600">${Number(sale.total || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={sale.orderStatus || "Sin estado"}
                          color={getOrderStatusColor(sale.orderStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FormControl size="small" style={{ minWidth: 150 }}>
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
                        <IconButton color="info" size="small" onClick={() => { setViewingSale(sale); setIsViewModalOpen(true); }}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => setDeleteModal({ open: true, sale })}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles de la venta" size="lg">
          {viewingSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-semibold">{viewingSale.userName || viewingSale.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Canal</p>
                  <p className="font-semibold">{getSaleChannelLabel(viewingSale.saleChannel)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pago</p>
                  <p className="font-semibold">{getPaymentMethodLabel(viewingSale.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado de pago</p>
                  <Chip
                    label={getPaymentStatusLabel(viewingSale.paymentStatus)}
                    color={getPaymentStatusColor(viewingSale.paymentStatus)}
                    size="small"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado pedido</p>
                  <Chip
                    label={viewingSale.orderStatus || "Sin estado"}
                    color={getOrderStatusColor(viewingSale.orderStatus)}
                    size="small"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-purple-600">${Number(viewingSale.total || 0).toFixed(2)}</p>
                </div>
              </div>

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
                        <TableCell>${Number(product.price || 0).toFixed(2)}</TableCell>
                        <TableCell>${(Number(product.price || 0) * Number(product.quantity || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </Modal>

        <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, sale: null })} title="Eliminar venta">
          <div className="space-y-4">
            <Alert severity="warning">
              Esta acción eliminará la venta y devolverá el stock de sus productos. No se borrarán usuarios ni productos.
            </Alert>
            <p>
              ¿Seguro que querés eliminar la venta #{deleteModal.sale ? String(deleteModal.sale.id).slice(-8) : ""}?
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setDeleteModal({ open: false, sale: null })}>Cancelar</Button>
              <Button color="error" variant="contained" onClick={handleDeleteSale}>
                Eliminar y devolver stock
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}