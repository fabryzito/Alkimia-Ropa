  import { create } from "zustand"

export const useCartStore = create((set, get) => ({
  cart: [],

  // Initialize cart from localStorage on app start
  initializeCart: () => {
    try {
      const savedCart = localStorage.getItem("bookstore_cart")
      if (savedCart) {
        set({ cart: JSON.parse(savedCart) })
      }
    } catch (error) {
      console.error("[v0] Error initializing cart:", error)
    }
  },

  // Add product to cart
  addToCart: (product, quantity = 1) => {
    const state = get()
    const existingItem = state.cart.find((item) => item.id === product.id)

    let newCart
    if (existingItem) {
      // Update quantity if product already in cart
      newCart = state.cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
      )
    } else {
      // Add new product to cart
      newCart = [...state.cart, { ...product, quantity }]
    }

    set({ cart: newCart })
    localStorage.setItem("bookstore_cart", JSON.stringify(newCart))
  },

  // Remove product from cart
  removeFromCart: (productId) => {
    const state = get()
    const newCart = state.cart.filter((item) => item.id !== productId)
    set({ cart: newCart })
    localStorage.setItem("bookstore_cart", JSON.stringify(newCart))
  },

  // Update product quantity
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }

    const state = get()
    const newCart = state.cart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    set({ cart: newCart })
    localStorage.setItem("bookstore_cart", JSON.stringify(newCart))
  },

  // Clear entire cart
  clearCart: () => {
    set({ cart: [] })
    localStorage.setItem("bookstore_cart", JSON.stringify([]))
  },

  // Get cart total price
  getCartTotal: () => {
    const state = get()
    return state.cart.reduce((total, item) => total + item.price * item.quantity, 0)
  },

  // Get total items count
  getCartItemsCount: () => {
    const state = get()
    return state.cart.reduce((count, item) => count + item.quantity, 0)
  },
}))
