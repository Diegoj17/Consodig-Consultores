import React from 'react';
import ProjectCard from './ProjectCard';
import '../../../../styles/management/project/admin/ProjectGrid.css';

const ProjectGrid = ({ projects, onViewDetails, onEditProject, onReviewEvaluation }) => {
  return (
    <div className="projects-grid">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onViewDetails={onViewDetails}
          onEditProject={onEditProject}
          onReviewEvaluation={onReviewEvaluation}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;