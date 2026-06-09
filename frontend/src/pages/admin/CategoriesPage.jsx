"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/AdminLayout"
import Modal from "../../components/common/Modal"
import { categoryService } from "../../services/categoryService"
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
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    const result = await categoryService.getAll()
    if (result.success) {
      setCategories(result.data)
    }
    setLoading(false)
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, description: category.description })
    } else {
      setEditingCategory(null)
      setFormData({ name: "", description: "" })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: "", description: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showAlert("El nombre es obligatorio", "error")
      return
    }

    const result = editingCategory
      ? await categoryService.update(editingCategory.id, formData)
      : await categoryService.create(formData)

    if (result.success) {
      showAlert(editingCategory ? "Categoría actualizada correctamente" : "Categoría creada correctamente", "success")
      loadCategories()
      handleCloseModal()
    } else {
      showAlert(result.error || "Error al guardar la categoría", "error")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
      const result = await categoryService.delete(id)
      if (result.success) {
        showAlert("Categoría eliminada correctamente", "success")
        loadCategories()
      } else {
        showAlert(result.error || "Error al eliminar la categoría", "error")
      }
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ ...alert, show: false }), 3000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nueva Categoría
          </Button>
        </div>

        {alert.show && (
          <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

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
                  <TableCell className="font-semibold">Descripción</TableCell>
                  <TableCell className="font-semibold">Fecha de Creación</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>{category.id}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.createdAt}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" size="small" onClick={() => handleOpenModal(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(category.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" variant="contained">
                {editingCategory ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
