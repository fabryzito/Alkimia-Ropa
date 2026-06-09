"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Container, Button } from "@mui/material"
import {
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material"

export default function ClientLayout({ children }) {
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
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="static" className="bg-gradient-to-r from-purple-600 to-purple-800">
        <Toolbar>
          <StoreIcon className="mr-2" />
          <Typography variant="h6" component="div" className="flex-grow">
            Alkimia
          </Typography>

          <Button color="inherit" onClick={() => navigate("/marketplace")} startIcon={<StoreIcon />}>
            Tienda
          </Button>

          <Button color="inherit" onClick={() => navigate("/orders")} startIcon={<ReceiptIcon />}>
            Mis Pedidos
          </Button>

          <IconButton color="inherit" onClick={() => navigate("/cart")}>
            <Badge badgeContent={getCartItemsCount()} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleMenu}>
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" className="py-8">
        {children}
      </Container>
    </div>
  )
}
