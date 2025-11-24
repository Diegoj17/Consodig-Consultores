import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import EvaluadorDashboard from '../pages/user/EvaluadorDashboardPage';
import EvaluatorProjectsPage from '../pages/user/EvaluatorProjectsPage';
import EvaluatorPendingPage from '../pages/user/EvaluatorPendingPage';
import EvaluatorInProgressPage from '../pages/user/EvaluatorInProgressPage';
import EvaluatorCompletedPage from '../pages/user/EvaluatorCompletedPage';
import EvaluatorEvaluationForm from '../components/management/project/evaluador/EvaluatorEvaluationForm';
import '../styles/pages/admin/DashboardPage.css';

function EvaluadorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/evaluador/evaluations/pending')) return 'evaluations-pending';
    if (path.includes('/evaluador/evaluations/in-progress')) return 'evaluations-in-progress';
    if (path.includes('/evaluador/evaluations/completed')) return 'evaluations-completed';
    if (path.includes('/evaluador/evaluations')) return 'evaluations';
    if (path.includes('/evaluador/projects/assigned')) return 'projects';
    if (path.includes('/evaluador/reports')) return 'reports';
    if (path.includes('/evaluador/messages')) return 'messages';
    return 'dashboard';
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes('/evaluador/evaluations/pending')) return 'Evaluaciones Pendientes';
    if (path.includes('/evaluador/evaluations/in-progress')) return 'Evaluaciones en Progreso';
    if (path.includes('/evaluador/evaluations/completed')) return 'Evaluaciones Completadas';
    if (path.includes('/evaluador/evaluation')) return 'Formulario de Evaluación';
    const titles = {
      dashboard: 'Inicio',
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
            <Route path="/evaluations/pending" element={<EvaluatorPendingPage />} />
            <Route path="/evaluations/in-progress" element={<EvaluatorInProgressPage />} />
            <Route path="/evaluations/completed" element={<EvaluatorCompletedPage />} />
            <Route path="/evaluation" element={<EvaluatorEvaluationForm />} />
            <Route path="/projects/assigned" element={<EvaluatorProjectsPage />} />
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