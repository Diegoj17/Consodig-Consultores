import React from 'react';
import { FaUser, FaCheck, FaTimes, FaClock, FaEye } from 'react-icons/fa';
import '../../../../styles/management/project/admin/HistoryTab.css';

const HistoryTab = ({ evaluators }) => {
  // Datos de ejemplo para el historial (en una app real vendrían del backend)
  const historyData = evaluators.map(evaluator => ({
    ...evaluator,
    assigned: Math.floor(Math.random() * 10) + 1,
    completed: Math.floor(Math.random() * 8) + 1,
    overdue: Math.floor(Math.random() * 3)
  }));

  return (
    <div className="project-admin-history-tab">
      <div className="project-admin-section-header">
        <h2>Historial de Cumplimiento</h2>
        <p>Consulta el historial y cumplimiento de plazos de los evaluadores</p>
      </div>

      <div className="project-admin-history-table">
        {historyData.map(evaluator => (
          <div key={evaluator.id} className="project-admin-history-row">
            <div className="project-admin-history-evaluator">
              <div className="project-admin-evaluator-avatar">
                <FaUser />
              </div>
              <div className="project-admin-evaluator-info">
                <h4>{evaluator.nombre}</h4>
                <span className="project-admin-evaluator-profile">{evaluator.perfil}</span>
              </div>
            </div>
            
            <div className="project-admin-history-stats">
              <div className="project-admin-history-stat">
                <FaClock className="project-admin-stat-icon project-admin-stat-icon--assigned" />
                <div className="project-admin-stat-content">
                  <span className="project-admin-stat-label">Asignados</span>
                  <span className="project-admin-stat-value">{evaluator.assigned}</span>
                </div>
              </div>
              
              <div className="project-admin-history-stat">
                <FaCheck className="project-admin-stat-icon project-admin-stat-icon--completed" />
                <div className="project-admin-stat-content">
                  <span className="project-admin-stat-label">Completados</span>
                  <span className="project-admin-stat-value">{evaluator.completed}</span>
                </div>
              </div>
              
              <div className="project-admin-history-stat">
                <FaTimes className="project-admin-stat-icon project-admin-stat-icon--overdue" />
                <div className="project-admin-stat-content">
                  <span className="project-admin-stat-label">Incumplimientos</span>
                  <span className="project-admin-stat-value project-admin-stat-value--warning">{evaluator.overdue}</span>
                </div>
              </div>
            </div>
            
            <div className="project-admin-history-actions">
              <button className="project-admin-btn-detail">
                <FaEye />
                Ver Detalle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTab;