// components/admin/reports/RatingsSummary.jsx
import React from 'react';
import { FaStar, FaProjectDiagram, FaUserTie, FaChartBar } from 'react-icons/fa';
import '../../styles/reports/RatingsSummary.css';

const RatingsSummary = ({ summary }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half-filled" />);
      } else {
        stars.push(<FaStar key={i} className="star empty" />);
      }
    }

    return stars;
  };

  return (
    <div className="ratings-summary">
      <div className="summary-card">
        <div className="summary-icon overall">
          <FaStar />
        </div>
        <div className="summary-info">
          <h3>Promedio General</h3>
          <div className="rating-display">
            {renderStars(summary.overallAverage)}
            <span className="rating-number">{summary.overallAverage}/5.0</span>
          </div>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon projects">
          <FaProjectDiagram />
        </div>
        <div className="summary-info">
          <h3>Proyectos Evaluados</h3>
          <span className="summary-number">{summary.totalProjects}</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon evaluators">
          <FaUserTie />
        </div>
        <div className="summary-info">
          <h3>Evaluadores Activos</h3>
          <span className="summary-number">{summary.totalEvaluators}</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon evaluations">
          <FaChartBar />
        </div>
        <div className="summary-info">
          <h3>Total Evaluaciones</h3>
          <span className="summary-number">{summary.totalEvaluations}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingsSummary;