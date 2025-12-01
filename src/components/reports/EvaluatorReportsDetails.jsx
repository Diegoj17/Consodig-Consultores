import React from 'react';
import { FaStar } from 'react-icons/fa';

const EvaluatorReportsDetails = ({ evaluator }) => {
  const getToneClass = (rating) => {
    if (rating >= 4) return 'high';
    if (rating >= 3) return 'medium';
    return 'low';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const tone = getToneClass(rating || 0);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className={`evaluator-reports-star filled ${tone}`} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className={`evaluator-reports-star half-filled ${tone}`} />);
      } else {
        stars.push(<FaStar key={i} className={`evaluator-reports-star empty ${tone}`} />);
      }
    }

    return stars;
  };

  const getDistributionDenominator = () => {
    const sum = Object.values(evaluator.performance?.ratingsDistribution || {}).reduce((acc, value) => acc + (Number(value) || 0), 0);
    return sum > 0 ? sum : (Number(evaluator.completedEvaluations) || 0) || 1;
  };

  return (
    <div className="evaluator-reports-details">
      <div className="evaluator-reports-performance-metrics">
        <div className="evaluator-reports-performance-card">
          <h3>Desempeño General</h3>
          <div className="evaluator-reports-metrics-grid">
            <div className="evaluator-reports-metric">
              <div className="evaluator-reports-metric-value">
                {renderStars(evaluator.averageRating || 0)}
                <div className="evaluator-reports-metric-number">{evaluator.averageRating ?? '0.0'}</div>
              </div>
              <div className="evaluator-reports-metric-label">Calificación Promedio</div>
            </div>
            <div className="evaluator-reports-metric">
              <div className="evaluator-reports-metric-value">{evaluator.totalProjects ?? 0}</div>
              <div className="evaluator-reports-metric-label">Proyectos Asignados</div>
            </div>
            <div className="evaluator-reports-metric">
              <div className="evaluator-reports-metric-value">{evaluator.completedEvaluations ?? 0}</div>
              <div className="evaluator-reports-metric-label">Evaluaciones Completadas</div>
            </div>
            <div className="evaluator-reports-metric">
              <div className="evaluator-reports-metric-value">{evaluator.pendingEvaluations ?? 0}</div>
              <div className="evaluator-reports-metric-label">Evaluaciones Pendientes</div>
            </div>
          </div>
        </div>

        <div className="evaluator-reports-performance-card">
          <h3>Distribución de Calificaciones</h3>
          <div className="evaluator-reports-distribution">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = Number(evaluator.performance?.ratingsDistribution?.[rating] || 0);
              const denom = getDistributionDenominator();
              const pct = denom > 0 ? Math.round((count / denom) * 100) : 0;
              return (
                <div key={rating} className="evaluator-reports-distribution-item">
                  <div className="evaluator-reports-distribution-row">
                    <span className="evaluator-reports-rating-label">{rating} ★</span>
                    <div className="evaluator-reports-bar-container">
                      <div
                        className="evaluator-reports-bar-fill"
                        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                      />
                    </div>
                    <span className="evaluator-reports-count">{count} ({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="evaluator-reports-recent-projects">
        <h3>Proyectos Evaluados Recientemente</h3>
        <div className="evaluator-reports-projects-list">
          {(evaluator.performance?.projects || []).map((project, index) => (
            <div key={index} className="evaluator-reports-project-item">
              <div className="evaluator-reports-project-info">
                <h4>{project.projectName || project.evaluationName}</h4>
                {project.evaluationName && (
                  <span className="evaluator-reports-project-subtitle">{project.evaluationName}</span>
                )}
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