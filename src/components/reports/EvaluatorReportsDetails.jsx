import React from 'react';
import { FaStar } from 'react-icons/fa';
import '../../styles/reports/EvaluatorReportsDetails.css';

const EvaluatorReportsDetails = ({ evaluator }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="evaluator-reports-star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="evaluator-reports-star half-filled" />);
      } else {
        stars.push(<FaStar key={i} className="evaluator-reports-star empty" />);
      }
    }

    return stars;
  };

  return (
    <div className="evaluator-reports-details">
      <div className="evaluator-reports-details-header">
        <h2>Reporte Detallado: {evaluator.name}</h2>
        <div className="evaluator-reports-evaluator-meta">
          <span>{evaluator.institution}</span>
          <span>{evaluator.specialization}</span>
          <span>Miembro desde: {evaluator.joinDate}</span>
        </div>
      </div>

      <div className="evaluator-reports-performance-metrics">
        <div className="evaluator-reports-performance-card">
          <h3>Desempeño General</h3>
          <div className="evaluator-reports-metrics-grid">
            <div className="evaluator-reports-metric">
              <div className="evaluator-reports-metric-value">
                {renderStars(evaluator.averageRating)}
                <span>{evaluator.averageRating}</span>
              </div>
              <div className="evaluator-reports-metric-label">Calificación Promedio</div>
            </div>
            <div className="evaluator-reports-metric">
              <div className="evaluator-reports-metric-value">{evaluator.totalProjects}</div>
              <div className="evaluator-reports-metric-label">Proyectos Asignados</div>
            </div>
            <div className="evaluator-reports-metric">
              <div className="evaluator-reports-metric-value">{evaluator.completedEvaluations}</div>
              <div className="evaluator-reports-metric-label">Evaluaciones Completadas</div>
            </div>
            <div className="evaluator-reports-metric">
              <div className="evaluator-reports-metric-value">{evaluator.pendingEvaluations}</div>
              <div className="evaluator-reports-metric-label">Evaluaciones Pendientes</div>
            </div>
          </div>
        </div>

        <div className="evaluator-reports-performance-card">
          <h3>Distribución de Calificaciones</h3>
          <div className="evaluator-reports-distribution-bars">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="evaluator-reports-distribution-item">
                <span className="evaluator-reports-rating-label">{rating} ★</span>
                <div className="evaluator-reports-bar-container">
                  <div 
                    className="evaluator-reports-bar-fill"
                    style={{
                      width: `${(evaluator.performance.ratingsDistribution[rating] / evaluator.completedEvaluations) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="evaluator-reports-count">{evaluator.performance.ratingsDistribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="evaluator-reports-recent-projects">
        <h3>Proyectos Evaluados Recientemente</h3>
        <div className="evaluator-reports-projects-list">
          {evaluator.performance.projects.map((project, index) => (
            <div key={index} className="evaluator-reports-project-item">
              <div className="evaluator-reports-project-info">
                <h4>{project.name}</h4>
                <span className="evaluator-reports-project-date">{project.date}</span>
              </div>
              <div className="evaluator-reports-project-rating">
                <span className="evaluator-reports-rating-badge">{project.rating} ★</span>
                <span className="evaluator-reports-project-status">{project.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorReportsDetails;