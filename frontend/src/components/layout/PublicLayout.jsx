"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Menu, MenuItem, Container } from "@mui/material"
import {
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Store as StoreIcon,
} from "@mui/icons-material"

export default function PublicLayout({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { getCartItemsCount } = useCartStore()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleClose()
    navigate("/")
  }

  const handleDashboard = () => {
    handleClose()
    if (user?.role === "admin") {
      navigate("/admin")
    } else if (user?.role === "employee") {
      navigate("/employee")
    } else {
      navigate("/orders")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar
  position="static"
  sx={{
    background: "linear-gradient(135deg, #9333ea, #a855f7)",
    boxShadow: "0 4px 20px rgba(147, 51, 234, 0.4)",
  }}
>
        <Toolbar>
          <StoreIcon className="mr-2" />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Alkimia Online Store
          </Typography>

          <IconButton color="inherit" onClick={() => navigate("/cart")}>
            <Badge badgeContent={getCartItemsCount()} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {user ? (
            <>
              <IconButton color="inherit" onClick={handleMenu}>
                <AccountCircleIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    {user.name} ({user.role})
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleDashboard}>Mi Panel</MenuItem>
                {user.role === "client" && (
                  <MenuItem
                    onClick={() => {
                      handleClose()
                      navigate("/orders")
                    }}
                  >
                    Mis Pedidos
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </div>
  )
}
