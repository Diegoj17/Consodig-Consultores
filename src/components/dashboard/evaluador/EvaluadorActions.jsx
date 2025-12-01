import React from 'react';
import { FaList, FaFolderOpen } from 'react-icons/fa';
import '../../../styles/dashboard/evaluador/EvaluadorActions.css';

// Ahora solo exponemos dos acciones: Evaluaciones y Ver Proyectos
const EvaluadorActions = ({ onViewEvaluations, onViewProjects }) => {
  const actions = [
    {
      label: 'Evaluaciones',
      icon: <FaList />,
      color: '#40c057',
      onClick: onViewEvaluations,
      description: 'Ir a evaluaciones pendientes y en progreso'
    },
    {
      label: 'Ver Proyectos',
      icon: <FaFolderOpen />,
      color: '#228be6',
      onClick: onViewProjects,
      description: 'Mis proyectos asignados'
    }
  ];

  return (
    <div className="evaluador-actions-container">
      <h3>Acciones Rápidas</h3>
      <div className="evaluador-actions-grid">
        {actions.map((action, index) => (
          <button
            key={index}
            className="evaluador-action-card"
            onClick={action.onClick}
            style={{ '--evaluador-action-color': action.color }}
          >
            <div className="evaluador-action-icon">
              {action.icon}
            </div>
            <div className="evaluador-action-content">
              <span className="evaluador-action-label">{action.label}</span>
              <span className="evaluador-action-description">{action.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EvaluadorActions;