import React from 'react';
import { FaSearch, FaDownload } from 'react-icons/fa';
import '../../styles/reports/EvaluatorReportsHeader.css';

const EvaluatorReportsHeader = ({ searchTerm, setSearchTerm, timeFilter, setTimeFilter, onExport }) => {
  return (
    <div className="evaluator-reports-header">
      <div className="evaluator-reports-header-content">
        <h1>Reportes por Evaluador</h1>
        <p>Analiza el desempeño individual de cada evaluador</p>
      </div>
      <div className="evaluator-reports-header-actions">
        <div className="evaluator-reports-search-box">
          <FaSearch className="evaluator-reports-search-icon" />
          <input
            type="text"
            placeholder="Buscar evaluadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="evaluator-reports-time-filter"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="last-week">Última semana</option>
          <option value="last-month">Último mes</option>
          <option value="last-quarter">Último trimestre</option>
          <option value="last-year">Último año</option>
        </select>
        <button className="evaluator-reports-export-btn" onClick={onExport}>
          <FaDownload /> Exportar Reporte
        </button>
      </div>
    </div>
  );
};

export default EvaluatorReportsHeader;