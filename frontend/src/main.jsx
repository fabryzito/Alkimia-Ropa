import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { useAuthStore } from "./store/authStore"

const initializeApp = async () => {
  const root = document.getElementById("root")
  if (!root) {
    console.error("[v0] Root element not found")
    return
  }

  // Initialize auth store
  const { initializeAuth } = useAuthStore.getState()
  await initializeAuth()

  // Render app after auth is initialized
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

initializeApp().catch((error) => {
  console.error("[v0] Failed to initialize app:", error)
})
