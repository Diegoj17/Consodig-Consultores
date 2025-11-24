import React from 'react';
import '../../../../styles/management/project/evaluador/EvaluatorHistory.css';

const EvaluatorHistory = ({ projects }) => {
  const completedProjects = projects.filter(p => p.estado === 'Evaluado');

  return (
    <div className="evaluator-history">
      <div className="evaluator-section-header">
        <h2>Historial de Evaluaciones</h2>
        <p>Consulta tus evaluaciones completadas</p>
      </div>

      <div className="evaluator-history-grid">
        {completedProjects.length === 0 ? (
          <p className="evaluator-empty-message">No hay evaluaciones completadas</p>
        ) : (
          completedProjects.map(project => (
            <div key={project.id} className="evaluator-history-card">
              <h3>{project.titulo}</h3>
              <div className="evaluator-history-details">
                <span>Fecha de evaluación: {project.fechaEvaluacion || 'N/A'}</span>
                <span className="evaluator-history-score">
                  Calificación: {project.calificacion || 'N/A'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EvaluatorHistory;