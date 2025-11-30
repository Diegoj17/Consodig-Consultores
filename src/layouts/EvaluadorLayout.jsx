import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProfileEditPage from '../pages/ProfileEditPage';
import EvaluatorDocumentsPage from '../pages/user/EvaluatorDocumentsPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import EvaluadorDashboard from '../pages/user/EvaluadorDashboardPage';
import EvaluatorProjectsPage from '../pages/user/EvaluatorProjectsPage';
import EvaluatorPendingPage from '../pages/user/EvaluatorPendingPage';
import EvaluatorInProgressPage from '../pages/user/EvaluatorInProgressPage';
import EvaluatorCompletedPage from '../pages/user/EvaluatorCompletedPage';
import EvaluatorEvaluationForm from '../components/management/project/evaluador/EvaluatorEvaluationForm';
import EvaluatorHistoryPage from '../pages/user/EvaluatorHistoryPage';
import EvaluatorInProgressProjectsPage from '../pages/user/EvaluatorInProgressProjectsPage';
import '../styles/pages/admin/DashboardPage.css';

function EvaluadorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Determinar sección activa basada en la URL - MEJORADO
  const getActiveSection = () => {
    const path = location.pathname;
    
    // Rutas del submenú de Evaluaciones (más específicas primero)
    if (path.includes('/evaluador/evaluations/pending')) return 'evaluations-pending';
    if (path.includes('/evaluador/evaluations/in-progress')) return 'evaluations-in-progress';
    if (path.includes('/evaluador/evaluations/completed')) return 'evaluations-completed';
    
    // Rutas del submenú de Proyectos
    if (path.includes('/evaluador/projects/assigned')) return 'projects-assigned';
    if (path.includes('/evaluador/projects/evaluating')) return 'projects-evaluating';
    if (path.includes('/evaluador/projects/history')) return 'projects-history';
    
    // Otras rutas
    if (path.includes('/evaluador/documents')) return 'documents';
    if (path.includes('/evaluador/profile/edit')) return 'profile';
    if (path.includes('/evaluador/change-password')) return 'change-password';
    if (path.includes('/evaluador/evaluations')) return 'evaluations';
    if (path.includes('/evaluador/projects')) return 'projects';
    if (path.includes('/evaluador/reports')) return 'reports';
    if (path.includes('/evaluador/messages')) return 'messages';
    
    return 'dashboard';
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes('/evaluador/profile/edit')) return 'Editar Perfil';
    if (path.includes('/evaluador/change-password')) return 'Cambiar Contraseña';
    if (path.includes('/evaluador/documents')) return 'Mis Documentos';

    if (path.includes('/evaluador/evaluations/pending')) return 'Evaluaciones Pendientes';
    if (path.includes('/evaluador/evaluations/in-progress')) return 'Evaluaciones en Progreso';
    if (path.includes('/evaluador/evaluations/completed')) return 'Evaluaciones Completadas';
    if (path.includes('/evaluador/evaluation')) return 'Formulario de Evaluación';

    if (path.includes('/evaluador/projects/assigned')) return 'Proyectos Asignados';
    if (path.includes('/evaluador/projects/evaluating')) return 'Proyectos en Evaluación';
    if (path.includes('/evaluador/projects/history')) return 'Historial de Proyectos';
    
    const titles = {
      dashboard: 'Inicio',
      evaluations: 'Mis Evaluaciones',
      projects: 'Proyectos',
      documents: 'Mis Documentos',
      reports: 'Reportes',
      messages: 'Mensajes',
      profile: 'Mi Perfil'
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
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/documents" element={<EvaluatorDocumentsPage />} />

            {/* Rutas del submenú de Evaluaciones */}
            <Route path="/evaluations/pending" element={<EvaluatorPendingPage />} />
            <Route path="/evaluations/in-progress" element={<EvaluatorInProgressPage />} />
            <Route path="/evaluations/completed" element={<EvaluatorCompletedPage />} />
            <Route path="/evaluate/:evaluationId" element={<EvaluatorEvaluationForm />} />

            {/* Rutas del submenú de Proyectos - MEJORADO */}
            <Route path="/projects/assigned" element={<EvaluatorProjectsPage />} />
            <Route path="/projects/evaluating" element={<EvaluatorInProgressProjectsPage />} />
            <Route path="/projects/history" element={<EvaluatorHistoryPage />} />
            
            <Route path="/reports" element={<div>Reportes (Evaluador)</div>} />
            <Route path="/messages" element={<div>Mensajes (Evaluador)</div>} />

            <Route path="/" element={<Navigate to="/evaluador/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default EvaluadorLayout;