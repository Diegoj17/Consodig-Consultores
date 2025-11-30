import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import EvaluandoDashboard from '../pages/user/EvaluandoDashboardPage';
import ProfileEditPage from '../pages/ProfileEditPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import '../styles/pages/admin/DashboardPage.css';

function EvaluandoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // MEJORADO: Determinar sección activa basada en la URL
  const getActiveSection = () => {
    const path = location.pathname;
    
    // Rutas del submenú de Resultados
    if (path.includes('/evaluando/results/current')) return 'results-current';
    if (path.includes('/evaluando/results/history')) return 'results-history';
    if (path.includes('/evaluando/results/comparative')) return 'results-comparative';
    
    // Otras rutas
    if (path.includes('/evaluando/evaluations')) return 'evaluations';
    if (path.includes('/evaluando/projects')) return 'my-projects';
    if (path.includes('/evaluando/results')) return 'results';
    if (path.includes('/evaluando/messages')) return 'messages';
    
    return 'dashboard';
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes('/evaluando/profile/edit')) return 'Editar Perfil';
    if (path.includes('/evaluando/change-password')) return 'Cambiar Contraseña';
    
    const titles = {
      dashboard: 'Inicio',
      evaluations: 'Mis Evaluaciones',
      'my-projects': 'Mis Proyectos',
      results: 'Resultados',
      messages: 'Mensajes',
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
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />

            <Route path="/evaluations" element={<div>Mis Evaluaciones (Evaluando)</div>} />

            <Route path="/projects" element={<div>Mis Proyectos (Evaluando)</div>} />

            {/* Rutas del submenú de Resultados */}
            <Route path="/results/current" element={<div>Resultados Actuales (Evaluando)</div>} />
            <Route path="/results/history" element={<div>Historial de Resultados (Evaluando)</div>} />
            <Route path="/results/comparative" element={<div>Análisis Comparativo (Evaluando)</div>} />
            
            <Route path="/messages" element={<div>Mensajes (Evaluando)</div>} />

            <Route path="/" element={<Navigate to="/evaluando/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default EvaluandoLayout;