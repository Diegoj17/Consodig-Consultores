import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import EvaluandoDashboard from '../pages/user/EvaluandoDashboardPage';
import '../styles/pages/admin/DashboardPage.css';

function EvaluandoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/evaluando/evaluations')) return 'evaluations';
    if (path.includes('/evaluando/projects')) return 'projects';
    if (path.includes('/evaluando/results')) return 'results';
    if (path.includes('/evaluando/messages')) return 'messages';
    if (path.includes('/evaluando/profile')) return 'profile';
    if (path.includes('/evaluando/settings')) return 'settings';
    return 'dashboard';
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Inicio',
      evaluations: 'Mis Evaluaciones',
      projects: 'Mis Proyectos',
      results: 'Resultados',
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
        userType="evaluando"
      />
      <div className="dashboard-main">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={getPageTitle()}
          userType="evaluando"
        />
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<EvaluandoDashboard />} />
            <Route path="/evaluations" element={<div>Mis Evaluaciones (Evaluando)</div>} />
            <Route path="/projects" element={<div>Mis Proyectos (Evaluando)</div>} />
            <Route path="/results" element={<div>Resultados (Evaluando)</div>} />
            <Route path="/messages" element={<div>Mensajes (Evaluando)</div>} />
            <Route path="/profile" element={<div>Mi Perfil (Evaluando)</div>} />
            <Route path="/settings" element={<div>Configuración (Evaluando)</div>} />
            <Route path="/" element={<Navigate to="/evaluando/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default EvaluandoLayout;