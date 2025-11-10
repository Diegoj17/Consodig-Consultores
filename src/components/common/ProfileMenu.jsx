"use client"

import { FaUserCircle } from "react-icons/fa"
import "../../styles/common/ProfileMenu.css"

const ProfileMenu = ({ isOpen, user = {}, menuItems = [], onAction, onClose }) => {
  if (!isOpen) return null

  // 🧾 Obtener nombre completo
  const getFullName = () => {
    if (!user || Object.keys(user).length === 0) return "Administrador del Sistema"
    if (user.nombre && user.apellido) return `${user.nombre} ${user.apellido}`
    if (user.nombre) return user.nombre
    if (user.name) return user.name
    if (user.fullname) return user.fullname
    return "Administrador del Sistema"
  }

  // 📧 Email
  const getUserEmail = () => (user?.email ? user.email : "admin@sistema.edu")

  // 🧩 Rol (por si no viene el label calculado)
  const getUserRole = () => {
    if (!user) return "Usuario"
    const raw = user.rol || user.role || user.tipo || ""
    if (typeof raw === "number") {
      if (raw === 0) return "Usuario"
      if (raw === 1) return "Evaluador"
      if (raw === 2) return "Administrador del Sistema"
    }
    return raw?.toString().toUpperCase() || "Usuario"
  }

  const fullName = getFullName()
  const userEmail = getUserEmail()
  const userRole = getUserRole()

  console.log("🧩 ProfileMenu - Datos procesados:", { fullName, userEmail, userRole })

  return (
    <div className="profilemenu">
      <div className="dropdown-header">
        <div className="user-info">
          <div className="user-avatar-large">
            <FaUserCircle />
          </div>
          <div className="user-info-details">
            <span className="user-fullname">{fullName}</span>
            <span className="user-email">{userEmail}</span>
            <span className="user-role-badge">{userRole}</span>
          </div>
        </div>
      </div>

      <div className="dropdown-divider"></div>

      <div className="menu-items">
        {menuItems.map((item) => (
          <button
            key={item.action}
            className={`menu-item ${item.isDanger ? "danger" : ""}`}
            onClick={() => {
              onAction?.(item.action)
              onClose?.()
            }}
          >
            <item.icon className="menu-item-icon" />
            <span className="menu-item-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="dropdown-footer">
        <span className="session-info">Sesión activa · Último acceso: Hoy</span>
      </div>
    </div>
  )
}

export default ProfileMenu
