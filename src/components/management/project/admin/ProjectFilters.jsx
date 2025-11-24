import React from 'react';
import { FaSearch, FaTh, FaList } from 'react-icons/fa';
import '../../../../styles/management/project/admin/ProjectFilters.css';

const ProjectFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus 
}) => {
  return (
    <div className="project-admin-filters">
      <div className="project-admin-filter-group">
        <div className="project-admin-search-box">
          <FaSearch className="project-admin-search-icon" />
          <input
            type="text"
            placeholder="Buscar proyectos por título o investigador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="project-admin-search-input"
          />
        </div>
        
        <div className="project-admin-filter-controls">
          <div className="project-admin-filter-select-group">
            <label className="project-admin-filter-label">Estado:</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="project-admin-filter-select"
            >
              <option value="todos">Todos los estados</option>
              <option value="Pendiente">Disponibles</option>
              <option value="Preasignado">Preasignados</option>
              <option value="En evaluación">En Evaluación</option>
              <option value="Evaluado">Evaluados</option>
            </select>
          </div>

          <div className="project-admin-view-toggle-group">
            <button className="project-admin-view-toggle project-admin-view-toggle--active">
              <FaTh />
            </button>
            <button className="project-admin-view-toggle">
              <FaList />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;