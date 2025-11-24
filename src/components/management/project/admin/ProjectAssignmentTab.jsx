import React from 'react';
import { FaUser, FaCalendar, FaUserCheck, FaUserPlus, FaEye } from 'react-icons/fa';
import '../../../../styles/management/project/admin/AssignmentTab.css';

const AssignmentTab = ({ 
  projects, 
  evaluators, 
  selectedProject, 
  setSelectedProject,
  onAssignEvaluator,
  onSetDeadline 
}) => {
  const availableProjects = projects.filter(p => !p.evaluadorAsignado);
  const availableEvaluators = evaluators.filter(e => e.disponible);

  return (
    <div className="project-admin-assignment-tab">
      <div className="project-admin-section-header">
        <h2>Asignación de Evaluadores</h2>
        <p>Preasigna evaluadores con perfiles equivalentes a los proyectos</p>
      </div>

      <div className="project-admin-assignment-grid">
        <div className="project-admin-assignment-column">
          <div className="project-admin-column-header">
            <FaUser className="project-admin-column-icon" />
            <h3>Proyectos Disponibles</h3>
          </div>
          <div className="project-admin-assignment-list">
            {availableProjects.map(project => (
              <div 
                key={project.id} 
                className={`project-admin-assignment-card ${selectedProject?.id === project.id ? 'project-admin-assignment-card--selected' : ''}`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="project-admin-assignment-card-content">
                  <h4>{project.titulo}</h4>
                  <p>
                    <FaUser className="project-admin-card-icon" />
                    Investigador: {project.investigadorPrincipal}
                  </p>
                </div>
                <FaEye className="project-admin-select-indicator" />
              </div>
            ))}
          </div>
        </div>

        <div className="project-admin-assignment-column">
          {selectedProject ? (
            <>
              <div className="project-admin-column-header">
                <FaUserCheck className="project-admin-column-icon" />
                <h3>Evaluadores Disponibles</h3>
              </div>
              
              <div className="project-admin-assignment-options">
                <div className="project-admin-option-group">
                  <label className="project-admin-checkbox-label">
                    <input type="checkbox" />
                    <span>Evaluación Anónima (Doble Ciego)</span>
                  </label>
                </div>
                
                <div className="project-admin-form-group">
                  <label>
                    <FaCalendar className="project-admin-label-icon" />
                    Plazo de Evaluación
                  </label>
                  <input type="date" className="project-admin-date-input" />
                </div>
              </div>

              <div className="project-admin-evaluators-list">
                {availableEvaluators.map(evaluator => (
                  <div key={evaluator.id} className="project-admin-evaluator-card">
                    <div className="project-admin-evaluator-info">
                      <h4>{evaluator.nombre}</h4>
                      <span className="project-admin-evaluator-badge">{evaluator.perfil}</span>
                    </div>
                    <button 
                      className="project-admin-btn-assign"
                      onClick={() => onAssignEvaluator(selectedProject.id, evaluator.id)}
                    >
                      <FaUserPlus />
                      Asignar
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="project-admin-empty-selection">
              <FaUserCheck className="project-admin-empty-icon" />
              <h4>Selecciona un proyecto</h4>
              <p>Selecciona un proyecto de la lista para ver los evaluadores disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentTab;