import React, { useState } from 'react';
import { FaProjectDiagram, FaFileAlt, FaUserCheck, FaHistory, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import '../../../../styles/management/project/admin/NavigationTabs.css';

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(false);

  const tabs = [
    { id: 'projects', label: 'Proyectos', icon: FaProjectDiagram, hasSubmenu: true },
    { id: 'assign', label: 'Asignar Evaluadores', icon: FaUserCheck },
    { id: 'history', label: 'Historial', icon: FaHistory }
  ];

  const projectsSubmenu = [
    { id: 'evaluations', label: 'Formatos de Evaluación', icon: FaFileAlt },
    { id: 'assign', label: 'Asignar Evaluadores', icon: FaUserCheck },
    { id: 'history', label: 'Historial', icon: FaHistory }
  ];

  const handleProjectsClick = () => {
    setProjectsMenuOpen(!projectsMenuOpen);
    if (!projectsMenuOpen) {
      setActiveTab('projects');
    }
  };

  const handleSubmenuClick = (tabId) => {
    setActiveTab(tabId);
  };

  const isSubmenuActive = projectsSubmenu.some(item => item.id === activeTab);

  return (
    <div className="project-admin-navigation">
      <div 
        className={`project-admin-nav-tab ${isSubmenuActive ? 'project-admin-nav-tab--active' : ''}`}
        onClick={handleProjectsClick}
      >
        <FaProjectDiagram className="project-admin-nav-tab-icon" />
        <span className="project-admin-nav-tab-label">Proyectos</span>
        {projectsMenuOpen ? <FaChevronDown /> : <FaChevronRight />}
      </div>

      {projectsMenuOpen && (
        <div className="project-admin-submenu">
          {projectsSubmenu.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`project-admin-nav-tab project-admin-submenu-tab ${activeTab === item.id ? 'project-admin-nav-tab--active' : ''}`}
                onClick={() => handleSubmenuClick(item.id)}
              >
                <IconComponent className="project-admin-nav-tab-icon" />
                <span className="project-admin-nav-tab-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NavigationTabs;