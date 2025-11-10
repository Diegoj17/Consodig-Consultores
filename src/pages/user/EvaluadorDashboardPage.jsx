import React from 'react';
import EvaluadorStats from '../../components/dashboard/evaluador/EvaluadorStats';
import EvaluadorActions from '../../components/dashboard/evaluador/EvaluadorActions';
import RecentEvaluations from '../../components/dashboard/evaluador/RecentEvaluations';
import AssignedProjects from '../../components/dashboard/evaluador/AssignedProjects';
import '../../styles/pages/user/EvaluadorDashboardPage.css';

const EvaluadorDashboardPage = () => {
  // Datos de ejemplo - en una app real vendrían de una API
  const dashboardData = {
    stats: {
      pendingEvaluations: 5,
      completedEvaluations: 12,
      assignedProjects: 3,
      averageRating: 4.5
    },
    recentEvaluations: [
      { id: 1, project: 'Proyecto Alpha', evaluando: 'Juan Pérez', dueDate: '2024-01-15', status: 'pending' },
      { id: 2, project: 'Proyecto Beta', evaluando: 'María García', dueDate: '2024-01-10', status: 'completed' },
      { id: 3, project: 'Proyecto Gamma', evaluando: 'Carlos López', dueDate: '2024-01-20', status: 'in-progress' }
    ],
    assignedProjects: [
      { id: 1, name: 'Proyecto Alpha', progress: 75, deadline: '2024-01-30', evaluandos: 3 },
      { id: 2, name: 'Proyecto Beta', progress: 100, deadline: '2024-01-10', evaluandos: 2 },
      { id: 3, name: 'Proyecto Gamma', progress: 25, deadline: '2024-02-15', evaluandos: 4 }
    ]
  };

  const handleStartEvaluation = (evaluationId) => {
    console.log('Iniciando evaluación:', evaluationId);
    // Navegar a la página de evaluación
  };

  const handleViewProject = (projectId) => {
    console.log('Viendo proyecto:', projectId);
    // Navegar a la página del proyecto
  };

  return (
    <div className="evaluador-dashboard">
      <div className="dashboard-header">
        <h1>Mi Dashboard</h1>
        <p>Bienvenido de vuelta, aquí tienes un resumen de tus actividades</p>
      </div>

      <EvaluadorStats stats={dashboardData.stats} />
      
      <EvaluadorActions 
        onStartEvaluation={() => handleStartEvaluation('new')}
        onViewProjects={() => handleViewProject('all')}
      />

      <div className="dashboard-content">
        <div className="content-column">
          <RecentEvaluations 
            evaluations={dashboardData.recentEvaluations}
            onStartEvaluation={handleStartEvaluation}
          />
        </div>
        
        <div className="content-column">
          <AssignedProjects 
            projects={dashboardData.assignedProjects}
            onViewProject={handleViewProject}
          />
        </div>
      </div>
    </div>
  );
};

export default EvaluadorDashboardPage;