"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Modal from "../../components/common/Modal";
import { saleService } from "../../services/saleService";
import { productService } from "../../services/productService";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

export default function EmployeeSales() {
  const [tab, setTab] = useState(0);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [localCart, setLocalCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [productSearch, setProductSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    loadInitialData();
  }, []);

  const localTotal = useMemo(() => {
    return localCart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }, [localCart]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    return products
      .filter((product) => product.stock > 0)
      .filter((product) => {
        if (!query) return true;
        return (
          product.name?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.categoryName?.toLowerCase().includes(query)
        );
      });
  }, [products, productSearch]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3500);
  };

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadSales(false), loadProducts(false)]);
    setLoading(false);
  };

  const loadSales = async (withLoading = true) => {
    if (withLoading) setLoading(true);

    const result = await saleService.getAll();

    if (result.success) {
      setSales((result.data || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      showAlert(result.error || "Error al cargar ventas", "error");
    }

    if (withLoading) setLoading(false);
  };

  const loadProducts = async (withLoading = true) => {
    if (withLoading) setLoading(true);

    const result = await productService.getAll();

    if (result.success) {
      setProducts(result.data || []);
    } else {
      showAlert(result.error || "Error al cargar productos", "error");
    }

    if (withLoading) setLoading(false);
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

  const addProductToLocalCart = (product) => {
    setLocalCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity >= product.stock) {
          showAlert(`No hay más stock disponible para ${product.name}`, "warning");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateLocalQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setLocalCart((currentCart) => currentCart.filter((item) => item.id !== productId));
      return;
    }

    const product = products.find((item) => item.id === productId);

    if (product && quantity > product.stock) {
      showAlert(`Stock disponible: ${product.stock}`, "warning");
      return;
    }

    setLocalCart((currentCart) =>
      currentCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromLocalCart = (productId) => {
    setLocalCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const handleCreateLocalSale = async () => {
    if (localCart.length === 0) {
      showAlert("Agregá al menos un producto", "error");
      return;
    }

    if (!paymentMethod) {
      showAlert("Seleccioná un método de pago", "error");
      return;
    }

    if (["credit_card", "debit_card"].includes(paymentMethod)) {
      showAlert("Tarjeta estará disponible próximamente con Mercado Pago", "warning");
      return;
    }

    setProcessing(true);

    const saleData = {
      saleChannel: "local",
      customerName: customerName.trim() || "Venta local",
      customerEmail: customerEmail.trim(),
      paymentMethod,
      paymentStatus: "paid",
      deliveryMethod: "local_pickup",
      products: localCart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
    };

    const result = await saleService.create(saleData);

    if (result.success) {
      showAlert("Venta local registrada correctamente", "success");
      setLocalCart([]);
      setCustomerName("");
      setCustomerEmail("");
      setPaymentMethod("cash");
      await Promise.all([loadSales(false), loadProducts(false)]);
      setTab(0);
    } else {
      showAlert(result.error || "Error al registrar la venta", "error");
    }

    setProcessing(false);
  };

  const handleViewSale = (sale) => {
    setViewingSale(sale);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "success",
      pending: "warning",
      cancelled: "error",
    };

    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: "Completado",
      pending: "Pendiente",
      cancelled: "Cancelado",
    };

    return labels[status] || status;
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

  const getPaymentMethodLabel = (method) => {
    const methods = {
      credit_card: "Tarjeta de crédito",
      debit_card: "Tarjeta de débito",
      cash: "Efectivo",
      transfer: "Transferencia",
    };

    return methods[method] || method;
  };

  const getSaleChannelLabel = (channel) => {
    return channel === "local" ? "Local" : "Online";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <Button variant="contained" onClick={() => setTab(1)}>
            Nueva venta local
          </Button>
        </div>

        {alert.show && (
          <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

        <Paper>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
            <Tab label="Consulta de ventas" />
            <Tab label="Venta local" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <div className="space-y-6">
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

            <TableContainer component={Paper} className="overflow-x-auto">
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow className="bg-gray-50">
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Productos</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Pago</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No hay ventas para mostrar
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale) => (
                      <TableRow key={sale.id} hover>
                        <TableCell>{String(sale.id).slice(-8)}</TableCell>
                        <TableCell className="font-medium">
                          {sale.userName || sale.customerName || "Cliente"}
                        </TableCell>
                        <TableCell>{getSaleChannelLabel(sale.saleChannel)}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>{sale.products.reduce((sum, p) => sum + p.quantity, 0)} items</TableCell>
                        <TableCell className="font-bold text-purple-600">
                          ${Number(sale.total || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
                            <Chip
                              label={getPaymentStatusLabel(sale.paymentStatus)}
                              color={getPaymentStatusColor(sale.paymentStatus)}
                              size="small"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip label={getStatusLabel(sale.status)} color={getStatusColor(sale.status)} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton color="info" size="small" onClick={() => handleViewSale(sale)}>
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {tab === 1 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-4">
                  <Typography variant="h6" className="font-bold">
                    Buscar productos
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="Buscar por nombre, marca o categoría..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProductToLocalCart(product)}
                        className="rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-purple-400 hover:bg-purple-50"
                      >
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-bold text-purple-700">${Number(product.price || 0).toFixed(2)}</span>
                          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <Typography color="textSecondary">No hay productos disponibles</Typography>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <Card>
                <CardContent className="space-y-4">
                  <Typography variant="h6" className="font-bold">
                    Venta local
                  </Typography>

                  <TextField
                    fullWidth
                    label="Cliente (opcional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />

                  <TextField
                    fullWidth
                    label="Email (opcional)"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />

                  <FormControl fullWidth>
                    <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <MenuItem value="cash">Efectivo</MenuItem>
                      <MenuItem value="transfer">Transferencia</MenuItem>
                    </Select>
                  </FormControl>

                  <div className="space-y-3">
                    {localCart.length === 0 ? (
                      <Typography color="textSecondary">Agregá productos para iniciar la venta</Typography>
                    ) : (
                      localCart.map((item) => (
                        <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Typography className="font-semibold">{item.name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                ${Number(item.price || 0).toFixed(2)} c/u
                              </Typography>
                            </div>
                            <IconButton color="error" size="small" onClick={() => removeFromLocalCart(item.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center rounded-lg border border-gray-200">
                              <IconButton
                                size="small"
                                onClick={() => updateLocalQuantity(item.id, item.quantity - 1)}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                              <IconButton
                                size="small"
                                onClick={() => updateLocalQuantity(item.id, item.quantity + 1)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </div>

                            <Typography className="font-bold text-purple-700">
                              ${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                            </Typography>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-purple-700">${localTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={processing || localCart.length === 0}
                    onClick={handleCreateLocalSale}
                  >
                    {processing ? "Registrando..." : "Registrar venta"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles de la venta" size="lg">
          {viewingSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-semibold">#{String(viewingSale.id).slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-semibold">{viewingSale.userName || viewingSale.customerName || "Cliente"}</p>
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
                        <TableCell>
                          ${(Number(product.price || 0) * Number(product.quantity || 0)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}