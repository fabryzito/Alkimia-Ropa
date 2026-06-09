"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/AdminLayout"
import Modal from "../../components/common/Modal"
import { clientService } from "../../services/clientService"
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
  InputAdornment,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [viewingClient, setViewingClient] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    dni: "",
    email: "",
    phone: "",
    address: "",
  })
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    const result = await clientService.getAll()
    if (result.success) {
      setClients(result.data)
    }
    setLoading(false)
  }

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        lastName: client.lastName,
        dni: client.dni,
        email: client.email,
        phone: client.phone,
        address: client.address,
      })
    } else {
      setEditingClient(null)
      setFormData({ name: "", lastName: "", dni: "", email: "", phone: "", address: "" })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
  }

  const handleViewClient = (client) => {
    setViewingClient(client)
    setIsViewModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.lastName.trim() || !formData.dni.trim() || !formData.email.trim()) {
      showAlert("Nombre, apellido, DNI y email son obligatorios", "error")
      return
    }

    const result = editingClient
      ? await clientService.update(editingClient.id, formData)
      : await clientService.create(formData)

    if (result.success) {
      showAlert(editingClient ? "Cliente actualizado correctamente" : "Cliente creado correctamente", "success")
      loadClients()
      handleCloseModal()
    } else {
      showAlert(result.error || "Error al guardar el cliente", "error")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      const result = await clientService.delete(id)
      if (result.success) {
        showAlert("Cliente eliminado correctamente", "success")
        loadClients()
      } else {
        showAlert(result.error || "Error al eliminar el cliente", "error")
      }
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadClients()
      return
    }
    const result = await clientService.search(searchQuery)
    if (result.success) {
      setClients(result.data)
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
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nuevo Cliente
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
            placeholder="Buscar por nombre, apellido, DNI o email..."
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
          <Button variant="outlined" onClick={loadClients}>
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
                  <TableCell className="font-semibold">Apellido</TableCell>
                  <TableCell className="font-semibold">DNI</TableCell>
                  <TableCell className="font-semibold">Email</TableCell>
                  <TableCell className="font-semibold">Teléfono</TableCell>
                  <TableCell className="font-semibold">Fecha de Registro</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>{client.id}</TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.lastName}</TableCell>
                    <TableCell>{client.dni}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.createdAt}</TableCell>
                    <TableCell align="center">
                      <IconButton color="info" size="small" onClick={() => handleViewClient(client)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" size="small" onClick={() => handleOpenModal(client)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(client.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingClient ? "Editar Cliente" : "Nuevo Cliente"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Apellido"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <TextField
              fullWidth
              label="DNI"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              required
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
                {editingClient ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Client Modal */}
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles del Cliente">
          {viewingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="font-semibold">
                    {viewingClient.name} {viewingClient.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DNI</p>
                  <p className="font-semibold">{viewingClient.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{viewingClient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-semibold">{viewingClient.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-semibold">{viewingClient.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Registro</p>
                <p className="font-semibold">{viewingClient.createdAt}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  )
}
