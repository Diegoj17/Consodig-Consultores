import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import DashboardPage from '../pages/admin/DashboardPage';
import UserManagement from '../pages/admin/UserManagementPage';
import ProjectsMainPage from '../pages/admin/ProjectsMainPage';
import ProjectEvaluationsMainPage from '../pages/admin/ProjectEvaluationsMainPage';
import ProjectAssignmentMainPage from '../pages/admin/ProjectAssignmentMainPage';
import ProjectHistoryMainPage from '../pages/admin/ProjectHistoryMainPage';

import '../styles/pages/admin/DashboardPage.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Determinar sección activa basada en la URL
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/projects')) return 'projects';
    if (path.includes('/admin/evaluations')) return 'evaluations';
    if (path.includes('/admin/assign')) return 'assign';
    if (path.includes('/admin/history')) return 'history';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/templates')) return 'templates';
    if (path.includes('/admin/messages')) return 'messages';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Inicio',
      users: 'Gestión de Usuarios',
      projects: 'Gestión de Proyectos',
      evaluations: 'Formatos de Evaluación',
      assign: 'Asignación de Evaluadores',
      history: 'Historial de Proyectos',
      reports: 'Reportes y Estadísticas',
      templates: 'Plantillas de Evaluación',
      messages: 'Mensajes y Notificaciones',
      settings: 'Configuración del Sistema'
    };
    return titles[getActiveSection()] || 'Dashboard';
  };

  return (
    <div className={`dashboard-app ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <Sidebar 
        isOpen={sidebarOpen}
        activeSection={getActiveSection()}
        userType="admin"
      />
      <div className="dashboard-main">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={getPageTitle()}
          userType="admin"
        />
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage userType="admin" />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/projects" element={<ProjectsMainPage initialTab="projects" />} />
            <Route path="/evaluations" element={<ProjectEvaluationsMainPage initialTab="evaluations" />} />
            <Route path="/assign" element={<ProjectAssignmentMainPage initialTab="assign" />} />
            <Route path="/history" element={<ProjectHistoryMainPage initialTab="history" />} />
            <Route path="/reports" element={<div>Reportes (Admin)</div>} />
            <Route path="/templates" element={<div>Plantillas (Admin)</div>} />
            <Route path="/messages" element={<div>Mensajes (Admin)</div>} />
            <Route path="/settings" element={<div>Configuración (Admin)</div>} />
            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;