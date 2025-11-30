// components/admin/reports/ProjectRatingsTable.jsx
import React from 'react';
import { FaStar } from 'react-icons/fa';
import '../../styles/reports/RatingsTables.css';

const ProjectRatingsTable = ({ projects }) => {
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
    <div className="project-ratings-table">
      <h2>Promedio de Calificaciones por Proyecto</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Evaluador</th>
              <th>Calificación Promedio</th>
              <th>Total Evaluaciones</th>
              <th>Última Evaluación</th>
              <th>Estado</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td className="project-name">{project.name}</td>
                <td className="evaluator-name">{project.evaluator}</td>
                <td className="rating-cell">
                  <div className="rating-display">
                    {renderStars(project.averageRating)}
                    <span className="rating-number">{project.averageRating}</span>
                  </div>
                </td>
                <td className="evaluation-count">{project.totalEvaluations}</td>
                <td className="last-evaluation">{project.lastEvaluation}</td>
                <td>
                  <span className={`status-badge ${project.status.toLowerCase()}`}>
                    {project.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="details-btn"
                    onClick={() => alert(`Detalles de: ${project.name}`)}
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectRatingsTable;