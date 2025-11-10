import React from 'react';
import { FaUsers, FaCalendarAlt } from 'react-icons/fa';
import '../../../styles/dashboard/evaluador/AssignedProjects.css';

const AssignedProjects = ({ projects, onViewProject }) => {
  const getProgressColor = (progress) => {
    if (progress >= 75) return '#40c057';
    if (progress >= 50) return '#fab005';
    if (progress >= 25) return '#fd7e14';
    return '#fa5252';
  };

  return (
    <div className="assigned-projects">
      <div className="section-header">
        <h3>Proyectos Asignados</h3>
        <button className="view-all-btn">Ver todos</button>
      </div>
      
      <div className="projects-list">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h4>{project.name}</h4>
              <span className="evaluandos-count">
                <FaUsers /> {project.evaluandos}
              </span>
            </div>
            
            <div className="project-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${project.progress}%`,
                    backgroundColor: getProgressColor(project.progress)
                  }}
                ></div>
              </div>
              <span className="progress-text">{project.progress}%</span>
            </div>
            
            <div className="project-footer">
              <span className="deadline">
                <FaCalendarAlt /> {project.deadline}
              </span>
              <button 
                className="view-project-btn"
                onClick={() => onViewProject(project.id)}
              >
                Ver Proyecto
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedProjects;