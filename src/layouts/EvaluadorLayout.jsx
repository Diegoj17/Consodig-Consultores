import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import EvaluadorDashboard from '../pages/user/EvaluadorDashboardPage';
import '../styles/pages/admin/DashboardPage.css';

function EvaluadorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/evaluador/evaluations')) return 'evaluations';
    if (path.includes('/evaluador/projects')) return 'projects';
    if (path.includes('/evaluador/reports')) return 'reports';
    if (path.includes('/evaluador/messages')) return 'messages';
    if (path.includes('/evaluador/profile')) return 'profile';
    if (path.includes('/evaluador/settings')) return 'settings';
    return 'dashboard';
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Mi Dashboard',
      evaluations: 'Mis Evaluaciones',
      projects: 'Proyectos Asignados',
      reports: 'Reportes',
      messages: 'Mensajes',
      profile: 'Mi Perfil',
      settings: 'Configuración'
    };
    return titles[getActiveSection()] || 'Dashboard';
  };

  return (
    <div className={`dashboard-app ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <Sidebar 
        isOpen={sidebarOpen}
        activeSection={getActiveSection()}
        userType="evaluador"
      />
      <div className="dashboard-main">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={getPageTitle()}
          userType="evaluador"
        />
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<EvaluadorDashboard />} />
            <Route path="/evaluations" element={<div>Mis Evaluaciones (Evaluador)</div>} />
            <Route path="/projects" element={<div>Proyectos Asignados (Evaluador)</div>} />
            <Route path="/reports" element={<div>Reportes (Evaluador)</div>} />
            <Route path="/messages" element={<div>Mensajes (Evaluador)</div>} />
            <Route path="/profile" element={<div>Mi Perfil (Evaluador)</div>} />
            <Route path="/settings" element={<div>Configuración (Evaluador)</div>} />
            <Route path="/" element={<Navigate to="/evaluador/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default EvaluadorLayout;