"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/AdminLayout"
import Modal from "../../components/common/Modal"
import { productService } from "../../services/productService"
import { categoryService } from "../../services/categoryService"
import { providerService } from "../../services/providerService"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    categoryName: "",
    brand: "",
    price: "",
    stock: "",
    provider: "",
    providerName: "",
    description: "",
    image: "",
  })
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [productsResult, categoriesResult, providersResult] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      providerService.getAll(),
    ])

    if (productsResult.success) setProducts(productsResult.data)
    if (categoriesResult.success) setCategories(categoriesResult.data)
    if (providersResult.success) setProviders(providersResult.data)
    setLoading(false)
  }

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        category: product.category,
        categoryName: product.categoryName,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        provider: product.provider,
        providerName: product.providerName,
        description: product.description,
        image: product.image || "",
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        category: "",
        categoryName: "",
        brand: "",
        price: "",
        stock: "",
        provider: "",
        providerName: "",
        description: "",
        image: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleViewProduct = (product) => {
    setViewingProduct(product)
    setIsViewModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.category || !formData.provider || !formData.price || !formData.stock) {
      showAlert("Todos los campos obligatorios deben ser completados", "error")
      return
    }

    const category = categories.find((c) => c.id === formData.category)
    const provider = providers.find((p) => p.id === formData.provider)

    const productData = {
      name: formData.name,
      brand: formData.brand,
      description: formData.description,
      image: formData.image,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
      category: formData.category, // Send as string ObjectId
      provider: formData.provider, // Send as string ObjectId
    }

    const result = editingProduct
      ? await productService.update(editingProduct.id, productData)
      : await productService.create(productData)

    if (result.success) {
      showAlert(editingProduct ? "Producto actualizado correctamente" : "Producto creado correctamente", "success")
      loadData()
      handleCloseModal()
    } else {
      showAlert(result.error || "Error al guardar el producto", "error")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      const result = await productService.delete(id)
      if (result.success) {
        showAlert("Producto eliminado correctamente", "success")
        loadData()
      } else {
        showAlert(result.error || "Error al eliminar el producto", "error")
      }
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData()
      return
    }
    const result = await productService.search(searchQuery)
    if (result.success) {
      setProducts(result.data)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ ...alert, show: false }), 3000)
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Sin Stock", color: "error" }
    if (stock < 10) return { label: "Stock Bajo", color: "warning" }
    return { label: "Disponible", color: "success" }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nuevo Producto
          </Button>
        </div>

        {alert.show && (
          <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

        <div className="flex gap-2">
          <TextField
            fullWidth
            placeholder="Buscar productos por nombre, marca o descripción..."
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
          <Button variant="contained" onClick={handleSearch}>
            Buscar
          </Button>
          <Button variant="outlined" onClick={loadData}>
            Limpiar
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold">ID</TableCell>
                  <TableCell className="font-semibold">Nombre</TableCell>
                  <TableCell className="font-semibold">Marca</TableCell>
                  <TableCell className="font-semibold">Categoría</TableCell>
                  <TableCell className="font-semibold">Precio</TableCell>
                  <TableCell className="font-semibold">Stock</TableCell>
                  <TableCell className="font-semibold">Estado</TableCell>
                  <TableCell className="font-semibold">Proveedor</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Chip label={stockStatus.label} color={stockStatus.color} size="small" />
                      </TableCell>
                      <TableCell>{product.providerName}</TableCell>
                      <TableCell align="center">
                        <IconButton color="info" size="small" onClick={() => handleViewProduct(product)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton color="primary" size="small" onClick={() => handleOpenModal(product)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => handleDelete(product.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Nombre del Producto"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={formData.category}
                label="Categoría"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Marca/Autor"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />

              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            <FormControl fullWidth required>
              <InputLabel>Proveedor</InputLabel>
              <Select
                value={formData.provider}
                label="Proveedor"
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              >
                {providers.map((prov) => (
                  <MenuItem key={prov.id} value={prov.id}>
                    {prov.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="URL de Imagen"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="/placeholder.svg?height=400&width=300"
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" variant="contained">
                {editingProduct ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Product Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles del Producto">
          {viewingProduct && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={viewingProduct.image || "/placeholder.svg?height=400&width=300"}
                  alt={viewingProduct.name}
                  className="w-48 h-64 object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-semibold">{viewingProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Marca/Autor</p>
                  <p className="font-semibold">{viewingProduct.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categoría</p>
                  <p className="font-semibold">{viewingProduct.categoryName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proveedor</p>
                  <p className="font-semibold">{viewingProduct.providerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Precio</p>
                  <p className="font-semibold text-lg text-purple-600">${viewingProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock Disponible</p>
                  <p className="font-semibold">{viewingProduct.stock} unidades</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="text-gray-700">{viewingProduct.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Creación</p>
                <p className="font-semibold">{viewingProduct.createdAt}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  )
}
