"use client";

import { useEffect, useMemo, useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { useCartStore } from "../../store/cartStore";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Search as SearchIcon, ShoppingCart as ShoppingCartIcon } from "@mui/icons-material";

const PRODUCTS_PER_PAGE = 4;

export default function ClientMarketplace() {
  const { addToCart } = useCartStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    loadData();
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => product.stock > 0);
  }, [products]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    return visibleProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [visibleProducts, page]);

  const loadData = async () => {
    setLoading(true);

    const [productsResult, categoriesResult] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
    ]);

    if (productsResult.success) {
      setProducts(productsResult.data || []);
    }

    if (categoriesResult.success) {
      setCategories(categoriesResult.data || []);
    }

    setPage(1);
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);

    if (!searchQuery.trim() && !selectedCategory) {
      await loadData();
      return;
    }

    let result;

    if (searchQuery.trim()) {
      result = await productService.search(searchQuery.trim());
    } else {
      result = await productService.getByCategory(selectedCategory);
    }

    if (result?.success) {
      let data = result.data || [];

      if (searchQuery.trim() && selectedCategory) {
        data = data.filter((product) => {
          return product.category === selectedCategory || product.categoryId === selectedCategory;
        });
      }

      setProducts(data);
      setPage(1);
    }

    setLoading(false);
  };

  const handleClearFilters = async () => {
    setSearchQuery("");
    setSelectedCategory("");
    await loadData();
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setSnackbar({ open: true, message: `${product.name} agregado al carrito` });
  };

  return (
    <PublicLayout>
      <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 30, sm: 40 },
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.15,
              mb: 1,
            }}
          >
            Bienvenido a Alkimia
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: { xs: 14, sm: 16 } }}>
            Descubrí las mejores prendas a los mejores precios
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr",
              md: "minmax(0, 1fr) 220px 120px 120px",
            },
            gap: 1.5,
            mb: 3,
            width: "100%",
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar prendas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={selectedCategory}
              label="Categoría"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSearch}
            fullWidth
            sx={{
              minHeight: 56,
              backgroundColor: "#9333ea",
              "&:hover": { backgroundColor: "#7e22ce" },
            }}
          >
            Buscar
          </Button>

          <Button
            variant="outlined"
            onClick={handleClearFilters}
            fullWidth
            sx={{
              minHeight: 56,
              borderColor: "#9333ea",
              color: "#9333ea",
              "&:hover": {
                borderColor: "#7e22ce",
                backgroundColor: "rgba(147, 51, 234, 0.06)",
              },
            }}
          >
            Limpiar
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : visibleProducts.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No se encontraron productos disponibles
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card className="flex h-full flex-col transition-shadow hover:shadow-lg">
                    <CardMedia
                      component="img"
                      image={product.image || "/abstract-book-cover.png"}
                      alt={product.name}
                      sx={{
                        height: 260,
                        objectFit: "cover",
                      }}
                    />

                    <CardContent className="flex flex-grow flex-col">
                      {product.categoryName && (
                        <Chip
                          label={product.categoryName}
                          size="small"
                          sx={{
                            backgroundColor: "#9333ea",
                            color: "white",
                            width: "fit-content",
                            mb: 1,
                          }}
                        />
                      )}

                      <Typography variant="h6" component="h2" className="mb-1 line-clamp-2 font-bold">
                        {product.name}
                      </Typography>

                      <Typography variant="body2" color="textSecondary" className="mb-2">
                        {product.brand}
                      </Typography>

                      <Typography variant="body2" color="textSecondary" className="mb-3 line-clamp-2 flex-grow">
                        {product.description}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
                        <Typography variant="h5" className="font-bold" sx={{ color: "#9333ea" }}>
                          ${Number(product.price || 0).toFixed(2)}
                        </Typography>

                        <Typography variant="body2" color="textSecondary">
                          Stock: {product.stock}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        sx={{
                          backgroundColor: "#9333ea",
                          "&:hover": { backgroundColor: "#7e22ce" },
                        }}
                      >
                        Agregar al carrito
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Stack alignItems="center" sx={{ pt: 4, pb: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="secondary"
                size="large"
              />

              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Mostrando {paginatedProducts.length} de {visibleProducts.length} productos
              </Typography>
            </Stack>
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PublicLayout>
  );
}