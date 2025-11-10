import React from 'react';
import { FaChartBar, FaEye } from 'react-icons/fa';
import '../../../styles/dashboard/evaluando/EvaluationResults.css';

const EvaluationResults = ({ results, onViewDetails }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return '#40c057';
    if (score >= 70) return '#fab005';
    if (score >= 60) return '#fd7e14';
    return '#fa5252';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="evaluation-results">
      <div className="section-header">
        <h3>Resultados Recientes</h3>
        <button className="view-all-btn">Ver todos</button>
      </div>
      
      <div className="results-list">
        {results.map(result => (
          <div key={result.id} className="result-card">
            <div className="result-header">
              <h4>{result.evaluation}</h4>
              <span 
                className="score-badge"
                style={{ backgroundColor: getScoreColor(result.score) }}
              >
                {result.score}%
              </span>
            </div>
            
            <div className="result-details">
              <span className="project">{result.project}</span>
              <span className="date">{formatDate(result.date)}</span>
            </div>
            
            <button 
              className="view-details-btn"
              onClick={() => onViewDetails(result.id)}
            >
              <FaEye /> Ver Detalles
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationResults;