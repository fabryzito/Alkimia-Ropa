"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/AdminLayout"
import Modal from "../../components/common/Modal"
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
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"

export default function ProvidersPage() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  })
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" })

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    setLoading(true)
    const result = await providerService.getAll()
    if (result.success) {
      setProviders(result.data)
    }
    setLoading(false)
  }

  const handleOpenModal = (provider = null) => {
    if (provider) {
      setEditingProvider(provider)
      setFormData({
        name: provider.name,
        contact: provider.contact,
        email: provider.email,
        phone: provider.phone,
        address: provider.address,
      })
    } else {
      setEditingProvider(null)
      setFormData({ name: "", contact: "", email: "", phone: "", address: "" })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProvider(null)
    setFormData({ name: "", contact: "", email: "", phone: "", address: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim()) {
      showAlert("El nombre y email son obligatorios", "error")
      return
    }

    const result = editingProvider
      ? await providerService.update(editingProvider.id, formData)
      : await providerService.create(formData)

    if (result.success) {
      showAlert(editingProvider ? "Proveedor actualizado correctamente" : "Proveedor creado correctamente", "success")
      loadProviders()
      handleCloseModal()
    } else {
      showAlert(result.error || "Error al guardar el proveedor", "error")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      const result = await providerService.delete(id)
      if (result.success) {
        showAlert("Proveedor eliminado correctamente", "success")
        loadProviders()
      } else {
        showAlert(result.error || "Error al eliminar el proveedor", "error")
      }
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nuevo Proveedor
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
                  <TableCell className="font-semibold">Contacto</TableCell>
                  <TableCell className="font-semibold">Email</TableCell>
                  <TableCell className="font-semibold">Teléfono</TableCell>
                  <TableCell className="font-semibold">Dirección</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id} hover>
                    <TableCell>{provider.id}</TableCell>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.contact}</TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>{provider.phone}</TableCell>
                    <TableCell>{provider.address}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" size="small" onClick={() => handleOpenModal(provider)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(provider.id)}>
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
          title={editingProvider ? "Editar Proveedor" : "Nuevo Proveedor"}
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
              label="Persona de Contacto"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Dirección"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              multiline
              rows={2}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" variant="contained">
                {editingProvider ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
