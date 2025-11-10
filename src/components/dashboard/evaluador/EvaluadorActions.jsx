import React from 'react';
import { FaPlay, FaList, FaChartBar } from 'react-icons/fa';
import '../../../styles/dashboard/evaluador/EvaluadorActions.css';

const EvaluadorActions = ({ onStartEvaluation, onViewProjects, onViewReports }) => {
  const actions = [
    {
      label: 'Comenzar Evaluación',
      icon: <FaPlay />,
      color: '#40c057',
      onClick: onStartEvaluation,
      description: 'Iniciar nueva evaluación'
    },
    {
      label: 'Ver Proyectos',
      icon: <FaList />,
      color: '#228be6',
      onClick: onViewProjects,
      description: 'Mis proyectos asignados'
    },
    {
      label: 'Generar Reporte',
      icon: <FaChartBar />,
      color: '#fab005',
      onClick: onViewReports,
      description: 'Crear reportes'
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