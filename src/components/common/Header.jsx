import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  FaBars,
  FaUserCircle,
  FaCog,
  FaKey,
  FaSignOutAlt,
  FaChevronDown,
  FaUser,
  FaFilePdf // Añade este import
} from "react-icons/fa"
import "../../styles/common/Header.css"
import ProfileMenu from "./ProfileMenu"
import NotificationsMenu from "./NotificationsMenu"
import { useAuth } from "../../contexts/AuthContext"

const Header = ({ onToggleSidebar, pageTitle = "Dashboard" }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const { user, roleLabel, logout } = useAuth()

  // 🔍 Debug para verificar datos cargados
  useEffect(() => {
    console.log("🧠 Header → Usuario actual:", user)
    console.log("🧠 Header → Rol label:", roleLabel)
  }, [user, roleLabel])

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleSidebarToggle = () => {
    if (typeof onToggleSidebar === 'function') {
      onToggleSidebar();
      return;
    }

    // fallback global
    try {
      const isClosed = document.body.classList.toggle('sidebar-closed');
      const open = !isClosed;
      const width = open ? '260px' : '80px';
      document.documentElement.style.setProperty('--sidebar-width', width);
      const mains = document.querySelectorAll('.dashboard-main');
      mains.forEach(el => { el.style.marginLeft = width; });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { open } }));
      }
    } catch (err) {
      console.warn('Toggle sidebar fallback failed', err);
    }
  }

  const handleMenuAction = (action) => {
    console.log(`⚙ Acción seleccionada: ${action}`)
    setIsUserMenuOpen(false)

    const userPrefix = getUserType();

    switch (action) {
      case "profile":
      case "edit-profile":
        navigate(`/${userPrefix}/profile/edit`, { state: { from: location.pathname } })
        break
      case "change-password":
        navigate(`/${userPrefix}/change-password`, { state: { from: location.pathname } })
        break
      case "documents":
        navigate(`/${userPrefix}/documents`, { state: { from: location.pathname } })
        break
      case "logout":
        logout()
        navigate("/login")
        break
      default:
        console.log("Acción sin manejar:", action)
    }
  }

  const getFullName = () => {
    if (!user) return "Usuario"
    if (user.nombre && user.apellido) return `${user.nombre} ${user.apellido}`
    if (user.nombre) return user.nombre
    if (user.name) return user.name
    if (user.fullname) return user.fullname
    return "Usuario"
  }

  const getUserType = () => {
    if (!user) return 'admin'
    const role = user.role || user.rol || ''
    if (role.toLowerCase().includes('admin')) return 'admin'
    if (role.toLowerCase().includes('evaluador')) return 'evaluador'
    return 'evaluando'
  }

  const menuItems = [
    { icon: FaUser, label: "Editar Perfil", action: "edit-profile" },
    { icon: FaKey, label: "Cambiar Contraseña", action: "change-password" },
    { icon: FaFilePdf, label: "Mis Documentos", action: "documents" }, // AÑADE ESTE ITEM
    { icon: FaSignOutAlt, label: "Cerrar Sesión", action: "logout", isDanger: true },
  ]

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-toggle" onClick={handleSidebarToggle}>
          <FaBars />
        </button>
        <div className="page-info">
          <h1 className="page-title">{pageTitle}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* 🔔 Menú de Notificaciones */}
        <NotificationsMenu />

        <div className="user-menu-container" ref={userMenuRef}>
          <button className="user-menu-trigger" onClick={handleUserMenuToggle}>
            <div className="user-avatar">
              <FaUserCircle />
            </div>
            <div className="user-details">
              <span className="user-name">{getFullName()}</span>
              <span className="user-role">{roleLabel || "Usuario"}</span>
            </div>
            <FaChevronDown className={`chevron-icon ${isUserMenuOpen ? "rotated" : ""}`} />
          </button>

          <ProfileMenu
            isOpen={isUserMenuOpen}
            user={user}
            menuItems={menuItems}
            onAction={handleMenuAction}
            onClose={() => setIsUserMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  )
}

export default Header