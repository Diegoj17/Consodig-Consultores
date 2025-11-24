import React from 'react';
import { FaFileAlt } from 'react-icons/fa';
import ProjectFilters from './ProjectFilters';
import ProjectCard from './ProjectCard';
import '../../../../styles/management/project/admin/ProjectsTab.css';

const ProjectsTab = ({ 
  filteredProjects, 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  setSelectedProject,
  onReviewEvaluation 
}) => {
  return (
    <div className="project-admin-projects-tab">
      <div className="project-admin-section-header">
        <h2>Gestionar Proyectos</h2>
        <p>Visualiza, busca y filtra todos los proyectos del sistema</p>
      </div>

      <ProjectFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <div className="project-admin-projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={setSelectedProject}
              onReviewEvaluation={onReviewEvaluation}
            />
          ))
        ) : (
          <div className="project-admin-empty-state">
            <FaFileAlt className="project-admin-empty-icon" />
            <h3>No se encontraron proyectos</h3>
            <p>No hay proyectos que coincidan con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsTab;