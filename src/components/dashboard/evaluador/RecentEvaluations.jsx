import React from 'react';
import { FaClock, FaCheck, FaPlay } from 'react-icons/fa';
import '../../../styles/dashboard/evaluador/RecentEvaluations.css';

const RecentEvaluations = ({ evaluations, onStartEvaluation }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock style={{ color: '#fab005' }} />;
      case 'completed':
        return <FaCheck style={{ color: '#40c057' }} />;
      case 'in-progress':
        return <FaPlay style={{ color: '#228be6' }} />;
      default:
        return <FaClock style={{ color: '#868e96' }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'in-progress': return 'En Progreso';
      default: return status;
    }
  };

  return (
    <div className="recent-evaluations">
      <div className="section-header">
        <h3>Evaluaciones Recientes</h3>
        <button className="view-all-btn">Ver todas</button>
      </div>
      
      <div className="evaluations-list">
        {evaluations.map(evaluation => (
          <div key={evaluation.id} className="evaluation-item">
            <div className="evaluation-info">
              <h4>{evaluation.project}</h4>
              <p>Evaluando: {evaluation.evaluando}</p>
              <span className="due-date">Vence: {evaluation.dueDate}</span>
              {evaluation.formato && <div className="evaluation-format">Formato: {evaluation.formato}</div>}
              {typeof evaluation.progress === 'number' && (
                <div className="evaluation-progress-small">
                  <div className="progress-bar-small">
                    <div className="progress-fill-small" style={{ width: `${evaluation.progress}%` }}></div>
                  </div>
                  <span className="progress-text-small">{evaluation.progress}%</span>
                </div>
              )}
            </div>

            <div className="evaluation-actions">
              <div className="status-indicator">
                {getStatusIcon(evaluation.status)}
                <span>{getStatusText(evaluation.status)}</span>
              </div>
              
              {evaluation.status !== 'completed' && (
                <button 
                  className="start-btn"
                  onClick={() => onStartEvaluation(evaluation.id)}
                >
                  {evaluation.status === 'in-progress' ? 'Continuar' : 'Comenzar'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentEvaluations;