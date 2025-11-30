import React from 'react';
import '../../styles/reports/EvaluationReportsAdditionalStats.css';

const EvaluationReportsAdditionalStats = ({
  statistics = { ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, averageTime: '0 días' },
  summary = { totalEvaluations: 0, completedEvaluations: 0, pendingEvaluations: 0 }
}) => {
  return (
    <div className="evaluation-reports-additional-stats">
      <div className="evaluation-reports-stats-card">
        <h3>Distribución de Calificaciones</h3>
        <div className="evaluation-reports-distribution-bars">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="evaluation-reports-distribution-item">
              <span className="evaluation-reports-rating-label">{rating} ★</span>
              <div className="evaluation-reports-bar-container">
                <div
                  className="evaluation-reports-bar-fill"
                  style={{
                    width: `${((statistics.ratingDistribution?.[rating] || 0) / (summary.totalEvaluations || 1)) * 100}%`
                  }}
                ></div>
              </div>
              <span className="evaluation-reports-count">{statistics.ratingDistribution?.[rating] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="evaluation-reports-stats-card">
        <h3>Métricas de Tiempo</h3>
        <div className="evaluation-reports-time-metrics">
          <div className="evaluation-reports-time-metric">
            <span className="evaluation-reports-label">Tiempo Promedio por Evaluación:</span>
            <span className="evaluation-reports-value">{statistics.averageTime}</span>
          </div>
          <div className="evaluation-reports-time-metric">
            <span className="evaluation-reports-label">Evaluaciones Completadas:</span>
            <span className="evaluation-reports-value">{summary.completedEvaluations}</span>
          </div>
          <div className="evaluation-reports-time-metric">
            <span className="evaluation-reports-label">Evaluaciones Pendientes:</span>
            <span className="evaluation-reports-value">{summary.pendingEvaluations}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationReportsAdditionalStats;