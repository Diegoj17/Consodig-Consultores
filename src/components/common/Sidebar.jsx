import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaFolderOpen, FaChartLine, FaEnvelope, FaSignOutAlt, 
  FaClipboardList, FaChartBar, FaProjectDiagram, FaChevronDown, FaChevronRight,
  FaFileAlt, FaUserCheck, FaHistory, FaTasks, FaListAlt,
  FaSearch, FaEdit, FaCheckCircle, FaUserTie, FaFileContract, 
  FaPaperPlane, FaBell, FaFileUpload
} from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";
import { authService } from '../../services/authService';
import '../../styles/common/Sidebar.css';

const Sidebar = ({ activeSection, isOpen = true, userType = 'admin' }) => {
  const navigate = useNavigate();
  
  // Estado único para controlar qué submenú está abierto
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Menú base para admin
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
    { 
      key: 'reports-parent',
      label: 'Reportes', 
      isParent: true,
      icon: <FaChartLine /> 
    },
  ];

  // Submenú de Proyectos para Admin
  const adminProjectsSubmenu = useMemo(() => [
    { key: 'manage-projects', label: 'Gestionar Proyectos', path: '/admin/projects', icon: <FaFolderOpen /> },
    { key: 'evaluation-forms', label: 'Formatos de Evaluación', path: '/admin/evaluations', icon: <FaFileAlt /> },
    { key: 'assign-evaluators', label: 'Asignar Evaluadores', path: '/admin/assign', icon: <FaUserCheck /> },
    { key: 'project-history', label: 'Historial', path: '/admin/history', icon: <FaHistory /> }
  ], []);

  // Submenú de Evaluaciones para Admin
  const adminEvaluationsSubmenu = useMemo(() => [
    { key: 'review-evaluations', label: 'Revisar Evaluaciones', path: '/admin/evaluations/review', icon: <FaSearch /> },
    { key: 'completed-evaluations', label: 'Evaluaciones Completadas', path: '/admin/evaluations/completed', icon: <FaCheckCircle /> },
    { key: 'feedback-management', label: 'Gestión de Observaciones', path: '/admin/evaluations/feedback', icon: <FaEdit /> }
  ], []);

  const adminReportsSubmenu = useMemo(() => [
    { key: 'evaluation-reports', label: 'Reportes por Evaluaciones', path: '/admin/reports/evaluations', icon: <FaFileContract /> },
    { key: 'evaluator-reports', label: 'Reportes por Evaluador', path: '/admin/reports/evaluators', icon: <FaUserTie /> }
  ], []);

  // Menú para Evaluador - MEJORADO
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
  ];

  // Submenú de Evaluaciones para Evaluador - MEJORADO
  const evaluadorEvaluationsSubmenu = useMemo(() => [
    { key: 'evaluations-pending', label: 'Pendientes de Aceptar', path: '/evaluador/evaluations/pending', icon: <FaTasks /> },
    { key: 'evaluations-in-progress', label: 'En Progreso', path: '/evaluador/evaluations/in-progress', icon: <FaListAlt /> },
    { key: 'evaluations-completed', label: 'Completadas', path: '/evaluador/evaluations/completed', icon: <FaCheckCircle /> }
  ], []);

  // Submenú de Proyectos para Evaluador - MEJORADO
  const evaluadorProjectsSubmenu = useMemo(() => [
    { key: 'projects-assigned', label: 'Asignados', path: '/evaluador/projects/assigned', icon: <FaFolderOpen /> },
    { key: 'projects-evaluating', label: 'En Evaluación', path: '/evaluador/projects/evaluating', icon: <FaUserCheck /> },
    { key: 'projects-history', label: 'Historial', path: '/evaluador/projects/history', icon: <FaHistory /> }
  ], []);

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
  const evaluandoResultsSubmenu = useMemo(() => [
    { key: 'results-current', label: 'Resultados Actuales', path: '/evaluando/results/current', icon: <FaChartLine /> },
    { key: 'results-history', label: 'Historial', path: '/evaluando/results/history', icon: <FaHistory /> },
    { key: 'results-comparative', label: 'Análisis Comparativo', path: '/evaluando/results/comparative', icon: <FaChartBar /> }
  ], []);

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
  const getSubmenuItems = useCallback((parentKey) => {
    if (userType === 'admin' && parentKey === 'projects-parent') {
      return adminProjectsSubmenu;
    }
    if (userType === 'admin' && parentKey === 'evaluations-admin-parent') {
      return adminEvaluationsSubmenu;
    }
    if (userType === 'admin' && parentKey === 'reports-parent') { 
      return adminReportsSubmenu;
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
  }, [userType, adminProjectsSubmenu, adminEvaluationsSubmenu, adminReportsSubmenu, evaluadorEvaluationsSubmenu, evaluadorProjectsSubmenu, evaluandoResultsSubmenu]);

  const menuItems = getMenuItems();

  // Verificar si la sección activa está en un submenú específico
  const isActiveInSubmenu = useCallback((parentKey) => {
    const submenuItems = getSubmenuItems(parentKey);
    return submenuItems.some(item => activeSection === item.key);
  }, [activeSection, getSubmenuItems]);

  // Efecto para abrir automáticamente el submenú cuando la sección activa está dentro de él
  useEffect(() => {
    const parentKeys = [
      'projects-parent', 
      'evaluations-admin-parent', 
      'reports-parent',
      'messages-parent',
      'evaluations-parent', 
      'results-parent'
    ];
    
    for (const parentKey of parentKeys) {
      if (isActiveInSubmenu(parentKey)) {
        setOpenSubmenu(parentKey);
        break;
      }
    }
  }, [activeSection, userType, isActiveInSubmenu]);

  // Navegación
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Manejar clic en menús padres (toggle)
  const handleParentClick = (parentKey) => {
    setOpenSubmenu(openSubmenu === parentKey ? null : parentKey);
  };

  // Manejar clic en ítems normales
  const handleItemClick = (path) => {
    handleNavigation(path);
  };

  // Manejar clic en ítems de submenú
  const handleSubitemClick = (path) => {
    handleNavigation(path);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
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
              if (item.isParent) {
                const submenuItems = getSubmenuItems(item.key);
                const isOpenSubmenu = openSubmenu === item.key;
                const hasActiveChild = isActiveInSubmenu(item.key);

                return (
                  <li key={item.key} className="nav-item-with-submenu">
                    <button
                      className={`nav-item ${hasActiveChild ? 'active-parent' : ''} ${isOpenSubmenu ? 'open' : ''}`}
                      onClick={() => handleParentClick(item.key)}
                      title={!isOpen ? item.label : undefined}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {isOpen && (
                        <>
                          <span className="nav-label">{item.label}</span>
                          <span className="nav-chevron">
                            {isOpenSubmenu ? <FaChevronDown /> : <FaChevronRight />}
                          </span>
                        </>
                      )}
                      {hasActiveChild && <div className="nav-indicator"></div>}
                    </button>
                    
                    {/* Submenú */}
                    {isOpen && (
                      <div className={`nav-submenu ${isOpenSubmenu ? 'nav-submenu--open' : ''}`}>
                        {submenuItems.map(subItem => (
                          <button
                            key={subItem.key}
                            className={`nav-subitem ${activeSection === subItem.key ? 'active' : ''}`}
                            onClick={() => handleSubitemClick(subItem.path)}
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

              // Ítems normales
              return (
                <li key={item.key}>
                  <button
                    className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.path)}
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