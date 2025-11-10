import React from 'react';
import { FaPlay, FaChartBar, FaHistory } from 'react-icons/fa';
import '../../../styles/dashboard/evaluando/EvaluandoActions.css';

const EvaluandoActions = ({ onViewAllEvaluations, onViewAllResults, onViewHistory }) => {
  const actions = [
    {
      label: 'Mis Evaluaciones',
      icon: <FaPlay />,
      color: '#40c057',
      onClick: onViewAllEvaluations,
      description: 'Ver todas las evaluaciones'
    },
    {
      label: 'Ver Resultados',
      icon: <FaChartBar />,
      color: '#228be6',
      onClick: onViewAllResults,
      description: 'Resultados detallados'
    },
    {
      label: 'Historial',
      icon: <FaHistory />,
      color: '#fab005',
      onClick: onViewHistory,
      description: 'Evaluaciones pasadas'
    }
  ];

  return (
    <div className="evaluando-actions">
      <h3>Acciones Rápidas</h3>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <button
            key={index}
            className="action-card"
            onClick={action.onClick}
            style={{ '--action-color': action.color }}
          >
            <div className="action-icon">
              {action.icon}
            </div>
            <div className="action-content">
              <span className="action-label">{action.label}</span>
              <span className="action-description">{action.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EvaluandoActions;