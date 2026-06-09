"use client"

import { useState, useEffect } from "react"
import AdminLayout from "../../components/layout/AdminLayout"
import Modal from "../../components/common/Modal"
import { userService } from "../../services/userService"
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
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client",
    password: "",
  })
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const result = await userService.getAll()
    if (result.success) {
      setUsers(result.data)
    }
    setLoading(false)
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      })
    } else {
      setEditingUser(null)
      setFormData({ name: "", email: "", role: "client", password: "" })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setFormData({ name: "", email: "", role: "client", password: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim()) {
      showAlert("El nombre y email son obligatorios", "error")
      return
    }

    if (!editingUser && !formData.password) {
      showAlert("La contraseña es obligatoria para nuevos usuarios", "error")
      return
    }

    const dataToSend =
      editingUser && !formData.password ? { name: formData.name, email: formData.email, role: formData.role } : formData

    const result = editingUser
      ? await userService.update(editingUser.id, dataToSend)
      : await userService.create(formData)

    if (result.success) {
      showAlert(editingUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente", "success")
      loadUsers()
      handleCloseModal()
    } else {
      showAlert(result.error || "Error al guardar el usuario", "error")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      const result = await userService.delete(id)
      if (result.success) {
        showAlert("Usuario eliminado correctamente", "success")
        loadUsers()
      } else {
        showAlert(result.error || "Error al eliminar el usuario", "error")
      }
    }
  }

  const handleToggleStatus = async (id) => {
    const result = await userService.toggleStatus(id)
    if (result.success) {
      showAlert("Estado del usuario actualizado", "success")
      loadUsers()
    } else {
      showAlert(result.error || "Error al actualizar el estado", "error")
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  const getRoleLabel = (role) => {
    const roles = {
      admin: { label: "Administrador", color: "error" },
      employee: { label: "Empleado", color: "primary" },
      client: { label: "Cliente", color: "success" },
    }
    return roles[role] || { label: role, color: "default" }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nuevo Usuario
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
                  <TableCell className="font-semibold">Email</TableCell>
                  <TableCell className="font-semibold">Rol</TableCell>
                  <TableCell className="font-semibold">Estado</TableCell>
                  <TableCell className="font-semibold">Fecha de Registro</TableCell>
                  <TableCell className="font-semibold" align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const roleInfo = getRoleLabel(user.role)
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={roleInfo.label} color={roleInfo.color} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status === "active" ? "Activo" : "Inactivo"}
                          color={user.status === "active" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color={user.status === "active" ? "warning" : "success"}
                          size="small"
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.status === "active" ? "Desactivar" : "Activar"}
                        >
                          {user.status === "active" ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                        <IconButton color="primary" size="small" onClick={() => handleOpenModal(user)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => handleDelete(user.id)}>
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

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Nombre Completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <FormControl fullWidth required>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                label="Rol"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="employee">Empleado</MenuItem>
                <MenuItem value="client">Cliente</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={editingUser ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" variant="contained">
                {editingUser ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
