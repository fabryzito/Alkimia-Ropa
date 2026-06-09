"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PublicLayout from "../../components/layout/PublicLayout"
import { productService } from "../../services/productService"
import { categoryService } from "../../services/categoryService"
import { useCartStore } from "../../store/cartStore"
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material"
import { Search as SearchIcon, ShoppingCart as ShoppingCartIcon } from "@mui/icons-material"

export default function ClientMarketplace() {
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [snackbar, setSnackbar] = useState({ open: false, message: "" })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [productsResult, categoriesResult] = await Promise.all([productService.getAll(), categoryService.getAll()])

    if (productsResult.success) {
      // Only show products with stock
      setProducts(productsResult.data.filter((p) => p.stock > 0))
    }
    if (categoriesResult.success) {
      setCategories(categoriesResult.data)
    }
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedCategory) {
      loadData()
      return
    }

    let result
    if (searchQuery.trim()) {
      result = await productService.search(searchQuery)
    } else if (selectedCategory) {
      result = await productService.getByCategory(selectedCategory)
    }

    if (result.success) {
      setProducts(result.data.filter((p) => p.stock > 0))
    }
  }

  const handleAddToCart = (product) => {
    addToCart(product, 1)
    setSnackbar({ open: true, message: `${product.name} agregado al carrito` })
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    loadData()
  }

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenido a Alkimia</h1>
          <p className="text-gray-600">Descubre las mejoreas prendas a los mejores precios</p>
        </div>

        <div className="flex gap-4 mb-6">
          <TextField
            fullWidth
            placeholder="Buscar Prendas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl style={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select value={selectedCategory} label="Categoría" onChange={(e) => setSelectedCategory(e.target.value)}>
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
  style={{ minWidth: 120 }}
  sx={{
    backgroundColor: "#9333ea",
    "&:hover": {
      backgroundColor: "#7e22ce",
    },
  }}
>
            Buscar
          </Button>
          <Button variant="outlined" onClick={handleClearFilters}>
            Limpiar
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Typography variant="h6" color="textSecondary">
              No se encontraron productos disponibles
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardMedia
                    component="img"
                    height="300"
                    image={product.image || "/abstract-book-cover.png"}
                    alt={product.name}
                    className="h-64 object-cover"
                  />
                  <CardContent className="flex-grow flex flex-col">
                  <Chip
  label={product.categoryName}
  size="small"
  sx={{
    backgroundColor: "#9333ea",
    color: "white",
  }}
  className="mb-2 w-fit"
/>
                    <Typography variant="h6" component="h2" className="mb-1 font-bold line-clamp-2">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-2">
                      {product.brand}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-3 line-clamp-2 flex-grow">
                      {product.description}
                    </Typography>
                    <div className="flex justify-between items-center mb-2">
                      <Typography
  variant="h5"
  className="font-bold"
  sx={{ color: "#9333ea" }}
>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Stock: {product.stock}
                      </Typography>
                    </div>
                    <Button
  variant="contained"
  fullWidth
  startIcon={<ShoppingCartIcon />}
  onClick={() => handleAddToCart(product)}
  disabled={product.stock === 0}
  sx={{
    backgroundColor: "#9333ea",
    "&:hover": {
      backgroundColor: "#7e22ce",
    },
  }}
>
  Agregar al Carrito
</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
      </div>
    </PublicLayout>
  )
}
