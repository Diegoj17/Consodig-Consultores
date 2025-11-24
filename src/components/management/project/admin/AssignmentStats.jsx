import React from 'react';
import { FaUser, FaUserCheck, FaCalendar, FaUserPlus, FaChartBar, FaClock, FaCheckCircle } from 'react-icons/fa';
import '../../../../styles/management/project/admin/AssignmentStats.css';

const AssignmentStats = ({ projects, evaluators, selectedProject }) => {
  // Calcular estadísticas de proyectos
  const getTotalProjects = () => {
    return projects.length;
  };

  const getPendingProjects = () => {
    return projects.filter(project => project.estado === 'Pendiente').length;
  };

  const getPreassignedProjects = () => {
    return projects.filter(project => project.estado === 'Preasignado').length;
  };

  const getAssignedProjects = () => {
    return projects.filter(project => project.evaluadorAsignado).length;
  };

  // Calcular estadísticas de evaluadores
  const getTotalEvaluators = () => {
    return evaluators.length;
  };

  const getAvailableEvaluators = () => {
    return evaluators.filter(evaluator => evaluator.disponible).length;
  };

  const getBusyEvaluators = () => {
    return evaluators.filter(evaluator => !evaluator.disponible).length;
  };

  const getAverageProjectsPerEvaluator = () => {
    const totalProjects = evaluators.reduce((sum, evaluator) => sum + evaluator.proyectosAsignados, 0);
    return evaluators.length > 0 ? (totalProjects / evaluators.length).toFixed(1) : 0;
  };

  // Estadísticas de áreas
  const getAreasStats = () => {
    const areas = {};
    projects.forEach(project => {
      areas[project.area] = (areas[project.area] || 0) + 1;
    });
    return Object.keys(areas).length;
  };

  return (
    <div className="assignment-stats-container">
      <div className="assignment-stats-header">
        <div className="assignment-stats-title">
          <h2>Estadísticas de Asignación</h2>
          <p>Preasigna evaluadores con perfiles equivalentes a los proyectos de investigación</p>
        </div>
        {selectedProject && (
          <div className="assignment-current-selection">
            <span>Proyecto seleccionado: <strong>{selectedProject.titulo}</strong></span>
          </div>
        )}
      </div>

      <div className="assignment-stats-grid">
        {/* Estadísticas de Proyectos */}
        <div className="assignment-stat-card">
          <div className="assignment-stat-icon total-projects">
            <FaUser />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getTotalProjects()}</span>
            <span className="assignment-stat-label">Total Proyectos</span>
          </div>
        </div>

        <div className="assignment-stat-card">
          <div className="assignment-stat-icon pending">
            <FaClock />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getPendingProjects()}</span>
            <span className="assignment-stat-label">Pendientes</span>
          </div>
        </div>

        <div className="assignment-stat-card">
          <div className="assignment-stat-icon preassigned">
            <FaUserCheck />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getPreassignedProjects()}</span>
            <span className="assignment-stat-label">Preasignados</span>
          </div>
        </div>

        <div className="assignment-stat-card">
          <div className="assignment-stat-icon assigned">
            <FaCheckCircle />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getAssignedProjects()}</span>
            <span className="assignment-stat-label">Asignados</span>
          </div>
        </div>

        {/* Estadísticas de Evaluadores */}
        <div className="assignment-stat-card">
          <div className="assignment-stat-icon total-evaluators">
            <FaUserCheck />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getTotalEvaluators()}</span>
            <span className="assignment-stat-label">Total Evaluadores</span>
          </div>
        </div>

        <div className="assignment-stat-card">
          <div className="assignment-stat-icon available">
            <FaUserPlus />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getAvailableEvaluators()}</span>
            <span className="assignment-stat-label">Disponibles</span>
          </div>
        </div>

        <div className="assignment-stat-card">
          <div className="assignment-stat-icon busy">
            <FaCalendar />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getBusyEvaluators()}</span>
            <span className="assignment-stat-label">Ocupados</span>
          </div>
        </div>

        <div className="assignment-stat-card">
          <div className="assignment-stat-icon average">
            <FaChartBar />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getAverageProjectsPerEvaluator()}</span>
            <span className="assignment-stat-label">Promedio por Evaluador</span>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="assignment-stat-card">
          <div className="assignment-stat-icon areas">
            <FaChartBar />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">{getAreasStats()}</span>
            <span className="assignment-stat-label">Áreas de Investigación</span>
          </div>
        </div>

        <div className="assignment-stat-card">
          <div className="assignment-stat-icon assignment-rate">
            <FaCheckCircle />
          </div>
          <div className="assignment-stat-info">
            <span className="assignment-stat-number">
              {getTotalProjects() > 0 ? ((getAssignedProjects() / getTotalProjects()) * 100).toFixed(0) : 0}%
            </span>
            <span className="assignment-stat-label">Tasa de Asignación</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentStats;