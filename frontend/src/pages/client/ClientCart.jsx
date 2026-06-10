"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { saleService } from "../../services/saleService";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  ShoppingBag as ShoppingBagIcon,
  WifiOff as WifiOffIcon,
} from "@mui/icons-material";

export default function ClientCart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCartStore();

  const [isOnline, setIsOnline] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState("home_delivery");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [processing, setProcessing] = useState(false);

  const subtotal = getCartTotal();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3500);
  };

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showAlert("El carrito está vacío", "error");
      return;
    }

    if (!paymentMethod) {
      showAlert("Por favor, seleccioná un método de pago", "error");
      return;
    }

    if (!isOnline) {
      showAlert("No se detecta conexión a internet", "error");
      return;
    }

    if (!user) {
      localStorage.setItem("returnUrl", "/cart");
      showAlert("Debés iniciar sesión para completar la compra", "warning");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }

    if (user.role !== "client") {
      showAlert("Solo las cuentas de cliente pueden realizar compras", "error");
      return;
    }

    if (deliveryMethod === "home_delivery") {
      const { street, city, postalCode, country } = deliveryAddress;

      if (!street || !city || !postalCode || !country) {
        showAlert("Completá todos los campos obligatorios de la dirección", "error");
        return;
      }
    }

    setProcessing(true);

    try {
      const saleData = {
        products: cart.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        deliveryMethod,
        deliveryAddress: deliveryMethod === "home_delivery" ? deliveryAddress : null,
        shippingCost: 0,
      };

      const result = await saleService.create(saleData);

      if (!result.success) {
        showAlert(result.error || result.message || "Error al procesar la compra", "error");
        return;
      }

      const paymentLabels = {
        cash: "Efectivo",
        transfer: "Transferencia bancaria",
        credit_card: "Tarjeta de crédito",
        debit_card: "Tarjeta de débito",
      };

      let resumen = "*Alkimia - Nueva compra*\n";
      resumen += `*Cliente:* ${user.name || "Cliente"}\n`;
      resumen += "------------------------------\n";
      resumen += "*Productos:*\n";

      cart.forEach((item) => {
        resumen += `- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
      });

      resumen += "------------------------------\n";
      resumen += `*Entrega:* ${
        deliveryMethod === "home_delivery" ? "Envío a domicilio" : "Retiro en local"
      }\n`;

      if (deliveryMethod === "home_delivery") {
        resumen += `*Dirección:* ${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.postalCode}, ${deliveryAddress.country}\n`;
        resumen += "*Envío:* el cargo del envío corre por cuenta del cliente\n";
      }

      resumen += `*Pago:* ${paymentLabels[paymentMethod] || paymentMethod}\n`;
      resumen += `*Total:* $${subtotal.toFixed(2)}\n`;

      const mensajeCodificado = encodeURIComponent(resumen);
      const numeroTelefono = "543815533148";
      window.open(`https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`, "_blank");

      showAlert("Compra realizada con éxito", "success");
      clearCart();

      setTimeout(() => {
        navigate("/orders");
      }, 1600);
    } catch (error) {
      console.error("[Checkout error]", error);
      showAlert(error.message || "Error inesperado al procesar la compra", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <PublicLayout>
        <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 text-center">
          <ShoppingBagIcon style={{ fontSize: 76 }} className="mb-4 text-gray-400" />
          <Typography variant="h5" className="mb-4">
            Tu carrito está vacío
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Ir a la tienda
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Mi carrito</h1>

        {!isOnline && (
          <Alert severity="error">
            <div className="flex items-center gap-2">
              <WifiOffIcon fontSize="small" />
              <span>No se detecta conexión a internet.</span>
            </div>
          </Alert>
        )}

        {alert.show && (
          <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <Card>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <Typography variant="h6" className="font-bold">
                  Productos
                </Typography>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[88px_1fr_auto] sm:items-center"
                    >
                      <img
                        src={item.image || "/placeholder.svg?height=96&width=80"}
                        alt={item.name}
                        className="h-24 w-18 rounded object-cover sm:h-28 sm:w-22"
                      />

                      <div className="min-w-0 space-y-2">
                        <div>
                          <Typography variant="body1" className="font-semibold">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.brand}
                          </Typography>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Typography className="font-semibold">${item.price.toFixed(2)}</Typography>

                          <div className="flex items-center rounded-lg border border-gray-200">
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </div>

                          <Typography className="font-semibold text-purple-700">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-end sm:col-span-1">
                        <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <Typography variant="h6" className="font-bold">
                  Método de pago *
                </Typography>

                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Radio value="cash" />
                    <span>
                      <Typography className="font-medium">Efectivo</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Abonás al recibir o retirar tu pedido.
                      </Typography>
                    </span>
                  </label>

                  <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Radio value="transfer" />
                    <span>
                      <Typography className="font-medium">Transferencia bancaria</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Te enviaremos los datos de la cuenta.
                      </Typography>
                    </span>
                  </label>

                  <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Radio value="credit_card" />
                    <span>
                      <Typography className="font-medium">Tarjeta de crédito</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Pagás de forma segura con tarjeta.
                      </Typography>
                    </span>
                  </label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <Typography variant="h6" className="font-bold">
                  Método de entrega
                </Typography>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="home_delivery"
                    checked={deliveryMethod === "home_delivery"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <Typography className="font-medium">Envío a domicilio</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Recibí tu pedido en tu dirección. El cargo del envío corre por tu cuenta.
                    </Typography>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="local_pickup"
                    checked={deliveryMethod === "local_pickup"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <Typography className="font-medium">Retiro en local</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Retirá tu pedido en nuestro local.
                    </Typography>
                  </span>
                </label>
              </CardContent>
            </Card>

            {deliveryMethod === "home_delivery" && (
              <Card>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <Typography variant="h6" className="font-bold">
                    Dirección de envío
                  </Typography>

                  <Alert severity="info">
                    El cargo del envío corre por tu cuenta.
                  </Alert>

                  <div>
                    <Typography variant="body2" className="mb-1 font-medium">
                      Calle y número *
                    </Typography>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Typography variant="body2" className="mb-1 font-medium">
                        Ciudad *
                      </Typography>
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <Typography variant="body2" className="mb-1 font-medium">
                        Código postal *
                      </Typography>
                      <input
                        type="text"
                        value={deliveryAddress.postalCode}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Typography variant="body2" className="mb-1 font-medium">
                      País *
                    </Typography>
                    <input
                      type="text"
                      value={deliveryAddress.country}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <Typography variant="body2" className="mb-1 font-medium">
                      Notas adicionales
                    </Typography>
                    <textarea
                      value={deliveryAddress.notes || ""}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, notes: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:sticky lg:top-5 lg:self-start">
            <Card>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <Typography variant="h6" className="font-bold">
                  Resumen del pedido
                </Typography>

                <Divider />

                <div className="flex justify-between gap-4">
                  <Typography>Subtotal:</Typography>
                  <Typography>${subtotal.toFixed(2)}</Typography>
                </div>

                <div className="flex justify-between gap-4">
                  <Typography>Envío:</Typography>
                  <Typography className={deliveryMethod === "home_delivery" ? "text-gray-700" : "text-green-600"}>
                    {deliveryMethod === "home_delivery" ? "A cargo del cliente" : "Gratis"}
                  </Typography>
                </div>

                <Divider />

                <div className="flex justify-between gap-4">
                  <Typography variant="h6" className="font-bold">
                    Total:
                  </Typography>
                  <Typography variant="h6" className="font-bold text-purple-700">
                    ${subtotal.toFixed(2)}
                  </Typography>
                </div>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  disabled={processing || !isOnline}
                  startIcon={<ShoppingBagIcon />}
                  sx={{
                    backgroundColor: "#9333ea",
                    "&:hover": { backgroundColor: "#7e22ce" },
                  }}
                >
                  {!isOnline ? "Sin conexión" : processing ? "Procesando..." : "Finalizar compra"}
                </Button>

                <Button variant="outlined" fullWidth onClick={() => navigate("/")}>
                  Seguir comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}