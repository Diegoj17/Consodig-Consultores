// layouts/AdminLayout.jsx - Actualizado
import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProfileEditPage from '../pages/ProfileEditPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import DashboardPage from '../pages/admin/DashboardPage';
import UserManagement from '../pages/admin/UserManagementPage';
import ProjectsMainPage from '../pages/admin/ProjectsMainPage';
import ProjectEvaluationsMainPage from '../pages/admin/ProjectEvaluationsMainPage';
import ProjectAssignmentMainPage from '../pages/admin/ProjectAssignmentMainPage';
import ProjectHistoryMainPage from '../pages/admin/ProjectHistoryMainPage';
import EvaluationReviewMainPage from '../pages/admin/EvaluationReviewMainPage';
import EvaluationReportsPage from '../pages/admin/EvaluationReportsPage'; 
import EvaluatorReportsPage from '../pages/admin/EvaluatorReportsPage'; 
import '../styles/pages/admin/DashboardPage.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // MEJORADO: Determinar sección activa basada en la URL
  const getActiveSection = () => {
    const path = location.pathname;
    
    // Rutas del submenú de Evaluaciones (más específicas primero)
    if (path.includes('/admin/evaluations/review')) return 'review-evaluations';
    if (path.includes('/admin/evaluations/completed')) return 'completed-evaluations';
    if (path.includes('/admin/evaluations/feedback')) return 'feedback-management';
    
    // Rutas del submenú de Proyectos
    if (path.includes('/admin/projects')) return 'manage-projects';
    if (path.includes('/admin/evaluations')) return 'evaluation-forms';
    if (path.includes('/admin/assign')) return 'assign-evaluators';
    if (path.includes('/admin/history')) return 'project-history';
    
    // Rutas del submenú de Reportes
    if (path.includes('/admin/reports/evaluations')) return 'evaluation-reports';
    if (path.includes('/admin/reports/evaluators')) return 'evaluator-reports';

    // Otras rutas
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/templates')) return 'templates';


    
    return 'dashboard';
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes('/admin/profile/edit')) return 'Editar Perfil';
    if (path.includes('/admin/change-password')) return 'Cambiar Contraseña';

    // Títulos específicos para las nuevas rutas
    if (path.includes('/admin/evaluations/review')) return 'Revisar Evaluaciones';
    if (path.includes('/admin/evaluations/completed')) return 'Evaluaciones Completadas';
    if (path.includes('/admin/evaluations/feedback')) return 'Gestión de Observaciones';
    
    // Títulos para Reportes
    if (path.includes('/admin/reports/evaluations')) return 'Reportes por Evaluaciones';
    if (path.includes('/admin/reports/evaluators')) return 'Reportes por Evaluador';
    
    const titles = {
      dashboard: 'Inicio',
      users: 'Gestión de Usuarios',
      'manage-projects': 'Gestión de Proyectos',
      'evaluation-forms': 'Formatos de Evaluación',
      'assign-evaluators': 'Asignación de Evaluadores',
      'project-history': 'Historial de Proyectos',
      reports: 'Sistema de Reportes', // ✅ ACTUALIZADO
      'evaluation-reports': 'Reportes por Evaluaciones', // ✅ NUEVO
      'evaluator-reports': 'Reportes por Evaluador', // ✅ NUEVO
      templates: 'Plantillas de Evaluación',
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
            {/* Rutas principales */}
            <Route path="/dashboard" element={<DashboardPage userType="admin" />} />
            <Route path="/users" element={<UserManagement />} />

            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            
            {/* Rutas de proyectos */}
            <Route path="/projects" element={<ProjectsMainPage initialTab="projects" />} />
            <Route path="/evaluations" element={<ProjectEvaluationsMainPage initialTab="evaluations" />} />
            <Route path="/assign" element={<ProjectAssignmentMainPage initialTab="assign" />} />
            <Route path="/history" element={<ProjectHistoryMainPage initialTab="history" />} />
            
            {/* Rutas específicas del submenú de Evaluaciones */}
            <Route path="/evaluations/review" element={<EvaluationReviewMainPage initialTab="review" />} />
            <Route path="/evaluations/completed" element={<EvaluationReviewMainPage initialTab="completed" />} />
            <Route path="/evaluations/feedback" element={<EvaluationReviewMainPage initialTab="feedback" />} />
            
            <Route path="/reports/evaluations" element={<EvaluationReportsPage />} />
            <Route path="/reports/evaluators" element={<EvaluatorReportsPage />} />
            
            <Route path="/reports" element={<Navigate to="/admin/reports/evaluations" replace />} />
            
            
            {/* Otras rutas */}
            <Route path="/templates" element={<div>Plantillas (Admin)</div>} />
            <Route path="/messages" element={<div>Mensajes (Admin)</div>} />
            
            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;