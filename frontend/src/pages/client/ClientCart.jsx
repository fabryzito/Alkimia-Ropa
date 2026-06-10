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
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  ShoppingBag as ShoppingBagIcon,
  WifiOff as WifiOffIcon,
} from "@mui/icons-material";

const TRANSFER_DATA = {
  alias: "nataliaa72",
  cvu: "2850621630001000092508",
  titular: "maria Natalia balegno",
  banco: "macro",
  cuit: "25372816",
  mensaje: "Tu pedido queda reservado. Una vez hecha la transferencia, envianos el comprobante por WhatsApp.",
};

export default function ClientCart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCartStore();

  const [isOnline, setIsOnline] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState("home_delivery");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [guestData, setGuestData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "Argentina",
    notes: "",
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [processing, setProcessing] = useState(false);

  const subtotal = getCartTotal();
  const isGuestCheckout = !user;

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

  useEffect(() => {
    if (user) {
      setGuestData({
        name: user.name || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [user]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3500);
  };

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) updateQuantity(productId, newQuantity);
  };

  const selectPaymentMethod = (method) => {
    if (method === "credit_card" || method === "debit_card") {
      showAlert("El pago con tarjeta estará disponible próximamente con Mercado Pago", "warning");
      return;
    }

    setPaymentMethod(method);
  };

  const validateCheckout = () => {
    if (cart.length === 0) {
      showAlert("El carrito está vacío", "error");
      return false;
    }

    if (!paymentMethod) {
      showAlert("Por favor, seleccioná un método de pago", "error");
      return false;
    }

    if (!isOnline) {
      showAlert("No se detecta conexión a internet", "error");
      return false;
    }

    if (isGuestCheckout) {
      if (!guestData.name.trim() || !guestData.email.trim() || !guestData.phone.trim()) {
        showAlert("Completá nombre, email y teléfono para finalizar la compra", "error");
        return false;
      }
    }

    if (deliveryMethod === "home_delivery") {
      const { street, city, postalCode, country } = deliveryAddress;

      if (!street.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
        showAlert("Completá todos los campos obligatorios de la dirección", "error");
        return false;
      }
    }

    return true;
  };

  const buildWhatsAppSummary = () => {
    const customerName = guestData.name || user?.name || "Cliente";
    const customerEmail = guestData.email || user?.email || "";
    const customerPhone = guestData.phone || "";

    const paymentLabels = {
      cash: "Efectivo",
      transfer: "Transferencia bancaria",
    };

    let resumen = "*Alkimia - Nueva compra*\n";
    resumen += `*Cliente:* ${customerName}\n`;
    if (customerEmail) resumen += `*Email:* ${customerEmail}\n`;
    if (customerPhone) resumen += `*Teléfono:* ${customerPhone}\n`;
    resumen += "------------------------------\n";
    resumen += "*Productos:*\n";

    cart.forEach((item) => {
      resumen += `- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    resumen += "------------------------------\n";
    resumen += `*Entrega:* ${deliveryMethod === "home_delivery" ? "Envío a domicilio" : "Retiro en local"}\n`;

    if (deliveryMethod === "home_delivery") {
      resumen += `*Dirección:* ${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.postalCode}, ${deliveryAddress.country}\n`;
      if (deliveryAddress.notes) resumen += `*Notas:* ${deliveryAddress.notes}\n`;
      resumen += "*Envío:* el cargo del envío corre por cuenta del cliente\n";
    }

    resumen += `*Pago:* ${paymentLabels[paymentMethod] || paymentMethod}\n`;
    resumen += "*Estado del pago:* pendiente de confirmación\n";

    if (paymentMethod === "transfer") {
      resumen += "\n*Datos para transferencia:*\n";
      resumen += `Alias: ${TRANSFER_DATA.alias}\n`;
      resumen += `CBU/CVU: ${TRANSFER_DATA.cvu}\n`;
      resumen += `Titular: ${TRANSFER_DATA.titular}\n`;
      resumen += `Banco o billetera: ${TRANSFER_DATA.banco}\n`;
      resumen += `CUIT/CUIL: ${TRANSFER_DATA.cuit}\n`;
      resumen += `${TRANSFER_DATA.mensaje}\n`;
    }

    resumen += `*Total:* $${subtotal.toFixed(2)}\n`;

    return resumen;
  };

  const handleCheckout = async () => {
    if (!validateCheckout()) return;

    setProcessing(true);

    try {
      const saleData = {
        saleChannel: "online",
        customerName: guestData.name.trim() || user?.name || "Cliente",
        customerEmail: guestData.email.trim() || user?.email || "",
        customerPhone: guestData.phone.trim(),
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

      const mensajeCodificado = encodeURIComponent(buildWhatsAppSummary());
      const numeroTelefono = "543815533148";
      window.open(`https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`, "_blank");

      showAlert("Pedido creado. El pago queda pendiente de confirmación.", "success");
      clearCart();

      setTimeout(() => {
        if (user?.role === "client") {
          navigate("/orders");
        } else {
          navigate("/");
        }
      }, 1600);
    } catch (error) {
      console.error("[Checkout error]", error);
      showAlert(error.message || "Error inesperado al procesar la compra", "error");
    } finally {
      setProcessing(false);
    }
  };

  const paymentOptionClass = (method) => {
    const isSelected = paymentMethod === method;

    return [
      "flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition",
      isSelected ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:bg-gray-50",
    ].join(" ");
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Mi carrito</h1>
            <p className="text-sm text-gray-500">
              Podés comprar como invitado o iniciar sesión para ver el seguimiento desde tu cuenta.
            </p>
          </div>

          {!user && (
            <Button variant="outlined" onClick={() => navigate("/login")}>
              Iniciar sesión
            </Button>
          )}
        </div>

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
            {isGuestCheckout && (
              <Card>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <Typography variant="h6" className="font-bold">
                    Datos de contacto
                  </Typography>

                  <Alert severity="info">
                    No hace falta iniciar sesión para comprar. Usaremos estos datos para coordinar tu pedido.
                  </Alert>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Typography variant="body2" className="mb-1 font-medium">
                        Nombre y apellido *
                      </Typography>
                      <input
                        type="text"
                        value={guestData.name}
                        onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <Typography variant="body2" className="mb-1 font-medium">
                        Teléfono *
                      </Typography>
                      <input
                        type="tel"
                        value={guestData.phone}
                        onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Typography variant="body2" className="mb-1 font-medium">
                      Email *
                    </Typography>
                    <input
                      type="email"
                      value={guestData.email}
                      onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

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

                <button type="button" className={paymentOptionClass("cash")} onClick={() => selectPaymentMethod("cash")}>
                  <Radio checked={paymentMethod === "cash"} value="cash" />
                  <span>
                    <Typography className="font-medium">Efectivo</Typography>
                    <Typography variant="body2" color="textSecondary">
                      El pedido queda pendiente hasta confirmar el pago.
                    </Typography>
                  </span>
                </button>

                <button
                  type="button"
                  className={paymentOptionClass("transfer")}
                  onClick={() => selectPaymentMethod("transfer")}
                >
                  <Radio checked={paymentMethod === "transfer"} value="transfer" />
                  <span>
                    <Typography className="font-medium">Transferencia bancaria</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tu pedido queda reservado hasta confirmar el pago.
                    </Typography>
                  </span>
                </button>

                {paymentMethod === "transfer" && (
                  <Alert severity="info">
                    <div className="space-y-1">
                      <Typography className="font-semibold">Datos para transferir</Typography>
                      <Typography variant="body2">Alias: {TRANSFER_DATA.alias}</Typography>
                      <Typography variant="body2">CBU/CVU: {TRANSFER_DATA.cvu}</Typography>
                      <Typography variant="body2">Titular: {TRANSFER_DATA.titular}</Typography>
                      <Typography variant="body2">Banco o billetera: {TRANSFER_DATA.banco}</Typography>
                      <Typography variant="body2">CUIT/CUIL: {TRANSFER_DATA.cuit}</Typography>
                      <Typography variant="body2" className="pt-1">
                        {TRANSFER_DATA.mensaje}
                      </Typography>
                    </div>
                  </Alert>
                )}

                <button
                  type="button"
                  className="flex w-full cursor-not-allowed items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left opacity-70"
                  onClick={() => selectPaymentMethod("credit_card")}
                >
                  <Radio checked={false} disabled />
                  <span>
                    <Typography className="font-medium">Tarjeta de crédito</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Próximamente disponible con Mercado Pago.
                    </Typography>
                  </span>
                </button>
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

                  <Alert severity="info">El cargo del envío corre por tu cuenta.</Alert>

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