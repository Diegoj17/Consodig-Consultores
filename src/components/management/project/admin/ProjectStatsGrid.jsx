import React from 'react';
import { FaProjectDiagram, FaClock, FaUserCheck, FaSync } from 'react-icons/fa';
import '../../../../styles/management/project/admin/StatsGrid.css';

const ProjectStatsGrid = ({ stats }) => {
  const iconMap = {
    'total-projects': FaProjectDiagram,
    'recent-projects': FaClock,
    'pending-assignment': FaUserCheck,
    'in-evaluation': FaSync
  };

  return (
    <div className="project-admin-stats-grid">
      {stats.map((stat, index) => {
        const IconComponent = iconMap[stat.variant] || FaProjectDiagram;
        return (
          <div 
            key={index} 
            className={`project-admin-stat-card project-admin-stat-card--${stat.variant}`}
          >
            <div className="project-admin-stat-icon-wrapper">
              <IconComponent />
            </div>
            <div className="project-admin-stat-content">
              <span className="project-admin-stat-value">{stat.value}</span>
              <span className="project-admin-stat-label">{stat.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectStatsGrid;