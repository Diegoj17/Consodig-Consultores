import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaFolderOpen, FaStar, FaChartLine, FaRegClipboard, 
  FaEnvelope, FaCog, FaSignOutAlt, FaUser, FaClipboardList, 
  FaChartBar, FaProjectDiagram, FaChevronDown, FaChevronRight,
  FaFileAlt, FaUserCheck, FaHistory, FaListAlt, FaTasks,
  FaHome, FaUserCircle, FaCogs, FaSearch, FaEdit, FaCheckCircle
} from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";
import { authService } from '../../services/authService';
import '../../styles/common/Sidebar.css';

const Sidebar = ({ activeSection, isOpen = true, userType = 'admin' }) => {
  const navigate = useNavigate();
  
  // Estados para controlar los submenús
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(false);
  const [evaluationsMenuOpen, setEvaluationsMenuOpen] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);

  // Menú base para admin - AGREGAR NUEVA OPCIÓN
  const baseAdminMenu = [
    { key: 'dashboard', label: 'Inicio', path: '/admin/dashboard', icon: <MdDashboard /> },
    { key: 'users', label: 'Gestión de Usuarios', path: '/admin/users', icon: <FaUsers /> },
    { 
      key: 'projects-parent', 
      label: 'Proyectos', 
      isParent: true,
      icon: <FaFolderOpen /> 
    },
    { 
      key: 'evaluations-admin-parent', 
      label: 'Evaluaciones', 
      isParent: true,
      icon: <FaClipboardList /> 
    },
    { key: 'reports', label: 'Reportes', path: '/admin/reports', icon: <FaChartLine /> },
    { key: 'messages', label: 'Mensajes', path: '/admin/messages', icon: <FaEnvelope /> },
  ];

  // Submenú de Proyectos para Admin
  const adminProjectsSubmenu = [
    { key: 'projects', label: 'Gestionar Proyectos', path: '/admin/projects', icon: <FaFolderOpen /> },
    { key: 'evaluations', label: 'Formatos de Evaluación', path: '/admin/evaluations', icon: <FaFileAlt /> },
    { key: 'assign', label: 'Asignar Evaluadores', path: '/admin/assign', icon: <FaUserCheck /> },
    { key: 'history', label: 'Historial', path: '/admin/history', icon: <FaHistory /> }
  ];

  // NUEVO: Submenú de Evaluaciones para Admin
  const adminEvaluationsSubmenu = [
    { key: 'evaluations-review', label: 'Revisar Evaluaciones', path: '/admin/evaluations/review', icon: <FaSearch /> },
    { key: 'evaluations-completed', label: 'Evaluaciones Completadas', path: '/admin/evaluations/completed', icon: <FaCheckCircle /> },
    { key: 'evaluations-feedback', label: 'Gestión de Observaciones', path: '/admin/evaluations/feedback', icon: <FaEdit /> }
  ];

  // Menú para Evaluador
  const evaluadorMenu = [
    { key: 'dashboard', label: 'Inicio', path: '/evaluador/dashboard', icon: <MdDashboard /> },
    { 
      key: 'evaluations-parent', 
      label: 'Mis Evaluaciones', 
      isParent: true,
      icon: <FaClipboardList /> 
    },
    { 
      key: 'projects-parent', 
      label: 'Proyectos', 
      isParent: true,
      icon: <FaProjectDiagram /> 
    },
    { key: 'reports', label: 'Reportes', path: '/evaluador/reports', icon: <FaChartBar /> },
    { key: 'messages', label: 'Mensajes', path: '/evaluador/messages', icon: <FaEnvelope /> },
  ];

  // Submenú de Evaluaciones para Evaluador
  const evaluadorEvaluationsSubmenu = [
    { key: 'evaluations-pending', label: 'Pendientes', path: '/evaluador/evaluations/pending', icon: <FaTasks /> },
    { key: 'evaluations-in-progress', label: 'En Progreso', path: '/evaluador/evaluations/in-progress', icon: <FaListAlt /> },
    { key: 'evaluations-completed', label: 'Completadas', path: '/evaluador/evaluations/completed', icon: <FaHistory /> }
  ];

  // Submenú de Proyectos para Evaluador
  const evaluadorProjectsSubmenu = [
    { key: 'projects-assigned', label: 'Proyectos Asignados', path: '/evaluador/projects/assigned', icon: <FaFolderOpen /> },
    { key: 'projects-evaluating', label: 'En Evaluación', path: '/evaluador/projects/evaluating', icon: <FaUserCheck /> },
    { key: 'projects-history', label: 'Historial', path: '/evaluador/projects/history', icon: <FaHistory /> }
  ];

  // Menú para Evaluando
  const evaluandoMenu = [
    { key: 'dashboard', label: 'Inicio', path: '/evaluando/dashboard', icon: <MdDashboard /> },
    { key: 'my-projects', label: 'Mis Proyectos', path: '/evaluando/projects', icon: <FaProjectDiagram /> },
    { key: 'evaluations', label: 'Mis Evaluaciones', path: '/evaluando/evaluations', icon: <FaClipboardList /> },
    { 
      key: 'results-parent', 
      label: 'Resultados', 
      isParent: true,
      icon: <FaChartBar /> 
    },
    { key: 'messages', label: 'Mensajes', path: '/evaluando/messages', icon: <FaEnvelope /> },
  ];

  // Submenú de Resultados para Evaluando
  const evaluandoResultsSubmenu = [
    { key: 'results-current', label: 'Resultados Actuales', path: '/evaluando/results/current', icon: <FaChartLine /> },
    { key: 'results-history', label: 'Historial', path: '/evaluando/results/history', icon: <FaHistory /> },
    { key: 'results-comparative', label: 'Análisis Comparativo', path: '/evaluando/results/comparative', icon: <FaChartBar /> }
  ];

  // Seleccionar menú según el tipo de usuario
  const getMenuItems = () => {
    switch (userType) {
      case 'admin': return baseAdminMenu;
      case 'evaluador': return evaluadorMenu;
      case 'evaluando': return evaluandoMenu;
      default: return baseAdminMenu;
    }
  };

  // Obtener submenú según tipo de usuario y menú padre
  const getSubmenuItems = (parentKey) => {
    if (userType === 'admin' && parentKey === 'projects-parent') {
      return adminProjectsSubmenu;
    }
    if (userType === 'admin' && parentKey === 'evaluations-admin-parent') {
      return adminEvaluationsSubmenu;
    }
    if (userType === 'evaluador' && parentKey === 'evaluations-parent') {
      return evaluadorEvaluationsSubmenu;
    }
    if (userType === 'evaluador' && parentKey === 'projects-parent') {
      return evaluadorProjectsSubmenu;
    }
    if (userType === 'evaluando' && parentKey === 'results-parent') {
      return evaluandoResultsSubmenu;
    }
    return [];
  };

  const menuItems = getMenuItems();

  // Función para verificar si activeSection pertenece a un submenú
  const checkIfActiveInSubmenu = (parentKey) => {
    const submenuItems = getSubmenuItems(parentKey);
    return submenuItems.some(item => activeSection === item.key);
  };

  // Efecto para abrir automáticamente el submenú si activeSection está dentro
  useEffect(() => {
    // Para admin
    if (userType === 'admin') {
      if (checkIfActiveInSubmenu('projects-parent')) {
        setProjectsMenuOpen(true);
      }
      if (checkIfActiveInSubmenu('evaluations-admin-parent')) {
        setEvaluationsMenuOpen(true);
      }
    }
    
    // Para evaluador
    if (userType === 'evaluador') {
      if (checkIfActiveInSubmenu('evaluations-parent')) {
        setEvaluationsMenuOpen(true);
      }
      if (checkIfActiveInSubmenu('projects-parent')) {
        setProjectsMenuOpen(true);
      }
    }
    
    // Para evaluando
    if (userType === 'evaluando' && checkIfActiveInSubmenu('results-parent')) {
      setReportsMenuOpen(true);
    }
  }, [activeSection, userType]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Manejar clic en menús padres
  const handleParentMenuClick = (parentKey) => {
    switch (parentKey) {
      case 'projects-parent':
        setProjectsMenuOpen(!projectsMenuOpen);
        setEvaluationsMenuOpen(false);
        setReportsMenuOpen(false);
        break;
      case 'evaluations-admin-parent':
        setEvaluationsMenuOpen(!evaluationsMenuOpen);
        setProjectsMenuOpen(false);
        setReportsMenuOpen(false);
        break;
      case 'evaluations-parent':
        setEvaluationsMenuOpen(!evaluationsMenuOpen);
        setProjectsMenuOpen(false);
        setReportsMenuOpen(false);
        break;
      case 'results-parent':
        setReportsMenuOpen(!reportsMenuOpen);
        setProjectsMenuOpen(false);
        setEvaluationsMenuOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSubmenuClick = (path, parentKey) => {
    handleNavigation(path);
    
    // Cerrar todos los submenús después de la navegación (opcional)
    // setProjectsMenuOpen(false);
    // setEvaluationsMenuOpen(false);
    // setReportsMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Verificar si un submenú está activo
  const isSubmenuActive = (parentKey) => {
    return checkIfActiveInSubmenu(parentKey);
  };

  // Verificar si un submenú está abierto
  const isSubmenuOpen = (parentKey) => {
    switch (parentKey) {
      case 'projects-parent': return projectsMenuOpen;
      case 'evaluations-admin-parent': return evaluationsMenuOpen;
      case 'evaluations-parent': return evaluationsMenuOpen;
      case 'results-parent': return reportsMenuOpen;
      default: return false;
    }
  };

  // Obtener icono de chevron según estado
  const getChevronIcon = (parentKey) => {
    return isSubmenuOpen(parentKey) ? <FaChevronDown /> : <FaChevronRight />;
  };

  // Sincronizar visual global
  useEffect(() => {
    const openWidth = '260px';
    const closedWidth = '80px';

    try {
      document.documentElement.style.setProperty('--sidebar-width', isOpen ? openWidth : closedWidth);
    } catch {
      // no crítico
    }

    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.toggle('sidebar-closed', !isOpen);
    }

    try {
      const mains = document.querySelectorAll('.dashboard-main');
      mains.forEach(el => {
        el.style.marginLeft = isOpen ? openWidth : closedWidth;
      });
    } catch {
      // noop
    }
  }, [isOpen]);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Brand Section */}
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

      {/* Navigation Section */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <ul>
            {menuItems.map(item => {
              // Renderizar ítems con submenú
              if (item.isParent) {
                const submenuItems = getSubmenuItems(item.key);
                const isActive = isSubmenuActive(item.key);
                const submenuOpen = isSubmenuOpen(item.key);

                return (
                  <li key={item.key} className={`nav-item-with-submenu ${submenuOpen ? 'submenu-visible' : ''}`}>
                    <button
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleParentMenuClick(item.key)}
                      title={!isOpen ? item.label : undefined}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {isOpen && (
                        <>
                          <span className="nav-label">{item.label}</span>
                          <span className="nav-chevron">
                            {getChevronIcon(item.key)}
                          </span>
                        </>
                      )}
                      {isActive && <div className="nav-indicator"></div>}
                    </button>
                    
                    {/* Submenú - visible cuando submenuOpen es true */}
                    {submenuItems.length > 0 && submenuOpen && (
                      <div className={`nav-submenu ${isOpen ? 'nav-submenu--open' : 'nav-submenu--closed'}`}>
                        {submenuItems.map(subItem => (
                          <button
                            key={subItem.key}
                            className={`nav-subitem ${activeSection === subItem.key ? 'active' : ''}`}
                            onClick={() => handleSubmenuClick(subItem.path, item.key)}
                            title={subItem.label}
                          >
                            <span className="nav-subicon">{subItem.icon}</span>
                            <span className="nav-sublabel">{subItem.label}</span>
                            {activeSection === subItem.key && <div className="nav-subindicator"></div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              }

              // Renderizar ítems normales
              return (
                <li key={item.key}>
                  <button
                    className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                    title={!isOpen ? item.label : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {isOpen && <span className="nav-label">{item.label}</span>}
                    {activeSection === item.key && <div className="nav-indicator"></div>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      
      {/* Footer Section */}
      <div className="sidebar-footer">
        <button 
          type="button" 
          className="logout-btn" 
          title={!isOpen ? 'Cerrar sesión' : undefined} 
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