import React from 'react';
import StatsGrid from './StatsGrid';
import '../../../../styles/management/project/admin/WelcomeSection.css';

const WelcomeSection = ({ 
  totalProjects = 0, 
  recentProjects = 0, 
  pendingAssignment = 0, 
  inEvaluation = 0 
}) => {
  const stats = [
    { 
      value: totalProjects, 
      label: 'Total de Proyectos', 
      variant: 'total-projects' 
    },
    { 
      value: recentProjects, 
      label: 'Proyectos Recientes', 
      variant: 'recent-projects' 
    },
    { 
      value: pendingAssignment, 
      label: 'Sin Evaluadores Asignados', 
      variant: 'pending-assignment' 
    },
    { 
      value: inEvaluation, 
      label: 'En Evaluación', 
      variant: 'in-evaluation' 
    }
  ];

  return (
    <div className="project-admin-welcome">
      <div className="project-admin-header">
        <h2>Administra y gestiona los proyectos del sistema</h2>
      </div>
      <div className="project-admin-stats-container">
        <StatsGrid stats={stats} />
      </div>
    </div>
  );
};

export default WelcomeSection;