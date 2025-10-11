import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaBell, FaSearch, FaUserCircle, FaCog, FaKey, FaSignOutAlt, FaChevronDown, FaUser, FaEnvelope } from 'react-icons/fa';
import '../../styles/common/Header.css';

const Header = ({ onToggleSidebar, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMenuAction = (action) => {
    console.log(`Acción seleccionada: ${action}`);
    setIsUserMenuOpen(false);
    // Navegación u otras lógicas según la acción
    if (action === 'edit-profile') {
      // ir a la página de edición de perfil y pasar la ruta de origen
      navigate('/edit-profile', { state: { from: location.pathname } });
      return;
    }
    // Aquí puedes agregar la lógica para el resto de acciones
  };

  const menuItems = [
    { icon: FaUser, label: 'Editar Perfil', action: 'edit-profile' },
    { icon: FaKey, label: 'Cambiar Contraseña', action: 'change-password' },
    { icon: FaCog, label: 'Configuración', action: 'settings' },
    { icon: FaEnvelope, label: 'Preferencias de Email', action: 'email-preferences' },
    { icon: FaSignOutAlt, label: 'Cerrar Sesión', action: 'logout', isDanger: true }
  ];

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <FaBars />
        </button>
        <div className="page-info">
          <h1 className="page-title">{pageTitle}</h1>
        </div>
      </div>
      
      <div className="header-right">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Buscar proyectos, usuarios..." className="search-input" />
        </div>
        
        <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu-container" ref={userMenuRef}>
          <button className="user-menu-trigger" onClick={handleUserMenuToggle}>
            <div className="user-avatar">
              <FaUserCircle />
            </div>
            <div className="user-details">
              <span className="user-name">Pepe</span>
              <span className="user-role">Administrador</span>
            </div>
            <FaChevronDown className={`chevron-icon ${isUserMenuOpen ? 'rotated' : ''}`} />
          </button>
          
          {isUserMenuOpen && (
            <div className="user-dropdown-menu">
              <div className="dropdown-header">
                <div className="user-info">
                  <div className="user-avatar-large">
                    <FaUserCircle />
                  </div>
                  <div className="user-info-details">
                    <span className="user-fullname">Administrador del Sistema</span>
                    <span className="user-email">admin@sistema.edu</span>
                  </div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="menu-items">
                {menuItems.map((item) => (
                  <button
                    key={item.action}
                    className={`menu-item ${item.isDanger ? 'danger' : ''}`}
                    onClick={() => handleMenuAction(item.action)}
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
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;