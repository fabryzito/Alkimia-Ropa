"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PublicLayout from "../../components/layout/PublicLayout"
import { useCartStore } from "../../store/cartStore"
import { useAuthStore } from "../../store/authStore"
import { saleService } from "../../services/saleService"
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingBag as ShoppingBagIcon,
  WifiOff as WifiOffIcon,
} from "@mui/icons-material"

export default function ClientCart() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCartStore()

  const [isOnline, setIsOnline] = useState(true)
  
  const [deliveryMethod, setDeliveryMethod] = useState("home_delivery")
  // NUEVO ESTADO: Guarda el método de pago seleccionado (vacío por defecto)
  const [paymentMethod, setPaymentMethod] = useState("") 
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  })
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showAlert("El carrito está vacío", "error")
      return
    }

    // VALIDACIÓN NUEVA: Si no seleccionó método de pago, no lo deja finalizar
    if (!paymentMethod) {
      showAlert("Por favor, selecciona un método de pago antes de finalizar tu compra", "error")
      return
    }

    if (!isOnline) {
      showAlert("No se detecta conexión a internet. Por favor revise su conexión antes de finalizar la compra", "error")
      return
    }

    if (!user) {
      localStorage.setItem("returnUrl", "/cart")
      showAlert("Debes iniciar sesión para completar la compra", "warning")
      setTimeout(() => {
        navigate("/login")
      }, 1500)
      return
    }

    if (user.role !== "client") {
      showAlert(
        "Solo los clientes pueden realizar compras. Por favor, inicia sesión con una cuenta de cliente.",
        "error",
      )
      return
    }

    if (deliveryMethod === "home_delivery") {
      if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode || !deliveryAddress.country) {
        showAlert("Por favor completa todos los campos de la dirección de envío", "error")
        return
      }
    }

    setProcessing(true)

    try {
      const shippingCost = deliveryMethod === "home_delivery" ? 100 : 0

      const saleData = {
        products: cart.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
        paymentMethod, // Envía el método seleccionado dinámicamente al backend
        deliveryMethod, 
        deliveryAddress: deliveryMethod === "home_delivery" ? deliveryAddress : null, 
        shippingCost, 
      }

      const result = await saleService.create(saleData)

      if (result.success) {
        // TRADUCCIÓN DEL MÉTODO PARA EL MENSAJE
        const labelsPago = {
          cash: "Efectivo",
          transfer: "Transferencia Bancaria",
          credit_card: "Tarjeta de Crédito"
        }

        // LÓGICA DE WHATSAPP: Construimos el resumen de la compra
        let resumen = "*📚 Sistema de Gestión - Alkimia*\n";
        resumen += `*Cliente:* ${user.name || "Cliente Alkimia"}\n`;
        resumen += "----------------------------------\n";
        resumen += "*Resumen de mi Compra:*\n\n";

        cart.forEach((item) => {
          resumen += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        resumen += "\n----------------------------------\n";
        resumen += `*Método de Entrega:* ${deliveryMethod === "home_delivery" ? "Envío a Domicilio" : "Retiro en Local"}\n`;
        if (deliveryMethod === "home_delivery") {
          resumen += `*Dirección:* ${deliveryAddress.street}, ${deliveryAddress.city}\n`;
          resumen += `*Envío:* $100.00\n`;
        }
        
        const totalFinal = deliveryMethod === "home_delivery" ? getCartTotal() + 100 : getCartTotal();
        resumen += `*Método de Pago:* ${labelsPago[paymentMethod]}\n`;
        resumen += `*Total Final:* $${totalFinal.toFixed(2)}\n`;

        // Codificar texto y redirigir al número indicado
        const mensajeCodificado = encodeURIComponent(resumen);
        const numeroTelefono = "543815533148"; 
        const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
        
        // Abrimos la pestaña de WhatsApp
        window.open(urlWhatsApp, "_blank");

        // Continuamos con el flujo normal de la app
        showAlert("Compra realizada con éxito. Revisa tu email para el comprobante", "success")
        clearCart()
        setTimeout(() => {
          navigate("/orders")
        }, 2000)
      } else {
        const errorMsg = result.error || result.message || "Error al procesar la compra"
        showAlert(errorMsg, "error")
      }
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      showAlert(error.message || "Error inesperado al procesar la compra", "error")
    } finally {
      setProcessing(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  if (cart.length === 0) {
    return (
      <PublicLayout>
        <div className="text-center py-16">
          <ShoppingBagIcon style={{ fontSize: 80 }} className="text-gray-400 mb-4" />
          <Typography variant="h5" className="mb-4">
            Tu carrito está vacío
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Ir a la Tienda
          </Button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>

        {!isOnline && (
          <Alert severity="error" onClose={() => {}}>
            <div className="flex items-center gap-2">
              <WifiOffIcon fontSize="small" />
              <span>No se detecta conexión a Internet. Por favor revise su conexión antes de finalizar la compra.</span>
            </div>
          </Alert>
        )}

        {alert.show && (
          <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-50">
                    <TableCell>Producto</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || "/placeholder.svg?height=80&width=60&query=book"}
                            alt={item.name}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div>
                            <Typography variant="body1" className="font-semibold">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {item.brand}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography className="w-8 text-center">{item.quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <AddIcon />
                          </IconButton>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* SECCIÓN NUEVA: MÉTODOS DE PAGO */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" style={{ color: '#111827', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '12px' }}>
                    Método de Pago *
                  </FormLabel>
                  <RadioGroup
                    aria-label="payment-method"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="space-y-3"
                  >
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <Radio value="cash" className="p-0" />
                      <span className="ml-3">
                        <Typography variant="body1" className="font-medium">💵 Efectivo</Typography>
                        <Typography variant="body2" color="textSecondary">Abona de forma presencial al recibir o retirar tu pedido</Typography>
                      </span>
                    </label>

                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <Radio value="transfer" className="p-0" />
                      <span className="ml-3">
                        <Typography variant="body1" className="font-medium">🏦 Transferencia Bancaria</Typography>
                        <Typography variant="body2" color="textSecondary">Te enviaremos los datos de nuestra cuenta de inmediato</Typography>
                      </span>
                    </label>

                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <Radio value="credit_card" className="p-0" />
                      <span className="ml-3">
                        <Typography variant="body1" className="font-medium">💳 Tarjeta de Crédito</Typography>
                        <Typography variant="body2" color="textSecondary">Paga de forma segura usando tu tarjeta de crédito habitual</Typography>
                      </span>
                    </label>
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-bold mb-4">
                  Método de Entrega
                </Typography>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="home_delivery"
                      checked={deliveryMethod === "home_delivery"}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3">
                      <Typography variant="body1" className="font-medium">
                        Envío a Domicilio
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Recibe tu pedido en tu dirección (cargo del envío: $100)
                      </Typography>
                    </span>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="local_pickup"
                      checked={deliveryMethod === "local_pickup"}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3">
                      <Typography variant="body1" className="font-medium">
                        Retiro en Local
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Recoge tu pedido en nuestro local sin costo adicional
                      </Typography>
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {deliveryMethod === "home_delivery" && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-bold mb-4">
                    Dirección de Envío
                  </Typography>
                  <Alert severity="info" className="mb-4">
                    <Typography variant="body2">El costo del envío ($100) corre por tu cuenta</Typography>
                  </Alert>
                  <div className="space-y-4">
                    <div>
                      <Typography variant="body2" className="font-medium mb-1">
                        Calle y Número *
                      </Typography>
                      <input
                        type="text"
                        placeholder="Ej: Avenida Principal 123"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Typography variant="body2" className="font-medium mb-1">
                          Ciudad *
                        </Typography>
                        <input
                          type="text"
                          placeholder="Ej: Buenos Aires"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <Typography variant="body2" className="font-medium mb-1">
                          Código Postal *
                        </Typography>
                        <input
                          type="text"
                          placeholder="Ej: 1425"
                          value={deliveryAddress.postalCode}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Typography variant="body2" className="font-medium mb-1">
                        País *
                      </Typography>
                      <input
                        type="text"
                        placeholder="Ej: Argentina"
                        value={deliveryAddress.country}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, country: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <Typography variant="body2" className="font-medium mb-1">
                        Notas Adicionales (Opcional)
                      </Typography>
                      <textarea
                        placeholder="Ej: Apto 4B, cerca de la estación"
                        value={deliveryAddress.notes || ""}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardContent className="space-y-4">
                <Typography variant="h6" className="font-bold">
                  Resumen del Pedido
                </Typography>

                <Divider />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography>Subtotal:</Typography>
                    <Typography>${getCartTotal().toFixed(2)}</Typography>
                  </div>
                  {deliveryMethod === "home_delivery" && (
                    <div className="flex justify-between">
                      <Typography>Envío:</Typography>
                      <Typography className="text-red-600">$100.00</Typography>
                    </div>
                  )}
                  {deliveryMethod === "local_pickup" && (
                    <div className="flex justify-between">
                      <Typography>Envío:</Typography>
                      <Typography className="text-green-600">Gratis</Typography>
                    </div>
                  )}
                  <Divider />
                  <div className="flex justify-between">
                    <Typography variant="h6" className="font-bold">
                      Total:
                    </Typography>
                    <Typography variant="h6" className="font-bold text-purple-600">
                      ${(deliveryMethod === "home_delivery" ? getCartTotal() + 100 : getCartTotal()).toFixed(2)}
                    </Typography>
                  </div>
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
                    "&:hover": {
                      backgroundColor: "#7e22ce",
                    },
                  }}
                >
                  {!isOnline ? "Sin conexión a Internet" : processing ? "Procesando..." : "Finalizar Compra"}
                </Button>

                <Button variant="outlined" fullWidth onClick={() => navigate("/")}>
                  Seguir Comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}