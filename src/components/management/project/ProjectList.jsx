import React, { useState } from 'react';
import '../../../styles/management/project/ProjectList.css';

const ProjectList = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project =>
    project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.resumen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-container">
      <h2 className="list-title">Mis Proyectos</h2>
      
      <div className="list-search-bar">
        <input
          type="text"
          placeholder="Buscar proyecto..."
          className="list-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="list-cards-grid">
        {filteredProjects.length === 0 ? (
          <p className="list-empty-message">
            {searchTerm ? 'No se encontraron proyectos' : 'No has enviado proyectos aún'}
          </p>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="list-card">
              <div className="list-card-header">
                <h3 className="list-card-title">{project.titulo}</h3>
                <span className={`list-card-status ${project.estado.toLowerCase().replace(' ', '-')}`}>
                  {project.estado}
                </span>
              </div>
              <p className="list-card-text">{project.resumen.substring(0, 100)}...</p>
              <div className="list-card-meta">
                <span>Fecha: {project.fechaEnvio}</span>
                {project.calificacion && (
                  <span className="list-card-score">Calificación: {project.calificacion}</span>
                )}
              </div>
              {project.retroalimentacion && (
                <div className="list-card-feedback">
                  <strong>Retroalimentación:</strong>
                  <p>{project.retroalimentacion}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectList;