// components/admin/reports/EvaluationReportsProjectsTable.jsx
import React from 'react';
import { FaFilter, FaStar } from 'react-icons/fa';
import '../../styles/reports/EvaluationReportsProjectsTable.css';

const EvaluationReportsProjectsTable = ({ projects, onFilter, onViewDetails }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="evaluation-reports-star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="evaluation-reports-star half-filled" />);
      } else {
        stars.push(<FaStar key={i} className="evaluation-reports-star empty" />);
      }
    }

    return stars;
  };

  return (
    <div className="evaluation-reports-projects-section">
      <div className="evaluation-reports-section-header">
        <h2>Promedio de Calificaciones por Proyecto</h2>
        <div className="evaluation-reports-table-actions">
          <button className="evaluation-reports-filter-btn" onClick={onFilter}>
            <FaFilter /> Filtros Avanzados
          </button>
        </div>
      </div>

      <div className="evaluation-reports-table-container">
        <table className="evaluation-reports-projects-table">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Evaluador</th>
              <th>Calificación</th>
              <th>Promedio</th>
              <th>Total Evaluaciones</th>
              <th>Última Evaluación</th>
              <th>Estado</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td className="evaluation-reports-project-name">
                  <strong>{project.name}</strong>
                </td>
                <td className="evaluation-reports-evaluator-name">
                  {project.evaluator}
                </td>
                <td className="evaluation-reports-rating-display">
                  <div className="evaluation-reports-stars-container">
                    {renderStars(project.averageRating)}
                  </div>
                </td>
                <td className="evaluation-reports-average-rating">
                  <span className="evaluation-reports-rating-value">{project.averageRating}</span>
                </td>
                <td className="evaluation-reports-evaluation-count">
                  {project.totalEvaluations}
                </td>
                <td className="evaluation-reports-last-evaluation">
                  {project.lastEvaluation}
                </td>
                <td className="evaluation-reports-status">
                  <span className={`evaluation-reports-status-badge ${project.status.toLowerCase()}`}>
                    {project.status}
                  </span>
                </td>
                <td className="evaluation-reports-actions">
                  <button 
                    className="evaluation-reports-details-btn"
                    onClick={() => onViewDetails(project)}
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="evaluation-reports-no-data">
          <p>No se encontraron proyectos que coincidan con la búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default EvaluationReportsProjectsTable;