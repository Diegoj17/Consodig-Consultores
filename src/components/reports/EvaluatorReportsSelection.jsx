import React from 'react';
import { FaUserTie, FaEnvelope } from 'react-icons/fa';

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

      <div className="evaluator-reports-list">
        <h3>Lista de Evaluadores</h3>
        <div className="evaluator-reports-evaluators-grid">
          {evaluators.map(evaluator => (
            <div 
              key={evaluator.id} 
              className={`evaluator-reports-card ${selectedEvaluator == evaluator.id ? 'selected' : ''}`}
              onClick={() => onSelectEvaluator(evaluator.id)}
            >
              <div className="evaluator-reports-card-header">
                <div className="evaluator-reports-avatar">
                  <FaUserTie />
                </div>
                <div className="evaluator-reports-info">
                  <h4>{evaluator.name}</h4>
                  <p>{evaluator.institution}</p>
                  <span className={`evaluator-reports-status-badge ${(evaluator.status || '').toLowerCase()}`}>
                    {evaluator.status || 'Sin estado'}
                  </span>
                </div>
              </div>
              <div className="evaluator-reports-card-stats">
                <div className="evaluator-reports-stat">
                  <span className="evaluator-reports-stat-value">{evaluator.averageRating ?? '0.0'}</span>
                  <span className="evaluator-reports-stat-label">Calificación</span>
                </div>
                <div className="evaluator-reports-stat">
                  <span className="evaluator-reports-stat-value">{evaluator.completedEvaluations ?? 0}</span>
                  <span className="evaluator-reports-stat-label">Completadas</span>
                </div>
                <div className="evaluator-reports-stat">
                  <span className="evaluator-reports-stat-value">{evaluator.pendingEvaluations ?? 0}</span>
                  <span className="evaluator-reports-stat-label">Pendientes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorReportsSelection;