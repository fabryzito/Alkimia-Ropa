"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Modal from "../../components/common/Modal";
import { saleService } from "../../services/saleService";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

export default function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    loadReports();
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3500);
  };

  const loadReports = async () => {
    setLoading(true);
    const [statsResult, salesResult] = await Promise.all([saleService.getStatistics(), saleService.getAll()]);

    if (statsResult.success) setReports(statsResult.data);
    if (salesResult.success) setSales(salesResult.data || []);

    setLoading(false);
  };

  const handleResetReports = async () => {
    const result = await saleService.resetReports();

    if (result.success) {
      showAlert("Reportes reiniciados. Ventas eliminadas y stock restaurado.", "success");
      setResetModalOpen(false);
      loadReports();
    } else {
      showAlert(result.error || "Error al reiniciar reportes", "error");
    }
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Reportes de ventas</h1>
          <Button color="error" variant="outlined" onClick={() => setResetModalOpen(true)}>
            Reiniciar reportes
          </Button>
        </div>

        {alert.show && (
          <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary">Total ventas</Typography>
                  <Typography variant="h4" className="font-bold">
                    {reports?.totalSales || 0}
                  </Typography>
                </div>
                <ShoppingCartIcon className="text-purple-500" style={{ fontSize: 48 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary">Ingresos</Typography>
                  <Typography variant="h4" className="font-bold text-green-600">
                    ${Number(reports?.totalRevenue || 0).toFixed(2)}
                  </Typography>
                </div>
                <AttachMoneyIcon className="text-green-500" style={{ fontSize: 48 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary">Venta promedio</Typography>
                  <Typography variant="h4" className="font-bold text-purple-600">
                    ${Number(reports?.averageSale || 0).toFixed(2)}
                  </Typography>
                </div>
                <TrendingUpIcon className="text-orange-500" style={{ fontSize: 48 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary">Ventas local</Typography>
                  <Typography variant="h4" className="font-bold">
                    {reports?.localSales || 0}
                  </Typography>
                </div>
                <BarChartIcon className="text-purple-500" style={{ fontSize: 48 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4 font-bold">
              Detalle de ventas
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-100">
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <TableRow key={sale.id} hover>
                        <TableCell>{String(sale.id).slice(-8)}</TableCell>
                        <TableCell>{sale.userName || sale.customerName || "Cliente"}</TableCell>
                        <TableCell>{sale.saleChannel === "local" ? "Local" : "Online"}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell align="right">${Number(sale.total || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay ventas disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reiniciar reportes">
          <div className="space-y-4">
            <Alert severity="error">
              Esta acción eliminará todas las ventas y devolverá el stock de los productos vendidos. No borra productos,
              usuarios, clientes, categorías ni proveedores.
            </Alert>
            <p>¿Seguro que querés reiniciar los reportes?</p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setResetModalOpen(false)}>Cancelar</Button>
              <Button color="error" variant="contained" onClick={handleResetReports}>
                Reiniciar reportes
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}