import React from 'react';
import { FaClipboardList, FaCheckCircle, FaProjectDiagram, FaStar } from 'react-icons/fa';
import '../../../styles/dashboard/evaluador/EvaluadorStats.css';

const EvaluadorStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Evaluaciones Pendientes',
      value: stats.pendingEvaluations,
      icon: <FaClipboardList />,
      color: '#ff6b6b',
      description: 'Por revisar'
    },
    {
      title: 'Evaluaciones Completadas',
      value: stats.completedEvaluations,
      icon: <FaCheckCircle />,
      color: '#51cf66',
      description: 'Total terminadas'
    },
    {
      title: 'Proyectos Asignados',
      value: stats.assignedProjects,
      icon: <FaProjectDiagram />,
      color: '#339af0',
      description: 'En progreso'
    },
    {
      title: 'Rating Promedio',
      value: stats.averageRating,
      icon: <FaStar />,
      color: '#ffd43b',
      description: 'De 5 estrellas'
    }
  ];

  return (
    <div className="evaluador-stats-container">
      {statCards.map((stat, index) => (
        <div key={index} className="evaluador-stat-card">
          <div className="evaluador-stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className="evaluador-stat-content">
            <h3>{stat.value}</h3>
            <p className="evaluador-stat-title">{stat.title}</p>
            <span className="evaluador-stat-description">{stat.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EvaluadorStats;