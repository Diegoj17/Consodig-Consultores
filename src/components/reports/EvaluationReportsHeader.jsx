import React from 'react';
import { FaSearch, FaDownload } from 'react-icons/fa';
import '../../styles/reports/EvaluationReportsHeader.css';

const EvaluationReportsHeader = ({ searchTerm, setSearchTerm, timeFilter, setTimeFilter, onExport }) => {
  return (
    <div className="evaluation-reports-header">
      <div className="evaluation-reports-header-content">
        <p>Analiza el desempeño y calificaciones de todos los proyectos evaluados</p>
      </div>
      <div className="evaluation-reports-header-actions">
        <div className="evaluation-reports-search-box">
          <FaSearch className="evaluation-reports-search-icon" />
          <input
            type="text"
            placeholder="Buscar proyectos o evaluadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="evaluation-reports-time-filter"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="all">Todos los tiempos</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="quarter">Último trimestre</option>
        </select>
        <button className="evaluation-reports-export-btn" onClick={onExport}>
          <FaDownload /> Exportar PDF
        </button>
      </div>
    </div>
  );
};

export default EvaluationReportsHeader;