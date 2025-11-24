import React from 'react';
import { FaFileContract, FaCheck, FaTimes, FaList, FaChartBar } from 'react-icons/fa';
import '../../../../styles/management/project/admin/EvaluationStats.css';

const EvaluationStats = ({ formats, onCreateFormat }) => {
  // Contar formatos por estado
  const getTotalCount = () => {
    return formats.length;
  };

  const getActiveCount = () => {
    return formats.filter(format => format.estado === 'active').length;
  };

  const getInactiveCount = () => {
    return formats.filter(format => format.estado === 'inactive').length;
  };

  const getTotalCriteria = () => {
    return formats.reduce((total, format) => total + (format.criterios || 0), 0);
  };

  const getAverageCriteria = () => {
    return formats.length > 0 ? (getTotalCriteria() / formats.length).toFixed(1) : 0;
  };

  return (
    <div className="evaluation-management-header">
      <div className="evaluation-header-content">
        <div className="evaluation-header-title">
          <p>Gestiona los formatos y criterios de evaluación para los proyectos de investigación</p>
        </div>
        <div className="evaluation-header-actions">
          <button
            className="evaluation-btn-primary evaluation-btn-with-icon"
            onClick={onCreateFormat}
          >
            <FaFileContract />
            <span>Nuevo Formato de Evaluación</span>
          </button>
        </div>
      </div>

      <div className="evaluation-stats-cards">
        <div className="evaluation-stat-card">
          <div className="evaluation-stat-icon total">
            <FaFileContract />
          </div>
          <div className="evaluation-stat-info">
            <span className="evaluation-stat-number">{getTotalCount()}</span>
            <span className="evaluation-stat-label">Total Formatos</span>
          </div>
        </div>
        
        <div className="evaluation-stat-card">
          <div className="evaluation-stat-icon active">
            <FaCheck />
          </div>
          <div className="evaluation-stat-info">
            <span className="evaluation-stat-number">{getActiveCount()}</span>
            <span className="evaluation-stat-label">Formatos Activos</span>
          </div>
        </div>
        
        <div className="evaluation-stat-card">
          <div className="evaluation-stat-icon inactive">
            <FaTimes />
          </div>
          <div className="evaluation-stat-info">
            <span className="evaluation-stat-number">{getInactiveCount()}</span>
            <span className="evaluation-stat-label">Formatos Inactivos</span>
          </div>
        </div>

        <div className="evaluation-stat-card">
          <div className="evaluation-stat-icon criteria">
            <FaList />
          </div>
          <div className="evaluation-stat-info">
            <span className="evaluation-stat-number">{getTotalCriteria()}</span>
            <span className="evaluation-stat-label">Total Criterios</span>
          </div>
        </div>

        <div className="evaluation-stat-card">
          <div className="evaluation-stat-icon average">
            <FaChartBar />
          </div>
          <div className="evaluation-stat-info">
            <span className="evaluation-stat-number">{getAverageCriteria()}</span>
            <span className="evaluation-stat-label">Promedio por Formato</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationStats;