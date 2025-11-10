import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import DashboardContent from '../../components/dashboard/admin/DashboardContent';
import '../../styles/pages/admin/DashboardPage.css';

function DashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Inicio',
      users: 'Gestión de Usuarios',
      projects: 'Gestión de Proyectos',
      evaluations: 'Evaluaciones',
      reports: 'Reportes y Estadísticas',
      templates: 'Plantillas de Evaluación',
      messages: 'Mensajes y Notificaciones',
      settings: 'Configuración del Sistema'
    };
    return titles[activeSection] || 'Dashboard';
  };

  return (
    <div className={`dashboard-app ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <Sidebar 
        isOpen={sidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="dashboard-main">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={getPageTitle()}
        />
        <main className="main-content">
          <DashboardContent activeSection={activeSection} />
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;