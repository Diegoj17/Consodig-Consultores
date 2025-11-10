import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaFolderOpen, FaStar, FaChartLine, FaRegClipboard, 
  FaEnvelope, FaCog, FaSignOutAlt, FaUser, FaClipboardList, 
  FaChartBar, FaProjectDiagram 
} from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";
import { authService } from '../../services/authService';
import '../../styles/common/Sidebar.css';

const Sidebar = ({ activeSection, isOpen, userType = 'admin' }) => {
  const navigate = useNavigate();

  // Menús diferentes para cada tipo de usuario
  const adminMenu = [
    { key: 'dashboard', label: 'Inicio', path: '/admin/dashboard', icon: <MdDashboard /> },
    { key: 'users', label: 'Gestión de Usuarios', path: '/admin/users', icon: <FaUsers /> },
    { key: 'projects', label: 'Proyectos', path: '/admin/projects', icon: <FaFolderOpen /> },
    { key: 'evaluations', label: 'Evaluaciones', path: '/admin/evaluations', icon: <FaStar /> },
    { key: 'reports', label: 'Reportes', path: '/admin/reports', icon: <FaChartLine /> },
    { key: 'templates', label: 'Plantillas', path: '/admin/templates', icon: <FaRegClipboard /> },
    { key: 'messages', label: 'Mensajes', path: '/admin/messages', icon: <FaEnvelope /> },
    { key: 'settings', label: 'Configuración', path: '/admin/settings', icon: <FaCog /> }
  ];

  const evaluadorMenu = [
    { key: 'dashboard', label: 'Inicio', path: '/evaluador/dashboard', icon: <MdDashboard /> },
    { key: 'evaluations', label: 'Mis Evaluaciones', path: '/evaluador/evaluations', icon: <FaClipboardList /> },
    { key: 'projects', label: 'Proyectos Asignados', path: '/evaluador/projects', icon: <FaProjectDiagram /> },
    { key: 'reports', label: 'Reportes', path: '/evaluador/reports', icon: <FaChartBar /> },
    { key: 'messages', label: 'Mensajes', path: '/evaluador/messages', icon: <FaEnvelope /> },
    { key: 'profile', label: 'Mi Perfil', path: '/evaluador/profile', icon: <FaUser /> },
    { key: 'settings', label: 'Configuración', path: '/evaluador/settings', icon: <FaCog /> }
  ];

  const evaluandoMenu = [
    { key: 'dashboard', label: 'Inicio', path: '/evaluando/dashboard', icon: <MdDashboard /> },
    { key: 'evaluations', label: 'Mis Evaluaciones', path: '/evaluando/evaluations', icon: <FaClipboardList /> },
    { key: 'projects', label: 'Mis Proyectos', path: '/evaluando/projects', icon: <FaProjectDiagram /> },
    { key: 'results', label: 'Resultados', path: '/evaluando/results', icon: <FaChartBar /> },
    { key: 'messages', label: 'Mensajes', path: '/evaluando/messages', icon: <FaEnvelope /> },
    { key: 'profile', label: 'Mi Perfil', path: '/evaluando/profile', icon: <FaUser /> },
    { key: 'settings', label: 'Configuración', path: '/evaluando/settings', icon: <FaCog /> }
  ];

  // Seleccionar menú según el tipo de usuario
  const getMenuItems = () => {
    switch (userType) {
      case 'admin': return adminMenu;
      case 'evaluador': return evaluadorMenu;
      case 'evaluando': return evaluandoMenu;
      default: return adminMenu;
    }
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <img 
            src="/img/logo.png" 
            alt="Consodig Consultores" 
            className="logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="logo-fallback" style={{display: 'none'}}>
            <span>CC</span>
          </div>
        </div>
        {isOpen && (
          <div className="brand-text">
            <div className="brand-title">Consodig</div>
            <div className="brand-subtitle">Consultores S.A.S</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <ul>
            {menuItems.map(item => (
              <li key={item.key}>
                <button
                  className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  title={isOpen ? undefined : item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {isOpen && <span className="nav-label">{item.label}</span>}
                  {activeSection === item.key && <div className="nav-indicator"></div>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <button 
          type="button" 
          className="logout-btn" 
          title={isOpen ? undefined : 'Cerrar sesión'} 
          onClick={handleLogout}
        >
          <span className="nav-icon"><FaSignOutAlt /></span>
          {isOpen && <span className="nav-label">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;