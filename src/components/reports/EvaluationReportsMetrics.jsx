import React from 'react';
import { FaStar, FaProjectDiagram, FaChartBar, FaUserTie } from 'react-icons/fa';
import '../../styles/reports/EvaluationReportsMetrics.css';

const EvaluationReportsMetrics = ({ summary, statistics }) => {
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
    <div className="evaluation-reports-metrics-summary">
      <div className="evaluation-reports-metric-card">
        <div className="evaluation-reports-metric-icon overall">
          <FaStar />
        </div>
        <div className="evaluation-reports-metric-info">
          <h3>PROMEDIO GENERAL</h3>
          <div className="evaluation-reports-metric-value">
            {renderStars(summary.overallAverage)}
            <span className="evaluation-reports-rating-number">{summary.overallAverage}/5.0</span>
          </div>
        </div>
      </div>

      <div className="evaluation-reports-metric-card">
        <div className="evaluation-reports-metric-icon projects">
          <FaProjectDiagram />
        </div>
        <div className="evaluation-reports-metric-info">
          <h3>PROYECTOS EVALUADOS</h3>
          <div className="evaluation-reports-metric-value">{summary.totalProjects}</div>
        </div>
      </div>

      <div className="evaluation-reports-metric-card">
        <div className="evaluation-reports-metric-icon evaluations">
          <FaChartBar />
        </div>
        <div className="evaluation-reports-metric-info">
          <h3>EVALUACIONES TOTALES</h3>
          <div className="evaluation-reports-metric-value">{summary.totalEvaluations}</div>
        </div>
      </div>

      <div className="evaluation-reports-metric-card">
        <div className="evaluation-reports-metric-icon completion">
          <FaUserTie />
        </div>
        <div className="evaluation-reports-metric-info">
          <h3>TASA DE COMPLETACIÓN</h3>
          <div className="evaluation-reports-metric-value">{statistics.completionRate}%</div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationReportsMetrics;