import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getPaymentMethodLabel = (method) => {
  const methods = {
    credit_card: "Tarjeta de crédito",
    debit_card: "Tarjeta de débito",
    cash: "Efectivo",
    transfer: "Transferencia",
  };

  return methods[method] || method || "No informado";
};

const getPaymentStatusLabel = (status) => {
  const statuses = {
    paid: "Pagado",
    pending: "Pendiente",
    cancelled: "Cancelado",
  };

  return statuses[status] || "Pendiente";
};

const getDeliveryMethodLabel = (method) => {
  return method === "home_delivery" ? "Envío a domicilio" : "Retiro en local";
};

const safeMoney = (value) => {
  return Number(value || 0).toFixed(2);
};

export const sendSaleEmail = async (saleData) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "Marianotrabajo05@gmail.com";
    const customerName = saleData.customerName || saleData.userName || "Cliente";
    const customerEmail = saleData.customerEmail || saleData.userEmail || "";
    const customerPhone = saleData.customerPhone || "";

    const productsDetails = (saleData.products || [])
      .map((p) => {
        const productName = p.productName || "Producto";
        const quantity = Number(p.quantity || 0);
        const price = Number(p.price || 0);

        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${productName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${safeMoney(price)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${safeMoney(price * quantity)}</td>
          </tr>
        `;
      })
      .join("");

    const deliverySection =
      saleData.deliveryMethod === "home_delivery"
        ? `
          <div class="section">
            <p class="section-title">Información de envío</p>
            <p><strong>Método:</strong> ${getDeliveryMethodLabel(saleData.deliveryMethod)}</p>
            <p><strong>Dirección:</strong> ${saleData.deliveryAddress?.street || "No informada"}</p>
            <p><strong>Ciudad:</strong> ${saleData.deliveryAddress?.city || "No informada"}</p>
            <p><strong>Código Postal:</strong> ${saleData.deliveryAddress?.postalCode || "No informado"}</p>
            <p><strong>País:</strong> ${saleData.deliveryAddress?.country || "No informado"}</p>
            ${
              saleData.deliveryAddress?.notes
                ? `<p><strong>Notas:</strong> ${saleData.deliveryAddress.notes}</p>`
                : ""
            }
            <p><strong>Envío:</strong> El cargo del envío corre por cuenta del cliente.</p>
            <p><strong>Estado del pedido:</strong> ${saleData.orderStatus || "Entregado"}</p>
          </div>
        `
        : `
          <div class="section">
            <p class="section-title">Información de entrega</p>
            <p><strong>Método:</strong> Retiro en local</p>
            <p><strong>Envío:</strong> Gratis</p>
            <p><strong>Estado del pedido:</strong> ${saleData.orderStatus || "Entregado"}</p>
          </div>
        `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 680px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
            .header { background-color: #9333ea; color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
            .content { background-color: white; padding: 20px; }
            .footer { background-color: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #666; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #7e22ce; margin-bottom: 10px; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background-color: #eee7ff; padding: 10px; text-align: left; font-weight: bold; }
            .total-row { background-color: #f3f4f6; font-weight: bold; }
            .highlight { color: #16a34a; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Resumen de venta entregada - Alkimia</h1>
            </div>

            <div class="content">
              <div class="section">
                <p class="section-title">Información de la venta</p>
                <p><strong>ID:</strong> ${saleData.id || "Sin ID"}</p>
                <p><strong>Fecha:</strong> ${saleData.date ? new Date(saleData.date).toLocaleDateString("es-AR") : new Date().toLocaleDateString("es-AR")}</p>
                <p><strong>Hora:</strong> ${saleData.date ? new Date(saleData.date).toLocaleTimeString("es-AR") : new Date().toLocaleTimeString("es-AR")}</p>
              </div>

              <div class="section">
                <p class="section-title">Datos del cliente</p>
                <p><strong>Nombre:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail || "No informado"}</p>
                <p><strong>Teléfono:</strong> ${customerPhone || "No informado"}</p>
              </div>

              <div class="section">
                <p class="section-title">Detalle de productos</p>
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
                      <td style="text-align: right; padding: 10px;">$${safeMoney(saleData.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="section">
                <p class="section-title">Pago</p>
                <p><strong>Método:</strong> ${getPaymentMethodLabel(saleData.paymentMethod)}</p>
                <p><strong>Estado:</strong> ${getPaymentStatusLabel(saleData.paymentStatus)}</p>
              </div>

              ${deliverySection}

              <div class="section">
                <p class="section-title">Estado final</p>
                <p><span class="highlight">Pedido entregado</span></p>
              </div>
            </div>

            <div class="footer">
              <p>Este email fue generado automáticamente por el sistema de Alkimia.</p>
              <p>&copy; ${new Date().getFullYear()} Alkimia. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const recipients = [adminEmail];
    const cc = customerEmail && customerEmail.includes("@") ? customerEmail : undefined;

    await transporter.sendMail({
      from: `"Alkimia" <${process.env.EMAIL_USER}>`,
      to: recipients.join(","),
      cc,
      subject: `Pedido entregado - Venta ${saleData.id || ""} - ${customerName}`,
      html: htmlContent,
    });

    console.log(`[email] Resumen de venta enviado a ${recipients.join(",")}`);
    return { success: true, message: "Email enviado correctamente" };
  } catch (error) {
    console.error("[email] Error al enviar email:", error);
    return { success: false, error: error.message };
  }
};