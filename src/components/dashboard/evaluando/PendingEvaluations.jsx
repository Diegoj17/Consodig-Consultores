import React from 'react';
import { FaClock, FaPlay, FaBook } from 'react-icons/fa';
import '../../../styles/dashboard/evaluando/PendingEvaluations.css';

const PendingEvaluations = ({ evaluations, onStartEvaluation }) => {
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="pending-evaluations">
      <div className="section-header">
        <h3>Evaluaciones Pendientes</h3>
        <button className="view-all-btn">Ver todas</button>
      </div>
      
      <div className="evaluations-list">
        {evaluations.map(evaluation => (
          <div key={evaluation.id} className="evaluation-card">
            <div className="evaluation-header">
              <h4>{evaluation.name}</h4>
              <span className="project-badge">{evaluation.project}</span>
            </div>
            
            <div className="evaluation-details">
              <div className="detail-item">
                <FaClock />
                <span>Vence: {formatDueDate(evaluation.dueDate)}</span>
              </div>
              <div className="detail-item">
                <FaBook />
                <span>Duración: {evaluation.duration}</span>
              </div>
            </div>
            
            <button 
              className="start-evaluation-btn"
              onClick={() => onStartEvaluation(evaluation.id)}
            >
              <FaPlay /> Comenzar Evaluación
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingEvaluations;