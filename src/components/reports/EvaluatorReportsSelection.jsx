import React from 'react';
import { FaUserTie, FaEnvelope } from 'react-icons/fa';
import '../../styles/reports/EvaluatorReportsSelection.css';

const EvaluatorReportsSelection = ({ evaluators, selectedEvaluator, onSelectEvaluator, onSendMessage }) => {
  return (
    <div className="evaluator-reports-selection">
      <div className="evaluator-reports-selection-header">
        <h2>Seleccionar Evaluador</h2>
        <select 
          value={selectedEvaluator} 
          onChange={(e) => onSelectEvaluator(e.target.value)}
          className="evaluator-reports-evaluator-select"
        >
          {evaluators.map(evaluator => (
            <option key={evaluator.id} value={evaluator.id}>
              {evaluator.name} - {evaluator.institution}
            </option>
          ))}
        </select>
      </div>

      <div className="evaluator-reports-evaluators-list">
        <h3>Lista de Evaluadores</h3>
        <div className="evaluator-reports-evaluators-grid">
          {evaluators.map(evaluator => (
            <div 
              key={evaluator.id} 
              className={`evaluator-reports-evaluator-card ${selectedEvaluator == evaluator.id ? 'selected' : ''}`}
              onClick={() => onSelectEvaluator(evaluator.id)}
            >
              <div className="evaluator-reports-evaluator-header">
                <div className="evaluator-reports-evaluator-avatar">
                  <FaUserTie />
                </div>
                <div className="evaluator-reports-evaluator-info">
                  <h4>{evaluator.name}</h4>
                  <p>{evaluator.institution}</p>
                  <span className={`evaluator-reports-status-badge ${evaluator.status.toLowerCase()}`}>
                    {evaluator.status}
                  </span>
                </div>
              </div>
              <div className="evaluator-reports-evaluator-stats">
                <div className="evaluator-reports-stat">
                  <span className="evaluator-reports-stat-value">{evaluator.averageRating}</span>
                  <span className="evaluator-reports-stat-label">Calificación</span>
                </div>
                <div className="evaluator-reports-stat">
                  <span className="evaluator-reports-stat-value">{evaluator.completedEvaluations}</span>
                  <span className="evaluator-reports-stat-label">Completadas</span>
                </div>
                <div className="evaluator-reports-stat">
                  <span className="evaluator-reports-stat-value">{evaluator.pendingEvaluations}</span>
                  <span className="evaluator-reports-stat-label">Pendientes</span>
                </div>
              </div>
              <button 
                className="evaluator-reports-message-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendMessage(evaluator);
                }}
              >
                <FaEnvelope /> Mensaje
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorReportsSelection;