import React from 'react';
import '../../../styles/management/project/EvaluatorProjects.css';

const EvaluatorProjects = ({ projects, onAccept, onReject }) => {
  const assignedProjects = projects.filter(p => p.estado === 'Preasignado');

  return (
    <div className="evaluator-container">
      <h2 className="evaluator-title">Proyectos Preasignados</h2>
      
      <div className="evaluator-cards-grid">
        {assignedProjects.length === 0 ? (
          <p className="evaluator-empty-message">
            No tienes proyectos preasignados en este momento
          </p>
        ) : (
          assignedProjects.map(project => (
            <div key={project.id} className="evaluator-card">
              <h3 className="evaluator-card-title">{project.titulo}</h3>
              
              <div className="evaluator-card-section">
                <strong className="evaluator-card-label">Resumen:</strong>
                <p className="evaluator-card-text">{project.resumen}</p>
              </div>

              <div className="evaluator-card-section">
                <strong className="evaluator-card-label">Palabras Clave:</strong>
                <p className="evaluator-card-text">{project.palabrasClave}</p>
              </div>

              <div className="evaluator-card-section">
                <strong className="evaluator-card-label">Objetivo General:</strong>
                <p className="evaluator-card-text">{project.objetivoGeneral}</p>
              </div>

              <div className="evaluator-card-meta">
                <span>Fecha de envío: {project.fechaEnvio}</span>
                {project.deadline && (
                  <span className="evaluator-card-deadline">
                    Plazo: {project.deadline}
                  </span>
                )}
              </div>

              <div className="evaluator-card-actions">
                <button
                  className="evaluator-accept-button"
                  onClick={() => onAccept(project.id)}
                >
                  Aceptar Evaluación
                </button>
                <button
                  className="evaluator-reject-button"
                  onClick={() => onReject(project.id)}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EvaluatorProjects;