import React from 'react';
import { FaProjectDiagram } from 'react-icons/fa';
import '../../../../styles/management/project/admin/ProjectStats.css';

const ProjectStats = ({ projects, onCreateProject }) => {
  // Contar proyectos por estado
  const getTotalCount = () => {
    return projects.length;
  };

  const getPendingCount = () => {
    return projects.filter(project => project.estado === 'Pendiente').length;
  };

  const getInEvaluationCount = () => {
    return projects.filter(project => project.estado === 'En evaluación').length;
  };

  const getEvaluatedCount = () => {
    return projects.filter(project => project.estado === 'Evaluado').length;
  };

  const getPreassignedCount = () => {
    return projects.filter(project => project.estado === 'Preasignado').length;
  };

  return (
    <div className="project-management-header">
      <div className="project-header-content">
        <div className="project-header-title">
          <p>Administra y gestiona los proyectos del sistema</p>
        </div>
        <div className="project-header-actions">
          <button
            className="project-btn-primary project-btn-with-icon"
            onClick={onCreateProject}
          >
            <FaProjectDiagram />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      <div className="project-stats-cards">
        <div className="project-stat-card">
          <div className="project-stat-icon total">
            <FaProjectDiagram />
          </div>
          <div className="project-stat-info">
            <span className="project-stat-number">{getTotalCount()}</span>
            <span className="project-stat-label">Total Proyectos</span>
          </div>
        </div>
        
        <div className="project-stat-card">
          <div className="project-stat-icon pending">
            <FaProjectDiagram />
          </div>
          <div className="project-stat-info">
            <span className="project-stat-number">{getPendingCount()}</span>
            <span className="project-stat-label">Pendientes</span>
          </div>
        </div>
        
        <div className="project-stat-card">
          <div className="project-stat-icon evaluation">
            <FaProjectDiagram />
          </div>
          <div className="project-stat-info">
            <span className="project-stat-number">{getInEvaluationCount()}</span>
            <span className="project-stat-label">En Evaluación</span>
          </div>
        </div>

        <div className="project-stat-card">
          <div className="project-stat-icon evaluated">
            <FaProjectDiagram />
          </div>
          <div className="project-stat-info">
            <span className="project-stat-number">{getEvaluatedCount()}</span>
            <span className="project-stat-label">Evaluados</span>
          </div>
        </div>

        <div className="project-stat-card">
          <div className="project-stat-icon preassigned">
            <FaProjectDiagram />
          </div>
          <div className="project-stat-info">
            <span className="project-stat-number">{getPreassignedCount()}</span>
            <span className="project-stat-label">Preasignados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;