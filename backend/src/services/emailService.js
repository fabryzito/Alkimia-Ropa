import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const getPaymentMethodLabel = (method) => {
  const methods = {
    credit_card: "Tarjeta de Crédito",
    debit_card: "Tarjeta de Débito",
    cash: "Efectivo",
    transfer: "Transferencia",
  }
  return methods[method] || method
}

export const sendSaleEmail = async (saleData) => {
  try {

    const productsDetails = saleData.products
      .map(
        (p) =>
          `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${p.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${p.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${p.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${(p.price * p.quantity).toFixed(2)}</td>
      </tr>
    `,
      )
      .join("")

    const deliverySection =
      saleData.deliveryMethod === "home_delivery"
        ? `
              <div class="section">
                <p class="section-title">Información de Envío a Domicilio</p>
                <p><strong>Dirección:</strong> ${saleData.deliveryAddress.street}</p>
                <p><strong>Ciudad:</strong> ${saleData.deliveryAddress.city}</p>
                <p><strong>Código Postal:</strong> ${saleData.deliveryAddress.postalCode}</p>
                <p><strong>País:</strong> ${saleData.deliveryAddress.country}</p>
                ${saleData.deliveryAddress.notes ? `<p><strong>Notas:</strong> ${saleData.deliveryAddress.notes}</p>` : ""}
                <p><strong>Costo de Envío:</strong> $${(saleData.shippingCost || 0).toFixed(2)}</p>
                <p><strong>Estado del Pedido:</strong> ${saleData.orderStatus || "En preparación"}</p>
              </div>
            `
        : `
              <div class="section">
                <p class="section-title">Información de Retiro en Local</p>
                <p><strong>Método:</strong> Retiro en Local</p>
                <p><strong>Costo de Envío:</strong> Gratis</p>
                <p><strong>Estado del Pedido:</strong> ${saleData.orderStatus || "En preparación"}</p>
              </div>
            `

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 20px; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background-color: #e0e0e0; padding: 10px; text-align: left; font-weight: bold; }
            .total-row { background-color: #f0f0f0; font-weight: bold; }
            .highlight { color: #1e40af; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Comprobante de Venta - Librería</h1>
            </div>
            
            <div class="content">
              <div class="section">
                <p class="section-title">Información de la Venta</p>
                <p><strong>ID de Venta:</strong> ${saleData.id}</p>
                <p><strong>Fecha:</strong> ${new Date(saleData.date).toLocaleDateString("es-ES")}</p>
                <p><strong>Hora:</strong> ${new Date(saleData.date).toLocaleTimeString("es-ES")}</p>
              </div>

              <div class="section">
                <p class="section-title">Datos del Cliente</p>
                <p><strong>Nombre:</strong> ${saleData.userName}</p>
                <p><strong>Email:</strong> ${saleData.userEmail}</p>
              </div>

              <div class="section">
                <p class="section-title">Detalle de Productos</p>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style="text-align: center;">Cantidad</th>
                      <th style="text-align: right;">Precio Unitario</th>
                      <th style="text-align: right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productsDetails}
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right; padding: 10px;">TOTAL:</td>
                      <td style="text-align: right; padding: 10px;">$${saleData.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="section">
                <p class="section-title">Método de Pago</p>
                <p>${getPaymentMethodLabel(saleData.paymentMethod)}</p>
              </div>

              ${deliverySection}

              <div class="section">
                <p class="section-title">Estado de la Venta</p>
                <p><span class="highlight">${saleData.status === "completed" ? "✓ Completada" : "Pendiente"}</span></p>
              </div>
            </div>

            <div class="footer">
              <p>Este es un comprobante automático de tu compra en Librería.</p>
              <p>Si tienes preguntas, por favor contacta a nuestro equipo de soporte.</p>
              <p>&copy; ${new Date().getFullYear()} Librería. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || "gonzalezzitof@gmail.com",
      subject: `Nueva Venta - ID: ${saleData.id} - Cliente: ${saleData.userName}`,
      html: htmlContent,
      cc: saleData.userEmail,
    }

    await transporter.sendMail(mailOptions)
    return { success: true, message: "Email enviado correctamente" }
  } catch (error) {
    console.error("[v0] Error al enviar email:", error)
    return { success: false, error: error.message }
  }
}
