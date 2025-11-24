import React, { useState } from 'react';
import '../../../styles/management/project/EvaluatorAssignment.css';

const EvaluatorAssignment = ({ 
  projects, 
  evaluators, 
  onAssignEvaluator, 
  onShowModal 
}) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [evaluationDeadline, setEvaluationDeadline] = useState('');
  const [isBlindEvaluation, setIsBlindEvaluation] = useState(false);

  const availableProjects = projects.filter(p => !p.evaluadorAsignado);

  const handleAssign = (evaluatorId) => {
    if (!evaluationDeadline) {
      onShowModal('error', 'Por favor establezca un plazo de evaluación');
      return;
    }

    onAssignEvaluator(selectedProject.id, evaluatorId, {
      deadline: evaluationDeadline,
      isBlind: isBlindEvaluation
    });
    
    setSelectedProject(null);
    setEvaluationDeadline('');
    setIsBlindEvaluation(false);
  };

  return (
    <div className="assignment-container">
      <h2 className="assignment-title">Asignar Evaluadores</h2>
      
      <div className="assignment-grid">
        <div className="assignment-column">
          <h3 className="assignment-subtitle">Proyectos Disponibles</h3>
          {availableProjects.length === 0 ? (
            <p className="assignment-empty">No hay proyectos disponibles para asignar</p>
          ) : (
            availableProjects.map(project => (
              <div 
                key={project.id} 
                className={`assignment-project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
              >
                <h4 className="assignment-project-title">{project.titulo}</h4>
                <p className="assignment-project-researcher">
                  Investigador: {project.investigadorPrincipal}
                </p>
                <button 
                  className="assignment-select-button"
                  onClick={() => setSelectedProject(project)}
                >
                  {selectedProject?.id === project.id ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            ))
          )}
        </div>

        {selectedProject && (
          <div className="assignment-column">
            <h3 className="assignment-subtitle">Evaluadores Disponibles</h3>
            
            <div className="assignment-options-panel">
              <label className="assignment-checkbox-label">
                <input
                  type="checkbox"
                  checked={isBlindEvaluation}
                  onChange={(e) => setIsBlindEvaluation(e.target.checked)}
                />
                Evaluación Anónima (Doble Ciego)
              </label>
              
              <div className="assignment-form-group">
                <label className="assignment-form-label">Plazo de Evaluación *</label>
                <input
                  type="date"
                  value={evaluationDeadline}
                  onChange={(e) => setEvaluationDeadline(e.target.value)}
                  className="assignment-form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="assignment-evaluators-list">
              {evaluators.filter(e => e.disponible).map(evaluator => (
                <div key={evaluator.id} className="assignment-evaluator-card">
                  <div className="assignment-evaluator-info">
                    <h4 className="assignment-evaluator-name">{evaluator.nombre}</h4>
                    <span className="assignment-evaluator-profile">{evaluator.perfil}</span>
                  </div>
                  <button
                    className="assignment-evaluator-button"
                    onClick={() => handleAssign(evaluator.id)}
                  >
                    Asignar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluatorAssignment;