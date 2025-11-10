import React from 'react';
import { FaSearch, FaDownload } from 'react-icons/fa';
import '../../../styles/management/user/UserToolbar.css';

const UserToolbar = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  viewMode,
  onViewModeChange,
  onExport
}) => {
  return (
    <div className="toolbar">
      <div className="search-section">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Estado</label>
          <select 
            value={statusFilter} 
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Rol</label>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los roles</option>
            <option value="evaluador">Evaluador</option>
            <option value="evaluando">Evaluando</option>
          </select>
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
          >
            Grid
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
          >
            Lista
          </button>
        </div>

        <button className="btn-secondary btn-with-icon" onClick={onExport}>
          <FaDownload />
          <span>Exportar</span>
        </button>
      </div>
    </div>
  );
};

export default UserToolbar;