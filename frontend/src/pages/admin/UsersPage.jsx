"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Modal from "../../components/common/Modal";
import { userService } from "../../services/userService";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const USERS_PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: USERS_PER_PAGE,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client",
    password: "",
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    loadUsers(1);
  }, []);

  const loadUsers = async (page = pagination.page) => {
    setLoading(true);

    const result = await userService.getAll({
      page,
      limit: USERS_PER_PAGE,
      search: search.trim(),
      role: roleFilter,
      status: statusFilter,
    });

    if (result.success) {
      setUsers(result.data || []);
      setPagination(
        result.pagination || {
          total: result.data?.length || 0,
          page,
          limit: USERS_PER_PAGE,
          totalPages: 1,
        }
      );
    } else {
      showAlert(result.error || "Error al cargar usuarios", "error");
    }

    setLoading(false);
  };

  const handleSearch = () => {
    loadUsers(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");

    setTimeout(() => {
      loadUsers(1);
    }, 0);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "client", password: "" });
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "client", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showAlert("El nombre y email son obligatorios", "error");
      return;
    }

    if (!editingUser && !formData.password) {
      showAlert("La contraseña es obligatoria para nuevos usuarios", "error");
      return;
    }

    const dataToSend =
      editingUser && !formData.password
        ? {
            name: formData.name,
            email: formData.email,
            role: formData.role,
          }
        : formData;

    const result = editingUser
      ? await userService.update(editingUser.id, dataToSend)
      : await userService.create(formData);

    if (result.success) {
      showAlert(editingUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente", "success");
      handleCloseModal();
      loadUsers(pagination.page);
    } else {
      showAlert(result.error || "Error al guardar el usuario", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    const result = await userService.delete(id);

    if (result.success) {
      showAlert("Usuario eliminado correctamente", "success");
      loadUsers(pagination.page);
    } else {
      showAlert(result.error || "Error al eliminar el usuario", "error");
    }
  };

  const handleToggleStatus = async (id) => {
    const result = await userService.toggleStatus(id);

    if (result.success) {
      showAlert("Estado del usuario actualizado", "success");
      loadUsers(pagination.page);
    } else {
      showAlert(result.error || "Error al actualizar el estado", "error");
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000);
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: { label: "Administrador", color: "error" },
      employee: { label: "Empleado", color: "primary" },
      client: { label: "Cliente", color: "success" },
    };

    return roles[role] || { label: role, color: "default" };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Usuarios del sistema</h1>
            <Typography variant="body2" color="textSecondary">
              {pagination.total} usuario{pagination.total === 1 ? "" : "s"} registrado
              {pagination.total === 1 ? "" : "s"}
            </Typography>
          </div>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nuevo usuario
          </Button>
        </div>

        {alert.show && (
          <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}

        <Paper className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px_auto_auto] md:items-center">
            <TextField
              fullWidth
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              <InputLabel>Rol</InputLabel>
              <Select value={roleFilter} label="Rol" onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="employee">Empleado</MenuItem>
                <MenuItem value="client">Cliente</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={statusFilter} label="Estado" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleSearch}
              fullWidth
              sx={{ minHeight: 56 }}
            >
              Buscar
            </Button>

            <Button
              variant="outlined"
              onClick={handleClearFilters}
              fullWidth
              sx={{ minHeight: 56 }}
            >
              Limpiar
            </Button>
          </div>
        </Paper>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <CircularProgress />
          </div>
        ) : (
          <>
            <TableContainer component={Paper} className="overflow-x-auto">
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-semibold">Usuario</TableCell>
                    <TableCell className="font-semibold">Email</TableCell>
                    <TableCell className="font-semibold">Rol</TableCell>
                    <TableCell className="font-semibold">Estado</TableCell>
                    <TableCell className="font-semibold">Registro</TableCell>
                    <TableCell className="font-semibold" align="center">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary" className="py-6">
                          No se encontraron usuarios
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const roleInfo = getRoleLabel(user.role);

                      return (
                        <TableRow key={user.id} hover>
                          <TableCell className="font-medium">
                            <div>
                              <Typography className="font-medium">{user.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {String(user.id).slice(-8)}
                              </Typography>
                            </div>
                          </TableCell>

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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack alignItems="center" className="pt-2">
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={(_, value) => loadUsers(value)}
                color="primary"
                size="large"
              />

              <Typography variant="body2" color="textSecondary" className="mt-2">
                Página {pagination.page} de {pagination.totalPages}
              </Typography>
            </Stack>
          </>
        )}

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Editar usuario" : "Nuevo usuario"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Nombre completo"
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
              label={editingUser ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
            />

            <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" variant="contained">
                {editingUser ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}