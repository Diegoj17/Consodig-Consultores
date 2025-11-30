// components/admin/reports/EvaluatorRatingsTable.jsx
import React from 'react';
import { FaStar } from 'react-icons/fa';
import '../../styles/reports/RatingsTables.css';

const EvaluatorRatingsTable = ({ evaluators }) => {
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
    <div className="evaluator-ratings-table">
      <h2>Promedio de Calificaciones por Evaluador</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Evaluador</th>
              <th>Institución</th>
              <th>Especialización</th>
              <th>Calificación Promedio</th>
              <th>Proyectos Asignados</th>
              <th>Evaluaciones Completadas</th>
              <th>Pendientes</th>
              <th>Distribución</th>
            </tr>
          </thead>
          <tbody>
            {evaluators.map(evaluator => (
              <tr key={evaluator.id}>
                <td className="evaluator-name">{evaluator.name}</td>
                <td className="institution">{evaluator.institution}</td>
                <td className="specialization">{evaluator.specialization}</td>
                <td className="rating-cell">
                  <div className="rating-display">
                    {renderStars(evaluator.averageRating)}
                    <span className="rating-number">{evaluator.averageRating}</span>
                  </div>
                </td>
                <td className="project-count">{evaluator.totalProjects}</td>
                <td className="evaluation-count">{evaluator.completedEvaluations}</td>
                <td className="pending-count">{evaluator.pendingEvaluations}</td>
                <td className="distribution">
                  <div className="distribution-bars">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="distribution-bar">
                        <span className="rating-label">{rating}★</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill"
                            style={{
                              width: `${(evaluator.ratingsDistribution[rating] / evaluator.completedEvaluations) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="count">{evaluator.ratingsDistribution[rating]}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvaluatorRatingsTable;