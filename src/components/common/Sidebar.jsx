import React from 'react';
import { FaUsers, FaFolderOpen, FaStar, FaChartLine, FaRegClipboard, FaEnvelope, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";
import '../../styles/common/Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection, isOpen }) => {
  const menuItems = [
    { key: 'dashboard', label: 'Inicio' },
    { key: 'users', label: 'Gestión de Usuarios' },
    { key: 'projects', label: 'Proyectos' },
    { key: 'evaluations', label: 'Evaluaciones' },
    { key: 'reports', label: 'Reportes' },
    { key: 'templates', label: 'Plantillas' },
    { key: 'messages', label: 'Mensajes' },
    { key: 'settings', label: 'Configuración' }
  ];

  const iconMap = {
    dashboard: <MdDashboard />,
    users: <FaUsers />,
    projects: <FaFolderOpen />,
    evaluations: <FaStar />,
    reports: <FaChartLine />,
    templates: <FaRegClipboard />,
    messages: <FaEnvelope />,
    settings: <FaCog />
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
                  onClick={() => setActiveSection(item.key)}
                  title={isOpen ? undefined : item.label}
                >
                  <span className="nav-icon">{iconMap[item.key]}</span>
                  {isOpen && <span className="nav-label">{item.label}</span>}
                  {activeSection === item.key && <div className="nav-indicator"></div>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" title={isOpen ? undefined : 'Cerrar sesión'}>
          <span className="nav-icon"><FaSignOutAlt /></span>
          {isOpen && <span className="nav-label">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;