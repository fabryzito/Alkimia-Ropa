"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { saleService } from "../../services/saleService";
import { productService } from "../../services/productService";
import { Card, CardContent, Typography, Grid, CircularProgress } from "@mui/material";
import {
  AddShoppingCart as AddShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const [salesStats, productsResult] = await Promise.all([saleService.getStatistics(), productService.getAll()]);

    if (salesStats.success && productsResult.success) {
      setStats({
        ...salesStats.data,
        totalProducts: productsResult.data.length,
        lowStockProducts: productsResult.data.filter((p) => p.stock < 10).length,
      });
    }

    setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Panel de empleado</h1>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="cursor-pointer hover:shadow-lg" onClick={() => navigate("/employee/sales")}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary">Ventas</Typography>
                  <Typography variant="h4" className="font-bold">
                    {stats?.totalSales || 0}
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
                    ${Number(stats?.totalRevenue || 0).toFixed(2)}
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
                  <Typography color="textSecondary">Productos</Typography>
                  <Typography variant="h4" className="font-bold">
                    {stats?.totalProducts || 0}
                  </Typography>
                </div>
                <InventoryIcon className="text-purple-500" style={{ fontSize: 48 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="cursor-pointer hover:shadow-lg" onClick={() => navigate("/employee/sales")}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary">Venta local</Typography>
                  <Typography variant="h4" className="font-bold text-purple-600">
                    Nueva
                  </Typography>
                </div>
                <AddShoppingCartIcon className="text-orange-500" style={{ fontSize: 48 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </AdminLayout>
  );
}